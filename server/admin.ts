import { Router, Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import { StoredUser } from './auth';
import { Course, SubscriptionPlan, FIBPaymentSettings, Lesson } from '../src/types';
import { MOCK_COURSES, INITIAL_SUBSCRIPTION_PLANS } from '../src/data/mockData';
import { loadCoursePurchases } from './courses';
import { loadServerFibConfig, saveServerFibConfig } from './paymentConfig';

export const adminRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'alpha_academy_secret_jwt_key_2026';
const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const COURSES_FILE = path.join(DATA_DIR, 'courses.json');
const PLANS_FILE = path.join(DATA_DIR, 'plans.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// -------------------------------------------------------------
// Database Helper: Users
// -------------------------------------------------------------
function loadUsers(): StoredUser[] {
  try {
    ensureDataDir();
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf8');
      if (data.trim()) return JSON.parse(data);
    }
  } catch (err) {
    console.error('Failed to read users file:', err);
  }
  return [];
}

function saveUsers(users: StoredUser[]): boolean {
  try {
    ensureDataDir();
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Failed to save users file:', err);
    return false;
  }
}

// -------------------------------------------------------------
// Database Helper: Courses
// -------------------------------------------------------------
export function loadCourses(): Course[] {
  try {
    ensureDataDir();
    if (fs.existsSync(COURSES_FILE)) {
      const data = fs.readFileSync(COURSES_FILE, 'utf8');
      if (data.trim()) return JSON.parse(data);
    }
    saveCourses(MOCK_COURSES);
    return MOCK_COURSES;
  } catch (err) {
    console.error('Failed to load courses file:', err);
    return MOCK_COURSES;
  }
}

export function saveCourses(courses: Course[]): boolean {
  try {
    ensureDataDir();
    fs.writeFileSync(COURSES_FILE, JSON.stringify(courses, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Failed to save courses file:', err);
    return false;
  }
}

// -------------------------------------------------------------
// Database Helper: Plans
// -------------------------------------------------------------
export function loadPlans(): SubscriptionPlan[] {
  try {
    ensureDataDir();
    if (fs.existsSync(PLANS_FILE)) {
      const data = fs.readFileSync(PLANS_FILE, 'utf8');
      if (data.trim()) return JSON.parse(data);
    }
    savePlans(INITIAL_SUBSCRIPTION_PLANS);
    return INITIAL_SUBSCRIPTION_PLANS;
  } catch (err) {
    console.error('Failed to load plans file:', err);
    return INITIAL_SUBSCRIPTION_PLANS;
  }
}

export function savePlans(plans: SubscriptionPlan[]): boolean {
  try {
    ensureDataDir();
    fs.writeFileSync(PLANS_FILE, JSON.stringify(plans, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Failed to save plans file:', err);
    return false;
  }
}

// -------------------------------------------------------------
// Database Helper: FIB Settings (Server Merchant Config)
// -------------------------------------------------------------
export function loadFibSettings(): FIBPaymentSettings {
  return loadServerFibConfig();
}

export function saveFibSettings(settings: Partial<FIBPaymentSettings>): boolean {
  return saveServerFibConfig(settings);
}

// Initialize on module load
loadCourses();
loadPlans();
loadServerFibConfig();

// -------------------------------------------------------------
// Strict Server-side Admin Authorization Middleware
// -------------------------------------------------------------
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'پێدڤیە بچیە ژوور وەکی بەڕێوەبەر (Authentication Required)'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, JWT_SECRET);

    // Look up the user in database to ensure role was not revoked
    const users = loadUsers();
    const user = users.find((u) => u.uid === decoded.uid || u.email.toLowerCase() === decoded.email?.toLowerCase());

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'بکارهێنەر نەهاتە دیتن د سیستەمیدا'
      });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'تۆ مافێ بەڕێوەبەرایەتیێ نینە (Admin Authorization Required)'
      });
    }

    // Attach authenticated admin to request
    (req as any).adminUser = user;
    next();
  } catch (err: any) {
    return res.status(401).json({
      success: false,
      error: 'تۆکنی بەڕێوەبەرایەتیێ دروست نینە یان ب سەرڤەچوویە'
    });
  }
}

// Apply requireAdmin middleware to all endpoints under /api/admin
adminRouter.use(requireAdmin);

