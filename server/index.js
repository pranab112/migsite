import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'mindgear-secret-key-2024';

// Security Constants
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 15;
const PASSWORD_MIN_LENGTH = 8;

// Initialize PostgreSQL Database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// ============================================
// RATE LIMITERS
// ============================================
const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: 'Too many authentication attempts. Please wait a minute before trying again.' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: { error: 'Too many accounts created. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(generalLimiter);

const clientBuildPath = path.join(__dirname, '..', 'dist');
app.use(express.static(clientBuildPath));

// ============================================
// DATABASE SCHEMA INITIALIZATION
// ============================================
const initDatabase = async () => {
  try {
    // Users Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'STUDENT' CHECK(role IN ('GUEST', 'BUSINESS', 'STUDENT', 'ADMIN')),
        organization TEXT,
        avatar TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        locked_until TIMESTAMP,
        failed_login_attempts INTEGER DEFAULT 0,
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Login Attempts Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS login_attempts (
        id TEXT PRIMARY KEY,
        ip_address TEXT NOT NULL,
        email TEXT,
        attempt_type TEXT CHECK(attempt_type IN ('LOGIN', 'SIGNUP')),
        success BOOLEAN DEFAULT FALSE,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON login_attempts(ip_address, created_at)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON login_attempts(email, created_at)`);

    // Classes Table
    await pool.query(`
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
        is_active BOOLEAN DEFAULT TRUE,
        is_featured BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Bookings Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id),
        class_id TEXT NOT NULL REFERENCES classes(id),
        price_paid INTEGER NOT NULL,
        discount_applied INTEGER DEFAULT 0,
        payment_method TEXT,
        payment_id TEXT,
        status TEXT DEFAULT 'COMPLETED' CHECK(status IN ('PENDING', 'COMPLETED', 'REFUNDED', 'CANCELLED')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Study Plans Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS study_plans (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id),
        topic TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        roadmap TEXT NOT NULL,
        completed_weeks TEXT DEFAULT '[]',
        certificate TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Business Strategies Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS business_strategies (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id),
        industry TEXT NOT NULL,
        description TEXT NOT NULL,
        solutions TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Contact Submissions Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contact_submissions (
        id TEXT PRIMARY KEY,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Activity Logs Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        action TEXT NOT NULL,
        details TEXT,
        ip_address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Settings Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id TEXT PRIMARY KEY,
        key TEXT UNIQUE NOT NULL,
        value TEXT NOT NULL,
        description TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Certificates Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS certificates (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id),
        plan_id TEXT NOT NULL REFERENCES study_plans(id),
        student_name TEXT NOT NULL,
        course_name TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        issue_date TEXT NOT NULL,
        signature TEXT DEFAULT 'Mind is Gear Academy',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Team Members Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS team_members (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        bio TEXT,
        image TEXT,
        linkedin TEXT,
        twitter TEXT,
        display_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Projects Table
    await pool.query(`
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
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create default admin if not exists
    const adminResult = await pool.query('SELECT id FROM users WHERE email = $1', ['admin@mindisgear.com']);
    if (adminResult.rows.length === 0) {
      const hashedPassword = bcrypt.hashSync('admin123', 10);
      await pool.query(
        `INSERT INTO users (id, name, email, password_hash, role, organization) VALUES ($1, $2, $3, $4, $5, $6)`,
        [uuidv4(), 'System Administrator', 'admin@mindisgear.com', hashedPassword, 'ADMIN', 'Mind is Gear']
      );
    }

    // Insert default courses if not exists
    const coursesResult = await pool.query('SELECT COUNT(*) as count FROM classes');
    if (parseInt(coursesResult.rows[0].count) === 0) {
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
          is_featured: true
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
          is_featured: true
        }
      ];

      for (const course of defaultCourses) {
        await pool.query(
          `INSERT INTO classes (id, title, instructor, date, time, duration, description, capacity, enrolled, price, image, tags, is_featured)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
          [course.id, course.title, course.instructor, course.date, course.time, course.duration, course.description, course.capacity, course.enrolled, course.price, course.image, course.tags, course.is_featured]
        );
      }
    }

    // Insert default settings
    const settingsResult = await pool.query('SELECT COUNT(*) as count FROM settings');
    if (parseInt(settingsResult.rows[0].count) === 0) {
      const defaultSettings = [
        { key: 'site_name', value: 'Mind is Gear', description: 'Website name' },
        { key: 'welcome_discount', value: '10', description: 'Welcome discount percentage for new users' },
        { key: 'loyalty_discount', value: '20', description: 'Loyalty discount for users with 2+ bookings' },
        { key: 'student_discount', value: '5', description: 'Additional discount for students' },
        { key: 'maintenance_mode', value: 'false', description: 'Enable/disable maintenance mode' }
      ];

      for (const s of defaultSettings) {
        await pool.query(
          `INSERT INTO settings (id, key, value, description) VALUES ($1, $2, $3, $4)`,
          [uuidv4(), s.key, s.value, s.description]
        );
      }
    }

    // Insert default projects
    const projectsResult = await pool.query('SELECT COUNT(*) as count FROM projects');
    if (parseInt(projectsResult.rows[0].count) === 0) {
      const defaultProjects = [
        {
          id: 'project_1',
          title: 'Nexus Logistics Core',
          category: 'Supply Chain AI',
          client: 'Global Shipping Corp',
          description: 'A fully autonomous fleet management system that reduced delivery latency by 40% using predictive routing algorithms.',
          image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1000&auto=format&fit=crop',
          stats: JSON.stringify([{ label: '40% Faster Delivery', icon: 'zap' }, { label: '2.4M Routes/Day', icon: 'activity' }]),
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
          stats: JSON.stringify([{ label: '$500M Secured', icon: 'shield' }, { label: '12ms Latency', icon: 'clock' }]),
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
          stats: JSON.stringify([{ label: '85% Less Paperwork', icon: 'file' }, { label: 'HIPAA Compliant', icon: 'check' }]),
          technologies: JSON.stringify(['React', 'NLP', 'Cloud Run']),
          display_order: 3
        }
      ];

      for (const project of defaultProjects) {
        await pool.query(
          `INSERT INTO projects (id, title, category, client, description, image, stats, technologies, display_order)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [project.id, project.title, project.category, project.client, project.description, project.image, project.stats, project.technologies, project.display_order]
        );
      }
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
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
const logActivity = async (userId, action, details, ipAddress = null) => {
  try {
    await pool.query(
      `INSERT INTO activity_logs (id, user_id, action, details, ip_address) VALUES ($1, $2, $3, $4, $5)`,
      [uuidv4(), userId, action, details, ipAddress]
    );
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};

// ============================================
// SECURITY HELPER FUNCTIONS
// ============================================
const getClientIP = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
         req.headers['x-real-ip'] ||
         req.connection?.remoteAddress ||
         req.ip ||
         'unknown';
};

const validatePassword = (password) => {
  const errors = [];
  if (password.length < PASSWORD_MIN_LENGTH) {
    errors.push(`Password must be at least ${PASSWORD_MIN_LENGTH} characters`);
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
  return errors;
};

const checkAccountLockout = async (email) => {
  const result = await pool.query(
    'SELECT locked_until, failed_login_attempts FROM users WHERE email = $1',
    [email]
  );
  if (result.rows.length === 0) return { locked: false };

  const user = result.rows[0];
  if (user.locked_until && new Date(user.locked_until) > new Date()) {
    const remainingMinutes = Math.ceil((new Date(user.locked_until) - new Date()) / 60000);
    return { locked: true, remainingMinutes };
  }
  return { locked: false, attempts: user.failed_login_attempts };
};

const recordFailedLogin = async (email, ipAddress, userAgent) => {
  await pool.query(
    `INSERT INTO login_attempts (id, ip_address, email, attempt_type, success, user_agent) VALUES ($1, $2, $3, $4, $5, $6)`,
    [uuidv4(), ipAddress, email, 'LOGIN', false, userAgent]
  );

  const result = await pool.query(
    'UPDATE users SET failed_login_attempts = failed_login_attempts + 1 WHERE email = $1 RETURNING failed_login_attempts',
    [email]
  );

  if (result.rows.length > 0 && result.rows[0].failed_login_attempts >= MAX_LOGIN_ATTEMPTS) {
    const lockUntil = new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60000);
    await pool.query(
      'UPDATE users SET locked_until = $1 WHERE email = $2',
      [lockUntil, email]
    );
    return { accountLocked: true };
  }
  return { accountLocked: false };
};

const resetLoginAttempts = async (email) => {
  await pool.query(
    'UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE email = $1',
    [email]
  );
};

// ============================================
// AUTH ROUTES
// ============================================
app.post('/api/auth/signup', signupLimiter, async (req, res) => {
  try {
    const { name, email, password, role = 'STUDENT', organization } = req.body;
    const ipAddress = getClientIP(req);

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      return res.status(400).json({ error: passwordErrors.join('. ') });
    }

    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const userId = uuidv4();
    const userRole = ['STUDENT', 'BUSINESS'].includes(role) ? role : 'STUDENT';

    await pool.query(
      `INSERT INTO users (id, name, email, password_hash, role, organization) VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, name, email, hashedPassword, userRole, organization || null]
    );

    await pool.query(
      `INSERT INTO login_attempts (id, ip_address, email, attempt_type, success) VALUES ($1, $2, $3, $4, $5)`,
      [uuidv4(), ipAddress, email, 'SIGNUP', true]
    );

    const token = jwt.sign({ id: userId, email, role: userRole, name }, JWT_SECRET, { expiresIn: '7d' });
    await logActivity(userId, 'USER_SIGNUP', `New user registered: ${email}`, ipAddress);

    res.json({ token, user: { id: userId, name, email, role: userRole, organization } });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/signin', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    const ipAddress = getClientIP(req);
    const userAgent = req.headers['user-agent'];

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const lockoutStatus = await checkAccountLockout(email);
    if (lockoutStatus.locked) {
      return res.status(423).json({
        error: `Account locked. Try again in ${lockoutStatus.remainingMinutes} minutes.`,
        locked: true,
        remainingMinutes: lockoutStatus.remainingMinutes
      });
    }

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(403).json({ error: 'Account has been deactivated. Contact support.' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      const lockResult = await recordFailedLogin(email, ipAddress, userAgent);
      if (lockResult.accountLocked) {
        return res.status(423).json({
          error: `Too many failed attempts. Account locked for ${LOCKOUT_DURATION_MINUTES} minutes.`,
          locked: true
        });
      }
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    await resetLoginAttempts(email);
    await pool.query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);

    await pool.query(
      `INSERT INTO login_attempts (id, ip_address, email, attempt_type, success, user_agent) VALUES ($1, $2, $3, $4, $5, $6)`,
      [uuidv4(), ipAddress, email, 'LOGIN', true, userAgent]
    );

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    await logActivity(user.id, 'USER_LOGIN', 'User logged in', ipAddress);

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, organization, avatar, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user info' });
  }
});

app.post('/api/auth/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password are required' });
    }

    const passwordErrors = validatePassword(newPassword);
    if (passwordErrors.length > 0) {
      return res.status(400).json({ error: passwordErrors.join('. ') });
    }

    const result = await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const validPassword = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [hashedPassword, req.user.id]
    );

    await logActivity(req.user.id, 'PASSWORD_CHANGED', 'User changed their password');

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// ============================================
// CLASSES/COURSES ROUTES
// ============================================
app.get('/api/classes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM classes WHERE is_active = true ORDER BY is_featured DESC, created_at DESC');
    res.json(result.rows.map(c => ({ ...c, tags: JSON.parse(c.tags || '[]') })));
  } catch (error) {
    res.status(500).json({ error: 'Failed to get classes' });
  }
});

