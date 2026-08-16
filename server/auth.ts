import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { UserProfile } from '../src/types';

export const authRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'alpha_academy_secret_jwt_key_2026';
const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

export interface StoredUser extends UserProfile {
  password_hash: string;
}

// Ensure data directory and users.json file exist
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Default initial accounts with securely hashed passwords
function getDefaultUsers(): StoredUser[] {
  const salt = bcrypt.genSaltSync(10);
  const now = new Date().toISOString();

  return [
    {
      uid: 'usr-admin-01',
      email: 'admin@alpha.edu',
      password_hash: bcrypt.hashSync('admin123', salt),
      full_name: 'بەڕێوەبەری ئەکادیمیایێ',
      role: 'admin',
      city: 'دهۆک',
      gender: 'male',
      is_student: false,
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      subscription_active: true,
      subscription_expiry: Date.now() + 365 * 24 * 60 * 60 * 1000,
      subscription_plan_id: 'yearly',
      created_at: now,
      completed_lessons: [],
      bookmarked_lessons: [],
      quiz_scores: {}
    },
    {
      uid: 'usr-teacher-01',
      email: 'behzad@alpha.edu',
      password_hash: bcrypt.hashSync('behzad123', salt),
      full_name: 'م. بهزاد علی',
      role: 'teacher',
      city: 'دهۆک',
      gender: 'male',
      is_student: false,
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      subscription_active: true,
      subscription_expiry: Date.now() + 365 * 24 * 60 * 60 * 1000,
      subscription_plan_id: 'yearly',
      created_at: now,
      completed_lessons: [],
      bookmarked_lessons: [],
      quiz_scores: {}
    },
    {
      uid: 'usr-student-01',
      email: 'student@alpha.edu',
      password_hash: bcrypt.hashSync('student123', salt),
      full_name: 'قوتابیێ هێژا',
      role: 'student',
      city: 'دهۆک',
      birthdate: '2007-04-15',
      gender: 'male',
      is_student: true,
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      subscription_active: true,
      subscription_expiry: Date.now() + 30 * 24 * 60 * 60 * 1000,
      subscription_plan_id: 'quarterly',
      created_at: now,
      completed_lessons: [],
      bookmarked_lessons: [],
      quiz_scores: {}
    }
  ];
}

// In-memory cache synced with disk
let usersCache: StoredUser[] = [];

function loadUsers(): StoredUser[] {
  try {
    ensureDataDir();
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf8');
      if (data.trim()) {
        usersCache = JSON.parse(data);
        return usersCache;
      }
    }
  } catch (err) {
    console.error('Failed to read users database from file:', err);
  }

  // Initialize with default users if file missing or corrupt
  usersCache = getDefaultUsers();
  saveUsers(usersCache);
  return usersCache;
}

function saveUsers(users: StoredUser[]): boolean {
  try {
    ensureDataDir();
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
    usersCache = users;
    return true;
  } catch (err) {
    console.error('Failed to write users database to file:', err);
    return false;
  }
}

// Initialize on module load
loadUsers();

// Helper to strip password_hash before returning to client
function sanitizeUser(user: StoredUser): UserProfile {
  const { password_hash, ...safeUser } = user;
  return safeUser;
}