// -------------------------------------------------------------
// 1. GET /api/admin/verify
// Verify if the current token has active server admin privileges
// -------------------------------------------------------------
adminRouter.get('/verify', (req: Request, res: Response) => {
  const adminUser = (req as any).adminUser;
  return res.json({
    success: true,
    is_admin: true,
    user: {
      uid: adminUser.uid,
      email: adminUser.email,
      full_name: adminUser.full_name,
      role: adminUser.role
    }
  });
});

// -------------------------------------------------------------
// 2. GET /api/admin/courses
// List all courses in server database
// -------------------------------------------------------------
adminRouter.get('/courses', (_req: Request, res: Response) => {
  const courses = loadCourses();
  return res.json({ success: true, courses });
});

// -------------------------------------------------------------
// 3. POST /api/admin/courses
// Add a new course to database
// -------------------------------------------------------------
adminRouter.post('/courses', (req: Request, res: Response) => {
  try {
    const newCourse: Course = req.body;
    if (!newCourse.id || !newCourse.title) {
      return res.status(400).json({ success: false, error: 'پێدڤیە ناسنامە و ناڤێ کۆرسی بنڤێسی' });
    }

    const courses = loadCourses();
    const existingIndex = courses.findIndex((c) => c.id === newCourse.id);

    if (existingIndex !== -1) {
      courses[existingIndex] = newCourse;
    } else {
      courses.push(newCourse);
    }

    saveCourses(courses);
    return res.json({ success: true, message: 'کۆرس ب سەرکەفتن ل سێرڤەری هاتە زێدەکرن', course: newCourse });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'خەلەتیەک پەیدابوو' });
  }
});

// -------------------------------------------------------------
// 4. PUT /api/admin/courses/:id
// Update an existing course in database
// -------------------------------------------------------------
adminRouter.put('/courses/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedFields: Partial<Course> = req.body;

    const courses = loadCourses();
    const courseIndex = courses.findIndex((c) => c.id === id);

    if (courseIndex === -1) {
      return res.status(404).json({ success: false, error: 'کۆرس نەهاتە دیتن' });
    }

    courses[courseIndex] = { ...courses[courseIndex], ...updatedFields };
    saveCourses(courses);

    return res.json({ success: true, message: 'کۆرس ب سەرکەفتن هاتە نویکردن', course: courses[courseIndex] });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'خەلەتیەک پەیدابوو' });
  }
});

// -------------------------------------------------------------
// 5. DELETE /api/admin/courses/:id
// Delete a course from database
// -------------------------------------------------------------
adminRouter.delete('/courses/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let courses = loadCourses();
    courses = courses.filter((c) => c.id !== id);
    saveCourses(courses);
    return res.json({ success: true, message: 'کۆرس ب سەرکەفتن هاتە سڕینەوە' });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'خەلەتیەک پەیدابوو' });
  }
});

// -------------------------------------------------------------
// 6. POST /api/admin/courses/:id/lessons
// Add lesson to course in database
// -------------------------------------------------------------
adminRouter.post('/courses/:id/lessons', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const lesson: Lesson = req.body;

    const courses = loadCourses();
    const courseIndex = courses.findIndex((c) => c.id === id);

    if (courseIndex === -1) {
      return res.status(404).json({ success: false, error: 'کۆرس نەهاتە دیتن' });
    }

    const course = courses[courseIndex];
    if (!course.lessons) course.lessons = [];
    if (!course.chapters) course.chapters = [];

    const targetChapterNum = lesson.chapter_number || 1;
    let chapter = course.chapters.find((ch) => ch.chapter_number === targetChapterNum);

    if (!chapter) {
      chapter = {
        id: `ch_${targetChapterNum}`,
        chapter_number: targetChapterNum,
        title: `بەشێ ${targetChapterNum}`,
        description: ''
      };
      course.chapters.push(chapter);
    }

    course.lessons.push(lesson);
    courses[courseIndex] = course;
    saveCourses(courses);

    return res.json({ success: true, message: 'وانە ل سێرڤەری ب سەرکەفتن هاتە زێدەکرن', course });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'خەلەتیەک پەیدابوو' });
  }
});

// -------------------------------------------------------------
// 7. GET /api/admin/plans & PUT /api/admin/plans/:id
// Manage subscription plans
// -------------------------------------------------------------
adminRouter.get('/plans', (_req: Request, res: Response) => {
  const plans = loadPlans();
  return res.json({ success: true, plans });
});