app.get('/api/classes/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM classes WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Class not found' });
    }
    const c = result.rows[0];
    res.json({ ...c, tags: JSON.parse(c.tags || '[]') });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get class' });
  }
});

// ============================================
// BOOKINGS ROUTES
// ============================================
app.post('/api/bookings', authenticateToken, async (req, res) => {
  try {
    const { class_id, payment_method, payment_id, price_paid } = req.body;
    const bookingId = uuidv4();

    await pool.query(
      `INSERT INTO bookings (id, user_id, class_id, price_paid, payment_method, payment_id) VALUES ($1, $2, $3, $4, $5, $6)`,
      [bookingId, req.user.id, class_id, price_paid, payment_method, payment_id]
    );

    await pool.query('UPDATE classes SET enrolled = enrolled + 1 WHERE id = $1', [class_id]);
    await logActivity(req.user.id, 'BOOKING_CREATED', `Booked class: ${class_id}`);

    res.json({ success: true, bookingId });
  } catch (error) {
    res.status(500).json({ error: 'Booking failed' });
  }
});

app.get('/api/bookings', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT b.*, c.title as class_title, c.instructor, c.date, c.time, c.image
      FROM bookings b
      JOIN classes c ON b.class_id = c.id
      WHERE b.user_id = $1
      ORDER BY b.created_at DESC
    `, [req.user.id]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get bookings' });
  }
});

// ============================================
// STUDY PLANS ROUTES
// ============================================
app.post('/api/plans', authenticateToken, async (req, res) => {
  try {
    const { topic, difficulty, roadmap } = req.body;
    const planId = uuidv4();

    await pool.query(
      `INSERT INTO study_plans (id, user_id, topic, difficulty, roadmap) VALUES ($1, $2, $3, $4, $5)`,
      [planId, req.user.id, topic, difficulty, JSON.stringify(roadmap)]
    );

    await logActivity(req.user.id, 'PLAN_CREATED', `Created study plan: ${topic}`);
    res.json({ success: true, planId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create plan' });
  }
});

app.get('/api/plans', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM study_plans WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(result.rows.map(p => ({
      ...p,
      roadmap: JSON.parse(p.roadmap),
      completed_weeks: JSON.parse(p.completed_weeks || '[]'),
      certificate: p.certificate ? JSON.parse(p.certificate) : null
    })));
  } catch (error) {
    res.status(500).json({ error: 'Failed to get plans' });
  }
});

app.put('/api/plans/:id', authenticateToken, async (req, res) => {
  try {
    const { completed_weeks, certificate } = req.body;

    await pool.query(
      `UPDATE study_plans SET completed_weeks = $1, certificate = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 AND user_id = $4`,
      [JSON.stringify(completed_weeks || []), certificate ? JSON.stringify(certificate) : null, req.params.id, req.user.id]
    );

    if (certificate) {
      const certId = uuidv4();
      await pool.query(
        `INSERT INTO certificates (id, user_id, plan_id, student_name, course_name, difficulty, issue_date) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [certId, req.user.id, req.params.id, certificate.studentName, certificate.courseName, certificate.difficulty, certificate.issueDate]
      );
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update plan' });
  }
});

