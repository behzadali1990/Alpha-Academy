import { Course, SubscriptionPlan, UserProfile, FIBPaymentSettings } from '../types';

const behzadTeacherPhoto = '/behzad_ali.jpg';

// Safe initial display placeholder (authoritative merchant configuration is maintained exclusively server-side)
export const INITIAL_FIB_SETTINGS: FIBPaymentSettings = {
  account_number: '',
  account_holder: '',
  iban: '',
  notes_kurdish: '',
  currency: 'IQD',
  is_active: true
};

export const INITIAL_SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'monthly',
    plan_name: '1 هەیڤ',
    subtitle_kurdish: '1 هەیڤ',
    duration_months: 1,
    price: 50000,
    formatted_price: '50,000 د.ع',
    original_price: 69000,
    formatted_original_price: '69,000 د.ع',
    discount_tag: '28% داشکاندن',
    currency: 'IQD',
    description: 'دەستپێگەهشتنا تەواو بۆ هەمی کۆرسان بۆ ماوێ ئێک هەیڤ',
    features: [
      'دەستپێگەهشتنا نەبڕاوە بۆ هەمی کۆرسان',
      'کوالیتییا HD 1080p ب بێ ڕێکلام',
      'دەستگەهشتن ب هەمی تاقیکرن و شیکاران',
      'پشتگیریا مامۆستایێ ژیر (AI Tutor)'
    ],
    popular: false,
    color_theme: 'border-slate-200 bg-white'
  },
  {
    id: 'yearly',
    plan_name: 'ئێک سال',
    subtitle_kurdish: '12 هەیڤ',
    duration_months: 12,
    price: 450000,
    formatted_price: '450,000 د.ع',
    original_price: 900000,
    formatted_original_price: '900,000 د.ع',
    discount_tag: '50% داشکاندن',
    badge_tag: 'باشترین ئۆفەر',
    currency: 'IQD',
    description: 'باشترین نرخ بۆ هەمی ساڵا خویندنێ (دەستپێگەهشتنا تەواو)',
    features: [
      'دەستپێگەهشتنا تەواو بۆ ساڵەکا کامل',
      'گەهشتن ب هەمی کۆرسێن نوو ب بێ تێچوویێ زێدە',
      'پشتگیریا ئێکسەر یا ٢٤/٧ ژ مامۆستایان',
      'داشکاندنا تایبەت بۆ بەشداربوونا هەڤالان'
    ],
    popular: true,
    color_theme: 'border-[#2B7FE0] bg-sky-50/20'
  },
  {
    id: 'quarterly',
    plan_name: '6 هەیڤ',
    subtitle_kurdish: '6 هەیڤ',
    duration_months: 6,
    price: 300000,
    formatted_price: '300,000 د.ع',
    original_price: 450000,
    formatted_original_price: '450,000 د.ع',
    discount_tag: '33% داشکاندن',
    currency: 'IQD',
    description: 'دەستپێگەهشتنا تەواو بۆ شەش هەیڤان',
    features: [
      'هەمی تایبەتمەندیێن پلا نا هەیڤانە',
      'تست و تاقیکرنێن گشتگیر یێن ئەزموونان',
      'بڕوانامەیا بەشداربوونا فەرمی',
      'پشتگیریا بەردەوام یا مامۆستایێن ئەکادیمی'
    ],
    popular: false,
    color_theme: 'border-slate-200 bg-white'
  }
];

