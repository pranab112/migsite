import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set('trust proxy', 1); // Trust first proxy (Railway, Render, etc.)
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'mindgear-secret-key-2024';

// Security Constants
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 15;
const PASSWORD_MIN_LENGTH = 8;

// Initialize SQLite Database
const db = new Database(path.join(__dirname, 'mindgear.db'));
db.pragma('journal_mode = WAL');

// ============================================
// RATE LIMITERS (DDoS & Brute Force Protection)
// ============================================

// General API rate limiter - 100 requests per minute per IP
const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiter for auth endpoints - 5 attempts per minute
const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: { error: 'Too many authentication attempts. Please wait a minute before trying again.' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
});

// Very strict limiter for signup - 3 per hour per IP
const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: { error: 'Too many accounts created. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increased limit for image uploads
app.use(generalLimiter); // Apply general rate limiting to all routes

// Serve static files from the frontend build
const clientBuildPath = path.join(__dirname, '..', 'dist');
app.use(express.static(clientBuildPath));

// ============================================
// DATABASE SCHEMA INITIALIZATION
// ============================================
const initDatabase = () => {
  // Users Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'STUDENT' CHECK(role IN ('GUEST', 'BUSINESS', 'STUDENT', 'ADMIN')),
      organization TEXT,
      avatar TEXT,
      is_active INTEGER DEFAULT 1,
      locked_until TEXT,
      failed_login_attempts INTEGER DEFAULT 0,
      last_login TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Login Attempts Table (for tracking failed logins by IP)
  db.exec(`
    CREATE TABLE IF NOT EXISTS login_attempts (
      id TEXT PRIMARY KEY,
      ip_address TEXT NOT NULL,
      email TEXT,
      attempt_type TEXT CHECK(attempt_type IN ('LOGIN', 'SIGNUP')),
      success INTEGER DEFAULT 0,
      user_agent TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create index for faster IP lookups
  db.exec(`CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON login_attempts(ip_address, created_at)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON login_attempts(email, created_at)`);

  // Classes/Courses Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS classes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      instructor TEXT NOT NULL,
      date TEXT,
      time TEXT,
      duration TEXT,
      description TEXT,
      capacity INTEGER DEFAULT 100,
      enrolled INTEGER DEFAULT 0,
      price INTEGER NOT NULL,
      image TEXT,
      tags TEXT,
      is_active INTEGER DEFAULT 1,
      is_featured INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Bookings/Enrollments Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      class_id TEXT NOT NULL,
      price_paid INTEGER NOT NULL,
      discount_applied INTEGER DEFAULT 0,
      payment_method TEXT,
      payment_id TEXT,
      status TEXT DEFAULT 'COMPLETED' CHECK(status IN ('PENDING', 'COMPLETED', 'REFUNDED', 'CANCELLED')),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (class_id) REFERENCES classes(id)
    )
  `);

  // Study Plans Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS study_plans (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      topic TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      roadmap TEXT NOT NULL,
      completed_weeks TEXT DEFAULT '[]',
      certificate TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Business Strategies Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS business_strategies (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      industry TEXT NOT NULL,
      description TEXT NOT NULL,
      solutions TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Contact Submissions Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS contact_submissions (
      id TEXT PRIMARY KEY,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Activity Logs Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      action TEXT NOT NULL,
      details TEXT,
      ip_address TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Settings Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      id TEXT PRIMARY KEY,
      key TEXT UNIQUE NOT NULL,
      value TEXT NOT NULL,
      description TEXT,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Certificates Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS certificates (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      plan_id TEXT NOT NULL,
      student_name TEXT NOT NULL,
      course_name TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      issue_date TEXT NOT NULL,
      signature TEXT DEFAULT 'Mind is Gear Academy',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (plan_id) REFERENCES study_plans(id)
    )
  `);

  // Team Members Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS team_members (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      bio TEXT,
      image TEXT,
      linkedin TEXT,
      twitter TEXT,
      display_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Fix any team members with NULL is_active (migration)
  db.prepare('UPDATE team_members SET is_active = 1 WHERE is_active IS NULL').run();

  // Projects Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      client TEXT,
      description TEXT,
      image TEXT,
      stats TEXT,
      technologies TEXT,
      display_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create default admin if not exists
  const adminExists = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@mindisgear.com');
  if (!adminExists) {
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    db.prepare(`
      INSERT INTO users (id, name, email, password_hash, role, organization)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(uuidv4(), 'System Administrator', 'admin@mindisgear.com', hashedPassword, 'ADMIN', 'Mind is Gear');
  }

  // Insert default courses if not exists
  const coursesExist = db.prepare('SELECT COUNT(*) as count FROM classes').get();
  if (coursesExist.count === 0) {
    const defaultCourses = [
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
        price: 25000,
        image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop',
        tags: JSON.stringify(['Google Cloud', 'Gemini AI', 'React', 'Full Stack']),
        is_featured: 1
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
        price: 3500,
        image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1000&auto=format&fit=crop',
        tags: JSON.stringify(['LLM', 'Prompting', 'Automation']),
        is_featured: 1
      }
    ];

    const insertCourse = db.prepare(`
      INSERT INTO classes (id, title, instructor, date, time, duration, description, capacity, enrolled, price, image, tags, is_featured)
      VALUES (@id, @title, @instructor, @date, @time, @duration, @description, @capacity, @enrolled, @price, @image, @tags, @is_featured)
    `);

    defaultCourses.forEach(course => insertCourse.run(course));
  }

  // Insert default settings
  const settingsExist = db.prepare('SELECT COUNT(*) as count FROM settings').get();
  if (settingsExist.count === 0) {
    const defaultSettings = [
      { key: 'site_name', value: 'Mind is Gear', description: 'Website name' },
      { key: 'welcome_discount', value: '10', description: 'Welcome discount percentage for new users' },
      { key: 'loyalty_discount', value: '20', description: 'Loyalty discount for users with 2+ bookings' },
      { key: 'student_discount', value: '5', description: 'Additional discount for students' },
      { key: 'maintenance_mode', value: 'false', description: 'Enable/disable maintenance mode' }
    ];

    const insertSetting = db.prepare(`
      INSERT INTO settings (id, key, value, description)
      VALUES (?, ?, ?, ?)
    `);

    defaultSettings.forEach(s => insertSetting.run(uuidv4(), s.key, s.value, s.description));
  }

  // Insert default projects
  const projectsExist = db.prepare('SELECT COUNT(*) as count FROM projects').get();
  if (projectsExist.count === 0) {
    const defaultProjects = [
      {
        id: 'project_1',
        title: 'Nexus Logistics Core',
        category: 'Supply Chain AI',
        client: 'Global Shipping Corp',
        description: 'A fully autonomous fleet management system that reduced delivery latency by 40% using predictive routing algorithms.',
        image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1000&auto=format&fit=crop',
        stats: JSON.stringify([
          { label: '40% Faster Delivery', icon: 'zap' },
          { label: '2.4M Routes/Day', icon: 'activity' }
        ]),
        technologies: JSON.stringify(['Python', 'TensorFlow', 'IoT']),
        display_order: 1
      },
      {
        id: 'project_2',
        title: 'Aegis Financial Sentinel',
        category: 'FinTech Security',
        client: 'NeoBank Systems',
        description: 'Real-time fraud detection engine processing high-frequency transactions with 99.9% accuracy via anomaly detection models.',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop',
        stats: JSON.stringify([
          { label: '$500M Secured', icon: 'shield' },
          { label: '12ms Latency', icon: 'clock' }
        ]),
        technologies: JSON.stringify(['Go', 'Kafka', 'Vertex AI']),
        display_order: 2
      },
      {
        id: 'project_3',
        title: 'Medi-Synapse Grid',
        category: 'Healthcare Data',
        client: 'City General Hospital',
        description: 'Unified patient data pipeline that utilizes NLP to summarize clinical notes and automate insurance coding.',
        image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=1000&auto=format&fit=crop',
        stats: JSON.stringify([
          { label: '85% Less Paperwork', icon: 'file' },
          { label: 'HIPAA Compliant', icon: 'check' }
        ]),
        technologies: JSON.stringify(['React', 'NLP', 'Cloud Run']),
        display_order: 3
      }
    ];

    const insertProject = db.prepare(`
      INSERT INTO projects (id, title, category, client, description, image, stats, technologies, display_order)
      VALUES (@id, @title, @category, @client, @description, @image, @stats, @technologies, @display_order)
    `);

    defaultProjects.forEach(project => insertProject.run(project));
  }

  console.log('Database initialized successfully');
};

// ============================================
// AUTH MIDDLEWARE
// ============================================
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Log activity helper
const logActivity = (userId, action, details, ipAddress = null) => {
  db.prepare(`
    INSERT INTO activity_logs (id, user_id, action, details, ip_address)
    VALUES (?, ?, ?, ?, ?)
  `).run(uuidv4(), userId, action, details, ipAddress);
};

// ============================================
// SECURITY HELPER FUNCTIONS
// ============================================

// Get client IP address (handles proxies)
const getClientIP = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
         req.headers['x-real-ip'] ||
         req.connection?.remoteAddress ||
         req.ip ||
         'unknown';
};