// ============================================
// BUSINESS STRATEGIES ROUTES
// ============================================
app.post('/api/strategies', authenticateToken, async (req, res) => {
  try {
    const { industry, description, solutions } = req.body;
    const strategyId = uuidv4();

    await pool.query(
      `INSERT INTO business_strategies (id, user_id, industry, description, solutions) VALUES ($1, $2, $3, $4, $5)`,
      [strategyId, req.user.id, industry, description, JSON.stringify(solutions)]
    );

    await logActivity(req.user.id, 'STRATEGY_CREATED', `Created strategy for: ${industry}`);
    res.json({ success: true, strategyId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create strategy' });
  }
});

app.get('/api/strategies', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM business_strategies WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(result.rows.map(s => ({ ...s, solutions: JSON.parse(s.solutions) })));
  } catch (error) {
    res.status(500).json({ error: 'Failed to get strategies' });
  }
});

// ============================================
// CONTACT ROUTES
// ============================================
app.post('/api/contact', async (req, res) => {
  try {
    const { first_name, last_name, email, message } = req.body;

    await pool.query(
      `INSERT INTO contact_submissions (id, first_name, last_name, email, message) VALUES ($1, $2, $3, $4, $5)`,
      [uuidv4(), first_name, last_name, email, message]
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit message' });
  }
});

// ============================================
// PUBLIC SETTINGS ROUTES
// ============================================
app.get('/api/settings/public', async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT key, value FROM settings WHERE key IN ('site_name', 'welcome_discount', 'loyalty_discount', 'student_discount')"
    );
    const settings = {};
    result.rows.forEach(s => { settings[s.key] = s.value; });
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get settings' });
  }
});

