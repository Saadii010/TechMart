import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { 
  User, Product, Category, Brand, Order, Review, Coupon, SupportTicket, Notification, ChatLog 
} from '../src/types';

const DATA_DIR = path.join(process.cwd(), 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Read/Write helper for JSON databases
function readJsonFile<T>(filename: string, defaultData: T[] = []): T[] {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data) as T[];
  } catch (error) {
    console.error(`Error reading database file ${filename}:`, error);
    return defaultData;
  }
}

function writeJsonFile<T>(filename: string, data: T[]): void {
  const filePath = path.join(DATA_DIR, filename);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error writing database file ${filename}:`, error);
  }
}

// Initial high-fidelity seed data
const initialCategories: Category[] = [
  { id: 'cat-laptops', name: 'Laptops', slug: 'laptops', image: 'https://images.unsplash.com/photo-1496181130204-755241524eab?w=400&q=80' },
  { id: 'cat-smartphones', name: 'Smartphones', slug: 'smartphones', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80' },
  { id: 'cat-headphones', name: 'Headphones', slug: 'headphones', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80' },
  { id: 'cat-smartwatches', name: 'Smart Watches', slug: 'smartwatches', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80' },
  { id: 'cat-gaming', name: 'Gaming Consoles', slug: 'gaming-consoles', image: 'https://images.unsplash.com/photo-1486401899868-0e435fc85728?w=400&q=80' },
  { id: 'cat-monitors', name: 'Monitors', slug: 'monitors', image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&q=80' },
  { id: 'cat-components', name: 'Graphics Cards', slug: 'graphics-cards', image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&q=80' }
];

const initialBrands: Brand[] = [
  { id: 'b-apple', name: 'Apple', slug: 'apple', logo: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=100&q=80' },
  { id: 'b-samsung', name: 'Samsung', slug: 'samsung', logo: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=100&q=80' },
  { id: 'b-sony', name: 'Sony', slug: 'sony', logo: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=100&q=80' },
  { id: 'b-asus', name: 'ASUS', slug: 'asus', logo: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=100&q=80' },
  { id: 'b-nvidia', name: 'Nvidia', slug: 'nvidia', logo: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=100&q=80' }
];

const initialProducts: Product[] = [
  {
    id: 'prod-macbook-pro-16',
    name: 'MacBook Pro 16" M3 Max',
    brand: 'Apple',
    category: 'Laptops',
    sku: 'SKU-AP-MBP16-M3X',
    model: 'Apple MacBook Pro 16-inch 2024',
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80',
      'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&q=80'
    ],
    thumbnail: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80',
    description: 'The ultimate pro laptop. With the M3 Max chip, a stunning Liquid Retina XDR display, and up to 22 hours of battery life, it delivers performance that redefines boundary limits.',
    technicalSpecifications: {
      'Processor': 'Apple M3 Max (16-core CPU, 40-core GPU)',
      'Memory': '48GB Unified RAM',
      'Storage': '1TB NVMe PCIe SSD',
      'Display': '16.2" Liquid Retina XDR (3456 x 2234), 120Hz',
      'Operating System': 'macOS Sonoma',
      'Battery Life': 'Up to 22 Hours',
      'Weight': '2.16 kg'
    },
    price: 3499,
    discount: 5,
    availableStock: 12,
    warranty: '1 Year Apple Official Warranty',
    deliveryInfo: 'Free shipping. Delivers in 2-3 business days.',
    returnPolicy: '15-day return window. Must be in original packaging and condition.',
    ratings: 4.9,
    reviewsCount: 38,
    isFeatured: true,
    isTrending: true,
    isBestSeller: false,
    isFlashSale: false,
    isNewArrival: true,
    isActive: true
  },
  {
    id: 'prod-galaxy-s24-ultra',
    name: 'Galaxy S24 Ultra 5G',
    brand: 'Samsung',
    category: 'Smartphones',
    sku: 'SKU-SM-S24U-512',
    model: 'Samsung Galaxy S24 Ultra',
    images: [
      'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&q=80',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80'
    ],
    thumbnail: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&q=80',
    description: 'Welcome to the era of mobile AI. With Galaxy S24 Ultra in your hands, you can unleash whole new levels of creativity, productivity and possibility.',
    technicalSpecifications: {
      'Processor': 'Snapdragon 8 Gen 3 for Galaxy',
      'Memory': '12GB LPDDR5X RAM',
      'Storage': '512GB UFS 4.0 Storage',
      'Display': '6.8" Dynamic AMOLED 2X, QHD+, 120Hz',
      'Camera': '200MP Main + 50MP Periscope + 12MP Ultra-wide + 10MP Telephoto',
      'Battery': '5000 mAh with 45W Super Fast Charging',
      'OS': 'Android 14 with One UI 6.1'
    },
    price: 1299,
    discount: 10,
    availableStock: 25,
    warranty: '1 Year Samsung Local Warranty',
    deliveryInfo: 'Free shipping. Express same-day delivery available in major cities.',
    returnPolicy: '7-day hassle-free return window.',
    ratings: 4.8,
    reviewsCount: 124,
    isFeatured: true,
    isTrending: true,
    isBestSeller: true,
    isFlashSale: false,
    isNewArrival: false,
    isActive: true
  },
  {
    id: 'prod-iphone-15-pro',
    name: 'iPhone 15 Pro Max',
    brand: 'Apple',
    category: 'Smartphones',
    sku: 'SKU-AP-IP15PM-256',
    model: 'Apple iPhone 15 Pro Max',
    images: [
      'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&q=80',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80'
    ],
    thumbnail: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&q=80',
    description: 'Forged in titanium and featuring the groundbreaking A17 Pro chip, a customizable Action button, and the most powerful iPhone camera system ever.',
    technicalSpecifications: {
      'Processor': 'Apple A17 Pro (6-core GPU)',
      'Memory': '8GB RAM',
      'Storage': '256GB NVMe Storage',
      'Display': '6.7" Super Retina XDR OLED, 120Hz ProMotion',
      'Camera': '48MP Main + 12MP Telephoto with 5x zoom + 12MP Ultra-wide',
      'Weight': '221g'
    },
    price: 1199,
    discount: 0,
    availableStock: 18,
    warranty: '1 Year Apple Official International Warranty',
    deliveryInfo: 'Delivered within 3-4 days.',
    returnPolicy: '15-day return window.',
    ratings: 4.7,
    reviewsCount: 95,
    isFeatured: false,
    isTrending: true,
    isBestSeller: true,
    isFlashSale: false,
    isNewArrival: false,
    isActive: true
  },
  {
    id: 'prod-sony-wh1000xm5',
    name: 'Sony WH-1000XM5 Wireless Headphones',
    brand: 'Sony',
    category: 'Headphones',
    sku: 'SKU-SO-WH1000XM5-B',
    model: 'Sony WH-1000XM5',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80'
    ],
    thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
    description: 'Industry-leading noise cancellation gets even better. Experience magnificent high-resolution sound quality with multiple microphones, auto-optimizer, and unmatched comfort.',
    technicalSpecifications: {
      'Type': 'Over-ear, Closed Dynamic',
      'Driver Unit': '30mm high-quality domes',
      'Frequency Response': '4Hz - 40,000Hz',
      'Battery Life': 'Up to 30 Hours (NC ON) / 40 Hours (NC OFF)',
      'Bluetooth Version': 'v5.2 (LDAC, AAC, SBC support)',
      'Special Features': 'Active Noise Cancelling, Speak-to-Chat, Voice Assistant compatible'
    },
    price: 399,
    discount: 15,
    availableStock: 40,
    warranty: '1 Year Sony Official Warranty',
    deliveryInfo: 'Delivers in 1-2 business days.',
    returnPolicy: '30-day standard returns.',
    ratings: 4.9,
    reviewsCount: 245,
    isFeatured: true,
    isTrending: true,
    isBestSeller: true,
    isFlashSale: true,
    isNewArrival: false,
    isActive: true
  },
  {
    id: 'prod-asus-rog-g16',
    name: 'ASUS ROG Strix G16 Gaming Laptop',
    brand: 'ASUS',
    category: 'Laptops',
    sku: 'SKU-AS-ROG-G16-4070',
    model: 'ASUS ROG Strix G16 2024',
    images: [
      'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=80',
      'https://images.unsplash.com/photo-1618424181497-157f25b6ddd5?w=800&q=80'
    ],
    thumbnail: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&q=80',
    description: 'Raise your game. Arm yourself with the competitive horsepower of the i9 processor and GeForce RTX 4070 graphics cards to completely dominate the esports arena.',
    technicalSpecifications: {
      'Processor': 'Intel Core i9-14900HX (24 Cores, up to 5.8 GHz)',
      'Graphics': 'NVIDIA GeForce RTX 4070 Laptop GPU 8GB GDDR6',
      'Memory': '32GB DDR5 5600MHz RAM',
      'Storage': '1TB PCIe 4.0 NVMe M.2 SSD',
      'Display': '16" QHD+ ROG Nebula Display, 240Hz, 3ms, 100% DCI-P3',
      'Cooling': 'ROG Intelligent Cooling with Tri-Fan technology'
    },
    price: 2199,
    discount: 8,
    availableStock: 8,
    warranty: '2 Year ASUS Global Warranty',
    deliveryInfo: 'Secure, insured shipping. Handed over to courier in 24 hours.',
    returnPolicy: '15-day return window.',
    ratings: 4.8,
    reviewsCount: 52,
    isFeatured: true,
    isTrending: false,
    isBestSeller: false,
    isFlashSale: false,
    isNewArrival: true,
    isActive: true
  },
  {
    id: 'prod-nvidia-rtx4090',
    name: 'NVIDIA GeForce RTX 4090 Founders Edition',
    brand: 'Nvidia',
    category: 'Graphics Cards',
    sku: 'SKU-NV-RTX4090-FE',
    model: 'NVIDIA GeForce RTX 4090 FE',
    images: [
      'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&q=80'
    ],
    thumbnail: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=600&q=80',
    description: 'The ultimate GeForce GPU. It brings an enormous leap in performance, efficiency, and AI-powered graphics. Experience ultra-high performance gaming, incredibly detailed virtual worlds, and AI-powered workflow acceleration.',
    technicalSpecifications: {
      'GPU architecture': 'NVIDIA Ada Lovelace architecture',
      'CUDA Cores': '16384',
      'Memory': '24 GB GDDR6X',
      'Memory Interface Width': '384-bit',
      'Tensor Cores': '4th Generation',
      'RT Cores': '3rd Generation',
      'Recommended Power Supply': '850W'
    },
    price: 1599,
    discount: 0,
    availableStock: 5,
    warranty: '3 Year Official Manufacturer Warranty',
    deliveryInfo: 'Fragile handling priority shipping. Requires signature on delivery.',
    returnPolicy: '7-day returns, seals must not be tampered or broken.',
    ratings: 4.9,
    reviewsCount: 19,
    isFeatured: true,
    isTrending: true,
    isBestSeller: false,
    isFlashSale: false,
    isNewArrival: false,
    isActive: true
  },
  {
    id: 'prod-apple-watch-ultra-2',
    name: 'Apple Watch Ultra 2 GPS + Cellular',
    brand: 'Apple',
    category: 'Smart Watches',
    sku: 'SKU-AP-AWU2-49',
    model: 'Apple Watch Ultra 2 2024',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80'
    ],
    thumbnail: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',
    description: 'The most rugged and capable Apple Watch pushes the limits again. Featuring the all-new S9 SiP, a magical new way to use your watch without touching the screen, and Apple\'s brightest display ever.',
    technicalSpecifications: {
      'Case Size': '49mm aerospace-grade titanium case',
      'Display': 'Always-On Retina LTPO OLED, up to 3000 nits brightness',
      'Water Resistance': '100m water resistant, MIL-STD 810H',
      'Battery Life': 'Up to 36 hours of normal use / 72 hours in Low Power Mode',
      'Sensors': 'Precision dual-frequency GPS, Blood Oxygen sensor, ECG app'
    },
    price: 799,
    discount: 5,
    availableStock: 15,
    warranty: '1 Year Apple Official Warranty',
    deliveryInfo: 'Delivered in 2 business days.',
    returnPolicy: '15-day return policy.',
    ratings: 4.8,
    reviewsCount: 62,
    isFeatured: false,
    isTrending: true,
    isBestSeller: false,
    isFlashSale: false,
    isNewArrival: true,
    isActive: true
  }
];

const initialCoupons: Coupon[] = [
  { id: 'c-tech10', code: 'TECH10', discountType: 'percentage', discountValue: 10, minPurchase: 100, isActive: true, expiryDate: '2027-12-31' },
  { id: 'c-super50', code: 'SUPER50', discountType: 'fixed', discountValue: 50, minPurchase: 500, isActive: true, expiryDate: '2027-12-31' },
  { id: 'c-welcome20', code: 'WELCOME20', discountType: 'percentage', discountValue: 20, minPurchase: 50, isActive: true, expiryDate: '2027-12-31' }
];

const initialReviews: Review[] = [
  { id: 'rev-1', productId: 'prod-macbook-pro-16', userId: 'user-demo', userName: 'Alex Johnson', rating: 5, comment: 'Incredible speed. The M3 Max compile times are insanely fast. Best laptop I have ever owned.', createdAt: new Date().toISOString() },
  { id: 'rev-2', productId: 'prod-galaxy-s24-ultra', userId: 'user-demo', userName: 'Sarah Connor', rating: 5, comment: 'The camera zoom and AI photo editing are magical! Screen brightness is brilliant even in direct sunlight.', createdAt: new Date().toISOString() },
  { id: 'rev-3', productId: 'prod-sony-wh1000xm5', userId: 'user-demo', userName: 'David Miller', rating: 4, comment: 'Superb sound stage and class-leading noise cancellation. Only downside is the head band size is a bit tight.', createdAt: new Date().toISOString() }
];

const initialTickets: SupportTicket[] = [
  {
    id: 't-1',
    userId: 'user-demo',
    userName: 'Demo User',
    userEmail: 'saadkust5481@gmail.com',
    subject: 'Delayed Shipping inquiry',
    message: 'Hello, my order #ORD-12345 has not shipped yet. Can you please check the status?',
    status: 'replied',
    responses: [
      { role: 'user', message: 'Hello, my order #ORD-12345 has not shipped yet. Can you please check the status?', createdAt: new Date(Date.now() - 3600000 * 2).toISOString() },
      { role: 'admin', message: 'Hi Demo, we apologize for the short delay. Your order has been processed and is scheduled for dispatch today. You will receive a tracking code shortly!', createdAt: new Date(Date.now() - 3600000).toISOString() }
    ],
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  }
];

const initialUsers: any[] = [
  {
    id: 'user-admin',
    name: 'Admin Manager',
    email: 'admin@techmart.com',
    passwordHash: '$2a$10$7R5vMbyV15eW59aVw/8FfeWvV4qscP5b3G0i3H2Nf1K49j9295w6G', // password123
    role: 'admin',
    phone: '+1 987 654 3210',
    address: '456 Tech Boulevard, Head Office',
    createdAt: new Date().toISOString()
  },
  {
    id: 'user-super',
    name: 'Super Administrator',
    email: 'superadmin@techmart.com',
    passwordHash: '$2a$10$7R5vMbyV15eW59aVw/8FfeWvV4qscP5b3G0i3H2Nf1K49j9295w6G', // password123
    role: 'superadmin',
    phone: '+1 000 000 0000',
    address: '000 Cloud Center, Global Headquarters',
    createdAt: new Date().toISOString()
  }
];

const initialOrders: Order[] = [
  {
    id: 'ORD-98765',
    userId: 'user-demo',
    userName: 'Demo User',
    userEmail: 'saadkust5481@gmail.com',
    items: [
      {
        productId: 'prod-sony-wh1000xm5',
        name: 'Sony WH-1000XM5 Wireless Headphones',
        brand: 'Sony',
        price: 399,
        quantity: 1,
        thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&q=80'
      }
    ],
    totalAmount: 399,
    discountAmount: 59.85, // 15% discount
    finalAmount: 339.15,
    status: 'delivered',
    shippingAddress: {
      name: 'Demo User',
      phone: '+1 234 567 8900',
      address: '123 Tech Avenue',
      city: 'Silicon Valley',
      country: 'USA'
    },
    paymentMethod: 'Credit Card',
    trackingNumber: 'TRK-SONY-77382',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
  },
  {
    id: 'ORD-54321',
    userId: 'user-demo',
    userName: 'Demo User',
    userEmail: 'saadkust5481@gmail.com',
    items: [
      {
        productId: 'prod-iphone-15-pro',
        name: 'iPhone 15 Pro Max',
        brand: 'Apple',
        price: 1199,
        quantity: 1,
        thumbnail: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=100&q=80'
      }
    ],
    totalAmount: 1199,
    discountAmount: 0,
    finalAmount: 1199,
    status: 'shipped',
    shippingAddress: {
      name: 'Demo User',
      phone: '+1 234 567 8900',
      address: '123 Tech Avenue',
      city: 'Silicon Valley',
      country: 'USA'
    },
    paymentMethod: 'Cash on Delivery',
    trackingNumber: 'TRK-APPLE-12294',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
  }
];

// High quality system FAQs used by Gemini
export interface FAQ {
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  { question: "What is your return policy?", answer: "We offer a 15-day return policy for standard electronics (such as laptops, keyboards, and watches) and a 7-day policy for smartphones. Items must be unopened, in original retail box, with all accessories intact." },
  { question: "Where do you deliver?", answer: "We ship internationally. Standard local delivery takes 2-3 business days, while express same-day shipping is available for major tech hubs." },
  { question: "How does the warranty work?", answer: "Products carry a 1-year to 3-year manufacturer warranty as indicated in their technical specifications. You can file a warranty repair ticket directly in your Customer Dashboard." },
  { question: "What payment methods are supported?", answer: "We support Visa, Mastercard, AMEX, PayPal, and Cash on Delivery (COD)." },
  { question: "Do you offer accessories suggestion?", answer: "Yes! Our AI Shopping Assistant can suggest accessories based on your cart contents or previous orders. Just ask!" }
];

// DB Operations wrapper
export const db = {
  getUsers: () => readJsonFile<any>('users.json', initialUsers),
  saveUsers: (data: any[]) => writeJsonFile('users.json', data),
  
  getProducts: () => readJsonFile<Product>('products.json', initialProducts),
  saveProducts: (data: Product[]) => writeJsonFile('products.json', data),
  
  getCategories: () => readJsonFile<Category>('categories.json', initialCategories),
  saveCategories: (data: Category[]) => writeJsonFile('categories.json', data),
  
  getBrands: () => readJsonFile<Brand>('brands.json', initialBrands),
  saveBrands: (data: Brand[]) => writeJsonFile('brands.json', data),
  
  getOrders: () => readJsonFile<Order>('orders.json', initialOrders),
  saveOrders: (data: Order[]) => writeJsonFile('orders.json', data),
  
  getReviews: () => readJsonFile<Review>('reviews.json', initialReviews),
  saveReviews: (data: Review[]) => writeJsonFile('reviews.json', data),
  
  getCoupons: () => readJsonFile<Coupon>('coupons.json', initialCoupons),
  saveCoupons: (data: Coupon[]) => writeJsonFile('coupons.json', data),
  
  getTickets: () => readJsonFile<SupportTicket>('tickets.json', initialTickets),
  saveTickets: (data: SupportTicket[]) => writeJsonFile('tickets.json', data),

  getNotifications: () => readJsonFile<Notification>('notifications.json', []),
  saveNotifications: (data: Notification[]) => writeJsonFile('notifications.json', data),

  getChatHistory: () => readJsonFile<ChatLog>('chathistory.json', []),
  saveChatHistory: (data: ChatLog[]) => writeJsonFile('chathistory.json', data),

  getFAQs: () => faqs
};

// Optionally test/initiate Mongoose in background
export async function initMongoose() {
  const uri = process.env.MONGODB_URI;
  if (
    !uri || 
    uri.includes("MY_MONGODB_URI") || 
    uri.includes("user:pass") || 
    uri.includes("<db_password>") || 
    uri.includes("<password>") || 
    uri.includes("db_password")
  ) {
    console.log("No custom MONGODB_URI configured. Seamlessly utilizing container persistent JSON database.");
    return;
  }
  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
    console.log("Connected successfully to MongoDB Atlas! Dynamic sync active.");
  } catch (error) {
    console.log("MongoDB is currently offline or unreachable. Seamlessly utilizing local container database instead.");
  }
}
