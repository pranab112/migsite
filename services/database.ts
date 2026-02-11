// MindGear Database Service
// Supports both LocalStorage (fallback) and SQLite API backend

import { api } from './api';
import { UserProfile, SavedBusinessStrategy, SavedStudyPlan, BusinessSolution, StudyPlan, Certificate, ClassSession } from '../types';

// --- Check Backend Availability ---
let useBackend = false;

const checkBackend = async () => {
  try {
    const API_BASE = window.location.hostname === 'localhost'
      ? 'http://localhost:3001'
      : '';
    const response = await fetch(`${API_BASE}/api/system/health`, { method: 'GET' });
    if (response.ok) {
      useBackend = true;
      console.log('MindGear: Connected to backend');
    }
  } catch {
    useBackend = false;
    console.log('MindGear: Using LocalStorage fallback');
  }
};

// Initialize backend check
checkBackend();

// --- SHARED DATA (fallback for when backend is not available) ---
export const AVAILABLE_CLASSES: ClassSession[] = [
  {
    id: 'class_fullstack_cloud_ai_01',
    title: 'Full Stack Development using Google Cloud AI',
    instructor: 'MindGear Expert Team',
    date: 'Starts Jan 1st',
    time: 'Daily Live Sessions',
    duration: '7 Days Bootcamp',
    description: 'A comprehensive journey from development to deployment. Learn to build scalable full-stack applications using React, Node.js, and integrate the power of Google Cloud Vertex AI and Gemini models.',
    capacity: 100,
    enrolled: 45,
    tags: ['Google Cloud', 'Gemini AI', 'React', 'Full Stack'],
    price: 'NPR 25,000',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: 'class_prompt_eng_01',
    title: 'Advanced Prompt Engineering',
    instructor: 'Sarah Connor',
    date: 'Next Tuesday',
    time: '2:00 PM - 4:00 PM EST',
    duration: '2 Hours',
    description: 'Stop guessing and start engineering. Learn the mathematical and linguistic structures behind effective LLM prompting for business automation.',
    capacity: 30,
    enrolled: 28,
    tags: ['LLM', 'Prompting', 'Automation'],
    price: 'NPR 3,500',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1000&auto=format&fit=crop'
  }
];

// --- SMART PRICING ENGINE ---
export const calculateSmartPrice = (user: UserProfile | null, basePrice: string, userHistoryCount: number = 0) => {
  const numericPrice = parseInt(basePrice.replace(/[^0-9]/g, '')) || 0;
  let discount = 0;
  let reason = "";

  if (!user) return { finalPrice: numericPrice, discount: 0, reason: "", originalPrice: numericPrice };

  if (userHistoryCount === 0) {
    discount = 0.10;
    reason = "Welcome Discount (10%)";
  } else if (userHistoryCount >= 2) {
    discount = 0.20;
    reason = "Loyalty Reward (20%)";
  }

  if (user.role === 'STUDENT') {
    discount += 0.05;
    reason += reason ? " + Student Bonus" : "Student Discount (5%)";
  }

  const finalPrice = Math.round(numericPrice * (1 - discount));
  return { finalPrice, discount: Math.round(discount * 100), reason, originalPrice: numericPrice };
};

// --- STORAGE KEYS ---
const KEYS = {
  USERS: 'mig_users',
  SESSION: 'mig_session',
  STRATEGIES: 'mig_strategies',
  PLANS: 'mig_plans',
  BOOKINGS: 'mig_bookings',
  TOKEN: 'mig_token'
};

// --- MOCK DATA ---
const MOCK_USERS: UserProfile[] = [
  { name: 'Alice Chen', email: 'alice@techcorp.com', role: 'BUSINESS', organization: 'TechCorp Solutions' },
  { name: 'Bob Smith', email: 'bob.s@university.edu', role: 'STUDENT', organization: 'MIT' },
  { name: 'Charlie Davis', email: 'charlie@startup.io', role: 'BUSINESS', organization: 'RapidLaunch IO' },
  { name: 'Dana Lee', email: 'dana@freelance.net', role: 'STUDENT', organization: 'Self-Taught' },
  { name: 'System Administrator', email: 'admin@mindisgear.com', role: 'ADMIN', organization: 'Mind is Gear' }
];

// Auth Listeners
const authListeners = new Set<(user: UserProfile | null) => void>();
const notifyAuth = (user: UserProfile | null) => authListeners.forEach(cb => cb(user));

