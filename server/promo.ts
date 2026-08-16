import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import { StoredUser } from './auth';
import { recordCoursePurchase } from './courses';

export const promoRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'alpha_academy_secret_jwt_key_2026';
const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const PROMO_FILE = path.join(DATA_DIR, 'promo_codes.json');
const PAYMENTS_FILE = path.join(DATA_DIR, 'payments.json');

export interface PromoCodeRecord {
  id: string;
  code: string;
  discount_type: 'PERCENT' | 'FIXED';
  discount_value: number;
  max_uses: number;
  used_count: number;
  expires_at: string; // ISO date string
  active: boolean;
  description?: string;
  created_at: string;
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Initial Database Seed for Production-like promo codes stored securely on server
const INITIAL_PROMO_CODES: PromoCodeRecord[] = [
  {
    id: 'promo_alpha100',
    code: 'ALPHA100',
    discount_type: 'PERCENT',
    discount_value: 100,
    max_uses: 500,
    used_count: 3,
    expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    active: true,
    description: 'داشکاندنا ١٠٠٪ یا تایبەت بۆ ئەندامێن ئەکادیمیایێ',
    created_at: new Date().toISOString()
  },
  {
    id: 'promo_student20',
    code: 'STUDENT20',
    discount_type: 'PERCENT',
    discount_value: 20,
    max_uses: 1000,
    used_count: 12,
    expires_at: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
    active: true,
    description: 'داشکاندنا ٢٠٪ بۆ هەمی قوتابیێن پۆلا ١٢',
    created_at: new Date().toISOString()
  },
  {
    id: 'promo_badini50',
    code: 'BADINI50',
    discount_type: 'PERCENT',
    discount_value: 50,
    max_uses: 200,
    used_count: 8,
    expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    active: true,
    description: 'داشکاندنا ٥٠٪ یا وەرزی',
    created_at: new Date().toISOString()
  },
  {
    id: 'promo_fixed15k',
    code: 'ALPHA15K',
    discount_type: 'FIXED',
    discount_value: 15000,
    max_uses: 300,
    used_count: 5,
    expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    active: true,
    description: 'داشکاندنا ١٥,٠٠٠ دینار بۆ هەر کۆرسەکی',
    created_at: new Date().toISOString()
  }
];

export function loadPromoCodes(): PromoCodeRecord[] {
  try {
    ensureDataDir();
    if (fs.existsSync(PROMO_FILE)) {
      const data = fs.readFileSync(PROMO_FILE, 'utf8');
      if (data.trim()) return JSON.parse(data);
    }
    // Seed initial codes if file does not exist
    savePromoCodes(INITIAL_PROMO_CODES);
    return INITIAL_PROMO_CODES;
  } catch (err) {
    console.error('Failed to load promo codes:', err);
    return INITIAL_PROMO_CODES;
  }
}

export function savePromoCodes(codes: PromoCodeRecord[]): boolean {
  try {
    ensureDataDir();
    fs.writeFileSync(PROMO_FILE, JSON.stringify(codes, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Failed to save promo codes:', err);
    return false;
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
// 1. POST /api/promo/validate
// Server-side validation and discount calculation
// -------------------------------------------------------------
promoRouter.post('/validate', (req: Request, res: Response) => {
  try {
    const { code, original_price, item_type } = req.body;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({
        valid: false,
        error: 'تکایە کۆدێ داشکاندنێ بنڤێسە'
      });
    }

    const cleanCode = code.trim().toUpperCase();
    const promoCodes = loadPromoCodes();
    const promo = promoCodes.find((p) => p.code.toUpperCase() === cleanCode);

    if (!promo) {
      return res.status(404).json({
        valid: false,
        error: 'کۆدێ داخستنێ یێ نەدروستە یان بوونی نینە'
      });
    }

    if (!promo.active) {
      return res.status(400).json({
        valid: false,
        error: 'ئەڤ کۆدە هاتیە ڕاگرتن و نەچالاکە'
      });
    }

    // Check expiration date
    const expiryTime = new Date(promo.expires_at).getTime();
    if (expiryTime < Date.now()) {
      return res.status(400).json({
        valid: false,
        error: 'دەمێ بکارئینانا ڤی کۆدی ب سەرڤە چوو'
      });
    }

    // Check usage limits
    if (promo.used_count >= promo.max_uses) {
      return res.status(400).json({
        valid: false,
        error: 'ڕێژەیا بکارئینانا ڤی کۆدی ب دووماهیک هاتیە'
      });
    }

    const basePrice = Number(original_price) || 0;
    let discountAmount = 0;

    if (promo.discount_type === 'PERCENT') {
      discountAmount = Math.round((basePrice * promo.discount_value) / 100);
    } else {
      discountAmount = Math.min(basePrice, promo.discount_value);
    }

    const finalPrice = Math.max(0, basePrice - discountAmount);

    return res.json({
      valid: true,
      code: promo.code,
      discount_type: promo.discount_type,
      discount_value: promo.discount_value,
      discount_amount: discountAmount,
      final_price: finalPrice,
      is_free: finalPrice === 0,
      description: promo.description,
      message: promo.discount_type === 'PERCENT'
        ? `کۆدێ داشکاندنێ (${promo.discount_value}٪) هاتە پەسەندکرن!`
        : `کۆدێ داشکاندنێ (${promo.discount_value.toLocaleString()} د.ع) هاتە پەسەندکرن!`
    });
  } catch (err: any) {
    console.error('Promo validate error:', err);
    return res.status(500).json({
      valid: false,
      error: 'خەلەتیەک د پشکنینا کۆدێ داشکاندنێ دا رویدا'
    });
  }
});

// -------------------------------------------------------------
// 2. POST /api/promo/redeem-free
// Server-side authoritative redemption for 100% discount promo codes
// -------------------------------------------------------------
promoRouter.post('/redeem-free', (req: Request, res: Response) => {
  try {
    const user = authenticateUser(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'پێدڤیە بچیە ژوور بۆ بکارئینانا کۆدێ داشکاندنێ'
      });
    }

    const { code, item_type, target_id, duration_months } = req.body;
    if (!code || !item_type || !target_id) {
      return res.status(400).json({
        success: false,
        error: 'پێزانینێن کەم بۆ وەرگرتنا داشکاندنێ'
      });
    }

    const cleanCode = code.trim().toUpperCase();
    const promoCodes = loadPromoCodes();
    const promoIndex = promoCodes.findIndex((p) => p.code.toUpperCase() === cleanCode);

    if (promoIndex === -1) {
      return res.status(404).json({ success: false, error: 'کۆد نەهاتە دیتن' });
    }

    const promo = promoCodes[promoIndex];
    if (!promo.active || promo.used_count >= promo.max_uses || new Date(promo.expires_at).getTime() < Date.now()) {
      return res.status(400).json({ success: false, error: 'ئەڤ کۆدە نەگونجایە یان بەسەرڤەچوویە' });
    }

    if (promo.discount_type !== 'PERCENT' || promo.discount_value !== 100) {
      return res.status(400).json({
        success: false,
        error: 'ئەڤ کۆدە ١٠٠٪ بێبەرامبەر نینە، پێدڤیە ب رێکا FIB پشکا مایی بدەی'
      });
    }

    // Increment used_count in server database
    promo.used_count += 1;
    promoCodes[promoIndex] = promo;
    savePromoCodes(promoCodes);

    // Apply unlock to user in server database
    const users = loadUsers();
    const targetUserIndex = users.findIndex((u) => u.uid === user.uid);

    if (targetUserIndex !== -1) {
      if (item_type === 'course') {
        // Record in course_purchases database table
        recordCoursePurchase(user.uid, target_id, `PROMO-${cleanCode}`, 0, 'IQD', 'PAID');

        const purchased = users[targetUserIndex].purchased_courses || [];
        if (!purchased.includes(target_id)) {
          purchased.push(target_id);
          users[targetUserIndex].purchased_courses = purchased;
        }
      } else if (item_type === 'plan') {
        const months = Number(duration_months) || 1;
        const additionMs = months * 30 * 24 * 60 * 60 * 1000;
        const currentExpiry = users[targetUserIndex].subscription_expiry && users[targetUserIndex].subscription_expiry > Date.now()
          ? users[targetUserIndex].subscription_expiry
          : Date.now();
        users[targetUserIndex].subscription_active = true;
        users[targetUserIndex].subscription_expiry = currentExpiry + additionMs;
        users[targetUserIndex].subscription_plan_id = target_id;
      }
      saveUsers(users);
    }

    const updatedUser = targetUserIndex !== -1 ? users[targetUserIndex] : null;
    const { password_hash, ...safeUser } = updatedUser || ({} as any);

    return res.json({
      success: true,
      message: 'کۆدێ ١٠٠٪ داشکاندنێ ل سەر سێرڤەری ب سەرکەفتن هاتە جێبەجێکرن!',
      user: safeUser
    });
  } catch (err: any) {
    console.error('Promo redeem error:', err);
    return res.status(500).json({
      success: false,
      error: 'خەلەتیەک د جێبەجێکرنا کۆدێ داشکاندنێ دا رویدا'
    });
  }
});

// -------------------------------------------------------------
// 3. GET /api/promo/admin/list
// Admin view of all database promo codes
// -------------------------------------------------------------
promoRouter.get('/admin/list', (req: Request, res: Response) => {
  try {
    const user = authenticateUser(req);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'بتنێ بەڕێوەبەر دشێت کۆدان ببینیت' });
    }

    const promoCodes = loadPromoCodes();
    return res.json({ success: true, promoCodes });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'خەلەتیەک پەیدابوو' });
  }
});

