import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import { StoredUser } from './auth';

export const coursesRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'alpha_academy_secret_jwt_key_2026';
const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const PURCHASES_FILE = path.join(DATA_DIR, 'course_purchases.json');

export interface CoursePurchaseRecord {
  id: string;
  user_id: string;
  course_id: string;
  payment_id: string;
  price: number;
  currency: string;
  status: 'PAID' | 'COMPLETED' | 'ACTIVE' | 'REFUNDED';
  purchased_at: string;
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Initial database seed for course purchases
const INITIAL_PURCHASES: CoursePurchaseRecord[] = [
  {
    id: 'pur_demo_01',
    user_id: 'usr-student-01',
    course_id: 'bio-12',
    payment_id: 'FIB-PAY-SEED-01',
    price: 60000,
    currency: 'IQD',
    status: 'PAID',
    purchased_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export function loadCoursePurchases(): CoursePurchaseRecord[] {
  try {
    ensureDataDir();
    if (fs.existsSync(PURCHASES_FILE)) {
      const data = fs.readFileSync(PURCHASES_FILE, 'utf8');
      if (data.trim()) return JSON.parse(data);
    }
    saveCoursePurchases(INITIAL_PURCHASES);
    return INITIAL_PURCHASES;
  } catch (err) {
    console.error('Failed to load course purchases:', err);
    return INITIAL_PURCHASES;
  }
}

export function saveCoursePurchases(purchases: CoursePurchaseRecord[]): boolean {
  try {
    ensureDataDir();
    fs.writeFileSync(PURCHASES_FILE, JSON.stringify(purchases, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Failed to save course purchases:', err);
    return false;
  }
}

export function recordCoursePurchase(
  userId: string,
  courseId: string,
  paymentId: string,
  price: number = 60000,
  currency: string = 'IQD',
  status: 'PAID' | 'COMPLETED' | 'ACTIVE' = 'PAID'
): CoursePurchaseRecord {
  const purchases = loadCoursePurchases();
  
  // Check if active purchase record already exists
  const existing = purchases.find(
    (p) => p.user_id === userId && p.course_id === courseId && (p.status === 'PAID' || p.status === 'COMPLETED' || p.status === 'ACTIVE')
  );

  if (existing) {
    return existing;
  }

  const newRecord: CoursePurchaseRecord = {
    id: `pur_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    user_id: userId,
    course_id: courseId,
    payment_id: paymentId,
    price,
    currency,
    status,
    purchased_at: new Date().toISOString()
  };

  purchases.push(newRecord);
  saveCoursePurchases(purchases);
  return newRecord;
}

export function userHasCoursePurchase(userId: string, courseId: string): boolean {
  const purchases = loadCoursePurchases();
  return purchases.some(
    (p) => p.user_id === userId && p.course_id === courseId && (p.status === 'PAID' || p.status === 'COMPLETED' || p.status === 'ACTIVE')
  );
}

function loadUsers(): StoredUser[] {
  try {
    ensureDataDir();
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf8');
      if (data.trim()) return JSON.parse(data);
    }
  } catch (err) {
    console.error('Failed to load users:', err);
  }
  return [];
}

function saveUsers(users: StoredUser[]): boolean {
  try {
    ensureDataDir();
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Failed to save users:', err);
    return false;
  }
}

function authenticateUser(req: Request): StoredUser | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
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
// 1. GET /api/courses/:id/access
// Server-authoritative access validation querying the database
// -------------------------------------------------------------
coursesRouter.get('/:id/access', (req: Request, res: Response) => {
  try {
    const courseId = req.params.id;
    const user = authenticateUser(req);

    if (!user) {
      return res.status(401).json({
        allowed: false,
        reason: 'unauthenticated',
        message: 'پێدڤیە بچیە ژوور بۆ پشکنینا دەستگەهشتنێ'
      });
    }

    // Admins and teachers have full access
    if (user.role === 'admin' || user.role === 'teacher') {
      return res.json({
        allowed: true,
        reason: 'admin_teacher_privilege',
        user_id: user.uid,
        course_id: courseId
      });
    }

    // Active subscription grants access to all courses
    if (user.subscription_active && user.subscription_expiry && user.subscription_expiry > Date.now()) {
      return res.json({
        allowed: true,
        reason: 'subscription_active',
        user_id: user.uid,
        course_id: courseId,
        subscription_expiry: user.subscription_expiry
      });
    }

    // Check course_purchases database table
    const purchases = loadCoursePurchases();
    const purchaseRecord = purchases.find(
      (p) => p.user_id === user.uid && p.course_id === courseId && (p.status === 'PAID' || p.status === 'COMPLETED' || p.status === 'ACTIVE')
    );

    if (purchaseRecord) {
      return res.json({
        allowed: true,
        reason: 'course_purchased',
        user_id: user.uid,
        course_id: courseId,
        purchase: purchaseRecord
      });
    }

    // Access denied by database
    return res.status(403).json({
      allowed: false,
      reason: 'course_not_purchased',
      message: 'تۆ ئەڤ کۆرسە نەکڕیە و پلانا تە یا بەردەست نینە',
      course_id: courseId
    });
  } catch (err: any) {
    console.error('Course access check error:', err);
    return res.status(500).json({
      allowed: false,
      error: 'خەلەتیەک د پشکنینا دەستگەهشتنا کۆرسیدا رویدا'
    });
  }
});

// -------------------------------------------------------------
// 2. GET /api/courses/my-purchases
// Returns all purchased courses for the authenticated user from database
// -------------------------------------------------------------
coursesRouter.get('/user/my-purchases', (req: Request, res: Response) => {
  try {
    const user = authenticateUser(req);
    if (!user) {
      return res.status(401).json({ success: false, error: 'پێدڤیە بچیە ژوور' });
    }

    const purchases = loadCoursePurchases();
    const userPurchases = purchases.filter(
      (p) => p.user_id === user.uid && (p.status === 'PAID' || p.status === 'COMPLETED' || p.status === 'ACTIVE')
    );

    return res.json({
      success: true,
      user_id: user.uid,
      purchases: userPurchases,
      course_ids: userPurchases.map((p) => p.course_id)
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'خەلەتیەک پەیدابوو' });
  }
});

// -------------------------------------------------------------
// 3. POST /api/courses/purchase
// Record a server-authoritative course purchase
// -------------------------------------------------------------
coursesRouter.post('/purchase', (req: Request, res: Response) => {
  try {
    const user = authenticateUser(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'پێدڤیە بچیە ژوور بۆ کڕینا کۆرسی'
      });
    }

    const { course_id, payment_ref, price } = req.body;
    if (!course_id) {
      return res.status(400).json({
        success: false,
        error: 'کۆرس نەهاتە دەستنیشانکرن'
      });
    }

    const paymentId = payment_ref || `PAY-${Date.now()}`;
    const coursePrice = Number(price) || 60000;

    // Record in course_purchases database
    const record = recordCoursePurchase(user.uid, course_id, paymentId, coursePrice, 'IQD', 'PAID');

    // Also sync to user profile record
    const users = loadUsers();
    const userIndex = users.findIndex((u) => u.uid === user.uid);
    if (userIndex !== -1) {
      const purchased = users[userIndex].purchased_courses || [];
      if (!purchased.includes(course_id)) {
        purchased.push(course_id);
        users[userIndex].purchased_courses = purchased;
        saveUsers(users);
      }
    }

    const updatedUser = userIndex !== -1 ? users[userIndex] : null;
    const { password_hash, ...safeUser } = updatedUser || ({} as any);

    return res.json({
      success: true,
      message: 'کڕینا کۆرسی ل سەر سێرڤەری و د خشتەیا course_purchases دا هاتە تۆمارکرن!',
      purchase: record,
      user: safeUser
    });
  } catch (err: any) {
    console.error('Course purchase error:', err);
    return res.status(500).json({
      success: false,
      error: 'خەلەتیەک پەیدابوو د کڕینا کۆرسیدا'
    });
  }
});