// ============================================
// PUBLIC TEAM ROUTES
// ============================================
app.get('/api/team', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM team_members WHERE is_active = true ORDER BY display_order ASC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get team members' });
  }
});

// ============================================
// PUBLIC PROJECTS ROUTES
// ============================================
app.get('/api/projects', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM projects WHERE is_active = true ORDER BY display_order ASC');
    res.json(result.rows.map(p => ({
      ...p,
      stats: JSON.parse(p.stats || '[]'),
      technologies: JSON.parse(p.technologies || '[]')
    })));
  } catch (error) {
    res.status(500).json({ error: 'Failed to get projects' });
  }
});

// ============================================
// ADMIN: ANALYTICS
// ============================================
app.get('/api/admin/analytics', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [users, classes, bookings, plans, contacts, logs] = await Promise.all([
      pool.query('SELECT COUNT(*) as total, COUNT(CASE WHEN is_active = true THEN 1 END) as active FROM users'),
      pool.query('SELECT COUNT(*) as total, SUM(enrolled) as total_enrolled FROM classes'),
      pool.query("SELECT COUNT(*) as total, SUM(price_paid) as revenue, COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed FROM bookings"),
      pool.query('SELECT COUNT(*) as total, COUNT(CASE WHEN certificate IS NOT NULL THEN 1 END) as certified FROM study_plans'),
      pool.query('SELECT COUNT(*) as total, COUNT(CASE WHEN is_read = false THEN 1 END) as unread FROM contact_submissions'),
      pool.query('SELECT COUNT(*) as total FROM activity_logs')
    ]);

    res.json({
      users: { total: parseInt(users.rows[0].total), active: parseInt(users.rows[0].active) },
      classes: { total: parseInt(classes.rows[0].total), enrolled: parseInt(classes.rows[0].total_enrolled) || 0 },
      bookings: {
        total: parseInt(bookings.rows[0].total),
        revenue: parseInt(bookings.rows[0].revenue) || 0,
        completed: parseInt(bookings.rows[0].completed)
      },
      plans: { total: parseInt(plans.rows[0].total), certified: parseInt(plans.rows[0].certified) },
      messages: { total: parseInt(contacts.rows[0].total), unread: parseInt(contacts.rows[0].unread) },
      logs: { total: parseInt(logs.rows[0].total) }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});

// ============================================
// ADMIN: USERS MANAGEMENT
// ============================================
app.get('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { search, role, status, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = 'SELECT id, name, email, role, organization, is_active, created_at, last_login FROM users WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (search) {
      query += ` AND (name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    if (role) {
      query += ` AND role = $${paramIndex}`;
      params.push(role);
      paramIndex++;
    }
    if (status === 'active') {
      query += ' AND is_active = true';
    } else if (status === 'inactive') {
      query += ' AND is_active = false';
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), offset);

    const result = await pool.query(query, params);
    const countResult = await pool.query('SELECT COUNT(*) as total FROM users');

    res.json({
      users: result.rows,
      total: parseInt(countResult.rows[0].total),
      page: parseInt(page),
      totalPages: Math.ceil(parseInt(countResult.rows[0].total) / parseInt(limit))
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get users' });
  }
});

app.get('/api/admin/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = result.rows[0];
    delete user.password_hash;
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user' });
  }
});

app.post('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, email, password, role, organization } = req.body;
    const hashedPassword = await bcrypt.hash(password, 12);
    const userId = uuidv4();

    await pool.query(
      `INSERT INTO users (id, name, email, password_hash, role, organization) VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, name, email, hashedPassword, role, organization]
    );

    await logActivity(req.user.id, 'USER_CREATED_BY_ADMIN', `Admin created user: ${email}`);
    res.json({ success: true, id: userId });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.put('/api/admin/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, email, role, organization, is_active } = req.body;

    await pool.query(
      `UPDATE users SET name = $1, email = $2, role = $3, organization = $4, is_active = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6`,
      [name, email, role, organization, is_active, req.params.id]
    );

    await logActivity(req.user.id, 'USER_UPDATED_BY_ADMIN', `Admin updated user: ${email}`);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

app.delete('/api/admin/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT email FROM users WHERE id = $1', [req.params.id]);
    await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    await logActivity(req.user.id, 'USER_DELETED', `Admin deleted user: ${result.rows[0]?.email}`);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// ============================================
// ADMIN: CLASSES MANAGEMENT
// ============================================
app.get('/api/admin/classes', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM classes ORDER BY created_at DESC');
    res.json(result.rows.map(c => ({ ...c, tags: JSON.parse(c.tags || '[]') })));
  } catch (error) {
    res.status(500).json({ error: 'Failed to get classes' });
  }
});

