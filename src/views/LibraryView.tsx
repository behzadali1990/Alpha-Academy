import React, { useState, useRef } from 'react';
import { 
  Search, 
  Lock, 
  GraduationCap, 
  BookOpen, 
  ShoppingCart, 
  CheckCircle2, 
  X, 
  Check, 
  CreditCard, 
  Layers,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Calculator,
  FlaskConical,
  Zap,
  Dna,
  Languages,
  BookMarked
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Course, CategoryType } from '../types';
import { FIBPaymentModal } from '../components/FIBPaymentModal';

export const LibraryView: React.FC = () => {
  const {
    courses,
    setSelectedCourse,
    setSelectedLesson,
    setActiveTab,
    hasAccessToLesson,
    hasAccessToCourse,
    purchaseSingleCourse,
    t,
    language
  } = useAuth();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');
  const [buyingCourse, setBuyingCourse] = useState<Course | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string>('07504260155');
  const [isProcessingBuy, setIsProcessingBuy] = useState(false);
  const [buySuccess, setBuySuccess] = useState(false);

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

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoriesScrollRef.current) {
      const scrollAmount = direction === 'left' ? -220 : 220;
      const adjustedAmount = isRtl ? -scrollAmount : scrollAmount;
      categoriesScrollRef.current.scrollBy({ left: adjustedAmount, behavior: 'smooth' });
    }
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor_title.toLowerCase().includes(searchQuery.toLowerCase());

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

  const handleConfirmBuy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyingCourse) return;
    setIsProcessingBuy(true);
    setTimeout(() => {
      purchaseSingleCourse(buyingCourse.id);
      setIsProcessingBuy(false);
      setBuySuccess(true);
      setTimeout(() => {
        setBuyingCourse(null);
        setBuySuccess(false);
      }, 1500);
    }, 600);
  };

  return (
    <div className={`space-y-6 pb-12 ${isRtl ? 'dir-rtl' : 'dir-ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Title & Search Header */}
      <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm space-y-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-sky-100 text-[#2B7FE0] px-3 py-1 rounded-full text-xs font-bold mb-2">
            <GraduationCap className="w-4 h-4" />
            <span>{t('grade12')}</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800">
            {t('libraryTitle')} (هەمی مامۆستا و کۆرس)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            دشێی هەمی بەشێن کۆرسان ببینی یان هەر ئێک بابەت ب جودا بکڕی ب رێکا دوگمەیا (کۆرسی بکڕە).
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className={`w-full ${isRtl ? 'pl-4 pr-11' : 'pr-4 pl-11'} py-3 rounded-2xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#2B7FE0] bg-slate-50/50`}
          />
          <Search className={`w-5 h-5 text-slate-400 absolute top-3.5 ${isRtl ? 'right-4' : 'left-4'} pointer-events-none`} />
        </div>

        {/* Category Filter Roller */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#2B7FE0]" />
              <span>بابەتێن پۆلا ١٢:</span>
            </div>

            {/* Roller Scroll Buttons */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => scrollCategories('left')}
                aria-label="Scroll categories left"
                className="w-6 h-6 rounded-full bg-slate-100 hover:bg-sky-100 text-slate-600 hover:text-[#2B7FE0] flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => scrollCategories('right')}
                aria-label="Scroll categories right"
                className="w-6 h-6 rounded-full bg-slate-100 hover:bg-sky-100 text-slate-600 hover:text-[#2B7FE0] flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div 
            ref={categoriesScrollRef}
            className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar scroll-smooth snap-x snap-mandatory touch-pan-x select-none text-xs font-semibold"
          >
            {categories.map((cat) => {
              const IconComp = cat.icon;
              const isActive = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2.5 rounded-2xl shrink-0 transition-all cursor-pointer flex items-center gap-2 snap-start border ${
                    isActive
                      ? 'bg-[#2B7FE0] text-white font-bold border-[#2B7FE0] shadow-sm shadow-sky-500/20 scale-[1.02]'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200/80 shadow-2xs hover:border-sky-200'
                  }`}
                >
                  <IconComp className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#2B7FE0]'}`} />
                  <span className="whitespace-nowrap">{t(cat.key)}</span>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Course Grid */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCourses.map((course) => {
            const isAccessUnlocked = hasAccessToCourse(course.id);

            return (
              <div
                key={course.id}
                onClick={() => handleOpenCourse(course)}
                className="bg-white rounded-3xl overflow-hidden border border-sky-100 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  {/* Thumbnail */}
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Grade Level Badge */}
                    <div className="absolute top-3 right-3 bg-[#2B7FE0] text-white text-[11px] font-extrabold px-3 py-1 rounded-full shadow-sm">
                      {course.grade_kurdish || 'پۆلا 12'}
                    </div>

                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md text-[#1E5BB0] text-[10px] font-bold px-2.5 py-1 rounded-full border border-sky-200">
                      {course.category_name_kurdish?.replace(/\s*\(\s*ئحیا\s*\)/gi, '').replace(/\s*\(\s*ئحيا\s*\)/gi, '').replace(/\s*\(\s*احياء\s*\)/gi, '').replace(/\s*\(\s*احيا\s*\)/gi, '')}
                    </div>

                    {!isAccessUnlocked && (
                      <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-md text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-400/40 flex items-center gap-1">
                        <Lock className="w-3 h-3 text-amber-400" />
                        <span>{course.formatted_price || '25,000 د.ع'}</span>
                      </div>
                    )}
                  </div>

                  {/* Info Body */}
                  <div className="p-5 space-y-2">
                    <h3 className="font-bold text-slate-800 text-sm sm:text-base leading-snug group-hover:text-[#2B7FE0] transition-colors line-clamp-2">
                      {course.title}
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>

                    {/* Course Sections Indicator */}
                    <div className="pt-2 flex items-center justify-between text-[11px] font-bold text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="flex items-center gap-1 text-[#2B7FE0]">
                        <Layers className="w-3.5 h-3.5" />
                        <span>٥ بەشێن سەرەکی یێن کۆرسی</span>
                      </span>
                      <span className="text-slate-400 font-semibold">
                        {course.lessons.length} وانە
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer with Instructor and '(کۆرسی بکڕە)' Action */}
                <div className="p-5 pt-0 border-t border-slate-100 mt-2 space-y-3">
                  <div className="flex items-center justify-between pt-3">
                    <div className="flex items-center gap-2">
                      <img
                        src={course.instructor_avatar}
                        alt={course.instructor_name}
                        className="w-8 h-8 rounded-full object-cover border border-sky-200 shrink-0"
                      />
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-slate-700 leading-tight">
                          {course.instructor_name}
                        </span>
                        <span className="text-[10px] text-sky-600 font-medium leading-tight">
                          {course.instructor_title}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-bold block">بهایێ کۆرسی</span>
                      <span className="text-xs font-black text-slate-800">
                        {course.formatted_price || '60,000 د.ع'}
                      </span>
                    </div>
                  </div>

                  {/* Single Course Purchase Action Button */}
                  <div className="pt-1">
                    {isAccessUnlocked ? (
                      <div className="w-full bg-emerald-50 text-emerald-700 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 border border-emerald-200">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>کۆرس هاتیە کڕین (ڤەکرییە)</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setBuyingCourse(course);
                        }}
                        className="w-full bg-[#00897B] hover:bg-[#00796B] text-white font-extrabold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer hover:shadow-md active:scale-98"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>کڕینا کۆرسی ب FIB ({course.formatted_price || '60,000 د.ع'})</span>
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-10 text-center border border-sky-100 space-y-3">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">{t('noBookmarks')}</h3>
        </div>
      )}

      {/* BUY SINGLE COURSE MODAL FROM LIBRARY (FIB Payment Gateway) */}
      {buyingCourse && (
        <FIBPaymentModal
          itemType="course"
          course={buyingCourse}
          onClose={() => setBuyingCourse(null)}
          onSuccess={() => setBuyingCourse(null)}
        />
      )}

    </div>
  );
};