// Password strength validation
const validatePassword = (password) => {
  const errors = [];

  if (!password || password.length < PASSWORD_MIN_LENGTH) {
    errors.push(`Password must be at least ${PASSWORD_MIN_LENGTH} characters long`);
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Email validation
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Check if account is locked
const isAccountLocked = (user) => {
  if (!user.locked_until) return false;
  return new Date(user.locked_until) > new Date();
};

// Lock account after failed attempts
const lockAccount = (userId) => {
  const lockUntil = new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000).toISOString();
  db.prepare('UPDATE users SET locked_until = ?, failed_login_attempts = 0 WHERE id = ?').run(lockUntil, userId);
  return lockUntil;
};

// Increment failed login attempts
const incrementFailedAttempts = (userId) => {
  const result = db.prepare('UPDATE users SET failed_login_attempts = failed_login_attempts + 1 WHERE id = ?').run(userId);
  const user = db.prepare('SELECT failed_login_attempts FROM users WHERE id = ?').get(userId);
  return user?.failed_login_attempts || 0;
};

// Reset failed login attempts on successful login
const resetFailedAttempts = (userId) => {
  db.prepare('UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE id = ?').run(userId);
};

// Log login attempt (for security monitoring)
const logLoginAttempt = (ipAddress, email, attemptType, success, userAgent) => {
  db.prepare(`
    INSERT INTO login_attempts (id, ip_address, email, attempt_type, success, user_agent)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(uuidv4(), ipAddress, email, attemptType, success ? 1 : 0, userAgent);
};

// Check for suspicious activity (too many failed attempts from IP)
const checkSuspiciousIP = (ipAddress) => {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  const attempts = db.prepare(`
    SELECT COUNT(*) as count FROM login_attempts
    WHERE ip_address = ? AND created_at > ? AND success = 0
  `).get(ipAddress, fiveMinutesAgo);

  return attempts.count >= 10; // Block if 10+ failed attempts in 5 minutes
};

// Clean up old login attempts (run periodically)
const cleanupOldAttempts = () => {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  db.prepare('DELETE FROM login_attempts WHERE created_at < ?').run(oneDayAgo);
};

// Run cleanup every hour
setInterval(cleanupOldAttempts, 60 * 60 * 1000);

// ============================================
// AUTH ROUTES
// ============================================
app.post('/api/auth/signup', signupLimiter, (req, res) => {
  const ipAddress = getClientIP(req);
  const userAgent = req.headers['user-agent'] || 'unknown';

  try {
    const { name, email, password, role, organization } = req.body;

    // Check for suspicious IP activity
    if (checkSuspiciousIP(ipAddress)) {
      logLoginAttempt(ipAddress, email, 'SIGNUP', false, userAgent);
      return res.status(429).json({ error: 'Too many attempts. Please try again later.' });
    }

    // Validate required fields
    if (!name || !email || !password) {
      logLoginAttempt(ipAddress, email, 'SIGNUP', false, userAgent);
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Validate email format
    if (!validateEmail(email)) {
      logLoginAttempt(ipAddress, email, 'SIGNUP', false, userAgent);
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      logLoginAttempt(ipAddress, email, 'SIGNUP', false, userAgent);
      return res.status(400).json({
        error: 'Password does not meet requirements',
        details: passwordValidation.errors
      });
    }

    // Sanitize name (prevent XSS)
    const sanitizedName = name.trim().substring(0, 100).replace(/[<>]/g, '');

    // Check if user exists (generic message to prevent enumeration)
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
    if (existingUser) {
      // Log but return generic message
      logLoginAttempt(ipAddress, email, 'SIGNUP', false, userAgent);
      // Delay response to prevent timing attacks
      setTimeout(() => {
        res.status(400).json({ error: 'Unable to create account. Please try a different email or contact support.' });
      }, Math.random() * 200 + 100);
      return;
    }

    const id = uuidv4();
    const password_hash = bcrypt.hashSync(password, 12); // Increased from 10 to 12 rounds
    const userRole = role === 'ADMIN' ? 'STUDENT' : role; // Prevent creating admin via signup

    db.prepare(`
      INSERT INTO users (id, name, email, password_hash, role, organization)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, sanitizedName, email.toLowerCase(), password_hash, userRole || 'STUDENT', organization || null);

    const user = { id, name: sanitizedName, email: email.toLowerCase(), role: userRole || 'STUDENT', organization };
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });

    logLoginAttempt(ipAddress, email, 'SIGNUP', true, userAgent);
    logActivity(id, 'USER_SIGNUP', `New user registered: ${email}`, ipAddress);

    res.json({ user, token });
  } catch (error) {
    console.error('Signup error:', error);
    logLoginAttempt(ipAddress, req.body?.email, 'SIGNUP', false, userAgent);
    res.status(500).json({ error: 'Registration failed. Please try again later.' });
  }
});