app.post('/api/admin/classes', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, instructor, date, time, duration, description, capacity, price, image, tags, is_featured } = req.body;
    const classId = uuidv4();

    await pool.query(
      `INSERT INTO classes (id, title, instructor, date, time, duration, description, capacity, price, image, tags, is_featured)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [classId, title, instructor, date, time, duration, description, capacity, price, image, JSON.stringify(tags || []), is_featured || false]
    );

    await logActivity(req.user.id, 'CLASS_CREATED', `Admin created class: ${title}`);
    res.json({ success: true, id: classId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create class' });
  }
});

app.put('/api/admin/classes/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, instructor, date, time, duration, description, capacity, price, image, tags, is_active, is_featured } = req.body;

    await pool.query(
      `UPDATE classes SET title = $1, instructor = $2, date = $3, time = $4, duration = $5, description = $6,
       capacity = $7, price = $8, image = $9, tags = $10, is_active = $11, is_featured = $12, updated_at = CURRENT_TIMESTAMP
       WHERE id = $13`,
      [title, instructor, date, time, duration, description, capacity, price, image, JSON.stringify(tags || []), is_active, is_featured, req.params.id]
    );

    await logActivity(req.user.id, 'CLASS_UPDATED', `Admin updated class: ${title}`);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update class' });
  }
});

app.delete('/api/admin/classes/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT title FROM classes WHERE id = $1', [req.params.id]);
    await pool.query('DELETE FROM classes WHERE id = $1', [req.params.id]);
    await logActivity(req.user.id, 'CLASS_DELETED', `Admin deleted class: ${result.rows[0]?.title}`);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete class' });
  }
});

// ============================================
// ADMIN: BOOKINGS MANAGEMENT
// ============================================
app.get('/api/admin/bookings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = `
      SELECT b.*, u.name as user_name, u.email as user_email, c.title as class_title
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN classes c ON b.class_id = c.id
    `;
    const params = [];
    let paramIndex = 1;

    if (status) {
      query += ` WHERE b.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    query += ` ORDER BY b.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), offset);

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get bookings' });
  }
});

app.put('/api/admin/bookings/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    await pool.query('UPDATE bookings SET status = $1 WHERE id = $2', [status, req.params.id]);
    await logActivity(req.user.id, 'BOOKING_STATUS_UPDATED', `Booking ${req.params.id} status changed to ${status}`);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update booking status' });
  }
});

app.delete('/api/admin/bookings/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM bookings WHERE id = $1', [req.params.id]);
    await logActivity(req.user.id, 'BOOKING_DELETED', `Booking ${req.params.id} deleted`);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete booking' });
  }
});

// ============================================
// ADMIN: PLANS MANAGEMENT
// ============================================
app.get('/api/admin/plans', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, u.name as user_name, u.email as user_email
      FROM study_plans p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
    `);
    res.json(result.rows.map(p => ({
      ...p,
      roadmap: JSON.parse(p.roadmap),
      completed_weeks: JSON.parse(p.completed_weeks || '[]'),
      certificate: p.certificate ? JSON.parse(p.certificate) : null
    })));
  } catch (error) {
    res.status(500).json({ error: 'Failed to get plans' });
  }
});

