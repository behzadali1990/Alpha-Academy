import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, Lesson, Course, SubscriptionPlan, FIBPaymentSettings, RegisterPayload } from '../types';
import { INITIAL_USER_PROFILE, MOCK_COURSES, INITIAL_SUBSCRIPTION_PLANS, INITIAL_FIB_SETTINGS } from '../data/mockData';
import { Language, TRANSLATIONS, getTranslation } from '../data/translations';

interface AuthContextType {
  user: UserProfile | null;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  courses: Course[];
  plans: SubscriptionPlan[];
  fibSettings: FIBPaymentSettings;
  updateFIBSettings: (newSettings: Partial<FIBPaymentSettings>) => void;
  activeTab: string;
  setActiveTab: (tab: any) => void;
  selectedCourse: Course | null;
  setSelectedCourse: (course: Course | null) => void;
  selectedLesson: Lesson | null;
  setSelectedLesson: (lesson: Lesson | null) => void;
  isMobileFrame: boolean;
  setIsMobileFrame: (val: boolean) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (val: boolean) => void;
  token: string | null;
  authLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (payload: RegisterPayload) => Promise<{ success: boolean; error?: string }>;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof TRANSLATIONS) => string;
  hasAccessToLesson: (lesson: Lesson | null) => boolean;
  activateSubscription: (planId: string, durationMonths: number, paymentRef?: string) => Promise<{ success: boolean; error?: string }>;
  cancelSubscription: () => void;
  resetAllPurchasesAndSubscription: () => void;
  setDemoUserMode: (mode: 'active' | 'expired' | 'unsubscribed') => void;
  toggleCompleteLesson: (lessonId: string) => void;
  toggleBookmarkLesson: (lessonId: string) => void;
  recordQuizScore: (lessonId: string, scorePercentage: number) => void;
  loginDemoUser: (fullName: string, email: string) => void;
  logoutUser: () => void;
  purchaseSingleCourse: (courseId: string, paymentRef?: string) => Promise<{ success: boolean; error?: string }>;
  buySingleCourse: (courseId: string) => void;
  hasAccessToCourse: (courseId: string) => boolean;
  checkServerCourseAccess: (courseId: string) => Promise<{ allowed: boolean; reason?: string; purchase?: any }>;
  updateCoursePrice: (courseId: string, newPrice: number) => void;
  
  // Content Editing Methods
  addCourse: (newCourse: Course) => void;
  updateCourse: (courseId: string, updatedFields: Partial<Course>) => void;
  deleteCourse: (courseId: string) => void;
  addLessonToCourse: (courseId: string, lesson: Lesson) => void;
  updateLesson: (courseId: string, lessonId: string, updatedFields: Partial<Lesson>) => void;
  deleteLesson: (courseId: string, lessonId: string) => void;
  updatePlan: (planId: string, updatedFields: Partial<SubscriptionPlan>) => void;
  resetAllDataToDefaults: () => void;

  timeRemainingFormatted: string;
  isExpired: boolean;
}

const STORAGE_KEY_USER = 'alpha_academy_user_v8';
const STORAGE_KEY_COURSES = 'alpha_academy_courses_v14';
const STORAGE_KEY_PLANS = 'alpha_academy_plans_v8';
const STORAGE_KEY_TOKEN = 'alpha_academy_auth_token_v1';