// -------------------------------------------------------------
// 4. POST /api/promo/admin/create
// Admin creates new database promo code
// -------------------------------------------------------------
promoRouter.post('/admin/create', (req: Request, res: Response) => {
  try {
    const user = authenticateUser(req);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'بتنێ بەڕێوەبەر دەستهەڵاتدارە' });
    }

    const { code, discount_type, discount_value, max_uses, expires_in_days, description } = req.body;

    if (!code || !discount_value) {
      return res.status(400).json({ success: false, error: 'کۆد و بهایێ داشکاندنێ پێتڤینە' });
    }

    const promoCodes = loadPromoCodes();
    const cleanCode = code.trim().toUpperCase();

    if (promoCodes.some((p) => p.code === cleanCode)) {
      return res.status(400).json({ success: false, error: 'ئەڤ کۆدە بەری نوکە هەیە' });
    }

    const days = Number(expires_in_days) || 30;
    const newPromo: PromoCodeRecord = {
      id: 'promo_' + Date.now(),
      code: cleanCode,
      discount_type: discount_type === 'FIXED' ? 'FIXED' : 'PERCENT',
      discount_value: Number(discount_value),
      max_uses: Number(max_uses) || 100,
      used_count: 0,
      expires_at: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString(),
      active: true,
      description: description || '',
      created_at: new Date().toISOString()
    };

    promoCodes.push(newPromo);
    savePromoCodes(promoCodes);

    return res.status(201).json({
      success: true,
      message: 'کۆدێ نوو د بنکەدراوەیا سێرڤەری دا هاتە تۆمارکرن',
      promo: newPromo
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'خەلەتیەک پەیدابوو' });
  }
});
