export type CategoryType = 'all' | 'birkayi' | 'kimiya' | 'fizya' | 'zindewarzani' | 'english' | 'kurdi' | 'arabi' | 'zanist' | 'rezman';

export type GradeLevel = 'all' | '10' | '11' | '12';

export type DifficultyLevel = 'ساناهی' | 'ناڤنجی' | 'زەحمەت';

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  questionText: string;
  options: QuizOption[];
  correctOptionId: string;
  explanation: string;
}

export interface Chapter {
  id: string;
  chapter_number: number;
  title: string;
  description?: string;
}

export interface Lesson {
  id: string;
  chapter_number?: number; // 1, 2, 3, 4, 5, 6
  chapter_title?: string;
  title: string;
  duration: string;
  video_url: string;
  description: string;
  is_free_preview?: boolean;
  quiz?: QuizQuestion[];
}

export interface Course {
  id: string;
  title: string;
  category: CategoryType;
  category_name_kurdish: string;
  grade_level: GradeLevel;
  grade_kurdish: string;
  description: string;
  thumbnail_url: string;
  difficulty_level: DifficultyLevel;
  instructor_name: string;
  instructor_avatar: string;
  instructor_title: string;
  price?: number;
  formatted_price?: string;
  chapters?: Chapter[];
  lessons: Lesson[];
  created_at: string;
}

export interface SubscriptionPlan {
  id: string;
  plan_name: string;
  subtitle_kurdish?: string;
  duration_months: number;
  price: number;
  formatted_price: string;
  original_price?: number;
  formatted_original_price?: string;
  discount_tag?: string;
  badge_tag?: string;
  currency: string;
  description: string;
  features: string[];
  popular?: boolean;
  color_theme?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  full_name: string;
  role?: 'student' | 'teacher' | 'admin';
  city?: string;
  birthdate?: string;
  gender?: string;
  is_student?: boolean;
  phone?: string;
  avatar_url?: string;
  subscription_active: boolean;
  subscription_expiry: number; // Unix timestamp ms
  subscription_plan_id?: string;
  purchased_courses?: string[]; // list of course IDs purchased individually
  created_at: string;
  completed_lessons: string[]; // lesson ids
  bookmarked_lessons: string[];
  quiz_scores: { [lessonId: string]: number }; // percentage
}

export interface RegisterPayload {
  full_name: string;
  email: string;
  password?: string;
  birthdate?: string;
  city?: string;
  gender?: string;
  is_student?: boolean;
  phone?: string;
}

export interface LoginPayload {
  email: string;
  password?: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: UserProfile;
  error?: string;
  message?: string;
}

export interface SafeFIBDisplayInfo {
  account_number: string;
  account_holder: string;
  iban: string;
  notes_kurdish?: string;
  currency?: string;
  is_active?: boolean;
}

export type FIBPaymentSettings = SafeFIBDisplayInfo;

export type ActiveTab = 'home' | 'library' | 'plans' | 'profile' | 'course_detail' | 'video_player' | 'admin';
