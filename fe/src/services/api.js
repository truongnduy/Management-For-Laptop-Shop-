const API_BASE_URL = 'http://localhost:3000/api/authen';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  // Authentication
  login: async (username, password) => {
    const res = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    return res.json();
  },

  register: async (username, email, password, passwordConfirmation) => {
    const res = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user: {
          username,
          email,
          password,
          password_confirmation: passwordConfirmation
        }
      }),
    });
    return res.json();
  },

  getCurrentUser: async () => {
    const res = await fetch(`${API_BASE_URL}/me`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  // Products
  getProducts: async (page = 1, perPage = 12) => {
    const res = await fetch(`${API_BASE_URL}/products?page=${page}&per_page=${perPage}`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  getProduct: async (id) => {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  // Cart
  getCart: async () => {
    const res = await fetch(`${API_BASE_URL}/cart`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  addToCart: async (productId, quantity = 1) => {
    const res = await fetch(`${API_BASE_URL}/cart/add`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ product_id: productId, quantity }),
    });
    return res.json();
  },

  updateCartItem: async (cartItemId, quantity) => {
    const res = await fetch(`${API_BASE_URL}/cart/update/${cartItemId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ quantity }),
    });
    return res.json();
  },

  removeCartItem: async (cartItemId) => {
    const res = await fetch(`${API_BASE_URL}/cart/remove/${cartItemId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return res.json();
  },

  // Order & Checkout
  checkout: async (address, city, phone) => {
    const res = await fetch(`${API_BASE_URL}/orders/checkout`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        shipping: { address, city, phone }
      }),
    });
    return res.json();
  },

  getOrders: async () => {
    const res = await fetch(`${API_BASE_URL}/orders`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  updateOrder: async (orderId, status) => {
    const res = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    return res.json();
  },

  // Admin Products management
  createProduct: async (productData) => {
    const res = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ product: productData }),
    });
    return res.json();
  },

  updateProductData: async (productId, productData) => {
    const res = await fetch(`${API_BASE_URL}/products/${productId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ product: productData }),
    });
    return res.json();
  },

  deleteProduct: async (productId) => {
    const res = await fetch(`${API_BASE_URL}/products/${productId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return res.json();
  },

  // Admin Users management
  getUsers: async () => {
    const res = await fetch(`${API_BASE_URL}/users`, {
      headers: getHeaders(),
    });
    return res.json();
  }
};