async function safeJson<T = any>(res: Response): Promise<T> {
  try {
    const text = await res.text();
    if (!text || !text.trim()) return {} as T;
    return JSON.parse(text) as T;
  } catch (err) {
    return {} as T;
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Safe display information fetched authoritatively from server API
  const [fibSettings, setFIBSettings] = useState<FIBPaymentSettings>(INITIAL_FIB_SETTINGS);

  const updateFIBSettings = async (newSettings: Partial<FIBPaymentSettings>) => {
    setFIBSettings((prev) => ({ ...prev, ...newSettings }));

    if (token) {
      try {
        const res = await fetch('/api/admin/fib-settings', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(newSettings)
        });
        const data = await safeJson(res);
        if (data.success && data.settings) {
          setFIBSettings(data.settings);
        }
      } catch (err) {
        console.error('Failed to sync FIB settings to admin API:', err);
      }
    }
  };
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.full_name === 'ئازاد دهۆکی') {
          parsed.full_name = 'قوتابیێ هێژا';
        }
        return parsed;
      }
    } catch (e) {
      console.error("Failed to load user state", e);
    }
    return INITIAL_USER_PROFILE;
  });

  const [courses, setCourses] = useState<Course[]>(() => {
    const isExcluded = (c: Course) => {
      if (c.grade_level && c.grade_level !== '12') return true;
      const text = `${c.id} ${c.title} ${c.description || ''} ${c.instructor_name || ''} ${c.instructor_title || ''}`.toLowerCase();
      return text.includes('کۆدکرن') || text.includes('python') || text.includes('هەڤال') || text.includes(' web basics') || (text.includes('it') && text.includes('پۆلا ١١'));
    };

    const sanitizeString = (str: string | undefined) => {
      if (!str) return str || '';
      return str
        .replace(/\s*\(\s*ئحیا\s*\)/gi, '')
        .replace(/\s*\(\s*ئحيا\s*\)/gi, '')
        .replace(/\s*\(\s*احياء\s*\)/gi, '')
        .replace(/\s*\(\s*احيا\s*\)/gi, '')
        .replace(/\s*\(\s*ژینناسی\s*\)/gi, '')
        .replace(/\s*\(\s*بایۆلۆجی\s*\)/gi, '')
        .replace(/ژینناسی/gi, 'زیندەوەرزانی')
        .trim();
    };

    const sanitizeTeacherName = (name: string | undefined) => {
      if (!name) return '';
      let formatted = name.trim();
      formatted = formatted.replace(/^(مامۆستا|ماموستا|د\.)\s*/i, '');
      if (!formatted.startsWith('م. ')) {
        formatted = `م. ${formatted}`;
      }
      return formatted;
    };

    const sanitizeCourse = (course: Course): Course => {
      return {
        ...course,
        title: sanitizeString(course.title),
        category_name_kurdish: sanitizeString(course.category_name_kurdish),
        description: sanitizeString(course.description),
        instructor_name: sanitizeTeacherName(course.instructor_name),
        instructor_title: sanitizeString(course.instructor_title),
      };
    };

    try {
      const saved = localStorage.getItem(STORAGE_KEY_COURSES);
      if (saved) {
        const parsed: Course[] = JSON.parse(saved);
        const filtered = parsed.filter((c) => !isExcluded(c)).map((c) => {
          const mock = MOCK_COURSES.find((m) => m.id === c.id);
          if (mock) {
            return sanitizeCourse({
              ...mock,
              ...c,
              instructor_name: c.instructor_name || mock.instructor_name,
              instructor_title: c.instructor_title || mock.instructor_title,
              instructor_avatar: c.instructor_avatar || mock.instructor_avatar,
              chapters: c.chapters || mock.chapters,
            });
          }
          return sanitizeCourse(c);
        });
        localStorage.setItem(STORAGE_KEY_COURSES, JSON.stringify(filtered));
        return filtered;
      }
    } catch (e) {
      console.error("Failed to load saved courses", e);
    }
    return MOCK_COURSES.filter((c) => !isExcluded(c)).map(sanitizeCourse);
  });

  const [plans, setPlans] = useState<SubscriptionPlan[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PLANS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to load saved plans", e);
    }
    return INITIAL_SUBSCRIPTION_PLANS;
  });

  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_TOKEN) || null;
    } catch (e) {
      return null;
    }
  });
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    try {
      const savedToken = localStorage.getItem(STORAGE_KEY_TOKEN);
      return !!savedToken;
    } catch (e) {
      return false;
    }
  });

  // Verify stored JWT session token on startup
  useEffect(() => {
    async function verifySession() {
      const savedToken = localStorage.getItem(STORAGE_KEY_TOKEN);
      if (!savedToken) {
        setAuthLoading(false);
        setIsLoggedIn(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${savedToken}`
          }
        });

        if (res.ok) {
          const data = await safeJson(res);
          if (data.success && data.user) {
            setUser(data.user);
            setToken(savedToken);
            setIsLoggedIn(true);
          } else {
            localStorage.removeItem(STORAGE_KEY_TOKEN);
            setToken(null);
            setIsLoggedIn(false);
          }
        } else {
          // Token expired or invalid
          localStorage.removeItem(STORAGE_KEY_TOKEN);
          setToken(null);
          setIsLoggedIn(false);
        }
      } catch (err) {
        console.error('Session verification network error:', err);
      } finally {
        setAuthLoading(false);
      }
    }

    verifySession();
  }, []);

  // Fetch safe-to-display FIB payment configuration from server API
  useEffect(() => {
    fetch('/api/fib/public-config')
      .then((res) => safeJson(res))
      .then((data) => {
        if (data.success && data.config) {
          setFIBSettings(data.config);
        }
      })
      .catch((err) => console.error('Failed to fetch public FIB configuration:', err));
  }, []);
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('alpha_academy_lang');
      if (saved === 'en' || saved === 'ar' || saved === 'ku') return saved;
    } catch (e) {
      console.error(e);
    }
    return 'ku';
  });

  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem('alpha_academy_lang', newLang);
    } catch (e) {
      console.error(e);
    }
  };

  const t = (key: keyof typeof TRANSLATIONS) => {
    return getTranslation(key, language);
  };

  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(courses[0] || null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(courses[0]?.lessons[0] || null);

  useEffect(() => {
    localStorage.setItem('alpha_academy_is_logged_in', JSON.stringify(isLoggedIn));
  }, [isLoggedIn]);

  // Sync to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_COURSES, JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PLANS, JSON.stringify(plans));
  }, [plans]);

  const now = Date.now();
  const isExpired = !user || !user.subscription_active || user.subscription_expiry <= now;

  // Calculate formatted time remaining
  const getTimeRemaining = (): string => {
    if (!user || !user.subscription_active || user.subscription_expiry <= now) {
      return 'بەسەرچوویە';
    }
    const diff = user.subscription_expiry - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days} ڕۆژ و ${hours} دەمژێر ماینە`;
    }
    return `${hours} دەمژێر ماینە`;
  };

  const hasAccessToCourse = (courseId: string): boolean => {
    if (!user) return false;
    if (user.role === 'admin' || user.role === 'teacher') return true;
    if (user.subscription_active && user.subscription_expiry > Date.now()) return true;
    return Boolean(user.purchased_courses && user.purchased_courses.includes(courseId));
  };

  const hasAccessToLesson = (lesson: Lesson | null, courseId?: string): boolean => {
    if (!lesson) return false;
    if (lesson.is_free_preview) return true;
    if (!user) return false;
    if (user.role === 'admin' || user.role === 'teacher') return true;

    // Authoritative check: User has an active, unexpired subscription
    if (user.subscription_active && user.subscription_expiry > Date.now()) {
      return true;
    }
    
    // Check if parent course or selectedCourse is purchased individually
    const targetCourseId = courseId || selectedCourse?.id;
    if (targetCourseId && user.purchased_courses && user.purchased_courses.includes(targetCourseId)) {
      return true;
    }
    return false;
  };

  // Server-authoritative Single Course Purchase
  const purchaseSingleCourse = async (courseId: string, paymentRef?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!token) {
        return { success: false, error: 'پێدڤیە بچیە ژوور' };
      }

      const res = await fetch('/api/courses/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          course_id: courseId,
          payment_ref: paymentRef || 'FIB-DIRECT'
        })
      });

      const data = await safeJson(res);
      if (res.ok && data.success && data.user) {
        setUser(data.user);
        return { success: true };
      }
      return { success: false, error: data.error || 'کڕینا کۆرسی سەرنەکەفت' };
    } catch (err) {
      console.error('Failed to purchase course on server:', err);
      return { success: false, error: 'پەیوەندی ب سێرڤەری نەهاتە ئەنجامدان' };
    }
  };

  const checkServerCourseAccess = async (courseId: string): Promise<{ allowed: boolean; reason?: string; purchase?: any }> => {
    if (!token) {
      return { allowed: false, reason: 'unauthenticated' };
    }
    try {
      const res = await fetch(`/api/courses/${courseId}/access`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await safeJson(res);
      return data;
    } catch (err) {
      console.error('Failed to check course access on server:', err);
      return { allowed: false, reason: 'network_error' };
    }
  };

  const buySingleCourse = (courseId: string) => {
    purchaseSingleCourse(courseId);
  };

  const updateCoursePrice = (courseId: string, newPrice: number) => {
    const formatted = `${newPrice.toLocaleString('en-US')} د.ع`;
    updateCourse(courseId, {
      price: newPrice,
      formatted_price: formatted
    });
  };

  // Server-authoritative Subscription Activation
  const activateSubscription = async (planId: string, durationMonths: number, paymentRef?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!token) {
        return { success: false, error: 'پێدڤیە بچیە ژوور' };
      }

      const res = await fetch('/api/subscriptions/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          plan_id: planId,
          duration_months: durationMonths,
          payment_ref: paymentRef || 'FIB-VERIFIED-RECEIPT',
          payment_method: 'fib'
        })
      });

      const data = await safeJson(res);
      if (res.ok && data.success && data.user) {
        // Server database confirmed subscription.status === ACTIVE
        setUser(data.user);
        return { success: true };
      }

      return { success: false, error: data.error || 'سێرڤەری پارەدان پشتڕاست نەکر' };
    } catch (err) {
      console.error('Server subscription activation failed:', err);
      return { success: false, error: 'ئاریشەک د پەیوەندیا سێرڤەری دا پەیدابوو' };
    }
  };

  // Server-authoritative Subscription Status Reset (for Admin test tools)
  const cancelSubscription = async () => {
    try {
      if (token && user?.role === 'admin') {
        const res = await fetch('/api/admin/subscription/set-status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            target_uid: user.uid,
            subscription_active: false
          })
        });
        const data = await safeJson(res);
        if (data.user) setUser(data.user);
      } else {
        // Local state expiration if non-admin
        setUser((prev) => ({
          ...prev,
          subscription_active: false,
          subscription_expiry: Date.now() - 1000
        }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const resetAllPurchasesAndSubscription = async () => {
    try {
      if (token && user?.role === 'admin') {
        const res = await fetch('/api/admin/subscription/set-status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            target_uid: user.uid,
            reset_all: true
          })
        });
        const data = await safeJson(res);
        if (data.user) setUser(data.user);
      } else {
        setUser((prev) => ({
          ...prev,
          subscription_active: false,
          subscription_expiry: 0,
          subscription_plan_id: undefined,
          purchased_courses: []
        }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Clean up demo user mode
  const setDemoUserMode = (mode: 'active' | 'expired' | 'unsubscribed') => {
    // Deprecated: Subscriptions are strictly verified via Server API
  };

  const toggleCompleteLesson = (lessonId: string) => {
    setUser((prev) => {
      const exists = prev.completed_lessons.includes(lessonId);
      const updated = exists
        ? prev.completed_lessons.filter((id) => id !== lessonId)
        : [...prev.completed_lessons, lessonId];
      return { ...prev, completed_lessons: updated };
    });
  };

  const toggleBookmarkLesson = (lessonId: string) => {
    setUser((prev) => {
      const exists = prev.bookmarked_lessons.includes(lessonId);
      const updated = exists
        ? prev.bookmarked_lessons.filter((id) => id !== lessonId)
        : [...prev.bookmarked_lessons, lessonId];
      return { ...prev, bookmarked_lessons: updated };
    });
  };

  const recordQuizScore = (lessonId: string, scorePercentage: number) => {
    setUser((prev) => ({
      ...prev,
      quiz_scores: {
        ...prev.quiz_scores,
        [lessonId]: scorePercentage
      }
    }));
  };

  // Real Server Authentication: Login
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });

      const data = await safeJson(res);

      if (!res.ok || !data.success) {
        return {
          success: false,
          error: data.error || 'ئیمێل یان پەیڤا نهێنی نەدروستە'
        };
      }

      if (data.token && data.user) {
        localStorage.setItem(STORAGE_KEY_TOKEN, data.token);
        setToken(data.token);
        setUser(data.user);
        setIsLoggedIn(true);
        return { success: true };
      }

      return { success: false, error: 'وەڵامێ نەدیار ژ سێرڤەری گەهشت' };
    } catch (err: any) {
      console.error('Login error:', err);
      return {
        success: false,
        error: 'پەیوەندی ب سێرڤەری نەهاتە ئەنجامدان. تکایە ئینتەرنێتێ خۆ بپشکنە.'
      };
    }
  };

  // Real Server Authentication: Register
  const register = async (payload: RegisterPayload): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await safeJson(res);

      if (!res.ok || !data.success) {
        return {
          success: false,
          error: data.error || 'خەلەتیەک پەیدابوو د تۆماربوونێ دا'
        };
      }

      if (data.token && data.user) {
        localStorage.setItem(STORAGE_KEY_TOKEN, data.token);
        setToken(data.token);
        setUser(data.user);
        setIsLoggedIn(true);
        return { success: true };
      }

      return { success: false, error: 'وەڵامێ نەدیار ژ سێرڤەری گەهشت' };
    } catch (err: any) {
      console.error('Register error:', err);
      return {
        success: false,
        error: 'پەیوەندی ب سێرڤەری نەهاتە ئەنجامدان. تکایە ئینتەرنێتێ خۆ بپشکنە.'
      };
    }
  };

  const loginDemoUser = (fullName: string, email: string) => {
    setUser({
      uid: 'usr-' + Date.now(),
      email,
      full_name: fullName,
      role: 'student',
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      subscription_active: true,
      subscription_expiry: Date.now() + 14 * 24 * 60 * 60 * 1000,
      subscription_plan_id: 'quarterly',
      created_at: new Date().toISOString(),
      completed_lessons: [],
      bookmarked_lessons: [],
      quiz_scores: {}
    });
    setIsLoggedIn(true);
  };

  const logoutUser = async () => {
    try {
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        }).catch(() => {});
      }
    } catch (e) {
      // Ignore network failures on logout
    }

    localStorage.removeItem(STORAGE_KEY_TOKEN);
    setToken(null);
    setIsLoggedIn(false);
    setActiveTab('home');
  };

  // Content Editing Functions (Server-authoritative for Admins)
  const addCourse = (newCourse: Course) => {
    setCourses((prev) => [newCourse, ...prev]);
    if (token) {
      fetch('/api/admin/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newCourse)
      }).catch((err) => console.error('Failed to save course to server:', err));
    }
  };

  const updateCourse = (courseId: string, updatedFields: Partial<Course>) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === courseId ? { ...c, ...updatedFields } : c))
    );
    if (selectedCourse?.id === courseId) {
      setSelectedCourse((prev) => (prev ? { ...prev, ...updatedFields } : null));
    }
    if (token) {
      fetch(`/api/admin/courses/${courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedFields)
      }).catch((err) => console.error('Failed to update course on server:', err));
    }
  };

  const deleteCourse = (courseId: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== courseId));
    if (selectedCourse?.id === courseId) {
      setSelectedCourse(null);
      setSelectedLesson(null);
    }
    if (token) {
      fetch(`/api/admin/courses/${courseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).catch((err) => console.error('Failed to delete course on server:', err));
    }
  };

  const addLessonToCourse = (courseId: string, lesson: Lesson) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id === courseId) {
          return { ...c, lessons: [...c.lessons, lesson] };
        }
        return c;
      })
    );
    if (selectedCourse?.id === courseId) {
      setSelectedCourse((prev) =>
        prev ? { ...prev, lessons: [...prev.lessons, lesson] } : null
      );
    }
    if (token) {
      fetch(`/api/admin/courses/${courseId}/lessons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(lesson)
      }).catch((err) => console.error('Failed to add lesson on server:', err));
    }
  };

  const updateLesson = (courseId: string, lessonId: string, updatedFields: Partial<Lesson>) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id === courseId) {
          const updatedLessons = c.lessons.map((l) =>
            l.id === lessonId ? { ...l, ...updatedFields } : l
          );
          return { ...c, lessons: updatedLessons };
        }
        return c;
      })
    );
    if (selectedCourse?.id === courseId) {
      setSelectedCourse((prev) => {
        if (!prev) return null;
        const updatedLessons = prev.lessons.map((l) =>
          l.id === lessonId ? { ...l, ...updatedFields } : l
        );
        return { ...prev, lessons: updatedLessons };
      });
    }
    if (selectedLesson?.id === lessonId) {
      setSelectedLesson((prev) => (prev ? { ...prev, ...updatedFields } : null));
    }
  };

  const deleteLesson = (courseId: string, lessonId: string) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id === courseId) {
          return { ...c, lessons: c.lessons.filter((l) => l.id !== lessonId) };
        }
        return c;
      })
    );
    if (selectedCourse?.id === courseId) {
      setSelectedCourse((prev) =>
        prev ? { ...prev, lessons: prev.lessons.filter((l) => l.id !== lessonId) } : null
      );
    }
    if (selectedLesson?.id === lessonId) {
      setSelectedLesson(null);
    }
  };

  const updatePlan = (planId: string, updatedFields: Partial<SubscriptionPlan>) => {
    setPlans((prev) =>
      prev.map((p) => (p.id === planId ? { ...p, ...updatedFields } : p))
    );
    if (token) {
      fetch(`/api/admin/plans/${planId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedFields)
      }).catch((err) => console.error('Failed to update plan on server:', err));
    }
  };

  const resetAllDataToDefaults = () => {
    localStorage.removeItem(STORAGE_KEY_COURSES);
    localStorage.removeItem(STORAGE_KEY_PLANS);
    localStorage.removeItem(STORAGE_KEY_USER);
    setCourses(MOCK_COURSES);
    setPlans(INITIAL_SUBSCRIPTION_PLANS);
    setUser(INITIAL_USER_PROFILE);
    setSelectedCourse(MOCK_COURSES[0]);
    setSelectedLesson(MOCK_COURSES[0].lessons[0]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        courses,
        plans,
        fibSettings,
        updateFIBSettings,
        activeTab,
        setActiveTab,
        selectedCourse,
        setSelectedCourse,
        selectedLesson,
        setSelectedLesson,
        isMobileFrame,
        setIsMobileFrame,
        isLoggedIn,
        setIsLoggedIn,
        token,
        authLoading,
        login,
        register,
        language,
        setLanguage,
        t,
        hasAccessToLesson,
        activateSubscription,
        cancelSubscription,
        resetAllPurchasesAndSubscription,
        setDemoUserMode,
        toggleCompleteLesson,
        toggleBookmarkLesson,
        recordQuizScore,
        loginDemoUser,
        logoutUser,
        purchaseSingleCourse,
        buySingleCourse: purchaseSingleCourse,
        hasAccessToCourse,
        checkServerCourseAccess,
        updateCoursePrice,
        addCourse,
        updateCourse,
        deleteCourse,
        addLessonToCourse,
        updateLesson,
        deleteLesson,
        updatePlan,
        resetAllDataToDefaults,
        timeRemainingFormatted: getTimeRemaining(),
        isExpired
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

