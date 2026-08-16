import React, { useState, useRef, useMemo } from 'react';
import { 
  BookOpen, 
  ShieldCheck, 
  Lock, 
  ChevronRight, 
  ChevronLeft, 
  GraduationCap, 
  Star, 
  Search, 
  Sparkles,
  Calculator,
  FlaskConical,
  Zap,
  Dna,
  Languages,
  BookMarked,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Course, CategoryType } from '../types';

export const HomeView: React.FC = () => {
  const {
    user,
    courses,
    setActiveTab,
    setSelectedCourse,
    setSelectedLesson,
    isExpired,
    timeRemainingFormatted,
    t,
    language
  } = useAuth();

  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const teachersScrollRef = useRef<HTMLDivElement>(null);
  const categoriesScrollRef = useRef<HTMLDivElement>(null);

  const isRtl = language !== 'en';

  const categories = [
    { id: 'all' as CategoryType, key: 'cat_all' as const, icon: Sparkles },
    { id: 'birkayi' as CategoryType, key: 'cat_birkayi' as const, icon: Calculator },
    { id: 'kimiya' as CategoryType, key: 'cat_kimiya' as const, icon: FlaskConical },
    { id: 'fizya' as CategoryType, key: 'cat_fizya' as const, icon: Zap },
    { id: 'zindewarzani' as CategoryType, key: 'cat_zindewarzani' as const, icon: Dna },
    { id: 'english' as CategoryType, key: 'cat_english' as const, icon: Languages },
    { id: 'kurdi' as CategoryType, key: 'cat_kurdi' as const, icon: BookOpen },
    { id: 'arabi' as CategoryType, key: 'cat_arabi' as const, icon: BookMarked },
  ];

  // Distinct list of teachers across courses
  const uniqueTeachers = useMemo(() => {
    const map = new Map<string, Course>();
    for (const c of courses) {
      const key = c.instructor_name?.trim() || c.id;
      if (!map.has(key)) {
        map.set(key, c);
      }
    }
    return Array.from(map.values());
  }, [courses]);

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    if (!matchesCategory) {
      if (selectedCategory === 'kimiya' && (course.category === 'zanist' || course.title.includes('کیمیا'))) matchesCategory = true;
      if (selectedCategory === 'fizya' && (course.category === 'zanist' || course.title.includes('فیزیا'))) matchesCategory = true;
      if (selectedCategory === 'kurdi' && (course.category === 'rezman' || course.title.includes('کوردی'))) matchesCategory = true;
    }
    return matchesSearch && matchesCategory;
  });

  const handleOpenCourse = (course: Course) => {
    setSelectedCourse(course);
    if (course.lessons.length > 0) {
      setSelectedLesson(course.lessons[0]);
    }
    setActiveTab('course_detail');
  };

  const scrollContainer = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -220 : 220;
      // Flip for RTL when using standard scrollBy
      const adjustedAmount = isRtl ? -scrollAmount : scrollAmount;
      ref.current.scrollBy({ left: adjustedAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className={`space-y-6 pb-12 ${isRtl ? 'dir-rtl' : 'dir-ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Search Input Bar */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="w-full bg-white text-slate-800 placeholder-slate-400 text-xs sm:text-sm font-semibold px-4 py-3.5 pr-10 rounded-2xl border border-sky-100 shadow-2xs focus:outline-none focus:border-[#2B7FE0] transition-all"
        />
        <Search className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 right-3.5" />
      </div>

      {/* Banner / Hero Section */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-sky-600 via-[#1E5BB0] to-[#2B7FE0] text-white p-6 shadow-md">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1.5 text-center sm:text-right">
            <span className="inline-block bg-white/20 text-white text-[10px] font-extrabold px-3 py-1 rounded-full backdrop-blur-md">
              ئەکادیمیایا ئەلفا • پۆلا 12
            </span>
            <h2 className="text-xl sm:text-2xl font-black leading-tight">
              حەفت بابەت ب ئێک بەشداربوون!
            </h2>
            <p className="text-xs text-sky-100 font-medium">
              هەمی وانێن پولا ١٢ ب شێوازەکی نوی و هەڤچەرخ
            </p>
          </div>
        </div>
      </div>

      {/* Category / Subjects Roller (بابەتان وەکی رولەرێ) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <Layers className="w-3.5 h-3.5 text-[#2B7FE0]" />
            <span>بابەتێن پۆلا ١٢ (Subjects)</span>
          </div>

          {/* Quick Roller Controls for mobile & desktop */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => scrollContainer(categoriesScrollRef, 'left')}
              aria-label="Scroll left"
              className="w-6 h-6 rounded-full bg-slate-100 hover:bg-sky-100 text-slate-600 hover:text-[#2B7FE0] flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => scrollContainer(categoriesScrollRef, 'right')}
              aria-label="Scroll right"
              className="w-6 h-6 rounded-full bg-slate-100 hover:bg-sky-100 text-slate-600 hover:text-[#2B7FE0] flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Categories Smooth Roller Container */}
        <div 
          ref={categoriesScrollRef}
          className="flex items-center gap-2 overflow-x-auto pb-2 pt-0.5 px-0.5 no-scrollbar scroll-smooth snap-x snap-mandatory touch-pan-x select-none"
        >
          {categories.map((cat) => {
            const IconComponent = cat.icon;
            const isActive = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2.5 rounded-2xl shrink-0 transition-all font-bold text-xs sm:text-sm flex items-center gap-2 snap-start cursor-pointer border ${
                  isActive
                    ? 'bg-[#2B7FE0] text-white border-[#2B7FE0] shadow-sm shadow-sky-500/25 scale-[1.02]'
                    : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200/80 shadow-2xs hover:border-sky-200'
                }`}
              >
                <IconComponent className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#2B7FE0]'}`} />
                <span className="whitespace-nowrap">{t(cat.key)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Our Teachers Section (مامۆستایێن ئەکادیمیایێ - Roller with Bigger Mobile Profiles & Full Names) */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-sky-100 text-[#2B7FE0] flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-800">
                مامۆستایێن ئەکادیمیایێ
              </h3>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                ژ چەپێ بۆ ڕاستێ ڕابکێشە بۆ دیتنا هەمی مامۆستایان
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#2B7FE0] bg-sky-50 border border-sky-100 px-2.5 py-0.5 rounded-full font-bold">
              {uniqueTeachers.length} مامۆستا
            </span>

            {/* Roller Scroll Arrow Buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => scrollContainer(teachersScrollRef, 'left')}
                aria-label="Scroll teachers left"
                className="w-7 h-7 rounded-full bg-white border border-slate-200 hover:bg-sky-50 hover:border-sky-300 text-slate-600 hover:text-[#2B7FE0] flex items-center justify-center transition-all shadow-2xs cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollContainer(teachersScrollRef, 'right')}
                aria-label="Scroll teachers right"
                className="w-7 h-7 rounded-full bg-white border border-slate-200 hover:bg-sky-50 hover:border-sky-300 text-slate-600 hover:text-[#2B7FE0] flex items-center justify-center transition-all shadow-2xs cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Touch-friendly Horizontal Teacher Roller with Large Profiles & Full Legible Names */}
        <div 
          ref={teachersScrollRef}
          className="flex items-stretch gap-3 sm:gap-4 overflow-x-auto pb-3 pt-1 px-1 no-scrollbar scroll-smooth snap-x snap-mandatory touch-pan-x select-none"
        >
          {uniqueTeachers.map((c) => (
            <div
              key={c.id}
              onClick={() => handleOpenCourse(c)}
              className="w-[140px] sm:w-[165px] shrink-0 snap-start bg-white rounded-3xl p-3.5 border border-sky-100/90 shadow-2xs hover:shadow-md hover:border-[#2B7FE0] transition-all flex flex-col items-center justify-between text-center cursor-pointer group active:scale-95 relative"
            >
              {/* Prominent, Large Teacher Avatar */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl p-1 bg-gradient-to-tr from-sky-400 via-[#2B7FE0] to-indigo-600 shadow-sm group-hover:scale-105 transition-transform duration-300">
                <img
                  src={c.instructor_avatar}
                  alt={c.instructor_name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-xl border-2 border-white bg-slate-100"
                />
                <div className="absolute -bottom-1 -right-1 bg-sky-500 text-white rounded-full p-0.5 border-2 border-white shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Full Teacher Name - 100% visible, no cutting off */}
              <div className="w-full mt-2.5 space-y-1">
                <h4 className="text-xs sm:text-sm font-black text-slate-800 group-hover:text-[#2B7FE0] transition-colors leading-snug break-words">
                  {c.instructor_name}
                </h4>

                {/* Subject Badge */}
                <div className="inline-block text-[10px] font-bold text-[#2B7FE0] bg-sky-50 border border-sky-100 px-2 py-0.5 rounded-lg w-full truncate">
                  {c.category_name_kurdish?.replace(/\s*\(\s*ئحیا\s*\)/gi, '').replace(/\s*\(\s*ئحيا\s*\)/gi, '').replace(/\s*\(\s*احياء\s*\)/gi, '') || c.instructor_title?.split(' ')[0] || 'پۆلا ١٢'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Courses List Section (کۆرسێن نوێ) */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#2B7FE0]" />
            <span>کۆرسێن نوێ</span>
          </h3>

          <button
            onClick={() => setActiveTab('library')}
            className="text-[11px] text-[#2B7FE0] font-bold flex items-center gap-0.5 hover:underline cursor-pointer"
          >
            <span>دیتنا هەمیان</span>
            <ChevronRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Course Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              onClick={() => handleOpenCourse(course)}
              className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-2xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                {/* Thumbnail Header */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Rating Tag */}
                  <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md text-amber-300 text-[10px] font-extrabold px-2 py-0.5 rounded-lg flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>5.0</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-1.5">
                  <h4 className="font-black text-slate-800 text-sm leading-snug group-hover:text-[#2B7FE0] transition-colors line-clamp-1">
                    {course.title} - {course.instructor_name}
                  </h4>

                  <p className="text-[11px] text-slate-500 font-medium line-clamp-1">
                    {course.instructor_name} • {course.instructor_title}
                  </p>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-4 pb-4 pt-0 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#2B7FE0] font-bold bg-sky-50 px-2.5 py-1 rounded-lg">
                    ٥ بەش • {course.lessons.length} {t('lessons')}
                  </span>

                  <span className="text-slate-800 font-extrabold">
                    {course.formatted_price || '60,000 د.ع'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-50">
                  <span className="text-[#2B7FE0] font-bold">
                    (کۆرسی بکڕە)
                  </span>

                  <span className="text-slate-400 font-bold group-hover:text-[#2B7FE0] flex items-center gap-0.5">
                    <span>سەحکێ</span>
                    <ChevronRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
                  </span>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