// ============================================
// ADMIN: TEAM MANAGEMENT
// ============================================
app.get('/api/admin/team', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM team_members ORDER BY display_order ASC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get team members' });
  }
});

app.post('/api/admin/team', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, role, bio, image, linkedin, twitter, display_order, is_active } = req.body;
    const id = uuidv4();

    await pool.query(
      `INSERT INTO team_members (id, name, role, bio, image, linkedin, twitter, display_order, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [id, name, role, bio, image, linkedin, twitter, display_order || 0, is_active !== false]
    );

    await logActivity(req.user.id, 'TEAM_MEMBER_CREATED', `Admin added team member: ${name}`);
    res.json({ success: true, id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create team member' });
  }
});

app.put('/api/admin/team/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, role, bio, image, linkedin, twitter, display_order, is_active } = req.body;

    await pool.query(
      `UPDATE team_members SET name = $1, role = $2, bio = $3, image = $4, linkedin = $5, twitter = $6,
       display_order = $7, is_active = $8, updated_at = CURRENT_TIMESTAMP WHERE id = $9`,
      [name, role, bio, image, linkedin, twitter, display_order, is_active, req.params.id]
    );

    await logActivity(req.user.id, 'TEAM_MEMBER_UPDATED', `Admin updated team member: ${name}`);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update team member' });
  }
});

app.delete('/api/admin/team/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT name FROM team_members WHERE id = $1', [req.params.id]);
    await pool.query('DELETE FROM team_members WHERE id = $1', [req.params.id]);
    await logActivity(req.user.id, 'TEAM_MEMBER_DELETED', `Admin deleted team member: ${result.rows[0]?.name}`);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete team member' });
  }
});

// ============================================
// ADMIN: PROJECTS MANAGEMENT
// ============================================
app.get('/api/admin/projects', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM projects ORDER BY display_order ASC');
    res.json(result.rows.map(p => ({
      ...p,
      stats: JSON.parse(p.stats || '[]'),
      technologies: JSON.parse(p.technologies || '[]')
    })));
  } catch (error) {
    res.status(500).json({ error: 'Failed to get projects' });
  }
});

app.post('/api/admin/projects', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, category, client, description, image, stats, technologies, display_order } = req.body;
    const id = uuidv4();

    await pool.query(
      `INSERT INTO projects (id, title, category, client, description, image, stats, technologies, display_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [id, title, category, client, description, image, JSON.stringify(stats || []), JSON.stringify(technologies || []), display_order || 0]
    );

    await logActivity(req.user.id, 'PROJECT_CREATED', `Admin created project: ${title}`);
    res.json({ success: true, id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create project' });
  }
});

