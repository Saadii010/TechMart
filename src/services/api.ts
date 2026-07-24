import { Product, Order, SupportTicket, Coupon, Review, Category, Brand, User } from '../types';

const API_BASE = '/api';

function getHeaders() {
  const token = localStorage.getItem('techmart_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  auth: {
    register: (body: any) => request<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body)
    }),
    login: (body: any) => request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body)
    }),
    getProfile: () => request<User>('/auth/profile'),
    updateProfile: (body: any) => request<{ message: string; user: User }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(body)
    }),
    changePassword: (body: any) => request<{ message: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(body)
    })
  },

  products: {
    getAll: (adminView = false) => request<Product[]>(`/products?adminView=${adminView}`),
    getById: (id: string) => request<Product>(`/products/${id}`),
    create: (body: any) => request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(body)
    }),
    update: (id: string, body: any) => request<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body)
    }),
    delete: (id: string) => request<{ message: string }>(`/products/${id}`, {
      method: 'DELETE'
    })
  },

  categories: {
    getAll: () => request<Category[]>('/categories'),
    create: (body: any) => request<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(body)
    }),
    delete: (id: string) => request<{ message: string }>(`/categories/${id}`, {
      method: 'DELETE'
    })
  },

  brands: {
    getAll: () => request<Brand[]>('/brands'),
    create: (body: any) => request<Brand>('/brands', {
      method: 'POST',
      body: JSON.stringify(body)
    }),
    delete: (id: string) => request<{ message: string }>(`/brands/${id}`, {
      method: 'DELETE'
    })
  },

  orders: {
    create: (body: any) => request<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(body)
    }),
    getMyOrders: () => request<Order[]>('/orders/my'),
    getAllOrders: () => request<Order[]>('/orders/all'),
    updateStatus: (id: string, body: any) => request<Order>(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(body)
    })
  },

  reviews: {
    add: (productId: string, body: any) => request<Review>(`/products/${productId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(body)
    }),
    getProductReviews: (productId: string) => request<Review[]>(`/products/${productId}/reviews`)
  },

  support: {
    createTicket: (body: any) => request<SupportTicket>('/support/tickets', {
      method: 'POST',
      body: JSON.stringify(body)
    }),
    getMyTickets: () => request<SupportTicket[]>('/support/tickets/my'),
    getAllTickets: () => request<SupportTicket[]>('/support/tickets/all'),
    replyTicket: (id: string, body: any) => request<SupportTicket>(`/support/tickets/${id}/reply`, {
      method: 'POST',
      body: JSON.stringify(body)
    }),
    closeTicket: (id: string) => request<SupportTicket>(`/support/tickets/${id}/close`, {
      method: 'PUT'
    })
  },

  coupons: {
    getAll: () => request<Coupon[]>('/coupons'),
    create: (body: any) => request<Coupon>('/coupons', {
      method: 'POST',
      body: JSON.stringify(body)
    }),
    toggle: (id: string) => request<Coupon>(`/coupons/${id}/toggle`, {
      method: 'PUT'
    }),
    delete: (id: string) => request<{ message: string }>(`/coupons/${id}`, {
      method: 'DELETE'
    }),
    validate: (body: any) => request<{ message: string; coupon: Coupon }>('/coupons/validate', {
      method: 'POST',
      body: JSON.stringify(body)
    })
  },

  notifications: {
    getMy: () => request<any[]>('/notifications'),
    markRead: () => request<{ message: string }>('/notifications/read', {
      method: 'POST'
    })
  },

  ai: {
    chat: (body: any) => request<{ reply: string }>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify(body)
    }),
    getLogs: () => request<any[]>('/ai/logs')
  },

  superadmin: {
    getUsers: () => request<any[]>('/superadmin/users'),
    createUser: (body: any) => request<any>('/superadmin/users', {
      method: 'POST',
      body: JSON.stringify(body)
    }),
    changeRole: (id: string, body: any) => request<any>(`/superadmin/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify(body)
    }),
    toggleSuspend: (id: string, body: { isSuspended: boolean }) => request<any>(`/superadmin/users/${id}/suspend`, {
      method: 'PUT',
      body: JSON.stringify(body)
    }),
    deleteUser: (id: string) => request<any>(`/superadmin/users/${id}`, {
      method: 'DELETE'
    }),
    getAnalytics: () => request<any>('/superadmin/analytics')
  }
};