adminRouter.put('/plans/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedFields: Partial<SubscriptionPlan> = req.body;

    const plans = loadPlans();
    const planIndex = plans.findIndex((p) => p.id === id);

    if (planIndex === -1) {
      return res.status(404).json({ success: false, error: 'پلان نەهاتە دیتن' });
    }

    plans[planIndex] = { ...plans[planIndex], ...updatedFields };
    savePlans(plans);

    return res.json({ success: true, message: 'پلان ب سەرکەفتن هاتە نویکردن', plan: plans[planIndex] });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'خەلەتیەک پەیدابوو' });
  }
});

// -------------------------------------------------------------
// 8. GET & PUT /api/admin/fib-settings
// -------------------------------------------------------------
adminRouter.get('/fib-settings', (_req: Request, res: Response) => {
  const settings = loadFibSettings();
  return res.json({ success: true, settings });
});

adminRouter.put('/fib-settings', (req: Request, res: Response) => {
  try {
    const updatedFields: Partial<FIBPaymentSettings> = req.body;
    const current = loadFibSettings();
    const merged = { ...current, ...updatedFields };
    saveFibSettings(merged);
    return res.json({ success: true, message: 'زانیاریێن FIB ب سەرکەفتن هاتنە نویکردن', settings: merged });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'خەلەتیەک پەیدابوو' });
  }
});

// -------------------------------------------------------------
// 9. GET /api/admin/users & POST /api/admin/users/role
// -------------------------------------------------------------
adminRouter.get('/users', (_req: Request, res: Response) => {
  const users = loadUsers();
  const safeUsers = users.map((u) => {
    const { password_hash, ...rest } = u;
    return rest;
  });
  return res.json({ success: true, users: safeUsers });
});

adminRouter.post('/users/set-role', (req: Request, res: Response) => {
  try {
    const { uid, role } = req.body;
    if (!uid || !role) {
      return res.status(400).json({ success: false, error: 'ناسنامە و ڕۆڵ پێدڤینە' });
    }

    const users = loadUsers();
    const userIndex = users.findIndex((u) => u.uid === uid);

    if (userIndex === -1) {
      return res.status(404).json({ success: false, error: 'بکارهێنەر نەهاتە دیتن' });
    }

    users[userIndex].role = role;
    saveUsers(users);

    return res.json({ success: true, message: 'ڕۆلێ بکارهێنەری ب سەرکەفتن هاتە گۆڕین' });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'خەلەتیەک پەیدابوو' });
  }
});

// -------------------------------------------------------------
// 10. POST /api/admin/subscription/set-status
// -------------------------------------------------------------
adminRouter.post('/subscription/set-status', (req: Request, res: Response) => {
  try {
    const { target_uid, subscription_active, duration_months, reset_all } = req.body;
    const users = loadUsers();
    const authHeader = req.headers.authorization;
    let callingUid = '';
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const decoded: any = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
        callingUid = decoded.uid;
      } catch (e) {}
    }

    const targetIndex = users.findIndex((u) => u.uid === (target_uid || callingUid));

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
    const { password_hash, ...safeUser } = users[targetIndex];
    return res.json({ success: true, message: 'ڕەوشا بەشداریێ ب سەرکەفتن هاتە گۆڕین', user: safeUser });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'خەلەتیەک پەیدابوو' });
  }
});

// -------------------------------------------------------------
// 11. GET /api/admin/stats
// Financial & student overview
// -------------------------------------------------------------
adminRouter.get('/stats', (_req: Request, res: Response) => {
  const users = loadUsers();
  const courses = loadCourses();
  const purchases = loadCoursePurchases();

  const totalStudents = users.filter((u) => u.role === 'student' || u.is_student).length;
  const activeSubscribers = users.filter((u) => u.subscription_active && u.subscription_expiry > Date.now()).length;
  const totalCoursesPurchased = purchases.filter((p) => p.status === 'PAID' || p.status === 'COMPLETED').length;

  return res.json({
    success: true,
    stats: {
      total_users: users.length,
      total_students: totalStudents,
      active_subscribers: activeSubscribers,
      total_courses: courses.length,
      total_course_purchases: totalCoursesPurchased,
      server_timestamp: new Date().toISOString()
    }
  });
});
