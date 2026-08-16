export type Language = 'ku' | 'en' | 'ar';

export const TRANSLATIONS = {
  // Language Names
  lang_ku: { ku: 'کوردی بادینی', en: 'Kurdish Badini', ar: 'الكردية البادينية' },
  lang_en: { ku: 'English', en: 'English', ar: 'الإنجليزية' },
  lang_ar: { ku: 'العربية', en: 'Arabic', ar: 'العربية' },

  // App & Header
  appName: { ku: 'ئەکادیمیا ئەلفا', en: 'Alpha Academy', ar: 'أكاديمية ألفا' },
  appSubtitle: { ku: 'ئەکادیمیا ئەلفا تایبەت ب پۆلا ١٢ زانستی ب بادینی', en: 'Alpha Academy for 12th Grade Scientific in Badini', ar: 'أكاديمية ألفا المخصصة للصف 12 العلمي بالبادينية' },
  mobileView: { ku: 'دیمەنێ موبایلێ', en: 'Mobile View', ar: 'عرض الهاتف' },
  fullView: { ku: 'دیمەنێ تەواو', en: 'Full Screen', ar: 'عرض كامل' },
  editStudio: { ku: 'دەستکاریکرن', en: 'Admin Studio', ar: 'استوديو الإدارة' },
  activeSub: { ku: 'بەشداربوونا چالاک:', en: 'Active Subscription:', ar: 'الاشتراك الفعّال:' },
  activateSub: { ku: 'چالاکرنا بەشداربوونێ', en: 'Activate Subscription', ar: 'تفعيل الاشتراك' },
  skip: { ku: 'دەربازبوون', en: 'Skip', ar: 'تخطي' },
  language: { ku: 'زمان', en: 'Language', ar: 'اللغة' },

  // Bottom Navigation
  navHome: { ku: 'سەرەکی', en: 'Home', ar: 'الرئيسية' },
  navLibrary: { ku: 'وانە', en: 'Courses', ar: 'الدروس' },
  navPlans: { ku: 'بەشداربوون', en: 'Plans', ar: 'الاشتراكات' },
  navAiTutor: { ku: 'مۆدێل', en: 'AI Tutor', ar: 'المعلم الذكي' },
  navProfile: { ku: 'پرۆفایل', en: 'Profile', ar: 'الملف الشخصي' },

  // Home View
  welcome: { ku: 'بخێرهاتی،', en: 'Welcome,', ar: 'أهلاً بك،' },
  headline: { ku: 'بخێربهێن بۆ ئەکادیمیا ئەلفا', en: 'Welcome to Alpha Academy', ar: 'مرحباً بكم في أكاديمية ألفا' },
  subheadline: { ku: 'پلاتفۆرما ئەلفا تایبەتە ب بەرنامەیێ خاندنا پۆلا 12 ب زاراڤێ بادینی', en: 'Alpha Platform is specialized in 12th grade curriculum in Badini dialect', ar: 'منصة ألفا مخصصة لمنهاج الصف 12 بلهجة باديني' },
  selectGrade: { ku: 'پۆلا خویندنێ هەڵبژێرە:', en: 'Select Grade:', ar: 'اختر المرحلة الدراسية:' },
  gradeAll: { ku: 'هەمی پۆل', en: 'All Grades', ar: 'جميع المراحل' },
  grade12: { ku: 'پۆلا ١٢', en: 'Grade 12', ar: 'الصف ١٢' },
  grade11: { ku: 'پۆلا ١١', en: 'Grade 11', ar: 'الصف ١١' },
  grade10: { ku: 'پۆلا ١٠', en: 'Grade 10', ar: 'الصف ١٠' },
  searchPlaceholder: { ku: 'ل کۆرس یان بابەتی بگەرە', en: 'Search courses or subjects...', ar: 'ابحث عن الكورسات أو المواد...' },
  featuredCourses: { ku: 'مامۆستایێن مە', en: 'Our Teachers', ar: 'مدرسونا المتميزون' },
  ourTeachers: { ku: 'مامۆستایێن مە', en: 'Our Teachers', ar: 'مدرسونا' },
  viewCourse: { ku: 'وانەیێن مامۆستایی', en: 'Teacher Lessons', ar: 'دروس المدرس' },
  viewTeacherLessons: { ku: 'سەحکرنا وانەیان', en: 'View Lessons', ar: 'مشاهدة الدروس' },
  lessons: { ku: 'وانە', en: 'Lessons', ar: 'دروس' },
  freePreview: { ku: 'بێ بەرامبەر', en: 'Free Preview', ar: 'مجاني' },
  vipOnly: { ku: 'تایبەت ب بەشداربووان', en: 'VIP Only', ar: 'خاص بالمشتركين' },
  aiCardTitle: { ku: 'مامۆستایێ ژیر (AI Tutor)', en: 'Smart AI Tutor', ar: 'المعلم الذكي (AI Tutor)' },
  aiCardSub: { ku: 'پرسیاڕەکێ بپرسه ل سەر هەر وانەیەکێ، ئێکسەر وەڵامێ وەربگره!', en: 'Ask any question about any lesson and get instant answers!', ar: 'اطرح أي سؤال حول أي درس واحصل على إجابة فورية!' },
  askAiButton: { ku: 'ئاخڤتن دگەل مۆدێلی', en: 'Chat with AI Tutor', ar: 'تحدث مع المعلم الذكي' },
  allSubjects: { ku: 'هەمی بابەت', en: 'All Subjects', ar: 'جميع المواد' },

  // Library View
  libraryTitle: { ku: 'مەکتەبا وانەیا تە', en: 'Your Courses Library', ar: 'مكتبة دروسك' },
  bookmarkedTab: { ku: 'وانەیێن پاشەکەوتکری', en: 'Bookmarked Lessons', ar: 'الدروس المحفوظة' },
  completedTab: { ku: 'وانەیێن تەمامبووی', en: 'Completed Lessons', ar: 'الدروس المكتملة' },
  allCoursesTab: { ku: 'هەمی کۆرس', en: 'All Courses', ar: 'جميع الكورسات' },
  noBookmarks: { ku: 'هیچ وانەیەک تە پاشەکەوت نەکریە.', en: 'No bookmarked lessons yet.', ar: 'لم تقم بحفظ أي درس بعد.' },
  noCompleted: { ku: 'هیچ وانەیەک تە بەحسا تەمامکرنێ نەکریە.', en: 'No completed lessons yet.', ar: 'لم تكمل أي درس بعد.' },
  watchNow: { ku: 'سەحکێ نوکە', en: 'Watch Now', ar: 'شاهد الآن' },
  coursePrice: { ku: 'بهایێ کۆرسی', en: 'Course Price', ar: 'سعر الكورس' },
  buyCourseWithFIB: { ku: 'کڕینا کۆرسی ب FIB', en: 'Buy Course with FIB', ar: 'شراء الكورس عبر FIB' },
  coursePurchased: { ku: 'کۆرس هاتیە کڕین (ڤەکرییە)', en: 'Course Purchased (Unlocked)', ar: 'تم شراء الكورس (مفتوح)' },

  // Plans View
  plansTitle: { ku: 'پلانێن بەشداربوونێ د ئەکادیمیایا ئەلفا دا', en: 'Alpha Academy Subscription Plans', ar: 'باقات الاشتراك في أكاديمية ألفا' },
  plansSubtitle: { ku: 'پلانا گونجای بۆ خو هەڵبژێرە بۆ دەستپێگەهشتنا تەواو ب هەمی کۆرس و وانەیان', en: 'Choose your preferred plan for complete access to all courses and lessons', ar: 'اختر الباقة المناسبة لك للوصول الكامل لجميع الكورسات والدروس' },
  activateNow: { ku: 'چالاکرنا بەشداربوونێ نوکە', en: 'Activate Subscription Now', ar: 'تفعيل الاشتراك الآن' },
  activeUntil: { ku: 'بەشداربوونا تە چالاکە تا:', en: 'Subscription active until:', ar: 'اشتراكك فعّال حتى:' },
  extendPlan: { ku: 'درێژکرنا ماوێ بەشداربوونێ', en: 'Extend Subscription', ar: 'تمديد فترة الاشتراك' },
  paymentMethods: { ku: 'ڕێکێن پارەدانێ:', en: 'Payment Methods:', ar: 'طرق الدفع:' },
  popularTag: { ku: 'پڕبکارهاتووترین', en: 'Most Popular', ar: 'الأكثر شعبية' },
  monthlyPlanName: { ku: 'پلانا هەیڤانە (Monthly)', en: 'Monthly Plan (1 Month)', ar: 'الباقة الشهرية (شهر واحد)' },
  quarterlyPlanName: { ku: 'پلانا شەش هەیڤانە (6 Months)', en: 'Semi-Annual Plan (6 Months)', ar: 'باقة 6 أشهر' },
  yearlyPlanName: { ku: 'پلانا ساڵانە (Yearly)', en: 'Annual Plan (Yearly)', ar: 'الباقة السنوية' },
  choosePlan: { ku: 'هەڵبژارتنا پلانێ', en: 'Select Plan', ar: 'اختيار الباقة' },
  payWithFIB: { ku: 'پارەدان ب ڕێکا FIB', en: 'Pay via FIB', ar: 'الدفع عبر FIB' },

  // Course Detail & Lesson Player
  backToHome: { ku: 'زڤڕین', en: 'Back', ar: 'رجوع' },
  instructor: { ku: 'مامۆستا:', en: 'Instructor:', ar: 'المدرس:' },
  totalLessons: { ku: 'کۆمبوونا وانەیان:', en: 'Total Lessons:', ar: 'مجموع الدروس:' },
  startWatching: { ku: 'دەستپێکرنا سەحکرنێ', en: 'Start Watching', ar: 'بدء المشاهدة' },
  lockNotice: { ku: 'ئەڤ وانەیە قوفڵکریە. ژ بۆ دیتنێ پێویستیا تە ب کڕینا کۆرسی هەیە.', en: 'This lesson is locked. Purchase this course to unlock all lessons.', ar: 'هذا الدرس مقفل. يرجى شراء الكورس لمشاهدة جميع الدروس.' },
  quizButton: { ku: 'تاقیکرنا کورت', en: 'Short Quiz', ar: 'اختبار قصير' },
  startLesson: { ku: 'دەستپێکرنا وانەیێ', en: 'Start Lesson', ar: 'بدء الدرس' },
  nextLesson: { ku: 'وانەیا پاشتر', en: 'Next Lesson', ar: 'الدرس التالي' },
  previousLesson: { ku: 'وانەیا پێشتر', en: 'Previous Lesson', ar: 'الدرس السابق' },
  complete: { ku: 'تەواوکرن', en: 'Mark Completed', ar: 'إكمال الدرس' },
  completed: { ku: 'تەواوبوو', en: 'Completed', ar: 'تم الإكمال' },
  interactiveQuiz: { ku: 'تاقیکرن', en: 'Interactive Quiz', ar: 'اختبار تفاعلي' },
  lessonNotes: { ku: 'تێبینیێن وانەیێ', en: 'Lesson Notes', ar: 'ملاحظات الدرس' },
  description: { ku: 'ڕوونکرنا وانەیێ', en: 'Lesson Overview', ar: 'تفاصيل الدرس' },
  protectedStream: { ku: 'ڤیدیۆیا پاراستی', en: 'Protected Video Stream', ar: 'بث فيديو محمي' },
  buySingleCourseNotice: { ku: 'تە دڤێت بتنێ ڤی بابەتی و هەمی ٥ بەشێن وی بکڕی؟ ب بێ بەشداربوونا تەمام دشێی ئێک بابەت ب جودا بکڕی.', en: 'Want to buy only this subject and all its 5 chapters? You can buy this single course separately.', ar: 'هل تريد شراء هذه المادة فقط بجميع فصولها الخمسة؟ يمكنك شراء كورس فردي بشكل منفصل.' },
  subjectPrice: { ku: 'بهایێ بابەتی', en: 'Subject Price', ar: 'سعر المادة' },
  buyCourseBtn: { ku: 'کڕینا کۆرسی ب FIB', en: 'Buy Course with FIB', ar: 'شراء الكورس بـ FIB' },
  addLessonBtn: { ku: '+ زێدەکرنا وانەیێ', en: '+ Add Lesson', ar: '+ إضافة درس' },
  fiveChaptersLabel: { ku: '٥ بەشێن سەرەکی یێن بابەتی', en: '5 Core Subject Chapters', ar: '٥ فصول رئيسية للمادة' },

  // Profile View
  profileTitle: { ku: 'پڕۆفایلێ من', en: 'My Profile', ar: 'ملفي الشخصي' },
  languageSetting: { ku: 'زمانێ ئەپلیکەیشنێ', en: 'App Language', ar: 'لغة التطبيق' },
  changeLanguage: { ku: 'گوهۆرینا زمانێ ئەپلیکەیشنێ', en: 'Change App Language', ar: 'تغيير لغة التطبيق' },
  studentName: { ku: 'ناڤێ قوتابی', en: 'Student Name', ar: 'اسم الطالب' },
  emailLabel: { ku: 'ئیمەیل', en: 'Email', ar: 'البريد الإلكتروني' },
  subStatus: { ku: 'بارودۆخێ بەشداربوونێ', en: 'Subscription Status', ar: 'حالة الاشتراك' },
  statusActive: { ku: 'چالاکە', en: 'Active', ar: 'فعّال' },
  statusExpired: { ku: 'بەسەرچوویە / نەچالاکە', en: 'Expired / Inactive', ar: 'منتهي / غير فعّال' },
  statsTitle: { ku: 'ئامارێن خویندنێ', en: 'Learning Stats', ar: 'إحصائيات التعلم' },
  completedCount: { ku: 'وانەیێن تەمامبووی', en: 'Completed Lessons', ar: 'الدروس المكتملة' },
  bookmarkedCount: { ku: 'وانەیێن پاشەکەوتکری', en: 'Bookmarked Lessons', ar: 'الدروس المحفوظة' },
  quizScores: { ku: 'نمرەیێن تاقیکرنان', en: 'Quiz Scores', ar: 'نتائج الاختبارات' },
  logout: { ku: 'چوونا ژ دەرڤە', en: 'Log Out', ar: 'تسجيل الخروج' },
  editProfile: { ku: 'دەستکاریکرنا پڕۆفایلی', en: 'Edit Profile', ar: 'تعديل الملف الشخصي' },

  // Quiz & AI Tutor Widgets
  testYourself: { ku: 'تاقیکرنا ئاستێ تێگەهشتنێ', en: 'Test Your Comprehension', ar: 'اختبر فهمك للدرس' },
  checkAnswer: { ku: 'پشکنینا وەڵامی', en: 'Check Answer', ar: 'التحقق من الإجابة' },
  nextQuestion: { ku: 'پرسیارا پاشتر', en: 'Next Question', ar: 'السؤال التالي' },
  quizFinished: { ku: 'تاقیکرن تەمام بوو', en: 'Quiz Completed', ar: 'اكتمل الاختبار' },
  tryAgain: { ku: 'دووبارەکرنا تاقیکرنێ', en: 'Try Again', ar: 'إعادة المحاولة' },
  quizTitle: { ku: 'تاقیکرنا تێگەهشتنێ', en: 'Comprehension Quiz', ar: 'اختبار الفهم' },
  quizScore: { ku: 'نمرەیا تە:', en: 'Your Score:', ar: 'درجتك:' },
  retryQuiz: { ku: 'دووبارەکرنا تاقیکرنێ', en: 'Retry Quiz', ar: 'إعادة الاختبار' },
  aiTutorTitle: { ku: 'مامۆستایێ ژیر (AI Tutor)', en: 'AI Tutor Assistant', ar: 'المعلم الذكي (AI Tutor)' },
  aiTutorPlaceholder: { ku: 'پرسیارا خو ل سەر ڤێ وانەیێ بنڤێسه...', en: 'Ask any question regarding this lesson...', ar: 'اكتب سؤالك حول هذا الدرس...' },
  askAnything: { ku: 'پرسیارا خو بنڤێسه ل سەر ڤێ وانەیێ...', en: 'Ask a question about this lesson...', ar: 'اطرح سؤالاً حول هذا الدرس...' },
  send: { ku: 'هنارتن', en: 'Send', ar: 'إرسال' },

  // Language Modal & Login
  langModalTitle: { ku: 'زمان', en: 'Language', ar: 'اللغة' },
  apply: { ku: 'جێبەجێکرن', en: 'Apply', ar: 'تطبيق' },
  cancel: { ku: 'پاشگەزبوون', en: 'Cancel', ar: 'إلغاء' },
  loginTitle: { ku: 'چوونا ژوور', en: 'Sign In', ar: 'تسجيل الدخول' },
  registerTitle: { ku: 'دروستکرنا هەژمارێ', en: 'Create Account', ar: 'إنشاء حساب جديد' },
  forgotPasswordTitle: { ku: 'ژبیرکرنا پەیڤا نهێنی', en: 'Forgot Password', ar: 'نسيت كلمة المرور' },
  loginBtn: { ku: 'چوونا ژوور', en: 'Sign In', ar: 'تسجيل الدخول' },
  registerBtn: { ku: 'خۆتۆمارکرن', en: 'Register', ar: 'إنشاء الحساب' },
  haveAccount: { ku: 'هەژمارا تە یا هەی؟', en: 'Already have an account?', ar: 'هل لديك حساب بالفعل؟' },
  noAccount: { ku: 'هەژمارا تە نینە؟', en: "Don't have an account?", ar: 'ليس لديك حساب؟' },
  createAccount: { ku: 'دروستکرنا هەژمارا نوو', en: 'Create New Account', ar: 'إنشاء حساب جديد' },
  fullNamePlaceholder: { ku: 'ناڤێ سێ قۆڵی', en: 'Full Name', ar: 'الاسم الثلاثي' },
  phonePlaceholder: { ku: 'ژمارا مۆبایلێ (واتسئەپ)', en: 'Phone Number', ar: 'رقم الهاتف' },
  emailPlaceholder: { ku: 'ئیمەیل (ئارەزوومەندانە)', en: 'Email address', ar: 'البريد الإلكتروني' },
  passwordPlaceholder: { ku: 'پەیڤا نهێنی', en: 'Password', ar: 'كلمة المرور' },
  cityLabel: { ku: 'باژێر', en: 'City', ar: 'المدينة' },
  birthdateLabel: { ku: 'ژدایکبوون', en: 'Birthdate', ar: 'تاريخ الميلاد' },

  // Categories
  cat_all: { ku: 'هەمی بابەت', en: 'All Subjects', ar: 'جميع المواد' },
  cat_birkayi: { ku: 'بیرکاری', en: 'Mathematics', ar: 'الرياضيات' },
  cat_kimiya: { ku: 'کیمیا', en: 'Chemistry', ar: 'الكيمياء' },
  cat_fizya: { ku: 'فیزیا', en: 'Physics', ar: 'الفيزياء' },
  cat_zindewarzani: { ku: 'زیندەوەرزانی', en: 'Biology', ar: 'علم الأحياء' },
  cat_english: { ku: 'ئینگلیزی', en: 'English', ar: 'اللغة الإنجليزية' },
  cat_kurdi: { ku: 'کوردی', en: 'Kurdish', ar: 'اللغة الكردية' },
  cat_arabi: { ku: 'عەرەبی', en: 'Arabic', ar: 'اللغة العربية' },
  cat_zanist: { ku: 'کیمیا و فیزیا', en: 'Science', ar: 'العلوم' },
  cat_rezman: { ku: 'ڕێزمان', en: 'Grammar', ar: 'القواعد' }
};

export const getTranslation = (key: keyof typeof TRANSLATIONS, lang: Language = 'ku'): string => {
  const item = TRANSLATIONS[key];
  if (!item) return String(key);
  return (item as any)[lang] || item['ku'] || String(key);
};