export const MOCK_COURSES: Course[] = [
  // ------------------- GRADE 12 SCIENTIFIC (پۆلا ١٢ زانستی) -------------------
  {
    id: 'course-g12-birkayi',
    title: 'بیرکاری پۆلا ١٢ زانستی',
    category: 'birkayi',
    category_name_kurdish: 'بیرکاری',
    grade_level: '12',
    grade_kurdish: 'پۆلا ١٢ زانستی',
    description: 'کۆرسێ تێر و تەسەل یێ بیرکارییا پۆلا ١٢ زانستی ب رێکێن ساناهی ب زاراڤێ بادینی ب پشتگیریا م. بهزاد علی.',
    thumbnail_url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80',
    difficulty_level: 'زەحمەت',
    instructor_name: 'م. بهزاد علی',
    instructor_avatar: behzadTeacherPhoto,
    instructor_title: 'مامۆستایێ بیرکارییا پۆلا ١٢ زانستی',
    price: 60000,
    formatted_price: '60,000 د.ع',
    created_at: '2026-01-15',
    chapters: [
      { id: 'ch-m1', chapter_number: 1, title: 'بەشێ ١: هاوکێشە و ڕەگێن جەبری', description: 'شیکارکرنا هاوکێشەیێن پلە دوو و یاسایێن دێلتا' },
      { id: 'ch-m2', chapter_number: 2, title: 'بەشێ ٢: ماتریکس و دیترمێنێنت', description: 'سیستەمێ هاوکێشەیان ب ماتریکس و ڕێکا کرامر' },
      { id: 'ch-m3', chapter_number: 3, title: 'بەشێ ٣: نەخشە و سنوور (Limit)', description: 'پێناسەیا سنووران و شیکارکرنا ئاستێ نەخشەیان' },
      { id: 'ch-m4', chapter_number: 4, title: 'بەشێ ٤: داڕشتن (Derivative)', description: 'یاسایێن داڕشتنێ و خاڵێن بەرز و نزم' },
      { id: 'ch-m5', chapter_number: 5, title: 'بەشێ ٥: تەواوکاری و ئەندازە', description: 'تەواوکارییا دیارکری، بڕگێن ئەندازەیی و ئامار' },
    ],
    lessons: [
      {
        id: 'l1-1',
        chapter_number: 1,
        chapter_title: 'بەشێ ١: هاوکێشە و ڕەگێن جەبری',
        title: 'وانەیا ١: دەستپێک ل سەر هاوکێشەیێن شێوەیێ پلە دوو',
        duration: '12:45',
        video_url: 'https://www.youtube.com/embed/LXb3EKWsInQ?autoplay=1&rel=0&modestbranding=1',
        description: 'د ڤێ وانەیێ دا دێ فێر ببی کا چاوا هاوکێشەیێن جەبری ب ڕێکا یاسایێن دێلتا و شیکارکرنا دەستبەجێ شیکار بکی.',
        is_free_preview: true,
        quiz: [
          {
            id: 'q1',
            questionText: 'یاسایێ دێلتا (Δ) د شیکارکرنا هاوکێشەیێن پلە دوو دا چییە؟',
            options: [
              { id: 'a', text: 'Δ = b² - 4ac' },
              { id: 'b', text: 'Δ = a² + b²' },
              { id: 'c', text: 'Δ = 2a + 3b' },
              { id: 'd', text: 'Δ = b / 2a' }
            ],
            correctOptionId: 'a',
            explanation: 'یاسایا گشتی یا دێلتا تشتێ بنەڕەتییە بۆ دیارکرنا ژمارەیا ڕەگێن هاوکێشەیێ: Δ = b² - 4ac.'
          }
        ]
      },
      {
        id: 'l1-2',
        chapter_number: 2,
        chapter_title: 'بەشێ ٢: ماتریکس و دیترمێنێنت',
        title: 'وانەیا ١: شیکارکرنا سیستەمێ هاوکێشەیێن هێڵی ب ڕێکا ماتریسان',
        duration: '18:20',
        video_url: 'https://www.youtube.com/embed/fPnwBITSmgU?autoplay=1&rel=0&modestbranding=1',
        description: 'شیکارکرنا ماتریکس، دیترمێنێنت و نەدیارێن X و Y.',
        is_free_preview: false
      },
      {
        id: 'l1-3',
        chapter_number: 3,
        chapter_title: 'بەشێ ٣: نەخشە و سنوور (Limit)',
        title: 'وانەیا ١: لێکدانا سنووران و بەردەوامبوونا نەخشەیان',
        duration: '15:10',
        video_url: 'https://www.youtube.com/embed/LXb3EKWsInQ?autoplay=1&rel=0&modestbranding=1',
        description: 'چاوانیا لێکدانا سنوورێن بەردەوام د بیرکارییا پۆلا ١٢ دا.',
        is_free_preview: false
      },
      {
        id: 'l1-4',
        chapter_number: 4,
        chapter_title: 'بەشێ ٤: داڕشتن (Derivative)',
        title: 'وانەیا ١: یاسایێن سەرەکی یێن داڕشتنێ',
        duration: '20:15',
        video_url: 'https://www.youtube.com/embed/fPnwBITSmgU?autoplay=1&rel=0&modestbranding=1',
        description: 'شیکارکرنا یاسایا زۆربوون و کێمبوونێ د داڕشتنێ دا.',
        is_free_preview: false
      },
      {
        id: 'l1-5',
        chapter_number: 5,
        chapter_title: 'بەشێ ٥: تەواوکاری (Integral)',
        title: 'وانەیا ١: بنەمایێن تەواوکارییا دیارنەکری',
        duration: '16:40',
        video_url: 'https://www.youtube.com/embed/LXb3EKWsInQ?autoplay=1&rel=0&modestbranding=1',
        description: 'دۆزینەوەیا نەخشەیا بنەڕەتی ب ڕێکا یاسایێن تەواوکاریێ.',
        is_free_preview: false
      },
      {
        id: 'l1-6',
        chapter_number: 6,
        chapter_title: 'بەشێ ٦: ئەندازە و ئامار',
        title: 'وانەیا ١: بڕگێن ئەرخەوانی و یاسایێن پارابۆلا',
        duration: '14:50',
        video_url: 'https://www.youtube.com/embed/fPnwBITSmgU?autoplay=1&rel=0&modestbranding=1',
        description: 'شیکارکرنا بڕگێن ئەندازەیی د بیرکارییا پۆلا ١٢ دا.',
        is_free_preview: false
      }
    ]
  },
  {
    id: 'course-g12-kimiya',
    title: 'کیمیا پۆلا ١٢ زانستی',
    category: 'kimiya',
    category_name_kurdish: 'کیمیا',
    grade_level: '12',
    grade_kurdish: 'پۆلا ١٢ زانستی',
    description: 'کۆرسێ گشتگیر یێ کیمیایا پۆلا ١٢ زانستی؛ تێگەهشتنا کارلێکێن کیمیاوی، هایدرۆکاربۆن، ترش و تفتان.',
    thumbnail_url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80',
    difficulty_level: 'زەحمەت',
    instructor_name: 'م. ڕێناس دهۆکی',
    instructor_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    instructor_title: 'مامۆستایێ کیمیایا پۆلا ١٢ زانستی',
    price: 60000,
    formatted_price: '60,000 د.ع',
    created_at: '2026-02-01',
    chapters: [
      { id: 'ch-k1', chapter_number: 1, title: 'بەشێ ١: کارلێکێن کیمیاوی و مۆڵ', description: 'بارستەیا مۆڵاری و هاوکێشەیێن کیمیاوی' },
      { id: 'ch-k2', chapter_number: 2, title: 'بەشێ ٢: گەرمییا کارلێکان', description: 'ئینتالیپی و کارلێکێن گەرمیبەخش و گەرمیپێویست' },
      { id: 'ch-k3', chapter_number: 3, title: 'بەشێ ٣: خێرايیا کارلێکێن کیمیاوی', description: 'تێکرا یا خێڕایی و کارپێکەرێن کارلێکان' },
      { id: 'ch-k4', chapter_number: 4, title: 'بەشێ ٤: هاوسەنگیا کیمیاوی', description: 'نەگۆڕا هاوسەنگیێ Keq و پرەنسیپێ لوشاتلیە' },
      { id: 'ch-k5', chapter_number: 5, title: 'بەشێ ٥: ترش، تفت و کیمیایا ئەندامی', description: 'سۆلماز pH و ئاوێتەیێن هایدرۆکاربۆنی' },
    ],
    lessons: [
      {
        id: 'l2-1',
        chapter_number: 1,
        chapter_title: 'بەشێ ١: کارلێکێن کیمیاوی و مۆڵ',
        title: 'وانەیا ١: بنەمایێن ژمارەیا مۆڵ و هاوکێشەیێن کیمیاوی',
        duration: '15:30',
        video_url: 'https://www.youtube.com/embed/3y13mS_8Puk?autoplay=1&rel=0&modestbranding=1',
        description: 'دیارکرنا بارستەیا مۆڵاری و هەڤسەنگکرنا کارلێکێن کیمیاوی.',
        is_free_preview: true
      }
    ]
  },
  {
    id: 'course-g12-fizya',
    title: 'فیزیا پۆلا ١٢ زانستی',
    category: 'fizya',
    category_name_kurdish: 'فیزیا',
    grade_level: '12',
    grade_kurdish: 'پۆلا ١٢ زانستی',
    description: 'شیکارکرنا یاسایێن فیزیایا پۆلا ١٢ زانستی؛ تەزوویا کارەبایی، شێوەیێن مەگناتیسی و کێشکرنا گەردونی ب وێنەیان.',
    thumbnail_url: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=800&q=80',
    difficulty_level: 'زەحمەت',
    instructor_name: 'م. دانا هەولێری',
    instructor_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    instructor_title: 'مامۆستایێ فیزیایا پۆلا ١٢ زانستی',
    price: 60000,
    formatted_price: '60,000 د.ع',
    created_at: '2026-02-05',
    chapters: [
      { id: 'ch-f1', chapter_number: 1, title: 'بەشێ ١: تەزوویا کارەبایی و بەرهەنگاری', description: 'یاسایا ئۆم و جیاوازییا پۆتەنشێل' },
      { id: 'ch-f2', chapter_number: 2, title: 'بەشێ ٢: خولگەیێن کارەبایی', description: 'بەستنا زنجیرەیی و تەریب' },
      { id: 'ch-f3', chapter_number: 3, title: 'بەشێ ٣: مەگناتیس و بەرهەمهێنانا کارەبایێ', description: 'بواری مەگناتیسی و یاسایا فارادای' },
      { id: 'ch-f4', chapter_number: 4, title: 'بەشێ ٤: کارۆمەگناتیسی و شەپۆل', description: 'ترانسفۆرمەر، هێزا کارۆمەگناتیسی و شەپۆل' },
      { id: 'ch-f5', chapter_number: 5, title: 'بەشێ ٥: فیزیایا گەردی و ناوکی', description: 'ڕادیۆئەکتیڤ و تیشکێن ناوکی' },
    ],
    lessons: [
      {
        id: 'l6-1',
        chapter_number: 1,
        chapter_title: 'بەشێ ١: تەزوویا کارەبایی و بەرهەنگاری',
        title: 'وانەیا ١: تەزوویا کارەبایی و بەرهەنگاریا ئۆم',
        duration: '17:40',
        video_url: 'https://www.youtube.com/embed/fPnwBITSmgU?autoplay=1&rel=0&modestbranding=1',
        description: 'شیکارکرنا گەهێن کارەبایی د هاوکێشەیێن فیزیایا پۆلا ١٢ زانستی دا.',
        is_free_preview: true
      }
    ]
  },
  {
    id: 'course-g12-zindewarzani',
    title: 'زیندەوەرزانی پۆلا ١٢ زانستی',
    category: 'zindewarzani',
    category_name_kurdish: 'زیندەوەرزانی',
    grade_level: '12',
    grade_kurdish: 'پۆلا ١٢ زانستی',
    description: 'شیکارکرنا بنەما و ئۆرگانێن لاشێ مرۆڤی، زیندەوەرزانی و خانەیان تایبەت ب پرۆگرامێ پۆلا ١٢ زانستی.',
    thumbnail_url: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&w=800&q=80',
    difficulty_level: 'زەحمەت',
    instructor_name: 'م. هێرش دهۆکی',
    instructor_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    instructor_title: 'مامۆستایێ زیندەوەرزانییا پۆلا ١٢ زانستی',
    price: 60000,
    formatted_price: '60,000 د.ع',
    created_at: '2026-02-10',
    chapters: [
      { id: 'ch-z1', chapter_number: 1, title: 'بەشێ ١: پێکهاتەیا خانەیێ و DNA', description: 'دابەشبوونا میتۆس و میۆس' },
      { id: 'ch-z2', chapter_number: 2, title: 'بەشێ ٢: بۆماوە زانی', description: 'یاسایێن مەندەل و نەخۆشیێن بۆماوەیی' },
      { id: 'ch-z3', chapter_number: 3, title: 'بەشێ ٣: کۆئەندامێ دەماران و مێشک', description: 'پەیامێن دەماری و هەستەوەر' },
      { id: 'ch-z4', chapter_number: 4, title: 'بەشێ ٤: کۆئەندامێ سووڕانا خوێنێ و هەناسەدان', description: 'دڵ، ڕەگێن خوێنێ و هەناسەدان' },
      { id: 'ch-z5', chapter_number: 5, title: 'بەشێ ٥: کۆئەندامێ بەرگریێ و هۆرمۆن', description: 'خۆپاراستن، بەرگری و زۆربوونا زیندەوەران' },
    ],
    lessons: [
      {
        id: 'lz-1',
        chapter_number: 1,
        chapter_title: 'بەشێ ١: پێکهاتەیا خانەیێ و DNA',
        title: 'وانەیا ١: خانە و پێکهاتەیا DNA د لاشێ ژینداران دا',
        duration: '19:10',
        video_url: 'https://www.youtube.com/embed/LXb3EKWsInQ?autoplay=1&rel=0&modestbranding=1',
        description: 'فێربوونا دابەشبوونا خانەیان و گواستنەیا بۆماوەیی د زیندەوەرزانی دا.',
        is_free_preview: true
      }
    ]
  },
  {
    id: 'course-g12-english',
    title: 'زمانێ ئینگلیزی پۆلا ١٢ زانستی',
    category: 'english',
    category_name_kurdish: 'زمانێ ئینگلیزی',
    grade_level: '12',
    grade_kurdish: 'پۆلا ١٢ زانستی',
    description: 'وانەیێن تایبەت یێن زمانێ ئینگلیزی کتێبا Sunrise 12؛ ڕێزمان، دەقێن خویندنێ و پرسێن بەکەلۆریایێ.',
    thumbnail_url: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=800&q=80',
    difficulty_level: 'ناڤنجی',
    instructor_name: 'م. سارا ئەحمەد',
    instructor_avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    instructor_title: 'مامۆستایا زمانێ ئینگلیزییا پۆلا ١٢ زانستی',
    price: 60000,
    formatted_price: '60,000 د.ع',
    created_at: '2026-02-12',
    chapters: [
      { id: 'ch-e1', chapter_number: 1, title: 'بەشێ ١: Unit 1 - Grammar & Passive Voice', description: 'ڕێزمانا Unit 1 و ڕستەیێن Passive' },
      { id: 'ch-e2', chapter_number: 2, title: 'بەشێ ٢: Unit 2 - Reading & Vocabulary', description: 'دەقێن خویندنێ و پەیڤێن نوو' },
      { id: 'ch-e3', chapter_number: 3, title: 'بەشێ ٣: Unit 3 - Reported Speech', description: 'ئاخڤتنا گواستراوە و داڕشتن' },
      { id: 'ch-e4', chapter_number: 4, title: 'بەشێ ٤: Unit 4 - Relative Clauses', description: 'ڕستەیێن بەستنێ و Conditionals' },
      { id: 'ch-e5', chapter_number: 5, title: 'بەشێ ٥: Units 5 & 6 - Past Papers & Final Practice', description: 'پرسیارێن بەکەلۆریایێ و پێداچوونا گشتی' },
    ],
    lessons: [
      {
        id: 'l3-1',
        chapter_number: 1,
        chapter_title: 'بەشێ ١: Unit 1 - Grammar & Passive Voice',
        title: 'Sunrise 12 - Unit 1: Passive Voice & Report Writing',
        duration: '14:20',
        video_url: 'https://www.youtube.com/embed/LXb3EKWsInQ?autoplay=1&rel=0&modestbranding=1',
        description: 'فێربوونا دروستکرنا ڕستەیێن بکەرنەدیار (Passive Voice) د ئینگلیزییا پۆلا ١٢ دا.',
        is_free_preview: true
      }
    ]
  },
  {
    id: 'course-g12-kurdi',
    title: 'زمانێ کوردی پۆلا ١٢ زانستی',
    category: 'kurdi',
    category_name_kurdish: 'کوردی',
    grade_level: '12',
    grade_kurdish: 'پۆلا ١٢ زانستی',
    description: 'شیکارکرنا کتێبا کوردییا پۆلا ١٢؛ ڕێزمانا بادینی، مێژووا ئەدەبێ کوردی و شیعڕێن شاعیران.',
    thumbnail_url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80',
    difficulty_level: 'ناڤنجی',
    instructor_name: 'م. نەوزاد زاخۆیی',
    instructor_avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
    instructor_title: 'مامۆستایێ زمانێ کوردی پۆلا ١٢',
    price: 60000,
    formatted_price: '60,000 د.ع',
    created_at: '2026-02-14',
    chapters: [
      { id: 'ch-ku1', chapter_number: 1, title: 'بەشێ ١: ڕێزمان - ئەرکێن ڕستەیێ', description: 'جێناوێن لکاو و سەربەخۆ د بادینی دا' },
      { id: 'ch-ku2', chapter_number: 2, title: 'بەشێ ٢: ڕێزمان - کاری تەواو و کەم', description: 'کاری دەمێن بورى و نوو' },
      { id: 'ch-ku3', chapter_number: 3, title: 'بەشێ ٣: ئەدەب - مێژووا ئەدەبێ کوردی', description: 'سەردەمێن ئەدەبێ کوردی' },
      { id: 'ch-ku4', chapter_number: 4, title: 'بەشێ ٤: ئەدەب - شاعیرێن کلاسیک', description: 'شیکارا شیعڕێن خانی، مەلایێ جزیری و بێکس' },
      { id: 'ch-ku5', chapter_number: 5, title: 'بەشێ ٥: دارشتن، زاراوەسازی و ڕاهێنانێن بەکەلۆریایێ', description: 'پرسیارێن بەکەلۆریایێ یێن ساڵێن بورى' },
    ],
    lessons: [
      {
        id: 'lkur-1',
        chapter_number: 1,
        chapter_title: 'بەشێ ١: ڕێزمان - ئەرکێن ڕستەیێ',
        title: 'وانەیا ١: ئەركێن ڕستەیێ و جێناوێن لکاو د بادینی دا',
        duration: '16:00',
        video_url: 'https://www.youtube.com/embed/LXb3EKWsInQ?autoplay=1&rel=0&modestbranding=1',
        description: 'شیکارکرنا جێناوان و کاری ناپەڕپەڕ د زمانێ کوردی یێ پۆلا ١٢ دا.',
        is_free_preview: true
      }
    ]
  },
  {
    id: 'course-g12-arabi',
    title: 'زمانێ عەرەبی پۆلا ١٢ زانستی',
    category: 'arabi',
    category_name_kurdish: 'زمانێ عەرەبی',
    grade_level: '12',
    grade_kurdish: 'پۆلا ١٢ زانستی',
    description: 'شیکارا تەواو یا یاسایێن ڕێزمانا عەرەبی (قواعد اللغة العربية) و دەقێن خویندنێ بۆ پۆلا ١٢.',
    thumbnail_url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80',
    difficulty_level: 'ناڤنجی',
    instructor_name: 'م. ئەیاد هەولێری',
    instructor_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    instructor_title: 'مامۆستایێ زمانێ عەرەبی پۆلا ١٢',
    price: 60000,
    formatted_price: '60,000 د.ع',
    created_at: '2026-02-16',
    chapters: [
      { id: 'ch-ar1', chapter_number: 1, title: 'بەشێ ١: القواعد - أسلوب الاستثناء', description: 'شیکارا ئیستسناء ب إلا، غير و سوى' },
      { id: 'ch-ar2', chapter_number: 2, title: 'بەشێ ٢: القواعد - أسلوب التعجب والنداء', description: 'یاسایێن تەعەجب و نیداء' },
      { id: 'ch-ar3', chapter_number: 3, title: 'بەشێ ٣: القواعد - أسلوب الشرط', description: 'ئامرازێن شەرتێ جازم و نەجازم' },
      { id: 'ch-ar4', chapter_number: 4, title: 'بەشێ ٤: النصوص والأدب', description: 'شیکارکرنا دەقێن ئەدەبی' },
      { id: 'ch-ar5', chapter_number: 5, title: 'بەشێ ٥: البلاغة والتعبير وأسئلة الوزاري', description: 'مەجاز و حل أسئلة الامتحانات الوزارية' },
    ],
    lessons: [
      {
        id: 'larab-1',
        chapter_number: 1,
        chapter_title: 'بەشێ ١: القواعد - أسلوب الاستثناء',
        title: 'الدرس الأول: أسلوب الاستثناء وأدواته د عەرەبییا پۆلا ١٢ دا',
        duration: '15:10',
        video_url: 'https://www.youtube.com/embed/LXb3EKWsInQ?autoplay=1&rel=0&modestbranding=1',
        description: 'شیکارکرنا شێوازێ ئیستسناء د عەرەبییا پۆلا ١٢ دا ب شیکارا بادینی.',
        is_free_preview: true
      }
    ]
  }
];

export const INITIAL_USER_PROFILE: UserProfile = {
  uid: 'user-alpha-101',
  email: 'student.badini@gmail.com',
  full_name: 'قوتابیێ هێژا',
  avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
  subscription_active: false,
  subscription_expiry: 0,
  subscription_plan_id: undefined,
  created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  completed_lessons: [],
  bookmarked_lessons: [],
  quiz_scores: {},
  purchased_courses: []
};
