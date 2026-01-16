// API Service for communicating with the MindGear backend
const API_BASE = window.location.hostname === 'localhost'
  ? 'http://localhost:3001/api'
  : '/api';

// Token management
let authToken: string | null = localStorage.getItem('mig_token');

const setToken = (token: string | null) => {
  authToken = token;
  if (token) {
    localStorage.setItem('mig_token', token);
  } else {
    localStorage.removeItem('mig_token');
  }
};

const getToken = () => authToken;

// API request helper
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'API request failed');
  }

  return data;
};

// Auth API
export const authApi = {
  signUp: async (userData: { name: string; email: string; password: string; role?: string; organization?: string }) => {
    const data = await apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    if (data.token) setToken(data.token);
    return data;
  },

  signIn: async (credentials: { email: string; password: string }) => {
    const data = await apiRequest('/auth/signin', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    if (data.token) setToken(data.token);
    return data;
  },

  signOut: () => {
    setToken(null);
    localStorage.removeItem('mig_session');
  },

  getMe: async () => {
    return await apiRequest('/auth/me');
  },

  isAuthenticated: () => !!authToken,

  changePassword: async (currentPassword: string, newPassword: string) => {
    return await apiRequest('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword })
    });
  }
};

// Classes/Courses API
export const classesApi = {
  getAll: async () => {
    return await apiRequest('/classes');
  },

  getById: async (id: string) => {
    return await apiRequest(`/classes/${id}`);
  }
};

// Bookings API
export const bookingsApi = {
  create: async (bookingData: { class_id: string; payment_method: string; payment_id: string; price_paid: number }) => {
    return await apiRequest('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData)
    });
  },

  getMyBookings: async () => {
    return await apiRequest('/bookings');
  }
};

// Study Plans API
export const plansApi = {
  create: async (planData: { topic: string; difficulty: string; roadmap: any[] }) => {
    return await apiRequest('/plans', {
      method: 'POST',
      body: JSON.stringify(planData)
    });
  },

  getMyPlans: async () => {
    return await apiRequest('/plans');
  },

  update: async (id: string, data: { completed_weeks?: number[]; certificate?: any }) => {
    return await apiRequest(`/plans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }
};

// Business Strategies API
export const strategiesApi = {
  create: async (strategyData: { industry: string; description: string; solutions: any[] }) => {
    return await apiRequest('/strategies', {
      method: 'POST',
      body: JSON.stringify(strategyData)
    });
  },

  getMyStrategies: async () => {
    return await apiRequest('/strategies');
  }
};

// Contact API
export const contactApi = {
  submit: async (data: { first_name: string; last_name: string; email: string; message: string }) => {
    return await apiRequest('/contact', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
};

// Public Settings API
export const settingsApi = {
  getPublic: async () => {
    return await apiRequest('/settings/public');
  }
};

// System API
export const systemApi = {
  health: async () => {
    return await apiRequest('/system/health');
  }
};

// Admin API
export const adminApi = {
  // Analytics
  getAnalytics: async () => {
    return await apiRequest('/admin/analytics');
  },

  // Users
  getUsers: async (params?: { search?: string; role?: string; status?: string; page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.role) queryParams.append('role', params.role);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    return await apiRequest(`/admin/users?${queryParams.toString()}`);
  },

  getUser: async (id: string) => {
    return await apiRequest(`/admin/users/${id}`);
  },

  createUser: async (userData: any) => {
    return await apiRequest('/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  updateUser: async (id: string, userData: any) => {
    return await apiRequest(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  },

  deleteUser: async (id: string) => {
    return await apiRequest(`/admin/users/${id}`, {
      method: 'DELETE'
    });
  },

  // Classes
  getClasses: async () => {
    return await apiRequest('/admin/classes');
  },

  createClass: async (classData: any) => {
    return await apiRequest('/admin/classes', {
      method: 'POST',
      body: JSON.stringify(classData)
    });
  },

  updateClass: async (id: string, classData: any) => {
    return await apiRequest(`/admin/classes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(classData)
    });
  },

  deleteClass: async (id: string) => {
    return await apiRequest(`/admin/classes/${id}`, {
      method: 'DELETE'
    });
  },

  // Bookings
  getBookings: async (params?: { status?: string; page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    return await apiRequest(`/admin/bookings?${queryParams.toString()}`);
  },

  updateBookingStatus: async (id: string, status: string) => {
    return await apiRequest(`/admin/bookings/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  },

  deleteBooking: async (id: string) => {
    return await apiRequest(`/admin/bookings/${id}`, {
      method: 'DELETE'
    });
  },

  // Plans
  getPlans: async () => {
    return await apiRequest('/admin/plans');
  },

  // Certificates
  getCertificates: async () => {
    return await apiRequest('/admin/certificates');
  },

  // Contacts
  getContacts: async () => {
    return await apiRequest('/admin/contacts');
  },

  markContactRead: async (id: string) => {
    return await apiRequest(`/admin/contacts/${id}/read`, {
      method: 'PUT'
    });
  },

  deleteContact: async (id: string) => {
    return await apiRequest(`/admin/contacts/${id}`, {
      method: 'DELETE'
    });
  },

  // Logs
  getLogs: async (params?: { page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    return await apiRequest(`/admin/logs?${queryParams.toString()}`);
  },

  // Settings
  getSettings: async () => {
    return await apiRequest('/admin/settings');
  },

  updateSetting: async (key: string, value: string) => {
    return await apiRequest(`/admin/settings/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ value })
    });
  },

  // Database
  getDatabaseStats: async () => {
    return await apiRequest('/admin/database/stats');
  },

  seedDatabase: async () => {
    return await apiRequest('/admin/database/seed', {
      method: 'POST'
    });
  },

  // Team Management
  getTeam: async () => {
    return await apiRequest('/admin/team');
  },

  createTeamMember: async (memberData: any) => {
    return await apiRequest('/admin/team', {
      method: 'POST',
      body: JSON.stringify(memberData)
    });
  },

  updateTeamMember: async (id: string, memberData: any) => {
    return await apiRequest(`/admin/team/${id}`, {
      method: 'PUT',
      body: JSON.stringify(memberData)
    });
  },

  deleteTeamMember: async (id: string) => {
    return await apiRequest(`/admin/team/${id}`, {
      method: 'DELETE'
    });
  },

  // Project Management
  getProjects: async () => {
    return await apiRequest('/admin/projects');
  },

  createProject: async (projectData: any) => {
    return await apiRequest('/admin/projects', {
      method: 'POST',
      body: JSON.stringify(projectData)
    });
  },

  updateProject: async (id: string, projectData: any) => {
    return await apiRequest(`/admin/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(projectData)
    });
  },

  deleteProject: async (id: string) => {
    return await apiRequest(`/admin/projects/${id}`, {
      method: 'DELETE'
    });
  }
};

// Export combined API object
export const api = {
  auth: authApi,
  classes: classesApi,
  bookings: bookingsApi,
  plans: plansApi,
  strategies: strategiesApi,
  contact: contactApi,
  settings: settingsApi,
  system: systemApi,
  admin: adminApi,
  setToken,
  getToken
};

export default api;