app.put('/api/admin/projects/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, category, client, description, image, stats, technologies, display_order, is_active } = req.body;

    await pool.query(
      `UPDATE projects SET title = $1, category = $2, client = $3, description = $4, image = $5,
       stats = $6, technologies = $7, display_order = $8, is_active = $9, updated_at = CURRENT_TIMESTAMP WHERE id = $10`,
      [title, category, client, description, image, JSON.stringify(stats || []), JSON.stringify(technologies || []), display_order, is_active, req.params.id]
    );

    await logActivity(req.user.id, 'PROJECT_UPDATED', `Admin updated project: ${title}`);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update project' });
  }
});

app.delete('/api/admin/projects/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT title FROM projects WHERE id = $1', [req.params.id]);
    await pool.query('DELETE FROM projects WHERE id = $1', [req.params.id]);
    await logActivity(req.user.id, 'PROJECT_DELETED', `Admin deleted project: ${result.rows[0]?.title}`);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// ============================================
// ADMIN: DATABASE MANAGEMENT
// ============================================
app.get('/api/admin/database/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [users, classes, bookings, plans, certs, strategies, contacts, logs, team, projects] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM users'),
      pool.query('SELECT COUNT(*) as count FROM classes'),
      pool.query('SELECT COUNT(*) as count FROM bookings'),
      pool.query('SELECT COUNT(*) as count FROM study_plans'),
      pool.query('SELECT COUNT(*) as count FROM certificates'),
      pool.query('SELECT COUNT(*) as count FROM business_strategies'),
      pool.query('SELECT COUNT(*) as count FROM contact_submissions'),
      pool.query('SELECT COUNT(*) as count FROM activity_logs'),
      pool.query('SELECT COUNT(*) as count FROM team_members'),
      pool.query('SELECT COUNT(*) as count FROM projects')
    ]);

    res.json({
      users: parseInt(users.rows[0].count),
      classes: parseInt(classes.rows[0].count),
      bookings: parseInt(bookings.rows[0].count),
      studyPlans: parseInt(plans.rows[0].count),
      certificates: parseInt(certs.rows[0].count),
      strategies: parseInt(strategies.rows[0].count),
      contacts: parseInt(contacts.rows[0].count),
      activityLogs: parseInt(logs.rows[0].count),
      teamMembers: parseInt(team.rows[0].count),
      projects: parseInt(projects.rows[0].count)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

app.post('/api/admin/database/seed', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const mockUsers = [
      { name: 'Alice Chen', email: 'alice@techcorp.com', role: 'BUSINESS', organization: 'TechCorp Solutions' },
      { name: 'Bob Smith', email: 'bob.s@university.edu', role: 'STUDENT', organization: 'MIT' },
      { name: 'Charlie Davis', email: 'charlie@startup.io', role: 'BUSINESS', organization: 'RapidLaunch IO' }
    ];

    for (const u of mockUsers) {
      const existing = await pool.query('SELECT id FROM users WHERE email = $1', [u.email]);
      if (existing.rows.length === 0) {
        const hashedPassword = await bcrypt.hash('Password123', 12);
        await pool.query(
          `INSERT INTO users (id, name, email, password_hash, role, organization) VALUES ($1, $2, $3, $4, $5, $6)`,
          [uuidv4(), u.name, u.email, hashedPassword, u.role, u.organization]
        );
      }
    }

    await logActivity(req.user.id, 'DATABASE_SEEDED', 'Database seeded with mock data');
    res.json({ success: true, message: 'Database seeded successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to seed database' });
  }
});