app.post('/api/auth/signin', authLimiter, (req, res) => {
  const ipAddress = getClientIP(req);
  const userAgent = req.headers['user-agent'] || 'unknown';

  try {
    const { email, password } = req.body;

    // Check for suspicious IP activity
    if (checkSuspiciousIP(ipAddress)) {
      logLoginAttempt(ipAddress, email, 'LOGIN', false, userAgent);
      return res.status(429).json({ error: 'Too many failed attempts. Please try again later.' });
    }

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());

    // User not found - generic message + artificial delay
    if (!user) {
      logLoginAttempt(ipAddress, email, 'LOGIN', false, userAgent);
      // Artificial delay to prevent timing attacks
      setTimeout(() => {
        res.status(401).json({ error: 'Invalid credentials' });
      }, Math.random() * 200 + 100);
      return;
    }

    // Check if account is locked
    if (isAccountLocked(user)) {
      const remainingTime = Math.ceil((new Date(user.locked_until) - new Date()) / 60000);
      logLoginAttempt(ipAddress, email, 'LOGIN', false, userAgent);
      logActivity(user.id, 'LOGIN_BLOCKED', `Locked account login attempt from ${ipAddress}`, ipAddress);
      return res.status(423).json({
        error: `Account is temporarily locked. Please try again in ${remainingTime} minutes.`,
        locked: true,
        remainingMinutes: remainingTime
      });
    }

    // Check if account is deactivated
    if (!user.is_active) {
      logLoginAttempt(ipAddress, email, 'LOGIN', false, userAgent);
      return res.status(403).json({ error: 'Account is deactivated. Please contact support.' });
    }

    // Validate password
    const validPassword = bcrypt.compareSync(password, user.password_hash);
    if (!validPassword) {
      // Increment failed attempts
      const failedAttempts = incrementFailedAttempts(user.id);
      logLoginAttempt(ipAddress, email, 'LOGIN', false, userAgent);
      logActivity(user.id, 'FAILED_LOGIN', `Failed login attempt (${failedAttempts}/${MAX_LOGIN_ATTEMPTS}) from ${ipAddress}`, ipAddress);

      // Lock account if max attempts reached
      if (failedAttempts >= MAX_LOGIN_ATTEMPTS) {
        const lockUntil = lockAccount(user.id);
        logActivity(user.id, 'ACCOUNT_LOCKED', `Account locked until ${lockUntil} after ${MAX_LOGIN_ATTEMPTS} failed attempts`, ipAddress);
        return res.status(423).json({
          error: `Account locked due to too many failed attempts. Try again in ${LOCKOUT_DURATION_MINUTES} minutes.`,
          locked: true,
          remainingMinutes: LOCKOUT_DURATION_MINUTES
        });
      }

      return res.status(401).json({
        error: 'Invalid credentials',
        remainingAttempts: MAX_LOGIN_ATTEMPTS - failedAttempts
      });
    }

    // Successful login - reset failed attempts
    resetFailedAttempts(user.id);

    // Update last login
    db.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?').run(user.id);

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      organization: user.organization
    };

    const token = jwt.sign(userData, JWT_SECRET, { expiresIn: '7d' });

    logLoginAttempt(ipAddress, email, 'LOGIN', true, userAgent);
    logActivity(user.id, 'USER_LOGIN', `User logged in from ${ipAddress}`, ipAddress);

    res.json({ user: userData, token });
  } catch (error) {
    console.error('Signin error:', error);
    logLoginAttempt(ipAddress, req.body?.email, 'LOGIN', false, userAgent);
    res.status(500).json({ error: 'Login failed. Please try again later.' });
  }
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  try {
    const user = db.prepare('SELECT id, name, email, role, organization, avatar, created_at FROM users WHERE id = ?').get(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Change Password endpoint
app.post('/api/auth/change-password', authenticateToken, (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    // Validate new password strength
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        error: 'New password does not meet requirements',
        details: passwordValidation.errors
      });
    }

    // Get user with password hash
    const user = db.prepare('SELECT id, password_hash FROM users WHERE id = ?').get(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isCurrentPasswordValid = bcrypt.compareSync(currentPassword, user.password_hash);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password and update
    const newPasswordHash = bcrypt.hashSync(newPassword, 12);
    db.prepare('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(newPasswordHash, req.user.id);

    logActivity(req.user.id, 'PASSWORD_CHANGED', 'User changed their password');
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// ============================================
// ADMIN: USER MANAGEMENT
// ============================================
app.get('/api/admin/users', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { search, role, status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT id, name, email, role, organization, is_active, last_login, created_at FROM users WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }
    if (status !== undefined) {
      query += ' AND is_active = ?';
      params.push(status === 'active' ? 1 : 0);
    }

    const countQuery = query.replace('SELECT id, name, email, role, organization, is_active, last_login, created_at', 'SELECT COUNT(*) as total');
    const total = db.prepare(countQuery).get(...params).total;

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const users = db.prepare(query).all(...params);

    res.json({
      users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

app.get('/api/admin/users/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const user = db.prepare(`
      SELECT id, name, email, role, organization, is_active, last_login, created_at, updated_at
      FROM users WHERE id = ?
    `).get(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user stats
    const bookings = db.prepare('SELECT COUNT(*) as count FROM bookings WHERE user_id = ?').get(req.params.id);
    const plans = db.prepare('SELECT COUNT(*) as count FROM study_plans WHERE user_id = ?').get(req.params.id);
    const certificates = db.prepare('SELECT COUNT(*) as count FROM certificates WHERE user_id = ?').get(req.params.id);

    res.json({
      ...user,
      stats: {
        bookings: bookings.count,
        studyPlans: plans.count,
        certificates: certificates.count
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user' });
  }
});

app.put('/api/admin/users/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { name, email, role, organization, is_active } = req.body;

    db.prepare(`
      UPDATE users SET name = ?, email = ?, role = ?, organization = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(name, email, role, organization, is_active ? 1 : 0, req.params.id);

    logActivity(req.user.id, 'USER_UPDATED', `Admin updated user: ${email}`);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

app.delete('/api/admin/users/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const user = db.prepare('SELECT email FROM users WHERE id = ?').get(req.params.id);

    // Don't allow deleting yourself
    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    // Delete related data
    db.prepare('DELETE FROM bookings WHERE user_id = ?').run(req.params.id);
    db.prepare('DELETE FROM study_plans WHERE user_id = ?').run(req.params.id);
    db.prepare('DELETE FROM business_strategies WHERE user_id = ?').run(req.params.id);
    db.prepare('DELETE FROM certificates WHERE user_id = ?').run(req.params.id);
    db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);

    logActivity(req.user.id, 'USER_DELETED', `Admin deleted user: ${user?.email}`);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

app.post('/api/admin/users', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { name, email, password, role, organization } = req.body;

    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const id = uuidv4();
    const password_hash = bcrypt.hashSync(password, 10);

    db.prepare(`
      INSERT INTO users (id, name, email, password_hash, role, organization)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, name, email, password_hash, role, organization || null);

    logActivity(req.user.id, 'USER_CREATED', `Admin created user: ${email}`);
    res.json({ success: true, id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// ============================================
// ADMIN: COURSE MANAGEMENT
// ============================================
app.get('/api/admin/classes', authenticateToken, requireAdmin, (req, res) => {
  try {
    const classes = db.prepare(`
      SELECT c.*,
             (SELECT COUNT(*) FROM bookings WHERE class_id = c.id) as total_bookings,
             (SELECT SUM(price_paid) FROM bookings WHERE class_id = c.id) as total_revenue
      FROM classes c
      ORDER BY created_at DESC
    `).all();

    res.json(classes.map(c => ({
      ...c,
      tags: JSON.parse(c.tags || '[]'),
      price: `NPR ${c.price.toLocaleString()}`
    })));
  } catch (error) {
    res.status(500).json({ error: 'Failed to get classes' });
  }
});

app.post('/api/admin/classes', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { title, instructor, date, time, duration, description, capacity, price, image, tags, is_featured } = req.body;

    const id = uuidv4();
    db.prepare(`
      INSERT INTO classes (id, title, instructor, date, time, duration, description, capacity, price, image, tags, is_featured)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, title, instructor, date, time, duration, description, capacity || 100, price, image, JSON.stringify(tags || []), is_featured ? 1 : 0);

    logActivity(req.user.id, 'CLASS_CREATED', `Admin created class: ${title}`);
    res.json({ success: true, id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create class' });
  }
});

app.put('/api/admin/classes/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { title, instructor, date, time, duration, description, capacity, price, image, tags, is_active, is_featured } = req.body;

    db.prepare(`
      UPDATE classes SET
        title = ?, instructor = ?, date = ?, time = ?, duration = ?, description = ?,
        capacity = ?, price = ?, image = ?, tags = ?, is_active = ?, is_featured = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(title, instructor, date, time, duration, description, capacity, price, image, JSON.stringify(tags || []), is_active ? 1 : 0, is_featured ? 1 : 0, req.params.id);

    logActivity(req.user.id, 'CLASS_UPDATED', `Admin updated class: ${title}`);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update class' });
  }
});

app.delete('/api/admin/classes/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const cls = db.prepare('SELECT title FROM classes WHERE id = ?').get(req.params.id);
    db.prepare('DELETE FROM classes WHERE id = ?').run(req.params.id);
    logActivity(req.user.id, 'CLASS_DELETED', `Admin deleted class: ${cls?.title}`);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete class' });
  }
});

// ============================================
// ADMIN: BOOKINGS/TRANSACTIONS
// ============================================
app.get('/api/admin/bookings', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT b.*, u.name as user_name, u.email as user_email, c.title as class_title
      FROM bookings b
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN classes c ON b.class_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND b.status = ?';
      params.push(status);
    }

    const countQuery = query.replace('SELECT b.*, u.name as user_name, u.email as user_email, c.title as class_title', 'SELECT COUNT(*) as total');
    const total = db.prepare(countQuery).get(...params).total;

    query += ' ORDER BY b.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const bookings = db.prepare(query).all(...params);

    res.json({
      bookings,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get bookings' });
  }
});

app.put('/api/admin/bookings/:id/status', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { status } = req.body;
    db.prepare('UPDATE bookings SET status = ? WHERE id = ?').run(status, req.params.id);
    logActivity(req.user.id, 'BOOKING_STATUS_CHANGED', `Booking ${req.params.id} status changed to ${status}`);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update booking' });
  }
});

app.delete('/api/admin/bookings/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    db.prepare('DELETE FROM bookings WHERE id = ?').run(req.params.id);
    logActivity(req.user.id, 'BOOKING_DELETED', `Admin deleted booking: ${req.params.id}`);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete booking' });
  }
});

// ============================================
// ADMIN: ANALYTICS & DASHBOARD
// ============================================
app.get('/api/admin/analytics', authenticateToken, requireAdmin, (req, res) => {
  try {
    // User stats
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    const newUsersToday = db.prepare("SELECT COUNT(*) as count FROM users WHERE date(created_at) = date('now')").get().count;
    const usersByRole = db.prepare('SELECT role, COUNT(*) as count FROM users GROUP BY role').all();

    // Revenue stats
    const totalRevenue = db.prepare('SELECT COALESCE(SUM(price_paid), 0) as total FROM bookings WHERE status = ?').get('COMPLETED').total;
    const revenueToday = db.prepare("SELECT COALESCE(SUM(price_paid), 0) as total FROM bookings WHERE status = 'COMPLETED' AND date(created_at) = date('now')").get().total;
    const revenueThisMonth = db.prepare("SELECT COALESCE(SUM(price_paid), 0) as total FROM bookings WHERE status = 'COMPLETED' AND strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')").get().total;

    // Booking stats
    const totalBookings = db.prepare('SELECT COUNT(*) as count FROM bookings').get().count;
    const bookingsByStatus = db.prepare('SELECT status, COUNT(*) as count FROM bookings GROUP BY status').all();

    // Course stats
    const totalCourses = db.prepare('SELECT COUNT(*) as count FROM classes WHERE is_active = 1').get().count;
    const revenueByClass = db.prepare(`
      SELECT c.title, COALESCE(SUM(b.price_paid), 0) as revenue, COUNT(b.id) as enrollments
      FROM classes c
      LEFT JOIN bookings b ON c.id = b.class_id AND b.status = 'COMPLETED'
      GROUP BY c.id
      ORDER BY revenue DESC
      LIMIT 10
    `).all();

    // Study plan stats
    const totalPlans = db.prepare('SELECT COUNT(*) as count FROM study_plans').get().count;
    const totalCertificates = db.prepare('SELECT COUNT(*) as count FROM certificates').get().count;

    // Recent activity
    const recentActivity = db.prepare(`
      SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 20
    `).all();

    // Contact submissions
    const unreadMessages = db.prepare('SELECT COUNT(*) as count FROM contact_submissions WHERE is_read = 0').get().count;

    // Revenue trend (last 7 days)
    const revenueTrend = db.prepare(`
      SELECT date(created_at) as date, SUM(price_paid) as revenue
      FROM bookings WHERE status = 'COMPLETED' AND created_at >= date('now', '-7 days')
      GROUP BY date(created_at)
      ORDER BY date
    `).all();

    res.json({
      users: {
        total: totalUsers,
        newToday: newUsersToday,
        byRole: usersByRole
      },
      revenue: {
        total: totalRevenue,
        today: revenueToday,
        thisMonth: revenueThisMonth,
        trend: revenueTrend,
        byClass: revenueByClass
      },
      bookings: {
        total: totalBookings,
        byStatus: bookingsByStatus
      },
      courses: {
        total: totalCourses
      },
      education: {
        studyPlans: totalPlans,
        certificates: totalCertificates
      },
      messages: {
        unread: unreadMessages
      },
      recentActivity
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});

// ============================================
// ADMIN: CONTACT SUBMISSIONS
// ============================================
app.get('/api/admin/contacts', authenticateToken, requireAdmin, (req, res) => {
  try {
    const contacts = db.prepare('SELECT * FROM contact_submissions ORDER BY created_at DESC').all();
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get contacts' });
  }
});

app.put('/api/admin/contacts/:id/read', authenticateToken, requireAdmin, (req, res) => {
  try {
    db.prepare('UPDATE contact_submissions SET is_read = 1 WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update contact' });
  }
});

app.delete('/api/admin/contacts/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    db.prepare('DELETE FROM contact_submissions WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete contact' });
  }
});

// ============================================
// ADMIN: ACTIVITY LOGS
// ============================================
app.get('/api/admin/logs', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const total = db.prepare('SELECT COUNT(*) as count FROM activity_logs').get().count;
    const logs = db.prepare(`
      SELECT l.*, u.name as user_name, u.email as user_email
      FROM activity_logs l
      LEFT JOIN users u ON l.user_id = u.id
      ORDER BY l.created_at DESC
      LIMIT ? OFFSET ?
    `).all(parseInt(limit), offset);

    res.json({
      logs,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get logs' });
  }
});

// ============================================
// ADMIN: SETTINGS
// ============================================
app.get('/api/admin/settings', authenticateToken, requireAdmin, (req, res) => {
  try {
    const settings = db.prepare('SELECT * FROM settings ORDER BY key').all();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get settings' });
  }
});

app.put('/api/admin/settings/:key', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { value } = req.body;
    db.prepare('UPDATE settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?').run(value, req.params.key);
    logActivity(req.user.id, 'SETTING_UPDATED', `Setting ${req.params.key} updated to ${value}`);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update setting' });
  }
});

// ============================================
// ADMIN: CERTIFICATES
// ============================================
app.get('/api/admin/certificates', authenticateToken, requireAdmin, (req, res) => {
  try {
    const certificates = db.prepare(`
      SELECT c.*, u.name as user_name, u.email as user_email
      FROM certificates c
      LEFT JOIN users u ON c.user_id = u.id
      ORDER BY c.created_at DESC
    `).all();
    res.json(certificates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get certificates' });
  }
});

// ============================================
// ADMIN: STUDY PLANS
// ============================================
app.get('/api/admin/plans', authenticateToken, requireAdmin, (req, res) => {
  try {
    const plans = db.prepare(`
      SELECT s.*, u.name as user_name, u.email as user_email
      FROM study_plans s
      LEFT JOIN users u ON s.user_id = u.id
      ORDER BY s.created_at DESC
    `).all();
    res.json(plans.map(p => ({
      ...p,
      roadmap: JSON.parse(p.roadmap),
      completed_weeks: JSON.parse(p.completed_weeks),
      certificate: p.certificate ? JSON.parse(p.certificate) : null
    })));
  } catch (error) {
    res.status(500).json({ error: 'Failed to get plans' });
  }
});

// ============================================
// ADMIN: TEAM MANAGEMENT
// ============================================
app.get('/api/admin/team', authenticateToken, requireAdmin, (req, res) => {
  try {
    const team = db.prepare('SELECT * FROM team_members ORDER BY display_order ASC').all();
    res.json(team);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get team members' });
  }
});

app.post('/api/admin/team', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { name, role, bio, image, linkedin, twitter, display_order, is_active } = req.body;
    const id = uuidv4();

    db.prepare(`
      INSERT INTO team_members (id, name, role, bio, image, linkedin, twitter, display_order, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, name, role, bio, image, linkedin, twitter, display_order || 0, is_active !== false ? 1 : 0);

    logActivity(req.user.id, 'TEAM_MEMBER_CREATED', `Admin added team member: ${name}`);
    res.json({ success: true, id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create team member' });
  }
});

app.put('/api/admin/team/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { name, role, bio, image, linkedin, twitter, display_order, is_active } = req.body;

    db.prepare(`
      UPDATE team_members SET
        name = ?, role = ?, bio = ?, image = ?, linkedin = ?, twitter = ?,
        display_order = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(name, role, bio, image, linkedin, twitter, display_order, is_active ? 1 : 0, req.params.id);

    logActivity(req.user.id, 'TEAM_MEMBER_UPDATED', `Admin updated team member: ${name}`);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update team member' });
  }
});

app.delete('/api/admin/team/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const member = db.prepare('SELECT name FROM team_members WHERE id = ?').get(req.params.id);
    db.prepare('DELETE FROM team_members WHERE id = ?').run(req.params.id);
    logActivity(req.user.id, 'TEAM_MEMBER_DELETED', `Admin deleted team member: ${member?.name}`);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete team member' });
  }
});

// Public endpoint to get team members
app.get('/api/team', (req, res) => {
  try {
    const team = db.prepare('SELECT * FROM team_members WHERE is_active = 1 ORDER BY display_order ASC').all();
    res.json(team);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get team members' });
  }
});

// ============================================
// ADMIN: PROJECT MANAGEMENT
// ============================================
app.get('/api/admin/projects', authenticateToken, requireAdmin, (req, res) => {
  try {
    const projects = db.prepare('SELECT * FROM projects ORDER BY display_order ASC').all();
    res.json(projects.map(p => ({
      ...p,
      stats: JSON.parse(p.stats || '[]'),
      technologies: JSON.parse(p.technologies || '[]')
    })));
  } catch (error) {
    res.status(500).json({ error: 'Failed to get projects' });
  }
});

app.post('/api/admin/projects', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { title, category, client, description, image, stats, technologies, display_order } = req.body;
    const id = uuidv4();

    db.prepare(`
      INSERT INTO projects (id, title, category, client, description, image, stats, technologies, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, title, category, client, description, image, JSON.stringify(stats || []), JSON.stringify(technologies || []), display_order || 0);

    logActivity(req.user.id, 'PROJECT_CREATED', `Admin added project: ${title}`);
    res.json({ success: true, id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create project' });
  }
});

app.put('/api/admin/projects/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { title, category, client, description, image, stats, technologies, display_order, is_active } = req.body;

    db.prepare(`
      UPDATE projects SET
        title = ?, category = ?, client = ?, description = ?, image = ?,
        stats = ?, technologies = ?, display_order = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(title, category, client, description, image, JSON.stringify(stats || []), JSON.stringify(technologies || []), display_order, is_active ? 1 : 0, req.params.id);

    logActivity(req.user.id, 'PROJECT_UPDATED', `Admin updated project: ${title}`);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update project' });
  }
});

app.delete('/api/admin/projects/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const project = db.prepare('SELECT title FROM projects WHERE id = ?').get(req.params.id);
    db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id);
    logActivity(req.user.id, 'PROJECT_DELETED', `Admin deleted project: ${project?.title}`);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// Public endpoint to get projects
app.get('/api/projects', (req, res) => {
  try {
    const projects = db.prepare('SELECT * FROM projects WHERE is_active = 1 ORDER BY display_order ASC').all();
    res.json(projects.map(p => ({
      ...p,
      stats: JSON.parse(p.stats || '[]'),
      technologies: JSON.parse(p.technologies || '[]')
    })));
  } catch (error) {
    res.status(500).json({ error: 'Failed to get projects' });
  }
});

// ============================================
// ADMIN: DATABASE MANAGEMENT
// ============================================
app.get('/api/admin/database/stats', authenticateToken, requireAdmin, (req, res) => {
  try {
    const stats = {
      users: db.prepare('SELECT COUNT(*) as count FROM users').get().count,
      classes: db.prepare('SELECT COUNT(*) as count FROM classes').get().count,
      bookings: db.prepare('SELECT COUNT(*) as count FROM bookings').get().count,
      studyPlans: db.prepare('SELECT COUNT(*) as count FROM study_plans').get().count,
      certificates: db.prepare('SELECT COUNT(*) as count FROM certificates').get().count,
      strategies: db.prepare('SELECT COUNT(*) as count FROM business_strategies').get().count,
      contacts: db.prepare('SELECT COUNT(*) as count FROM contact_submissions').get().count,
      activityLogs: db.prepare('SELECT COUNT(*) as count FROM activity_logs').get().count,
      teamMembers: db.prepare('SELECT COUNT(*) as count FROM team_members').get().count,
      projects: db.prepare('SELECT COUNT(*) as count FROM projects').get().count
    };
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

app.post('/api/admin/database/seed', authenticateToken, requireAdmin, (req, res) => {
  try {
    // Seed mock users
    const mockUsers = [
      { name: 'Alice Chen', email: 'alice@techcorp.com', role: 'BUSINESS', organization: 'TechCorp Solutions' },
      { name: 'Bob Smith', email: 'bob.s@university.edu', role: 'STUDENT', organization: 'MIT' },
      { name: 'Charlie Davis', email: 'charlie@startup.io', role: 'BUSINESS', organization: 'RapidLaunch IO' },
      { name: 'Dana Lee', email: 'dana@freelance.net', role: 'STUDENT', organization: 'Self-Taught' }
    ];

    const insertUser = db.prepare(`
      INSERT OR IGNORE INTO users (id, name, email, password_hash, role, organization)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    mockUsers.forEach(u => {
      insertUser.run(uuidv4(), u.name, u.email, bcrypt.hashSync('password123', 10), u.role, u.organization);
    });

    // Seed mock bookings
    const users = db.prepare('SELECT id FROM users').all();
    const classes = db.prepare('SELECT id, price FROM classes').all();

    if (users.length > 0 && classes.length > 0) {
      const insertBooking = db.prepare(`
        INSERT INTO bookings (id, user_id, class_id, price_paid, payment_method, payment_id)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      for (let i = 0; i < 15; i++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const randomClass = classes[Math.floor(Math.random() * classes.length)];
        insertBooking.run(
          uuidv4(),
          randomUser.id,
          randomClass.id,
          randomClass.price,
          Math.random() > 0.5 ? 'ESEWA' : 'KHALTI',
          'PAY-' + Math.random().toString(36).substring(7).toUpperCase()
        );
      }
    }

    logActivity(req.user.id, 'DATABASE_SEEDED', 'Database seeded with mock data');
    res.json({ success: true, message: 'Database seeded successfully' });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ error: 'Failed to seed database' });
  }
});

// ============================================
// PUBLIC API: CLASSES
// ============================================
app.get('/api/classes', (req, res) => {
  try {
    const classes = db.prepare('SELECT * FROM classes WHERE is_active = 1 ORDER BY is_featured DESC, created_at DESC').all();
    res.json(classes.map(c => ({
      ...c,
      tags: JSON.parse(c.tags || '[]'),
      price: `NPR ${c.price.toLocaleString()}`
    })));
  } catch (error) {
    res.status(500).json({ error: 'Failed to get classes' });
  }
});

// ============================================
// USER API: BOOKINGS
// ============================================
app.post('/api/bookings', authenticateToken, (req, res) => {
  try {
    const { class_id, payment_method, payment_id, price_paid } = req.body;
    const id = uuidv4();

    db.prepare(`
      INSERT INTO bookings (id, user_id, class_id, price_paid, payment_method, payment_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, req.user.id, class_id, price_paid, payment_method, payment_id);

    // Update class enrolled count
    db.prepare('UPDATE classes SET enrolled = enrolled + 1 WHERE id = ?').run(class_id);

    logActivity(req.user.id, 'BOOKING_CREATED', `User booked class: ${class_id}`);
    res.json({ success: true, id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

app.get('/api/bookings', authenticateToken, (req, res) => {
  try {
    const bookings = db.prepare(`
      SELECT b.*, c.title as class_title
      FROM bookings b
      LEFT JOIN classes c ON b.class_id = c.id
      WHERE b.user_id = ?
      ORDER BY b.created_at DESC
    `).all(req.user.id);
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get bookings' });
  }
});

// ============================================
// USER API: STUDY PLANS
// ============================================
app.post('/api/plans', authenticateToken, (req, res) => {
  try {
    const { topic, difficulty, roadmap } = req.body;
    const id = uuidv4();

    db.prepare(`
      INSERT INTO study_plans (id, user_id, topic, difficulty, roadmap)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, req.user.id, topic, difficulty, JSON.stringify(roadmap));

    logActivity(req.user.id, 'PLAN_CREATED', `User created study plan: ${topic}`);
    res.json({ success: true, id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create plan' });
  }
});

app.get('/api/plans', authenticateToken, (req, res) => {
  try {
    const plans = db.prepare('SELECT * FROM study_plans WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
    res.json(plans.map(p => ({
      ...p,
      roadmap: JSON.parse(p.roadmap),
      completed_weeks: JSON.parse(p.completed_weeks),
      certificate: p.certificate ? JSON.parse(p.certificate) : null
    })));
  } catch (error) {
    res.status(500).json({ error: 'Failed to get plans' });
  }
});

app.put('/api/plans/:id', authenticateToken, (req, res) => {
  try {
    const { completed_weeks, certificate } = req.body;
    db.prepare(`
      UPDATE study_plans SET completed_weeks = ?, certificate = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `).run(JSON.stringify(completed_weeks), certificate ? JSON.stringify(certificate) : null, req.params.id, req.user.id);

    // Create certificate record if provided
    if (certificate) {
      const plan = db.prepare('SELECT topic, difficulty FROM study_plans WHERE id = ?').get(req.params.id);
      db.prepare(`
        INSERT INTO certificates (id, user_id, plan_id, student_name, course_name, difficulty, issue_date)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(certificate.id, req.user.id, req.params.id, certificate.studentName, certificate.courseName, certificate.difficulty, certificate.issueDate);
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update plan' });
  }
});

// ============================================
// USER API: BUSINESS STRATEGIES
// ============================================
app.post('/api/strategies', authenticateToken, (req, res) => {
  try {
    const { industry, description, solutions } = req.body;
    const id = uuidv4();

    db.prepare(`
      INSERT INTO business_strategies (id, user_id, industry, description, solutions)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, req.user.id, industry, description, JSON.stringify(solutions));

    res.json({ success: true, id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save strategy' });
  }
});

app.get('/api/strategies', authenticateToken, (req, res) => {
  try {
    const strategies = db.prepare('SELECT * FROM business_strategies WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
    res.json(strategies.map(s => ({
      ...s,
      solutions: JSON.parse(s.solutions)
    })));
  } catch (error) {
    res.status(500).json({ error: 'Failed to get strategies' });
  }
});

// ============================================
// PUBLIC API: CONTACT
// ============================================
app.post('/api/contact', (req, res) => {
  try {
    const { first_name, last_name, email, message } = req.body;
    const id = uuidv4();

    db.prepare(`
      INSERT INTO contact_submissions (id, first_name, last_name, email, message)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, first_name, last_name, email, message);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit contact' });
  }
});

// ============================================
// SYSTEM API
// ============================================
app.get('/api/system/health', (req, res) => {
  try {
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    res.json({ status: 'OK', message: 'System Online', userCount });
  } catch (error) {
    res.json({ status: 'ERROR', message: 'Database Error' });
  }
});

app.get('/api/settings/public', (req, res) => {
  try {
    const settings = db.prepare('SELECT key, value FROM settings WHERE key IN (?, ?, ?, ?)').all(
      'welcome_discount', 'loyalty_discount', 'student_discount', 'site_name'
    );
    res.json(settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {}));
  } catch (error) {
    res.status(500).json({ error: 'Failed to get settings' });
  }
});

// Catch-all route to serve frontend for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

// Initialize and start
initDatabase();
app.listen(PORT, () => {
  console.log(`MindGear API Server running on port ${PORT}`);
});

export default app;
