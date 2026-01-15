
import { UserProfile, SavedBusinessStrategy, SavedStudyPlan, BusinessSolution, StudyPlan, Certificate, ClassSession } from '../types';

// --- SHARED DATA ---
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

  if (!user) return { finalPrice: numericPrice, discount: 0, reason: "" };

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

// --- LOCAL STORAGE DATABASE IMPLEMENTATION ---

const KEYS = {
  USERS: 'mig_users',
  SESSION: 'mig_session',
  STRATEGIES: 'mig_strategies',
  PLANS: 'mig_plans',
  BOOKINGS: 'mig_bookings'
};

// Helper for Auth Listeners
const authListeners = new Set<(user: UserProfile | null) => void>();
const notifyAuth = (user: UserProfile | null) => authListeners.forEach(cb => cb(user));

export const db = {
  system: {
    checkHealth: async () => {
        // LocalStorage is always available in the browser
        return { status: 'OK', message: 'Local System Ready' };
    }
  },

  admin: {
    getAllUsers: async (): Promise<UserProfile[]> => {
      const users = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
      return users.map((u: any) => ({
        name: u.name,
        email: u.email,
        role: u.role,
        organization: u.organization
      }));
    },
    getAllBookings: async () => {
      const bookings = JSON.parse(localStorage.getItem(KEYS.BOOKINGS) || '[]');
      const users = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
      
      return bookings.map((b: any) => {
        const user = users.find((u: any) => u.email === b.user_id);
        const course = AVAILABLE_CLASSES.find(c => c.id === b.class_id);
        return {
          userName: user?.name || 'Unknown',
          userEmail: b.user_id,
          className: course?.title || b.class_id,
          price: course?.price || 'NPR 0',
          date: b.created_at
        };
      });
    }
  },

  auth: {
    signUp: async (user: UserProfile, password: string): Promise<{ user: UserProfile, confirmationRequired: boolean }> => {
      const users = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
      
      if (users.find((u: any) => u.email === user.email)) {
        throw new Error("User already exists with this email.");
      }
      
      const newUser = { ...user, password }; // In a real app, never store passwords plainly
      users.push(newUser);
      localStorage.setItem(KEYS.USERS, JSON.stringify(users));

      // Auto login after signup
      localStorage.setItem(KEYS.SESSION, JSON.stringify(newUser));
      notifyAuth(user);

      return { user, confirmationRequired: false };
    },
    signIn: async (email: string, password: string): Promise<UserProfile> => {
      // Hardcoded Admin
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
      localStorage.removeItem(KEYS.SESSION);
      notifyAuth(null);
    },
    onAuthChange: (callback: (user: UserProfile | null) => void) => {
      authListeners.add(callback);
      // Initial state
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
  
  content: {
    saveStrategy: async (email: string, industry: string, description: string, solutions: BusinessSolution[]): Promise<SavedBusinessStrategy> => {
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
      const strategies = JSON.parse(localStorage.getItem(KEYS.STRATEGIES) || '[]');
      return strategies.filter((s: any) => s.userId === email);
    },
    savePlan: async (email: string, plan: StudyPlan): Promise<SavedStudyPlan> => {
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
      const plans = JSON.parse(localStorage.getItem(KEYS.PLANS) || '[]');
      const index = plans.findIndex((p: any) => p.id === planId);
      if (index !== -1) {
        plans[index].completedWeeks = completedWeeks;
        if (certificate) plans[index].certificate = certificate;
        localStorage.setItem(KEYS.PLANS, JSON.stringify(plans));
      }
    },
    getPlans: async (email: string): Promise<SavedStudyPlan[]> => {
      const plans = JSON.parse(localStorage.getItem(KEYS.PLANS) || '[]');
      return plans.filter((p: any) => p.userId === email);
    },
    bookClass: async (email: string, classId: string): Promise<void> => {
      const bookings = JSON.parse(localStorage.getItem(KEYS.BOOKINGS) || '[]');
      // Prevent duplicate
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
      const bookings = JSON.parse(localStorage.getItem(KEYS.BOOKINGS) || '[]');
      return bookings
        .filter((b: any) => b.user_id === email)
        .map((b: any) => b.class_id);
    }
  }
};