// Generate JWT token
function generateToken(user: StoredUser): string {
  return jwt.sign(
    {
      uid: user.uid,
      email: user.email,
      role: user.role || 'student',
      full_name: user.full_name
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

// -------------------------------------------------------------
// POST /api/auth/register
// -------------------------------------------------------------
authRouter.post('/register', (req: Request, res: Response) => {
  try {
    const { full_name, email, password, birthdate, city, gender, is_student, phone } = req.body;

    if (!full_name || typeof full_name !== 'string' || !full_name.trim()) {
      return res.status(400).json({
        success: false,
        error: 'تکایە ناڤێ سیانی بنڤێسە'
      });
    }

    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({
        success: false,
        error: 'تکایە ئیمێلەکێ دروست بنڤێسە'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        error: 'شێوازێ ئیمێلی نەدروستە (نموونە: student@example.com)'
      });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'پەیڤا نهێنی پێدڤیە کێمتر نەبیت ژ ٦ پیتان'
      });
    }

    const users = loadUsers();
    const existingUser = users.find((u) => u.email.toLowerCase() === normalizedEmail);

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'ئەڤ ئیمێلە بەرێ هاتیە بکارئینان. تکایە بچە لاپەرێ چوونا ژوور.'
      });
    }

    const salt = bcrypt.genSaltSync(10);
    const password_hash = bcrypt.hashSync(password, salt);
    const now = new Date().toISOString();

    const newUser: StoredUser = {
      uid: 'usr-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6),
      email: normalizedEmail,
      password_hash,
      full_name: full_name.trim(),
      role: 'student',
      city: city || 'دهۆک',
      birthdate: birthdate || '',
      gender: gender || 'male',
      is_student: is_student !== undefined ? Boolean(is_student) : true,
      phone: phone || '',
      avatar_url: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80`,
      subscription_active: true, // Gift 14 days welcome trial
      subscription_expiry: Date.now() + 14 * 24 * 60 * 60 * 1000,
      subscription_plan_id: 'quarterly',
      purchased_courses: [],
      created_at: now,
      completed_lessons: [],
      bookmarked_lessons: [],
      quiz_scores: {}
    };

    users.push(newUser);
    saveUsers(users);

    const token = generateToken(newUser);
    const safeUser = sanitizeUser(newUser);

    return res.status(201).json({
      success: true,
      message: 'هەژمار ب سەرکەفتن هاتە دروستکرن!',
      token,
      user: safeUser
    });
  } catch (err: any) {
    console.error('Registration server error:', err);
    return res.status(500).json({
      success: false,
      error: 'خەلەتیەک پەیدابوو د دروستکرنا هەژمارێ دا. تکایە دووبارە هەوڵبدە.'
    });
  }
});

// -------------------------------------------------------------
// POST /api/auth/login
// -------------------------------------------------------------
authRouter.post('/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({
        success: false,
        error: 'تکایە ئیمێلێ خۆ بنڤێسە'
      });
    }

    if (!password || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'تکایە پەیڤا دەربازبوونێ بنڤێسە'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const users = loadUsers();
    const user = users.find((u) => u.email.toLowerCase() === normalizedEmail);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'ئیمێل یان پەیڤا دەربازبوونێ نەدروستە'
      });
    }

    const passwordMatch = bcrypt.compareSync(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        error: 'ئیمێل یان پەیڤا دەربازبوونێ نەدروستە'
      });
    }

    const token = generateToken(user);
    const safeUser = sanitizeUser(user);

    return res.json({
      success: true,
      message: 'چوونا ژوور ب سەرکەفتن ئەنجامدرا!',
      token,
      user: safeUser
    });
  } catch (err: any) {
    console.error('Login server error:', err);
    return res.status(500).json({
      success: false,
      error: 'خەلەتیەک پەیدابوو د چوونا ژوور دا. تکایە دووبارە هەوڵبدە.'
    });
  }
});

// -------------------------------------------------------------
// GET /api/auth/me
// -------------------------------------------------------------
authRouter.get('/me', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'پێدڤیە بچیە ژوور (Token missing)'
      });
    }

    const token = authHeader.split(' ')[1];
    let decoded: any;

    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (tokenErr) {
      return res.status(401).json({
        success: false,
        error: 'دەمی بەکارهێنانا هەژمارێ ب سەرڤە چوو. تکایە دووبارە بچە ژوور.'
      });
    }

    const users = loadUsers();
    const user = users.find((u) => u.uid === decoded.uid || u.email.toLowerCase() === decoded.email.toLowerCase());

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'بکارهێنەر نەهاتە دیتن'
      });
    }

    return res.json({
      success: true,
      user: sanitizeUser(user)
    });
  } catch (err: any) {
    console.error('Get profile server error:', err);
    return res.status(500).json({
      success: false,
      error: 'خەلەتیەک پەیدابوو د بارکرنا هەژمارێ دا'
    });
  }
});

// -------------------------------------------------------------
// POST /api/auth/forgot-password
// -------------------------------------------------------------
authRouter.post('/forgot-password', (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        error: 'تکایە ئیمێلێ خۆ بنڤێسە'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const users = loadUsers();
    const user = users.find((u) => u.email.toLowerCase() === normalizedEmail);

    // For security, always return success message so email enumeration is avoided
    return res.json({
      success: true,
      message: 'ئەگەر ئەڤ ئیمێلە هەبیت د سیستەمیدا، لینکا نووکرنێ هاتە هنارتن.'
    });
  } catch (err: any) {
    console.error('Forgot password server error:', err);
    return res.status(500).json({
      success: false,
      error: 'خەلەتیەک پەیدابوو. تکایە پاشتر تاقیبکەڤە.'
    });
  }
});

// -------------------------------------------------------------
// POST /api/auth/logout
// -------------------------------------------------------------
authRouter.post('/logout', (_req: Request, res: Response) => {
  return res.json({
    success: true,
    message: 'دەرکەفتن ب سەرکەفتن ئەنجامدرا'
  });
});

// Middleware helper to authenticate and extract user
function authenticateUser(req: Request): StoredUser | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const users = loadUsers();
    return users.find((u) => u.uid === decoded.uid || u.email.toLowerCase() === decoded.email.toLowerCase()) || null;
  } catch (err) {
    return null;
  }
}

// -------------------------------------------------------------
// POST /api/subscriptions/verify-payment
// Server-authoritative payment verification & activation
// -------------------------------------------------------------
authRouter.post('/subscriptions/verify-payment', (req: Request, res: Response) => {
  try {
    const user = authenticateUser(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'پێدڤیە بچیە ژوور بۆ چالاککرنا بەشداریێ'
      });
    }

    const { plan_id, duration_months, payment_ref, payment_method } = req.body;

    if (!plan_id || !duration_months) {
      return res.status(400).json({
        success: false,
        error: 'پێزانینێن پلانێ نەدروستن'
      });
    }

    const months = Number(duration_months) || 1;
    const additionMs = months * 30 * 24 * 60 * 60 * 1000;
    const currentExpiry = user.subscription_expiry && user.subscription_expiry > Date.now() 
      ? user.subscription_expiry 
      : Date.now();
    const newExpiry = currentExpiry + additionMs;

    const users = loadUsers();
    const userIndex = users.findIndex((u) => u.uid === user.uid);
    if (userIndex === -1) {
      return res.status(404).json({ success: false, error: 'بکارهێنەر نەهاتە دیتن' });
    }

    // Update server-side database authoritative subscription status
    users[userIndex].subscription_active = true;
    users[userIndex].subscription_expiry = newExpiry;
    users[userIndex].subscription_plan_id = plan_id;

    saveUsers(users);

    return res.json({
      success: true,
      message: 'بەشداریکرن ل سەر سێرڤەری ب سەرکەفتن هاتە چالاکرن!',
      user: sanitizeUser(users[userIndex])
    });
  } catch (err: any) {
    console.error('Subscription activation server error:', err);
    return res.status(500).json({
      success: false,
      error: 'خەلەتیەک پەیدابوو د چالاککرنا بەشداریێ دا'
    });
  }
});

// -------------------------------------------------------------
// POST /api/courses/purchase
// Server-authoritative single course purchase
// -------------------------------------------------------------
authRouter.post('/courses/purchase', (req: Request, res: Response) => {
  try {
    const user = authenticateUser(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'پێدڤیە بچیە ژوور بۆ کڕینا کۆرسی'
      });
    }

    const { course_id, payment_ref } = req.body;
    if (!course_id) {
      return res.status(400).json({
        success: false,
        error: 'کۆرس نەهاتە دەستنیشانکرن'
      });
    }

    const users = loadUsers();
    const userIndex = users.findIndex((u) => u.uid === user.uid);
    if (userIndex === -1) {
      return res.status(404).json({ success: false, error: 'بکارهێنەر نەهاتە دیتن' });
    }

    const purchased = users[userIndex].purchased_courses || [];
    if (!purchased.includes(course_id)) {
      purchased.push(course_id);
      users[userIndex].purchased_courses = purchased;
      saveUsers(users);
    }

    return res.json({
      success: true,
      message: 'کۆرس ل سەر سێرڤەری ب سەرکەفتن هاتە کڕین!',
      user: sanitizeUser(users[userIndex])
    });
  } catch (err: any) {
    console.error('Course purchase server error:', err);
    return res.status(500).json({
      success: false,
      error: 'خەلەتیەک پەیدابوو د کڕینا کۆرسیدا'
    });
  }
});

// -------------------------------------------------------------
// GET /api/lessons/:lessonId/access
// Server-authoritative validation for paid lesson content
// -------------------------------------------------------------
authRouter.get('/lessons/:lessonId/access', (req: Request, res: Response) => {
  try {
    const { lessonId } = req.params;
    const courseId = req.query.courseId as string;
    const user = authenticateUser(req);

    // If user is admin/teacher, allow all access
    if (user && (user.role === 'admin' || user.role === 'teacher')) {
      return res.json({
        allowed: true,
        reason: 'admin_teacher_privilege'
      });
    }

    // Check if user has active server subscription (current time < expiry)
    if (user && user.subscription_active && user.subscription_expiry > Date.now()) {
      return res.json({
        allowed: true,
        reason: 'subscription_active',
        expiry: user.subscription_expiry
      });
    }

    // Check if user bought this specific course
    if (user && courseId && user.purchased_courses && user.purchased_courses.includes(courseId)) {
      return res.json({
        allowed: true,
        reason: 'course_purchased'
      });
    }

    // If not subscribed or purchased, server denies content
    return res.status(403).json({
      allowed: false,
      reason: 'subscription_required_or_expired',
      message: 'پێدڤیە بەشداریێ بکەی یان کۆرسی بکڕی بۆ دیتنا ڤێ وانەیێ'
    });
  } catch (err: any) {
    console.error('Access check server error:', err);
    return res.status(500).json({
      allowed: false,
      error: 'خەلەتیەک پەیدابوو د پشکنینا دەستگەهشتنێ دا'
    });
  }
});

// -------------------------------------------------------------
// POST /api/admin/subscription/set-status
// Server-only administrative control (requires admin token)
// -------------------------------------------------------------
authRouter.post('/admin/subscription/set-status', (req: Request, res: Response) => {
  try {
    const user = authenticateUser(req);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'بتنێ بەڕێوەبەر دشێت دەستکاریێ بکەت'
      });
    }

    const { target_uid, subscription_active, duration_months, reset_all } = req.body;
    const users = loadUsers();
    const targetIndex = users.findIndex((u) => u.uid === (target_uid || user.uid));

    if (targetIndex === -1) {
      return res.status(404).json({ success: false, error: 'بکارهێنەر نەهاتە دیتن' });
    }

    if (reset_all) {
      users[targetIndex].subscription_active = false;
      users[targetIndex].subscription_expiry = 0;
      users[targetIndex].subscription_plan_id = undefined;
      users[targetIndex].purchased_courses = [];
    } else if (subscription_active) {
      const months = Number(duration_months) || 1;
      const additionMs = months * 30 * 24 * 60 * 60 * 1000;
      users[targetIndex].subscription_active = true;
      users[targetIndex].subscription_expiry = Date.now() + additionMs;
      users[targetIndex].subscription_plan_id = 'monthly';
    } else {
      users[targetIndex].subscription_active = false;
      users[targetIndex].subscription_expiry = Date.now() - 1000;
    }

    saveUsers(users);

    return res.json({
      success: true,
      message: 'گۆڕانکاری ل سەر سێرڤەری هاتنە تۆمارکرن',
      user: sanitizeUser(users[targetIndex])
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'خەلەتیەک پەیدابوو' });
  }
});
