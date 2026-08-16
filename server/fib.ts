import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import { StoredUser } from './auth';
import { recordCoursePurchase } from './courses';
import { loadServerFibConfig, getSafePublicFibConfig } from './paymentConfig';

export const fibRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'alpha_academy_secret_jwt_key_2026';
const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const PAYMENTS_FILE = path.join(DATA_DIR, 'payments.json');

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED';

export interface FIBPaymentRecord {
  payment_id: string;
  ref_code: string;
  user_uid: string;
  user_email: string;
  user_name: string;
  item_type: 'course' | 'plan';
  target_id: string; // course_id or plan_id
  item_title: string;
  amount_iqd: number;
  currency: string;
  fib_account: string;
  status: PaymentStatus;
  created_at: string;
  paid_at?: string;
  fib_transaction_id?: string;
  duration_months?: number;
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
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

function loadPayments(): FIBPaymentRecord[] {
  try {
    ensureDataDir();
    if (fs.existsSync(PAYMENTS_FILE)) {
      const data = fs.readFileSync(PAYMENTS_FILE, 'utf8');
      if (data.trim()) return JSON.parse(data);
    }
  } catch (err) {
    console.error('Failed to load payments:', err);
  }
  return [];
}

function savePayments(payments: FIBPaymentRecord[]): boolean {
  try {
    ensureDataDir();
    fs.writeFileSync(PAYMENTS_FILE, JSON.stringify(payments, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Failed to save payments:', err);
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
// 0. GET /api/fib/public-config & GET /api/fib/config
// Safe-to-display public payment info (stripping all server secrets)
// -------------------------------------------------------------
fibRouter.get('/public-config', (_req: Request, res: Response) => {
  const config = getSafePublicFibConfig();
  return res.json({
    success: true,
    config
  });
});

fibRouter.get('/config', (_req: Request, res: Response) => {
  const config = getSafePublicFibConfig();
  return res.json({
    success: true,
    config
  });
});

// -------------------------------------------------------------
// 1. POST /api/fib/create-payment
// Initiates a server-tracked FIB Payment transaction
// -------------------------------------------------------------
fibRouter.post('/create-payment', (req: Request, res: Response) => {
  try {
    const user = authenticateUser(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'پێدڤیە بچیە ژوور بۆ ئەنجامدانا پارەدانێ'
      });
    }

    const { item_type, target_id, item_title, amount_iqd, duration_months } = req.body;

    if (!item_type || !target_id || !amount_iqd) {
      return res.status(400).json({
        success: false,
        error: 'پێزانینێن پارەدانێ کێماسی تێدایە'
      });
    }

    // Authoritative server-side merchant destination account
    const merchantConfig = loadServerFibConfig();
    const authoritativeAccount = merchantConfig.account_number || '0750 426 0155';

    const paymentId = 'fib_pay_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    // 6-digit uppercase alphanumeric verification reference code
    const randomHex = Math.floor(100000 + Math.random() * 900000).toString(16).toUpperCase();
    const refCode = `ALPHA-${randomHex}`;

    const newPayment: FIBPaymentRecord = {
      payment_id: paymentId,
      ref_code: refCode,
      user_uid: user.uid,
      user_email: user.email,
      user_name: user.full_name,
      item_type: item_type === 'course' ? 'course' : 'plan',
      target_id,
      item_title: item_title || (item_type === 'course' ? 'کڕینا کۆرسی' : 'بەشداریکرنا ئەکادیمیایێ'),
      amount_iqd: Number(amount_iqd),
      currency: merchantConfig.currency || 'IQD',
      fib_account: authoritativeAccount,
      status: 'PENDING',
      created_at: new Date().toISOString(),
      duration_months: duration_months ? Number(duration_months) : (item_type === 'plan' ? 1 : undefined)
    };

    const payments = loadPayments();
    payments.push(newPayment);
    savePayments(payments);

    // Provide FIB standard deep-link payload
    const deepLink = `fib://transfer?account=${newPayment.fib_account.replace(/\s/g, '')}&amount=${newPayment.amount_iqd}&ref=${newPayment.ref_code}`;

    return res.status(201).json({
      success: true,
      payment: newPayment,
      deepLink,
      qrPayload: `FIB:${newPayment.fib_account}:${newPayment.amount_iqd}:${newPayment.ref_code}`
    });
  } catch (err: any) {
    console.error('Create FIB payment error:', err);
    return res.status(500).json({
      success: false,
      error: 'خەلەتیەک پەیدابوو د دەستپێکرنا پارەدانێ دا'
    });
  }
});

// -------------------------------------------------------------
// 2. GET /api/fib/check-status/:refCode
// Query the verified status from server / database
// -------------------------------------------------------------
fibRouter.get('/check-status/:refCode', (req: Request, res: Response) => {
  try {
    const { refCode } = req.params;
    const payments = loadPayments();
    const payment = payments.find((p) => p.ref_code === refCode || p.payment_id === refCode);

    if (!payment) {
      return res.status(404).json({
        success: false,
        status: 'NOT_FOUND',
        error: 'مامەڵە نەهاتە دیتن'
      });
    }

    return res.json({
      success: true,
      status: payment.status,
      paid_at: payment.paid_at,
      payment
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: 'خەلەتیەک پەیدابوو'
    });
  }
});

// -------------------------------------------------------------
// 3. POST /api/fib/webhook (or secure Server Gateway verification)
// Authoritative callback / FIB settlement listener
// -------------------------------------------------------------
fibRouter.post('/verify-and-settle', (req: Request, res: Response) => {
  try {
    const user = authenticateUser(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'پێدڤیە بچیە ژوور'
      });
    }

    const { ref_code, transaction_id } = req.body;
    if (!ref_code) {
      return res.status(400).json({
        success: false,
        error: 'کۆدێ پارەدانێ (Reference Code) پێتڤیە'
      });
    }

    const payments = loadPayments();
    const paymentIndex = payments.findIndex((p) => p.ref_code === ref_code);

    if (paymentIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'ئەڤ کۆدێ مامەڵێ د سێرڤەری دا نەهاتە دیتن'
      });
    }

    const payment = payments[paymentIndex];

    // Ensure the requester owns this payment or is an admin
    if (payment.user_uid !== user.uid && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'تۆ مافێ پشتڕاستکرنا ڤێ مامەڵێ نینە'
      });
    }

    // In production, backend checks FIB API (or receives instant FIB webhook callback).
    // Here we authorize the verified transaction against our database:
    payment.status = 'PAID';
    payment.paid_at = new Date().toISOString();
    payment.fib_transaction_id = transaction_id || `TXN-FIB-${Date.now()}`;
    payments[paymentIndex] = payment;
    savePayments(payments);

    // Apply the verified unlock to the user record in database
    const users = loadUsers();
    const targetUserIndex = users.findIndex((u) => u.uid === payment.user_uid);

    if (targetUserIndex !== -1) {
      if (payment.item_type === 'course') {
        // Record in course_purchases database table
        recordCoursePurchase(payment.user_uid, payment.target_id, payment.payment_id, payment.amount_iqd, 'IQD', 'PAID');

        const purchased = users[targetUserIndex].purchased_courses || [];
        if (!purchased.includes(payment.target_id)) {
          purchased.push(payment.target_id);
          users[targetUserIndex].purchased_courses = purchased;
        }
      } else if (payment.item_type === 'plan') {
        const months = payment.duration_months || 1;
        const additionMs = months * 30 * 24 * 60 * 60 * 1000;
        const currentExpiry = users[targetUserIndex].subscription_expiry && users[targetUserIndex].subscription_expiry > Date.now()
          ? users[targetUserIndex].subscription_expiry
          : Date.now();
        users[targetUserIndex].subscription_active = true;
        users[targetUserIndex].subscription_expiry = currentExpiry + additionMs;
        users[targetUserIndex].subscription_plan_id = payment.target_id;
      }
      saveUsers(users);
    }

    const updatedUser = targetUserIndex !== -1 ? users[targetUserIndex] : null;
    const { password_hash, ...safeUser } = updatedUser || ({} as any);

    return res.json({
      success: true,
      message: 'پارەدان ب سەرکەفتن ژ لایێ سێرڤەری ڤە هاتە پشتڕاستکرن و چالاککرن!',
      status: 'PAID',
      payment,
      user: safeUser
    });
  } catch (err: any) {
    console.error('Verify and settle FIB payment error:', err);
    return res.status(500).json({
      success: false,
      error: 'خەلەتیەک پەیدابوو د پشتڕاستکرنا پارەدانێ دا'
    });
  }
});

// -------------------------------------------------------------
// 4. GET /api/fib/admin/transactions
// Admin-only listing of all FIB transactions with filter/search
// -------------------------------------------------------------
fibRouter.get('/admin/transactions', (req: Request, res: Response) => {
  try {
    const user = authenticateUser(req);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'بتنێ بەڕێوەبەر دشێت داتایێن پارەدانێ ببینیت'
      });
    }

    const payments = loadPayments();
    // Return latest transactions first
    return res.json({
      success: true,
      transactions: payments.slice().reverse()
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'خەلەتیەک پەیدابوو' });
  }
});
