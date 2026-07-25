import dotenv from 'dotenv';
dotenv.config();
console.log(process.env.MONGODB_URI);


import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { initMongoose } from './server/db';
import { 
  authenticateToken, 
  authorizeRoles, 
  AuthController, 
  ProductController, 
  CategoryBrandController, 
  OrderController, 
  ReviewController, 
  SupportController, 
  CouponController, 
  NotificationController, 
  AIController, 
  SuperAdminController 
} from './server/controllers';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize DB connection if credentials exist
  await initMongoose();

  // Basic Middlewares
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request logger helper
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // ==========================================
  // API ROUTES
  // ==========================================

  // Authentication API
  app.post('/api/auth/register', AuthController.register);
  app.post('/api/auth/login', AuthController.login);
  app.get('/api/auth/profile', authenticateToken, AuthController.getProfile);
  app.put('/api/auth/profile', authenticateToken, AuthController.updateProfile);
  app.post('/api/auth/change-password', authenticateToken, AuthController.changePassword);

  // Products API
  app.get('/api/products', ProductController.getAll);
  app.get('/api/products/:id', ProductController.getById);
  app.post('/api/products', authenticateToken, authorizeRoles('admin', 'superadmin'), ProductController.create);
  app.put('/api/products/:id', authenticateToken, authorizeRoles('admin', 'superadmin'), ProductController.update);
  app.delete('/api/products/:id', authenticateToken, authorizeRoles('admin', 'superadmin'), ProductController.delete);

  // Categories & Brands API
  app.get('/api/categories', CategoryBrandController.getCategories);
  app.post('/api/categories', authenticateToken, authorizeRoles('admin', 'superadmin'), CategoryBrandController.createCategory);
  app.delete('/api/categories/:id', authenticateToken, authorizeRoles('admin', 'superadmin'), CategoryBrandController.deleteCategory);

  app.get('/api/brands', CategoryBrandController.getBrands);
  app.post('/api/brands', authenticateToken, authorizeRoles('admin', 'superadmin'), CategoryBrandController.createBrand);
  app.delete('/api/brands/:id', authenticateToken, authorizeRoles('admin', 'superadmin'), CategoryBrandController.deleteBrand);

  // Orders API
  app.post('/api/orders', authenticateToken, OrderController.create);
  app.get('/api/orders/my', authenticateToken, OrderController.getMyOrders);
  app.get('/api/orders/all', authenticateToken, authorizeRoles('admin', 'superadmin'), OrderController.getAllOrders);
  app.put('/api/orders/:id/status', authenticateToken, authorizeRoles('admin', 'superadmin'), OrderController.updateStatus);

  // Reviews API
  app.post('/api/products/:productId/reviews', authenticateToken, ReviewController.addReview);
  app.get('/api/products/:productId/reviews', ReviewController.getProductReviews);

  // Support Tickets API
  app.post('/api/support/tickets', authenticateToken, SupportController.createTicket);
  app.get('/api/support/tickets/my', authenticateToken, SupportController.getMyTickets);
  app.get('/api/support/tickets/all', authenticateToken, authorizeRoles('admin', 'superadmin'), SupportController.getAllTickets);
  app.post('/api/support/tickets/:id/reply', authenticateToken, SupportController.replyTicket);
  app.put('/api/support/tickets/:id/close', authenticateToken, authorizeRoles('admin', 'superadmin'), SupportController.closeTicket);

  // Coupons API
  app.get('/api/coupons', authenticateToken, authorizeRoles('admin', 'superadmin'), CouponController.getAll);
  app.post('/api/coupons', authenticateToken, authorizeRoles('admin', 'superadmin'), CouponController.create);
  app.put('/api/coupons/:id/toggle', authenticateToken, authorizeRoles('admin', 'superadmin'), CouponController.toggle);
  app.delete('/api/coupons/:id', authenticateToken, authorizeRoles('admin', 'superadmin'), CouponController.delete);
  app.post('/api/coupons/validate', CouponController.validate);

  // Notifications API
  app.get('/api/notifications', authenticateToken, NotificationController.getMy);
  app.post('/api/notifications/read', authenticateToken, NotificationController.markRead);

  // AI Assistant API
  app.post('/api/ai/chat', AIController.chat);
  app.get('/api/ai/logs', authenticateToken, authorizeRoles('admin', 'superadmin'), AIController.getLogs);

  // Super Admin API
  app.get('/api/superadmin/users', authenticateToken, authorizeRoles('superadmin'), SuperAdminController.getUsers);
  app.post('/api/superadmin/users', authenticateToken, authorizeRoles('superadmin'), SuperAdminController.createUser);
  app.put('/api/superadmin/users/:id/role', authenticateToken, authorizeRoles('superadmin'), SuperAdminController.changeRole);
  app.put('/api/superadmin/users/:id/suspend', authenticateToken, authorizeRoles('superadmin'), SuperAdminController.toggleSuspend);
  app.delete('/api/superadmin/users/:id', authenticateToken, authorizeRoles('superadmin'), SuperAdminController.deleteUser);
  app.get('/api/superadmin/analytics', authenticateToken, authorizeRoles('admin', 'superadmin'), SuperAdminController.getAnalytics);

  // ==========================================
  // VITE OR STATIC FRONTEND INTEGRATION
  // ==========================================

  if (process.env.NODE_ENV !== 'production') {
    // Development Mode - Mount Vite dev server
    console.log("Loading Vite Dev Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production Mode - Serve prebuilt static assets
    console.log("Loading Static Production Assets...");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Fallback Error Handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Unhandled Server Error:", err);
    res.status(500).json({ message: "An unhandled server error occurred." });
  });

  // Listen on PORT 3000
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n==================================================`);
    console.log(`🚀 TechMart Server is running on http://localhost:${PORT}`);
    console.log(`==================================================\n`);
  });
}

startServer();
