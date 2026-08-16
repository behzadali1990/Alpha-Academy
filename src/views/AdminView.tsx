import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit3, Trash2, Video, FileText, Check, X, RefreshCw, 
  Settings, BookOpen, Layers, DollarSign, ShieldAlert, Sparkles, Image, UserCheck, AlertCircle,
  CreditCard, Building2, Copy, ExternalLink, Phone
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Course, Lesson, GradeLevel, CategoryType, DifficultyLevel, SubscriptionPlan, FIBPaymentSettings } from '../types';

export const AdminView: React.FC = () => {
  const { 
    user,
    setActiveTab,
    courses, 
    plans, 
    fibSettings,
    updateFIBSettings,
    addCourse, 
    updateCourse, 
    deleteCourse, 
    addLessonToCourse, 
    updateLesson, 
    deleteLesson, 
    updatePlan,
    updateCoursePrice,
    resetAllDataToDefaults 
  } = useAuth();

  const [adminTab, setAdminTab] = useState<'courses' | 'teachers' | 'lessons' | 'plans' | 'fib'>('courses');
  
  // FIB Settings Form state
  const [fibForm, setFibForm] = useState<FIBPaymentSettings>({
    account_number: fibSettings?.account_number || '0750 426 0155',
    account_holder: fibSettings?.account_holder || 'ئەکادیمیایا ئەلفا (Alpha Academy)',
    iban: fibSettings?.iban || 'IQ88FIBK0000000000882041',
    notes_kurdish: fibSettings?.notes_kurdish || ''
  });
  const [fibSaveSuccess, setFibSaveSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (fibSettings) {
      setFibForm(fibSettings);
    }
  }, [fibSettings]);

  // Strict Server-Role Authorization Guard
  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-lg mx-auto my-16 p-8 bg-white border border-rose-200 rounded-3xl text-center shadow-xl">
        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-100">
          <ShieldAlert className="w-9 h-9" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">دەستهەڵات نەهاتە دیتن (Access Denied)</h2>
        <p className="text-slate-600 text-sm mb-6 leading-relaxed">
          ئەڤ بەشە بتنێ بۆ بەڕێوەبەرێن باوەڕپێکراوێن ئەکادیمیایێ یە. هەمی کردارێن ئەدمینێ ل سەر سێرڤەری پاراستینە و پێدڤیە ب هەژمارا فەرمی یا Admin بچیە ژوور.
        </p>
        <button
          onClick={() => setActiveTab('explore')}
          className="px-6 py-3 bg-[#2B7FE0] hover:bg-sky-600 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-sky-500/20 cursor-pointer"
        >
          زڤڕین بۆ بەشێ سەرەکی
        </button>
      </div>
    );
  }

  const handleSaveFibSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateFIBSettings(fibForm);
    setFibSaveSuccess(true);
    setTimeout(() => setFibSaveSuccess(false), 3500);
  };
  
  // Teacher Editing Modal state
  const [editingTeacher, setEditingTeacher] = useState<{
    oldName: string;
    name: string;
    title: string;
    avatar: string;
  } | null>(null);

  // Unique teachers computed list
  interface TeacherInfo {
    name: string;
    title: string;
    avatar: string;
    coursesCount: number;
    coursesList: Course[];
  }

  const teacherMap = new Map<string, TeacherInfo>();
  courses.forEach((c) => {
    if (!teacherMap.has(c.instructor_name)) {
      const teacherCourses = courses.filter((x) => x.instructor_name === c.instructor_name);
      teacherMap.set(c.instructor_name, {
        name: c.instructor_name,
        title: c.instructor_title,
        avatar: c.instructor_avatar,
        coursesCount: teacherCourses.length,
        coursesList: teacherCourses,
      });
    }
  });
  const uniqueTeachers: TeacherInfo[] = Array.from(teacherMap.values());

  const handleSaveTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacher) return;

    courses.forEach((c) => {
      if (c.instructor_name === editingTeacher.oldName) {
        updateCourse(c.id, {
          instructor_name: editingTeacher.name,
          instructor_title: editingTeacher.title,
          instructor_avatar: editingTeacher.avatar
        });
      }
    });

    setEditingTeacher(null);
  };
  
  // Course Modal state
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isAddingCourse, setIsAddingCourse] = useState<boolean>(false);
  const [courseForm, setCourseForm] = useState<{
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
    price: number;
    formatted_price: string;
  }>({
    title: '',
    category: 'birkayi',
    category_name_kurdish: 'بیرکاری',
    grade_level: '12',
    grade_kurdish: 'پۆلا ١٢ زانستی',
    description: '',
    thumbnail_url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80',
    difficulty_level: 'ناڤنجی',
    instructor_name: 'م. بهزاد علی',
    instructor_avatar: '/behzad_ali.jpg',
    instructor_title: 'مامۆستایێ تایبەتمەند',
    price: 25000,
    formatted_price: '25,000 د.ع'
  });

  // Lesson Modal State
  const [selectedCourseForLessons, setSelectedCourseForLessons] = useState<Course | null>(courses[0] || null);
  const [isAddingLesson, setIsAddingLesson] = useState<boolean>(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [lessonForm, setLessonForm] = useState<{
    title: string;
    duration: string;
    video_url: string;
    description: string;
    is_free_preview: boolean;
  }>({
    title: '',
    duration: '15:00',
    video_url: 'https://www.youtube.com/embed/LXb3EKWsInQ?autoplay=1&rel=0&modestbranding=1',
    description: '',
    is_free_preview: false
  });

  // Plan Edit State
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [planForm, setPlanForm] = useState<{
    plan_name: string;
    price: number;
    formatted_price: string;
    description: string;
  }>({
    plan_name: '',
    price: 0,
    formatted_price: '',
    description: ''
  });

  // Category mapper helper
  const categoryKurdishNames: { [key in CategoryType]: string } = {
    all: 'هەمی بابەت',
    birkayi: 'بیرکاری',
    kimiya: 'کیمیا',
    fizya: 'فیزیا',
    zindewarzani: 'زیندەوەرزانی',
    english: 'ئینگلیزی',
    kurdi: 'کوردی',
    arabi: 'عەرەبی',
    zanist: 'کیمیا و فیزیا',
    rezman: 'کوردی',
  };

  const gradeKurdishNames: { [key in GradeLevel]: string } = {
    all: 'پۆلا ١٢ زانستی',
    '10': 'پۆلا ١٠ ئامادەیی',
    '11': 'پۆلا ١١ ئامادەیی',
    '12': 'پۆلا ١٢ زانستی'
  };

  // Open course create form
  const handleOpenAddCourse = () => {
    setCourseForm({
      title: '',
      category: 'birkayi',
      category_name_kurdish: 'بیرکاری',
      grade_level: '12',
      grade_kurdish: 'پۆلا ١٢ زانستی',
      description: '',
      thumbnail_url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80',
      difficulty_level: 'ناڤنجی',
      instructor_name: 'م. بهزاد علی',
      instructor_avatar: '/behzad_ali.jpg',
      instructor_title: 'مامۆستایێ پسپۆڕ',
      price: 60000,
      formatted_price: '60,000 د.ع'
    });
    setEditingCourse(null);
    setIsAddingCourse(true);
  };

  // Open course edit form
  const handleOpenEditCourse = (course: Course) => {
    setEditingCourse(course);
    setCourseForm({
      title: course.title,
      category: course.category,
      category_name_kurdish: course.category_name_kurdish,
      grade_level: course.grade_level,
      grade_kurdish: course.grade_kurdish,
      description: course.description,
      thumbnail_url: course.thumbnail_url,
      difficulty_level: course.difficulty_level,
      instructor_name: course.instructor_name,
      instructor_avatar: course.instructor_avatar,
      instructor_title: course.instructor_title,
      price: course.price || 60000,
      formatted_price: course.formatted_price || `${(course.price || 60000).toLocaleString()} د.ع`
    });
    setIsAddingCourse(true);
  };

  // Save Course (Create or Update)
  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseForm.title.trim()) return;

    const formattedPrice = `${Number(courseForm.price || 0).toLocaleString()} د.ع`;

    if (editingCourse) {
      updateCourse(editingCourse.id, {
        ...courseForm,
        price: Number(courseForm.price || 0),
        formatted_price: formattedPrice,
        category_name_kurdish: categoryKurdishNames[courseForm.category],
        grade_kurdish: gradeKurdishNames[courseForm.grade_level]
      });
    } else {
      const newCourse: Course = {
        id: 'course-' + Date.now(),
        ...courseForm,
        price: Number(courseForm.price || 0),
        formatted_price: formattedPrice,
        category_name_kurdish: categoryKurdishNames[courseForm.category],
        grade_kurdish: gradeKurdishNames[courseForm.grade_level],
        lessons: [],
        created_at: new Date().toISOString().split('T')[0]
      };
      addCourse(newCourse);
      setSelectedCourseForLessons(newCourse);
    }
    setIsAddingCourse(false);
    setEditingCourse(null);
  };

  // Open Lesson Create Form
  const handleOpenAddLesson = () => {
    setLessonForm({
      title: '',
      duration: '15:00',
      video_url: 'https://www.youtube.com/embed/LXb3EKWsInQ?autoplay=1&rel=0&modestbranding=1',
      description: '',
      is_free_preview: false,
      pdf_attachment_name: 'فایلا_پوختەیا_وانەیێ.pdf',
      pdf_attachment_url: '#'
    });
    setEditingLesson(null);
    setIsAddingLesson(true);
  };

  // Open Lesson Edit Form
  const handleOpenEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setLessonForm({
      title: lesson.title,
      duration: lesson.duration,
      video_url: lesson.video_url,
      description: lesson.description,
      is_free_preview: lesson.is_free_preview || false
    });
    setIsAddingLesson(true);
  };

  // Save Lesson
  const handleSaveLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseForLessons || !lessonForm.title.trim()) return;

    if (editingLesson) {
      updateLesson(selectedCourseForLessons.id, editingLesson.id, lessonForm);
    } else {
      const newLesson: Lesson = {
        id: 'l-' + Date.now(),
        ...lessonForm
      };
      addLessonToCourse(selectedCourseForLessons.id, newLesson);
    }
    setIsAddingLesson(false);
    setEditingLesson(null);
  };

  // Edit Plan
  const handleOpenEditPlan = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setPlanForm({
      plan_name: plan.plan_name,
      price: plan.price,
      formatted_price: plan.formatted_price,
      description: plan.description
    });
  };

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;
    updatePlan(editingPlan.id, planForm);
    setEditingPlan(null);
  };

  return (
    <div className="space-y-6 dir-rtl pb-16" dir="rtl">
      
      {/* Admin Title Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-[#1E5BB0] rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-sky-200 text-xs font-bold border border-white/10 mb-2">
            <Settings className="w-3.5 h-3.5 animate-spin" />
            <span>ستۆدیۆیا دەستکاریکرن و برێڤەبرنا ئەپێ</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">پانێلا ئەدمین (دەستکاریکرنا ناوەڕۆکێ)</h2>
          <p className="text-xs text-sky-100/80 mt-1 max-w-xl">
            تە هەمی دەسەڵات هەن بۆ زێدەکرنا کۆرسان، دەستکاریکرنا وانەیان، گۆڕینا مامۆستایان، و دەستکاریکرنا نرخێن بەشداربوونێ.
          </p>
        </div>

        <button
          onClick={() => {
            if (confirm('ئایا دپشتڕاستی کو دڤێت هەمی زانیاری بێنە زڤڕاندن بۆ شێوازێ بنەڕەتی؟')) {
              resetAllDataToDefaults();
            }
          }}
          className="bg-white/10 hover:bg-rose-500 text-white border border-white/20 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 self-start md:self-auto shrink-0"
        >
          <RefreshCw className="w-4 h-4" />
          <span>زڤڕاندن بۆ شێوازێ سەرەتایی (Reset)</span>
        </button>
      </div>

      {/* Admin Tab Switcher */}
      <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-sky-100 shadow-2xs overflow-x-auto no-scrollbar">
        <button
          onClick={() => setAdminTab('courses')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all shrink-0 ${
            adminTab === 'courses'
              ? 'bg-[#2B7FE0] text-white shadow-sm'
              : 'text-slate-600 hover:bg-sky-50'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>برێڤەبرنا کۆرسان ({courses.length})</span>
        </button>

        <button
          onClick={() => setAdminTab('teachers')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all shrink-0 ${
            adminTab === 'teachers'
              ? 'bg-[#2B7FE0] text-white shadow-sm'
              : 'text-slate-600 hover:bg-sky-50'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>وێنە و برێڤەبرنا مامۆستایان ({uniqueTeachers.length})</span>
        </button>

        <button
          onClick={() => setAdminTab('lessons')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all shrink-0 ${
            adminTab === 'lessons'
              ? 'bg-[#2B7FE0] text-white shadow-sm'
              : 'text-slate-600 hover:bg-sky-50'
          }`}
        >
          <Video className="w-4 h-4" />
          <span>برێڤەبرنا وانەیان</span>
        </button>

        <button
          onClick={() => setAdminTab('plans')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all shrink-0 ${
            adminTab === 'plans'
              ? 'bg-[#2B7FE0] text-white shadow-sm'
              : 'text-slate-600 hover:bg-sky-50'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>دەستکاریکرنا نرخێن بەشداربوونێ</span>
        </button>

        <button
          onClick={() => setAdminTab('fib')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all shrink-0 ${
            adminTab === 'fib'
              ? 'bg-[#00897B] text-white shadow-sm'
              : 'text-slate-600 hover:bg-teal-50 hover:text-[#00897B]'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>💳 هەژمارا پارەدانا FIB</span>
        </button>
      </div>

      {/* TAB 1: COURSES MANAGEMENT */}
      {adminTab === 'courses' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#2B7FE0]" />
              <span>لیستا هەمی کۆرسێن بەردەست</span>
            </h3>

            <button
              onClick={handleOpenAddCourse}
              className="bg-[#2B7FE0] hover:bg-[#1E5BB0] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-[#2B7FE0]/20 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>زێدەکرنا کۆرسەکێ نوو</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-2xl p-4 border border-sky-100 shadow-2xs flex flex-col justify-between hover:border-sky-300 transition-all"
              >
                <div className="flex gap-3">
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="w-24 h-24 rounded-xl object-cover shrink-0 border border-slate-100"
                  />
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-100 text-[#2B7FE0]">
                        {course.grade_kurdish}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {course.category_name_kurdish}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-800 truncate" title={course.title}>
                      {course.title}
                    </h4>

                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <img
                        src={course.instructor_avatar}
                        alt={course.instructor_name}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <span className="font-semibold text-slate-700 text-[11px]">
                        {course.instructor_name} ({course.instructor_title})
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 line-clamp-1">
                      {course.description}
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-500">
                      وانە: <span className="text-[#2B7FE0]">{course.lessons.length}</span>
                    </span>

                    {/* Price and quick buttons */}
                    <div className="flex items-center gap-1.5 bg-sky-50/80 px-2.5 py-1 rounded-xl border border-sky-100">
                      <span className="text-[11px] font-black text-[#1E5BB0]">
                        {course.formatted_price || `${(course.price || 60000).toLocaleString()} د.ع`}
                      </span>
                      <div className="flex items-center gap-0.5 mr-1">
                        <button
                          type="button"
                          title="کێمکرنا بهایی (-5,000)"
                          onClick={() => updateCoursePrice(course.id, Math.max(0, (course.price || 60000) - 5000))}
                          className="w-5 h-5 rounded-md bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold text-[10px] flex items-center justify-center transition-all cursor-pointer"
                        >
                          -
                        </button>
                        <button
                          type="button"
                          title="زێدەکرنا بهایی (+5,000)"
                          onClick={() => updateCoursePrice(course.id, (course.price || 60000) + 5000)}
                          className="w-5 h-5 rounded-md bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-bold text-[10px] flex items-center justify-center transition-all cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => {
                        setSelectedCourseForLessons(course);
                        setAdminTab('lessons');
                      }}
                      className="px-3 py-1.5 bg-sky-50 text-[#2B7FE0] hover:bg-sky-100 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>وانە</span>
                    </button>

                    <button
                      onClick={() => handleOpenEditCourse(course)}
                      className="px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>دەستکاری</span>
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`ئایا دپشتڕاستی ژ سڕینەوا کۆرسێ "${course.title}"؟`)) {
                          deleteCourse(course.id);
                        }
                      }}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                      title="سڕینەوە"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: LESSONS MANAGEMENT */}
      {adminTab === 'lessons' && (
        <div className="space-y-4">
          {/* Select Course Dropdown */}
          <div className="bg-white p-4 rounded-2xl border border-sky-100 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">کۆرسێ هۆبژارتنی هەڵبژێرە:</label>
              <select
                value={selectedCourseForLessons?.id || ''}
                onChange={(e) => {
                  const found = courses.find((c) => c.id === e.target.value);
                  setSelectedCourseForLessons(found || null);
                }}
                className="bg-sky-50 border border-sky-200 text-slate-800 text-xs rounded-xl px-3 py-2 font-bold focus:outline-none focus:ring-2 focus:ring-[#2B7FE0]"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    [{c.grade_kurdish}] {c.title}
                  </option>
                ))}
              </select>
            </div>

            {selectedCourseForLessons && (
              <button
                onClick={handleOpenAddLesson}
                className="bg-[#2B7FE0] hover:bg-[#1E5BB0] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>زێدەکرنا وانەیەکا نوو</span>
              </button>
            )}
          </div>

          {selectedCourseForLessons && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-600">
                وانەیێن د ناڤ کۆرسێ "{selectedCourseForLessons.title}" دا ({selectedCourseForLessons.lessons.length}):
              </h4>

              {selectedCourseForLessons.lessons.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl text-center border border-dashed border-slate-200">
                  <p className="text-xs text-slate-500 font-medium">هیچ وانەیەک بۆ ڤی کۆرسی نەهاتییە زێدەکرن.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedCourseForLessons.lessons.map((lesson, idx) => (
                    <div
                      key={lesson.id}
                      className="bg-white p-4 rounded-2xl border border-sky-100 flex items-center justify-between gap-3 hover:border-sky-200 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-sky-100 text-[#2B7FE0] text-xs font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="text-xs font-bold text-slate-800">{lesson.title}</h5>
                            {lesson.is_free_preview && (
                              <span className="bg-emerald-100 text-emerald-700 text-[9px] font-extrabold px-2 py-0.5 rounded-full">
                                وانەیا بلاش (Free)
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            دەمی: {lesson.duration} | ویدیو: {lesson.video_url.slice(0, 35)}...
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleOpenEditLesson(lesson)}
                          className="p-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs transition-all"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`ئایا دپشتڕاستی ژ سڕینەوا وانەیا "${lesson.title}"؟`)) {
                              deleteLesson(selectedCourseForLessons.id, lesson.id);
                            }
                          }}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PLANS MANAGEMENT */}
      {adminTab === 'plans' && (
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-[#2B7FE0]" />
              <span>دەستکاریکرنا پلانێن بەشداربوونێ و نرخایەتیا فەرمی</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans.map((plan) => (
                <div key={plan.id} className="bg-white p-5 rounded-2xl border border-sky-100 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-800">{plan.plan_name}</h4>
                    <span className="text-xs font-bold text-[#2B7FE0] bg-sky-50 px-2 py-0.5 rounded-md">
                      {plan.duration_months} هەیڤ
                    </span>
                  </div>

                  <div className="text-2xl font-black text-[#2B7FE0]">
                    {plan.formatted_price}
                  </div>

                  <p className="text-xs text-slate-500 min-h-[36px]">{plan.description}</p>

                  <button
                    onClick={() => handleOpenEditPlan(plan)}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>دەستکاریکرنا نرخ و شێوازی</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Individual Subject / Course Price Management Section */}
          <div className="bg-white p-6 rounded-3xl border border-sky-100 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-4 border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-xl bg-sky-100 text-[#2B7FE0] flex items-center justify-center text-xs font-black">
                    د.ع
                  </span>
                  <span>دەستکاریکرنا بهایێ کڕینا تاکەکەسی یا هەر بابەتەکی (کێم و زێدەکرن)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  لڤێرە دشێی بهایێ هەر کۆرسەک و مامۆستایەکی بەجیا کێم یان زێدە بکەی دا قوتابی بتنێ ئێک بابەت ژی بکڕیت.
                </p>
              </div>
              <span className="text-xs font-bold text-[#2B7FE0] bg-sky-50 px-3 py-1.5 rounded-xl border border-sky-100 self-start sm:self-auto">
                {courses.length} بابەتێن بەردەست
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courses.map((course) => {
                const cPrice = course.price || 60000;
                return (
                  <div
                    key={course.id}
                    className="p-4 rounded-2xl border border-slate-200 hover:border-sky-300 bg-slate-50/50 hover:bg-white transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={course.instructor_avatar}
                          alt={course.instructor_name}
                          className="w-10 h-10 rounded-xl object-cover border border-sky-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs font-extrabold text-slate-900 truncate" title={course.title}>
                            {course.title}
                          </h4>
                          <p className="text-[11px] font-bold text-slate-500">
                            {course.instructor_name} • {course.grade_kurdish}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-slate-400 font-bold block">بهایێ نووکە</span>
                        <span className="text-sm font-black text-[#1E5BB0]">
                          {course.formatted_price || `${cPrice.toLocaleString()} د.ع`}
                        </span>
                      </div>
                    </div>

                    {/* Quick +/- and Direct Price Change */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          title="کێمکرن ب -5,000 د.ع"
                          onClick={() => updateCoursePrice(course.id, Math.max(0, cPrice - 5000))}
                          disabled={cPrice <= 0}
                          className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] border border-rose-200 transition-all disabled:opacity-30 cursor-pointer"
                        >
                          - ٥,٠٠٠
                        </button>
                        <button
                          type="button"
                          title="کێمکرن ب -1,000 د.ع"
                          onClick={() => updateCoursePrice(course.id, Math.max(0, cPrice - 1000))}
                          disabled={cPrice <= 0}
                          className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] border border-rose-200 transition-all disabled:opacity-30 cursor-pointer"
                        >
                          - ١,٠٠٠
                        </button>
                        <button
                          type="button"
                          title="زێدەکرن ب +1,000 د.ع"
                          onClick={() => updateCoursePrice(course.id, cPrice + 1000)}
                          className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] border border-emerald-200 transition-all cursor-pointer"
                        >
                          + ١,٠٠٠
                        </button>
                        <button
                          type="button"
                          title="زێدەکرن ب +5,000 د.ع"
                          onClick={() => updateCoursePrice(course.id, cPrice + 5000)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] border border-emerald-200 transition-all cursor-pointer"
                        >
                          + ٥,٠٠٠
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenEditCourse(course)}
                        className="px-3 py-1 rounded-lg bg-[#2B7FE0] hover:bg-[#1E5BB0] text-white font-bold text-[11px] transition-all flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>دەستکاری</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: TEACHERS MANAGEMENT */}
      {adminTab === 'teachers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-[#2B7FE0]" />
              <span>دەستکاریکرنا وێنە و ناڤێن هەمی مامۆستایان</span>
            </h3>
            <span className="text-xs font-bold text-slate-500 bg-sky-50 px-3 py-1 rounded-xl border border-sky-100">
              ژمارەیا مامۆستایان: {uniqueTeachers.length}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {uniqueTeachers.map((teacher) => (
              <div
                key={teacher.name}
                className="bg-white rounded-2xl p-5 border border-sky-100 shadow-2xs space-y-4 hover:border-sky-300 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="relative group shrink-0">
                    <img
                      src={teacher.avatar}
                      alt={teacher.name}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-[#2B7FE0] shadow-xs"
                    />
                    <button
                      onClick={() =>
                        setEditingTeacher({
                          oldName: teacher.name,
                          name: teacher.name,
                          title: teacher.title,
                          avatar: teacher.avatar
                        })
                      }
                      className="absolute -bottom-1 -right-1 bg-[#2B7FE0] text-white p-1 rounded-lg shadow-sm hover:scale-110 transition-all"
                      title="گۆڕینا وێنەیی"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-1 flex-1 min-w-0">
                    <h4 className="text-base font-extrabold text-slate-900 truncate">
                      {teacher.name}
                    </h4>
                    <p className="text-xs font-medium text-slate-500 truncate">
                      {teacher.title}
                    </p>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-sky-50 text-[#2B7FE0] text-[11px] font-bold">
                      <BookOpen className="w-3 h-3" />
                      <span>{teacher.coursesCount} کۆرسێن خویندنێ</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-semibold truncate max-w-[200px]" title={teacher.coursesList.map((c) => c.title).join(' ، ')}>
                    کۆرس: {teacher.coursesList.map((c) => c.title).join(' ، ')}
                  </span>

                  <button
                    onClick={() =>
                      setEditingTeacher({
                        oldName: teacher.name,
                        name: teacher.name,
                        title: teacher.title,
                        avatar: teacher.avatar
                      })
                    }
                    className="px-4 py-2 bg-[#2B7FE0] hover:bg-[#1E5BB0] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs shrink-0"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>دەستکاریکرنا مامۆستایی</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: FIB PAYMENT SETTINGS */}
      {adminTab === 'fib' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-teal-100 shadow-2xs">
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#00897B]" />
                <span>برێڤەبرن و گۆڕینا هەژمارا FIB (First Iraqi Bank)</span>
              </h3>
              <p className="text-xs text-slate-500">
                هەر وەختێ تە بڤێت دشێی ژمارە یان ناڤێ هەژمارێ بگۆڕی، دەستبەجێ بۆ هەمی قوتابیان دێ نوو بیت.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-xs font-bold text-[#00897B] shrink-0 self-start sm:self-auto">
              <span className="w-2 h-2 rounded-full bg-[#00897B] animate-pulse"></span>
              <span>سیستەمێ پارەدانا ڕاستەوخۆ یا FIB چاڵاکە</span>
            </div>
          </div>

          {fibSaveSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-800 font-bold flex items-center gap-2 shadow-xs animate-in fade-in duration-200">
              <Check className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>زانیاریێن هەژمارا FIB ب سەرکەفتن هاتنە پاشەکەوتکرن و نووژەنکرن د ئەپێ دا!</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Form Column */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-teal-100 shadow-2xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="text-sm font-black text-slate-800 flex items-center gap-2">
                  <Settings className="w-4 h-4 text-[#00897B]" />
                  <span>دەستکاریکرنا زانیاریێن هەژمارا بانکی</span>
                </h4>
                <span className="text-[11px] font-bold text-slate-400">
                  Alpha Academy FIB Account
                </span>
              </div>

              <form onSubmit={handleSaveFibSettings} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <span>ژمارەیا تەلەفۆنێ یان هەژمارا فەرمی یا FIB:</span>
                      <span className="text-rose-500 font-bold">*</span>
                    </span>
                    <span className="text-[10px] text-slate-400">نموونە: 0750 426 0155</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fibForm.account_number}
                    onChange={(e) => setFibForm({ ...fibForm, account_number: e.target.value })}
                    placeholder="0750 426 0155"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00897B] font-mono text-sm font-bold tracking-wider ltr text-left bg-slate-50 focus:bg-white transition-all text-slate-900"
                  />
                  <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                    ئەڤ ژمارەیە دێ بۆ قوتابی دەرکەڤیت و دەمێ کلیکێ لێبکەت دێ ڕاستەوخۆ ئەپا FIB بۆ ڤەبیت و ئەڤ ژمارەیە هێتە کۆپیکرن.
                  </p>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1.5 flex items-center gap-1">
                    <span>ناڤێ خۆدانێ هەژمارێ (Account Holder Name):</span>
                    <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fibForm.account_holder}
                    onChange={(e) => setFibForm({ ...fibForm, account_holder: e.target.value })}
                    placeholder="ئەکادیمیایا ئەلفا (Alpha Academy)"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00897B] font-bold text-xs bg-slate-50 focus:bg-white transition-all text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">
                    کۆدێ فەرمی یێ IBAN (ئارەزوومەندانە):
                  </label>
                  <input
                    type="text"
                    value={fibForm.iban}
                    onChange={(e) => setFibForm({ ...fibForm, iban: e.target.value })}
                    placeholder="IQ88FIBK0000000000882041"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00897B] font-mono text-xs tracking-wider ltr text-left bg-slate-50 focus:bg-white transition-all text-slate-800"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">
                    تێبینی یان ڕێنمایا پارەدانێ بۆ قوتابی:
                  </label>
                  <textarea
                    rows={2}
                    value={fibForm.notes_kurdish || ''}
                    onChange={(e) => setFibForm({ ...fibForm, notes_kurdish: e.target.value })}
                    placeholder="تۆ دشێی ب ڕێکا ئەپا FIB کۆژمێ گشتی بۆ هەژمارا ئەکادیمیایێ بهنێری..."
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00897B] text-xs bg-slate-50 focus:bg-white transition-all text-slate-800 leading-relaxed"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setFibForm({
                        account_number: '0750 426 0155',
                        account_holder: 'ئەکادیمیایا ئەلفا (Alpha Academy)',
                        iban: 'IQ88FIBK0000000000882041',
                        notes_kurdish: 'تۆ دشێی ب ڕێکا ئەپا FIB کۆژمێ گشتی بۆ هەژمارا ئەکادیمیایێ بهنێری و ب دووماهیک بینە.'
                      });
                    }}
                    className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all"
                  >
                    زڤڕاندن بۆ پێشگریمان
                  </button>

                  <button
                    type="submit"
                    className="flex-1 py-3 px-6 rounded-2xl bg-[#00897B] hover:bg-[#00796B] text-white font-bold text-xs shadow-md shadow-[#00897B]/25 flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>پاشەکەوتکرنا گۆڕانکاریێن هەژمارا FIB</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Live Preview Column */}
            <div className="lg:col-span-5 space-y-4">
              <h4 className="text-sm font-black text-slate-800 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#00897B]" />
                <span>شێوازێ بەرچاڤ د ناڤ کارتی دا (Live Preview)</span>
              </h4>

              {/* Exact Card Preview */}
              <div className="bg-gradient-to-br from-[#00897B] to-[#005f56] text-white rounded-3xl p-5 shadow-lg space-y-3.5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-teal-100 font-bold">
                    <Building2 className="w-4 h-4 text-teal-200" />
                    <span>بانکا ئێکێ یا عیراقی (FIB)</span>
                  </div>
                  <span className="text-[10px] bg-white/20 px-2.5 py-0.5 rounded-full font-mono font-bold">
                    Merchant Verified
                  </span>
                </div>

                <div className="flex items-center justify-between bg-black/25 backdrop-blur-md rounded-2xl p-3.5 border border-white/10" dir="ltr">
                  <div>
                    <span className="text-[10px] text-teal-200 block uppercase font-mono tracking-wider font-semibold">
                      FIB Account / Phone
                    </span>
                    <span className="text-base sm:text-lg font-black tracking-wider text-white font-mono">
                      {fibForm.account_number || '0750 426 0155'}
                    </span>
                  </div>

                  <div className="px-3 py-1.5 rounded-xl bg-white text-[#00897B] font-bold text-xs flex items-center gap-1.5 shadow-sm">
                    <Copy className="w-3.5 h-3.5" />
                    <span>کۆپی</span>
                  </div>
                </div>

                {fibForm.iban && (
                  <div className="text-[10px] text-teal-200/90 font-mono pt-0.5 truncate" dir="ltr">
                    IBAN: {fibForm.iban}
                  </div>
                )}
              </div>

              {/* Quick Explanation */}
              <div className="p-4 bg-teal-50 border border-teal-200 rounded-3xl text-xs text-teal-900 space-y-2">
                <p className="font-bold flex items-center gap-1.5 text-[#00897B]">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>تێبینی بۆ بەڕێوەبەرێ ئەکادیمیایێ:</span>
                </p>
                <p className="text-[11px] text-teal-800 leading-relaxed">
                  تۆ دشێی هەر دەمێ پێدڤی بوو ژمارەیا تەلەفۆنا تایبەت ب FIB یان ژمارەیا هەژمارێ ل ڤێرێ ب ساناهی بگۆڕی. سیستەم ب شێوەیەکێ ئۆتۆماتیکی دێ ژمارا نوو ل هەمی بەشێن کڕینا کۆرس و پلانان نیشانی قوتابیان دەت.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT COURSE */}
      {isAddingCourse && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-sky-100 space-y-4 my-8">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#2B7FE0]" />
                <span>{editingCourse ? 'دەستکاریکرنا کۆرسی' : 'زێدەکرنا کۆرسەکێ نوو'}</span>
              </h3>
              <button
                onClick={() => setIsAddingCourse(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">سەردێڕێ کۆرسی:</label>
                <input
                  type="text"
                  required
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  placeholder="مژار: کیمیایا پۆلا ١٢ زانستی - بەشێ سێیەم"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2B7FE0]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">پۆلا خویندنێ:</label>
                  <select
                    value={courseForm.grade_level}
                    onChange={(e) => setCourseForm({ ...courseForm, grade_level: e.target.value as GradeLevel })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2B7FE0] bg-white font-bold"
                  >
                    <option value="12">پۆلا ١٢ زانستی</option>
                    <option value="11">پۆلا ١١ ئامادەیی</option>
                    <option value="10">پۆلا ١٠ ئامادەیی</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">بابەت (Subject):</label>
                  <select
                    value={courseForm.category}
                    onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value as CategoryType })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2B7FE0] bg-white font-bold"
                  >
                    <option value="birkayi">بیرکاری</option>
                    <option value="kimiya">کیمیا</option>
                    <option value="fizya">فیزیا</option>
                    <option value="zindewarzani">زیندەوەرزانی</option>
                    <option value="english">ئینگلیزی</option>
                    <option value="kurdi">کوردی</option>
                    <option value="arabi">عەرەبی</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">ناوی مامۆستایێ وانەبێژ:</label>
                <input
                  type="text"
                  required
                  value={courseForm.instructor_name}
                  onChange={(e) => setCourseForm({ ...courseForm, instructor_name: e.target.value })}
                  placeholder="م. بهزاد علی"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2B7FE0]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">پلەیا ئەکادیمی یا مامۆستایی:</label>
                <input
                  type="text"
                  required
                  value={courseForm.instructor_title}
                  onChange={(e) => setCourseForm({ ...courseForm, instructor_title: e.target.value })}
                  placeholder="مامۆستایێ پسپۆڕ یێ پۆلا ١٢"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2B7FE0]"
                />
              </div>

              {/* Instructor Avatar Upload & URL Field */}
              <div className="space-y-2 bg-sky-50/60 p-3 rounded-2xl border border-sky-100">
                <label className="font-bold text-slate-800 block text-xs">
                  وێنەیێ مامۆستایی (Instructor Image):
                </label>

                <div className="flex items-center gap-3">
                  <img
                    src={courseForm.instructor_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                    alt="Instructor Avatar"
                    className="w-12 h-12 rounded-full object-cover border-2 border-[#2B7FE0] shadow-2xs shrink-0"
                  />

                  <div className="flex-1 space-y-1.5">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-[#2B7FE0] border border-sky-300 hover:bg-sky-50 font-bold rounded-xl cursor-pointer text-xs transition-all shadow-2xs">
                      <span>📷 هەڵبژارتنا وێنەیێ مامۆستایی</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              if (event.target?.result) {
                                setCourseForm((prev) => ({
                                  ...prev,
                                  instructor_avatar: event.target!.result as string
                                }));
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                      />
                    </label>

                    <input
                      type="text"
                      value={courseForm.instructor_avatar}
                      onChange={(e) => setCourseForm({ ...courseForm, instructor_avatar: e.target.value })}
                      placeholder="یان لینکا وێنەیێ مامۆستایی دانە"
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2B7FE0] ltr text-left bg-white text-xs"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">لینکێ وێنەیێ بەرگێ کۆرسی (Thumbnail URL):</label>
                <input
                  type="url"
                  required
                  value={courseForm.thumbnail_url}
                  onChange={(e) => setCourseForm({ ...courseForm, thumbnail_url: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2B7FE0] ltr text-left"
                />
              </div>

              {/* Single Course Purchase Price Field */}
              <div className="bg-sky-50/70 p-3.5 rounded-2xl border border-sky-100 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-[#2B7FE0]" />
                    <span>بهایێ کڕینا تاکەکەسی یا کۆرسی (Single Subject Price):</span>
                  </label>
                  <span className="text-xs font-black text-[#1E5BB0]">
                    {Number(courseForm.price || 0).toLocaleString()} د.ع
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      step={500}
                      required
                      value={courseForm.price}
                      onChange={(e) => setCourseForm({ ...courseForm, price: Math.max(0, Number(e.target.value)) })}
                      placeholder="25000"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2B7FE0] font-bold ltr text-left bg-white text-xs"
                    />
                    <span className="absolute right-2.5 top-2 text-[11px] font-bold text-slate-400 pointer-events-none">
                      د.ع
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setCourseForm((prev) => ({ ...prev, price: Math.max(0, prev.price - 5000) }))}
                      className="flex-1 py-2 px-1 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] border border-rose-200 transition-all cursor-pointer text-center"
                    >
                      - ٥,٠٠٠
                    </button>
                    <button
                      type="button"
                      onClick={() => setCourseForm((prev) => ({ ...prev, price: prev.price + 5000 }))}
                      className="flex-1 py-2 px-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] border border-emerald-200 transition-all cursor-pointer text-center"
                    >
                      + ٥,٠٠٠
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">کورتە ڕوونکرن دبارا کۆرسی دا:</label>
                <textarea
                  rows={2}
                  required
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2B7FE0]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingCourse(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200"
                >
                  پاشگەزبوونەوە
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#2B7FE0] text-white font-bold hover:bg-[#1E5BB0] shadow-md"
                >
                  پاشەکەوتکرن
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT LESSON */}
      {isAddingLesson && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-sky-100 space-y-4 my-8">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Video className="w-5 h-5 text-[#2B7FE0]" />
                <span>{editingLesson ? 'دەستکاریکرنا وانەیێ' : 'زێدەکرنا وانەیەکا نوو'}</span>
              </h3>
              <button
                onClick={() => setIsAddingLesson(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLesson} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">سەردێڕێ وانەیێ:</label>
                <input
                  type="text"
                  required
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                  placeholder="وانەیا ١: شیکارکرنا هاوکێشەیان"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2B7FE0]"
                />
              </div>

              {/* Video File / Link Input */}
              <div className="space-y-2 bg-sky-50/60 p-3 rounded-2xl border border-sky-100">
                <label className="font-bold text-slate-800 block text-xs">
                  ئاپلۆدکرن یان دانانا فایلا ڤیدیۆیێ (Video Source):
                </label>

                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <label className="w-full sm:w-auto shrink-0 px-3 py-2 bg-white text-[#2B7FE0] border border-sky-300 hover:bg-sky-50 font-bold rounded-xl cursor-pointer text-center transition-all shadow-2xs">
                    <span>📁 هەڵبژارتنا فایلا ڤیدیۆیێ</span>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = URL.createObjectURL(file);
                          setLessonForm((prev) => ({
                            ...prev,
                            video_url: url,
                            title: prev.title || file.name.replace(/\.[^/.]+$/, "")
                          }));
                          const tempVid = document.createElement('video');
                          tempVid.src = url;
                          tempVid.onloadedmetadata = () => {
                            const mins = Math.floor(tempVid.duration / 60);
                            const secs = Math.floor(tempVid.duration % 60);
                            setLessonForm((prev) => ({ ...prev, duration: `${mins}:${secs < 10 ? '0' : ''}${secs}` }));
                          };
                        }
                      }}
                      className="hidden"
                    />
                  </label>

                  <input
                    type="text"
                    required
                    value={lessonForm.video_url}
                    onChange={(e) => setLessonForm({ ...lessonForm, video_url: e.target.value })}
                    placeholder="لینکا YouTube, Vimeo, Google Drive یان MP4 بنڤیسە"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2B7FE0] ltr text-left bg-white text-xs"
                  />
                </div>

                <div className="bg-sky-100/60 p-2.5 rounded-xl text-[11px] text-slate-700 leading-relaxed border border-sky-200 space-y-1">
                  <p className="font-bold text-[#2B7FE0] flex items-center gap-1">
                    🔒 پاراستنا ڤیدیۆیان ژ خەزنکرن و داگرتنێ:
                  </p>
                  <ul className="list-disc list-inside space-y-0.5 text-[10.5px] text-slate-600">
                    <li><strong>YouTube (Unlisted):</strong> لینکێن ئاسایی یان Embed خودکارانە دبنە پڵەیەرێ پاراستی (Embed).</li>
                    <li><strong>Google Drive:</strong> لینکا <code>/preview</code> یان <code>/file/d/...</code> بکاربینە.</li>
                    <li><strong>Vimeo / Bunny Stream:</strong> لینکێن Embed وەک سێرڤەرێ پاراستی کار دکەن.</li>
                    <li><strong>فایلێن MP4:</strong> ب شێوازێ خودکار کلیکا راستێ (Right click) و داگرتن (Download) هاتیە ڕاگرتن.</li>
                  </ul>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">دەمی (خولەک):</label>
                <input
                  type="text"
                  required
                  value={lessonForm.duration}
                  onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })}
                  placeholder="15:30"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2B7FE0]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">ڕوونکرن دبارا وانەیێ دا:</label>
                <textarea
                  rows={2}
                  value={lessonForm.description}
                  onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2B7FE0]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="free_preview"
                  checked={lessonForm.is_free_preview}
                  onChange={(e) => setLessonForm({ ...lessonForm, is_free_preview: e.target.checked })}
                  className="w-4 h-4 text-[#2B7FE0] rounded"
                />
                <label htmlFor="free_preview" className="font-bold text-slate-700 cursor-pointer">
                  ئەڤ وانەیە وانەکا بلاشە (Free Preview بۆ هەمی لایەکی)
                </label>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingLesson(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200"
                >
                  پاشگەزبوونەوە
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#2B7FE0] text-white font-bold hover:bg-[#1E5BB0] shadow-md"
                >
                  پاشەکەوتکرن
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT PLAN */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-sky-100 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-[#2B7FE0]" />
                <span>دەستکاریکرنا پلا نا {editingPlan.plan_name}</span>
              </h3>
              <button
                onClick={() => setEditingPlan(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">ناوی پلانێ:</label>
                <input
                  type="text"
                  required
                  value={planForm.plan_name}
                  onChange={(e) => setPlanForm({ ...planForm, plan_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2B7FE0]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">نرخێ فەرمی ب ڕستەیا کوردی:</label>
                <input
                  type="text"
                  required
                  value={planForm.formatted_price}
                  onChange={(e) => setPlanForm({ ...planForm, formatted_price: e.target.value })}
                  placeholder="٣٥,٠٠٠ د.ع"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2B7FE0]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">ڕوونکرنا پلانێ:</label>
                <textarea
                  rows={2}
                  required
                  value={planForm.description}
                  onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2B7FE0]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingPlan(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200"
                >
                  پاشگەزبوونەوە
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#2B7FE0] text-white font-bold hover:bg-[#1E5BB0] shadow-md"
                >
                  پاشەکەوتکرن
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT TEACHER PROFILE & AVATAR PHOTO */}
      {editingTeacher && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-sky-100 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#2B7FE0]" />
                <span>دەستکاریکرنا زانیاری و وێنەیێ {editingTeacher.oldName}</span>
              </h3>
              <button
                onClick={() => setEditingTeacher(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTeacher} className="space-y-4 text-xs">
              {/* Avatar Photo Preview & File Upload */}
              <div className="bg-sky-50/70 p-4 rounded-2xl border border-sky-100 text-center space-y-3">
                <div className="relative inline-block">
                  <img
                    src={editingTeacher.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                    alt="Teacher Avatar"
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md mx-auto"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="w-full py-2 bg-[#2B7FE0] hover:bg-[#1E5BB0] text-white font-bold rounded-xl cursor-pointer text-center transition-all shadow-xs flex items-center justify-center gap-2 text-xs">
                    <span>📷 هەڵبژارتنا وێنەیەکێ نوو ژ مۆبایلێ / کۆمپیوتەری</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            if (event.target?.result) {
                              setEditingTeacher((prev) => prev ? {
                                ...prev,
                                avatar: event.target!.result as string
                              } : null);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                  </label>

                  <input
                    type="text"
                    value={editingTeacher.avatar}
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, avatar: e.target.value })}
                    placeholder="یان لینکا وێنەیی (Image URL) دانە"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2B7FE0] ltr text-left bg-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">ناوی مامۆستایی:</label>
                <input
                  type="text"
                  required
                  value={editingTeacher.name}
                  onChange={(e) => setEditingTeacher({ ...editingTeacher, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2B7FE0]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">پلەیا ئەکادیمی یان زانیاریێن تایبەت:</label>
                <input
                  type="text"
                  required
                  value={editingTeacher.title}
                  onChange={(e) => setEditingTeacher({ ...editingTeacher, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2B7FE0]"
                />
              </div>

              <div className="bg-sky-100/60 p-3 rounded-xl border border-sky-200 text-[11px] text-[#2B7FE0] leading-relaxed font-bold">
                💡 گۆڕانکاریێن تە د دێ بنە هۆکارا نووژەنکرنا وێنە و زانیاریێن ڤی مامۆستایی د هەمی کۆرسێن وی دا بەردەوام.
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingTeacher(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200"
                >
                  پاشگەزبوونەوە
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#2B7FE0] text-white font-bold hover:bg-[#1E5BB0] shadow-md"
                >
                  پاشەکەوتکرن
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