// --- DATABASE SERVICE ---
export const db = {
  // System Operations
  system: {
    checkHealth: async () => {
      if (useBackend) {
        try {
          return await api.system.health();
        } catch (e) {
          console.error('Backend health check failed:', e);
        }
      }

      // LocalStorage fallback
      try {
        const usage = JSON.stringify(localStorage).length;
        const status = usage < 4500000 ? 'OK' : 'WARNING';
        return { status, message: 'System Online', usageBytes: usage };
      } catch (e) {
        return { status: 'ERROR', message: 'Storage Error', usageBytes: 0 };
      }
    },

    getStorageUsage: async () => {
      let total = 0;
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          total += (localStorage[key].length * 2);
        }
      }
      return {
        totalKB: (total / 1024).toFixed(2),
        usagePercent: (total / (5 * 1024 * 1024) * 100).toFixed(2)
      };
    },

    seedDatabase: async () => {
      if (useBackend) {
        try {
          return await api.admin.seedDatabase();
        } catch (e) {
          console.error('Backend seed failed:', e);
        }
      }

      // LocalStorage fallback
      const currentUsers = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
      if (currentUsers.length <= 1) {
        const seededUsers = [...currentUsers];
        MOCK_USERS.forEach(u => {
          if (!seededUsers.find((ex: any) => ex.email === u.email)) {
            seededUsers.push({ ...u, password: 'password123' });
          }
        });
        localStorage.setItem(KEYS.USERS, JSON.stringify(seededUsers));

        const bookings = [];
        const classes = AVAILABLE_CLASSES;
        for (let i = 0; i < 15; i++) {
          const randomUser = seededUsers[Math.floor(Math.random() * seededUsers.length)];
          const randomClass = classes[Math.floor(Math.random() * classes.length)];
          bookings.push({
            id: crypto.randomUUID(),
            user_id: randomUser.email,
            class_id: randomClass.id,
            created_at: new Date(Date.now() - Math.floor(Math.random() * 1000000000)).toISOString()
          });
        }
        localStorage.setItem(KEYS.BOOKINGS, JSON.stringify(bookings));
        return { success: true, message: `Database seeded with ${seededUsers.length} users and ${bookings.length} transactions.` };
      }
      return { success: false, message: 'Database already contains data. Seed skipped.' };
    },

    nuke: async () => {
      localStorage.clear();
      notifyAuth(null);
      return { success: true, message: 'System Factory Reset Complete.' };
    },

    isBackendConnected: () => useBackend
  },

  // Admin Operations
  admin: {
    getAllUsers: async (): Promise<UserProfile[]> => {
      if (useBackend) {
        try {
          const data = await api.admin.getUsers();
          return data.users.map((u: any) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            organization: u.organization
          }));
        } catch (e) {
          console.error('Backend get users failed:', e);
        }
      }

      // LocalStorage fallback
      const users = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
      return users.map((u: any) => ({
        name: u.name,
        email: u.email,
        role: u.role,
        organization: u.organization
      }));
    },

    deleteUser: async (emailOrId: string) => {
      if (useBackend) {
        try {
          await api.admin.deleteUser(emailOrId);
          return true;
        } catch (e) {
          console.error('Backend delete user failed:', e);
        }
      }

      // LocalStorage fallback
      const users = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
      const newUsers = users.filter((u: any) => u.email !== emailOrId && u.id !== emailOrId);
      localStorage.setItem(KEYS.USERS, JSON.stringify(newUsers));

      const bookings = JSON.parse(localStorage.getItem(KEYS.BOOKINGS) || '[]');
      const newBookings = bookings.filter((b: any) => b.user_id !== emailOrId);
      localStorage.setItem(KEYS.BOOKINGS, JSON.stringify(newBookings));

      return true;
    },

    getAllBookings: async () => {
      if (useBackend) {
        try {
          const data = await api.admin.getBookings();
          return data.bookings.map((b: any) => ({
            id: b.id,
            userName: b.user_name,
            userEmail: b.user_email,
            className: b.class_title,
            price: `NPR ${b.price_paid.toLocaleString()}`,
            date: b.created_at
          }));
        } catch (e) {
          console.error('Backend get bookings failed:', e);
        }
      }

      // LocalStorage fallback
      const bookings = JSON.parse(localStorage.getItem(KEYS.BOOKINGS) || '[]');
      const users = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');

      return bookings.map((b: any) => {
        const user = users.find((u: any) => u.email === b.user_id);
        const course = AVAILABLE_CLASSES.find(c => c.id === b.class_id);
        return {
          id: b.id,
          userName: user?.name || 'Unknown User',
          userEmail: b.user_id,
          className: course?.title || 'Legacy Course',
          price: course?.price || 'NPR 0',
          date: b.created_at
        };
      }).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },

    deleteBooking: async (id: string) => {
      if (useBackend) {
        try {
          await api.admin.deleteBooking(id);
          return true;
        } catch (e) {
          console.error('Backend delete booking failed:', e);
        }
      }

      // LocalStorage fallback
      const bookings = JSON.parse(localStorage.getItem(KEYS.BOOKINGS) || '[]');
      const newBookings = bookings.filter((b: any) => b.id !== id);
      localStorage.setItem(KEYS.BOOKINGS, JSON.stringify(newBookings));
      return true;
    }
  },

  // Auth Operations
  auth: {
    signUp: async (user: UserProfile, password: string): Promise<{ user: UserProfile, confirmationRequired: boolean }> => {
      if (useBackend) {
        try {
          const result = await api.auth.signUp({
            name: user.name,
            email: user.email,
            password,
            role: user.role,
            organization: user.organization
          });
          localStorage.setItem(KEYS.SESSION, JSON.stringify(result.user));
          notifyAuth(result.user);
          return { user: result.user, confirmationRequired: false };
        } catch (e: any) {
          throw new Error(e.message || 'Registration failed');
        }
      }

      // LocalStorage fallback
      const users = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');

      if (users.find((u: any) => u.email === user.email)) {
        throw new Error("User already exists with this email.");
      }

      const newUser = { ...user, password };
      users.push(newUser);
      localStorage.setItem(KEYS.USERS, JSON.stringify(users));
      localStorage.setItem(KEYS.SESSION, JSON.stringify(newUser));
      notifyAuth(user);

      return { user, confirmationRequired: false };
    },

    signIn: async (email: string, password: string): Promise<UserProfile> => {
      if (useBackend) {
        try {
          const result = await api.auth.signIn({ email, password });
          localStorage.setItem(KEYS.SESSION, JSON.stringify(result.user));
          notifyAuth(result.user);
          return result.user;
        } catch (e: any) {
          throw new Error(e.message || 'Invalid credentials');
        }
      }

      // LocalStorage fallback - check hardcoded admin
      if (email === 'admin@mindisgear.com' && password === 'admin123') {
        const admin = { name: 'System Administrator', email, role: 'ADMIN', organization: 'Internal' } as UserProfile;
        localStorage.setItem(KEYS.SESSION, JSON.stringify(admin));
        notifyAuth(admin);
        return admin;
      }

      const users = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
      const user = users.find((u: any) => u.email === email && u.password === password);

      if (!user) {
        throw new Error("Invalid credentials.");
      }

      const { password: _, ...safeUser } = user;
      localStorage.setItem(KEYS.SESSION, JSON.stringify(safeUser));
      notifyAuth(safeUser as UserProfile);
      return safeUser as UserProfile;
    },

    signOut: async (): Promise<void> => {
      if (useBackend) {
        api.auth.signOut();
      }
      localStorage.removeItem(KEYS.SESSION);
      localStorage.removeItem(KEYS.TOKEN);
      notifyAuth(null);
    },

    onAuthChange: (callback: (user: UserProfile | null) => void) => {
      authListeners.add(callback);
      const session = localStorage.getItem(KEYS.SESSION);
      if (session) callback(JSON.parse(session));
      else callback(null);

      return { subscription: { unsubscribe: () => authListeners.delete(callback) } };
    },

    getCurrentUser: async (): Promise<UserProfile | null> => {
      const session = localStorage.getItem(KEYS.SESSION);
      return session ? JSON.parse(session) : null;
    }
  },

  // Content Operations
  content: {
    // Business Strategies
    saveStrategy: async (email: string, industry: string, description: string, solutions: BusinessSolution[]): Promise<SavedBusinessStrategy> => {
      if (useBackend) {
        try {
          const result = await api.strategies.create({ industry, description, solutions });
          return {
            id: result.id,
            userId: email,
            date: new Date().toISOString(),
            industry,
            description,
            solutions
          };
        } catch (e) {
          console.error('Backend save strategy failed:', e);
        }
      }

      // LocalStorage fallback
      const strategies = JSON.parse(localStorage.getItem(KEYS.STRATEGIES) || '[]');
      const newStrategy: SavedBusinessStrategy = {
        id: crypto.randomUUID(),
        userId: email,
        date: new Date().toISOString(),
        industry,
        description,
        solutions
      };
      strategies.unshift(newStrategy);
      localStorage.setItem(KEYS.STRATEGIES, JSON.stringify(strategies));
      return newStrategy;
    },

    getStrategies: async (email: string): Promise<SavedBusinessStrategy[]> => {
      if (useBackend) {
        try {
          const strategies = await api.strategies.getMyStrategies();
          return strategies.map((s: any) => ({
            id: s.id,
            userId: s.user_id,
            date: s.created_at,
            industry: s.industry,
            description: s.description,
            solutions: s.solutions
          }));
        } catch (e) {
          console.error('Backend get strategies failed:', e);
        }
      }

      // LocalStorage fallback
      const strategies = JSON.parse(localStorage.getItem(KEYS.STRATEGIES) || '[]');
      return strategies.filter((s: any) => s.userId === email);
    },

    // Study Plans
    savePlan: async (email: string, plan: StudyPlan): Promise<SavedStudyPlan> => {
      if (useBackend) {
        try {
          const result = await api.plans.create({
            topic: plan.topic,
            difficulty: plan.difficulty,
            roadmap: plan.roadmap
          });
          return {
            ...plan,
            id: result.id,
            userId: email,
            createdAt: new Date().toISOString(),
            completedWeeks: [],
            certificate: null
          };
        } catch (e) {
          console.error('Backend save plan failed:', e);
        }
      }

      // LocalStorage fallback
      const plans = JSON.parse(localStorage.getItem(KEYS.PLANS) || '[]');
      const newPlan: SavedStudyPlan = {
        ...plan,
        id: crypto.randomUUID(),
        userId: email,
        createdAt: new Date().toISOString(),
        completedWeeks: [],
        certificate: null
      };
      plans.unshift(newPlan);
      localStorage.setItem(KEYS.PLANS, JSON.stringify(plans));
      return newPlan;
    },

    updateStudyProgress: async (email: string, planId: string, completedWeeks: number[], certificate?: Certificate | null): Promise<void> => {
      if (useBackend) {
        try {
          await api.plans.update(planId, { completed_weeks: completedWeeks, certificate });
          return;
        } catch (e) {
          console.error('Backend update progress failed:', e);
        }
      }

      // LocalStorage fallback
      const plans = JSON.parse(localStorage.getItem(KEYS.PLANS) || '[]');
      const index = plans.findIndex((p: any) => p.id === planId);
      if (index !== -1) {
        plans[index].completedWeeks = completedWeeks;
        if (certificate) plans[index].certificate = certificate;
        localStorage.setItem(KEYS.PLANS, JSON.stringify(plans));
      }
    },

    getPlans: async (email: string): Promise<SavedStudyPlan[]> => {
      if (useBackend) {
        try {
          const plans = await api.plans.getMyPlans();
          return plans.map((p: any) => ({
            id: p.id,
            userId: p.user_id,
            topic: p.topic,
            difficulty: p.difficulty,
            roadmap: p.roadmap,
            completedWeeks: p.completed_weeks || [],
            certificate: p.certificate,
            createdAt: p.created_at
          }));
        } catch (e) {
          console.error('Backend get plans failed:', e);
        }
      }

      // LocalStorage fallback
      const plans = JSON.parse(localStorage.getItem(KEYS.PLANS) || '[]');
      return plans.filter((p: any) => p.userId === email);
    },

    // Class Bookings
    bookClass: async (email: string, classId: string): Promise<void> => {
      const classData = AVAILABLE_CLASSES.find(c => c.id === classId);
      if (!classData) return;

      if (useBackend) {
        try {
          await api.bookings.create({
            class_id: classId,
            payment_method: 'ESEWA',
            payment_id: 'PAY-' + Math.random().toString(36).substring(7).toUpperCase(),
            price_paid: parseInt(classData.price.replace(/[^0-9]/g, '')) || 0
          });
          return;
        } catch (e) {
          console.error('Backend book class failed:', e);
        }
      }

      // LocalStorage fallback
      const bookings = JSON.parse(localStorage.getItem(KEYS.BOOKINGS) || '[]');
      if (!bookings.some((b: any) => b.user_id === email && b.class_id === classId)) {
        bookings.push({
          id: crypto.randomUUID(),
          user_id: email,
          class_id: classId,
          created_at: new Date().toISOString()
        });
        localStorage.setItem(KEYS.BOOKINGS, JSON.stringify(bookings));
      }
    },

    getBookedClasses: async (email: string): Promise<string[]> => {
      if (useBackend) {
        try {
          const bookings = await api.bookings.getMyBookings();
          return bookings.map((b: any) => b.class_id);
        } catch (e) {
          console.error('Backend get bookings failed:', e);
        }
      }

      // LocalStorage fallback
      const bookings = JSON.parse(localStorage.getItem(KEYS.BOOKINGS) || '[]');
      return bookings
        .filter((b: any) => b.user_id === email)
        .map((b: any) => b.class_id);
    },

    // Get available classes (from backend or fallback)
    getAvailableClasses: async (): Promise<ClassSession[]> => {
      if (useBackend) {
        try {
          const classes = await api.classes.getAll();
          return classes.map((c: any) => ({
            id: c.id,
            title: c.title,
            instructor: c.instructor,
            date: c.date,
            time: c.time,
            duration: c.duration,
            description: c.description,
            capacity: c.capacity,
            enrolled: c.enrolled,
            tags: c.tags,
            price: c.price,
            image: c.image
          }));
        } catch (e) {
          console.error('Backend get classes failed:', e);
        }
      }

      // Return fallback classes
      return AVAILABLE_CLASSES;
    }
  }
};

export default db;