// ============================================
// ADMIN: CONTACTS MANAGEMENT
// ============================================
app.get('/api/admin/contacts', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM contact_submissions ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get contacts' });
  }
});

app.put('/api/admin/contacts/:id/read', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query('UPDATE contact_submissions SET is_read = true WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark contact as read' });
  }
});

app.delete('/api/admin/contacts/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM contact_submissions WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete contact' });
  }
});

// ============================================
// ADMIN: LOGS
// ============================================
app.get('/api/admin/logs', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const result = await pool.query(
      `SELECT l.*, u.name as user_name, u.email as user_email
       FROM activity_logs l
       LEFT JOIN users u ON l.user_id = u.id
       ORDER BY l.created_at DESC
       LIMIT $1 OFFSET $2`,
      [parseInt(limit), offset]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get logs' });
  }
});

// ============================================
// ADMIN: SETTINGS
// ============================================
app.get('/api/admin/settings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM settings ORDER BY key');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get settings' });
  }
});

app.put('/api/admin/settings/:key', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { value } = req.body;
    await pool.query(
      'UPDATE settings SET value = $1, updated_at = CURRENT_TIMESTAMP WHERE key = $2',
      [value, req.params.key]
    );
    await logActivity(req.user.id, 'SETTING_UPDATED', `Setting ${req.params.key} updated to ${value}`);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update setting' });
  }
});

// ============================================
// ADMIN: CERTIFICATES
// ============================================
app.get('/api/admin/certificates', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*, u.name as user_name, u.email as user_email
      FROM certificates c
      JOIN users u ON c.user_id = u.id
      ORDER BY c.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get certificates' });
  }
});

// ============================================
// SYSTEM HEALTH CHECK
// ============================================
app.get('/api/system/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'OK', database: 'PostgreSQL', timestamp: new Date().toISOString() });
  } catch (error) {
    res.json({ status: 'ERROR', message: 'Database Error' });
  }
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

// Start server
const startServer = async () => {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Database: PostgreSQL`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
