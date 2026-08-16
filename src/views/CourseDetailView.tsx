import React, { useState } from 'react';
import { Play, Lock, ArrowLeft, Sparkles, Upload, Video, X, Check, Layers, ChevronDown, ChevronUp, Plus, FolderOpen, Snowflake, ShoppingCart, CheckCircle2, CreditCard, Edit3, PlusCircle, MinusCircle, DollarSign, Trash2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Lesson, Chapter } from '../types';
import { FIBPaymentModal } from '../components/FIBPaymentModal';

export const CourseDetailView: React.FC = () => {
  const {
    selectedCourse,
    setSelectedLesson,
    setActiveTab,
    hasAccessToLesson,
    hasAccessToCourse,
    purchaseSingleCourse,
    updateCoursePrice,
    isExpired,
    addLessonToCourse,
    updateLesson,
    deleteLesson,
    t,
    language
  } = useAuth();

  const isRtl = language !== 'en';

  // Active Chapter Filter: 'all' or chapter number 1..6
  const [activeChapterFilter, setActiveChapterFilter] = useState<number | 'all'>('all');

  // Accordion open/closed state for each chapter (default all closed so only chapter cards show first)
  const [openChapters, setOpenChapters] = useState<{ [key: number]: boolean }>({});

  const toggleChapterOpen = (chapterNum: number) => {
    setOpenChapters((prev) => ({
      ...prev,
      [chapterNum]: !prev[chapterNum],
    }));
  };

  const handleSelectChapterFilter = (chNum: number | 'all') => {
    if (chNum === 'all') {
      setActiveChapterFilter('all');
    } else {
      setActiveChapterFilter(chNum);
      // Auto-open this chapter when selected from pills
      setOpenChapters((prev) => ({
        ...prev,
        [chNum]: true,
      }));
    }
  };

  // Video Upload Modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string>('');
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('url');
  const [videoFile, setVideoFile] = useState<File | null>(null);

  // Lesson Deletion Confirmation state
  const [lessonToDelete, setLessonToDelete] = useState<Lesson | null>(null);
  const [deleteSuccessNotice, setDeleteSuccessNotice] = useState<string>('');

  // Buy Course Modal state
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('07504260155');
  const [isProcessingBuy, setIsProcessingBuy] = useState(false);
  const [buySuccess, setBuySuccess] = useState(false);

  const [lessonForm, setLessonForm] = useState({
    title: '',
    duration: '15:00',
    video_url: 'https://www.youtube.com/embed/LXb3EKWsInQ?autoplay=1&rel=0&modestbranding=1',
    description: '',
    chapter_number: 1,
    is_free_preview: false
  });

  if (!selectedCourse) {
    return (
      <div className="text-center py-12 text-slate-500 text-xs">
        {t('noBookmarks')}
      </div>
    );
  }

  // Define default 5 chapters if course doesn't have custom ones
  const default5Chapters: Chapter[] = [
    { id: 'ch-1', chapter_number: 1, title: 'بەشێ ١: بنەما و وانەیێن دەستپێکێ', description: 'وانە و شیکارێن بەشێ یەکێ' },
    { id: 'ch-2', chapter_number: 2, title: 'بەشێ ٢: یاسا و سەربڕینێن گشتی', description: 'وانە و شیکارێن بەشێ دووێ' },
    { id: 'ch-3', chapter_number: 3, title: 'بەشێ ٣: تاقیکرن و شیکارێن بەشێ سێیێ', description: 'وانە و شیکارێن بەشێ سێیێ' },
    { id: 'ch-4', chapter_number: 4, title: 'بەشێ ٤: بابەتێن سەرەکی یێن بەشێ چوارێ', description: 'وانە و شیکارێن بەشێ چوارێ' },
    { id: 'ch-5', chapter_number: 5, title: 'بەشێ ٥: پوختەیا وانەیێن بەشێ پێنجێ و پێداچوون', description: 'وانە و شیکارێن بەشێ پێنجێ' },
  ];

  const courseChapters: Chapter[] = selectedCourse.chapters && selectedCourse.chapters.length >= 5
    ? selectedCourse.chapters.slice(0, 5)
    : default5Chapters;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setVideoFile(file);
      const fakeUrl = URL.createObjectURL(file);
      setVideoPreviewUrl(fakeUrl);
      setLessonForm((prev) => ({ ...prev, video_url: fakeUrl }));
    }
  };

  const handlePlayLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setActiveTab('video_player');
  };

  const handleOpenUploadNew = (targetChapterNum: number = 1) => {
    setEditingLesson(null);
    setVideoPreviewUrl('');
    const matchedChapter = courseChapters.find((c) => c.chapter_number === targetChapterNum);
    setLessonForm({
      title: '',
      duration: '15:00',
      video_url: 'https://www.youtube.com/embed/LXb3EKWsInQ?autoplay=1&rel=0&modestbranding=1',
      description: 'Overview',
      chapter_number: targetChapterNum,
      is_free_preview: false
    });
    setIsUploadModalOpen(true);
  };

  const handleOpenEditLesson = (lesson: Lesson, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingLesson(lesson);
    setVideoPreviewUrl(lesson.video_url);
    setUploadMode('url');
    setVideoFile(null);
    setLessonForm({
      title: lesson.title,
      duration: lesson.duration,
      video_url: lesson.video_url,
      description: lesson.description || '',
      chapter_number: lesson.chapter_number || 1,
      is_free_preview: !!lesson.is_free_preview
    });
    setIsUploadModalOpen(true);
  };

  const handleRequestDeleteLesson = (lesson: Lesson, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setLessonToDelete(lesson);
  };

  const handleConfirmDeleteLesson = () => {
    if (lessonToDelete && selectedCourse) {
      const lessonTitle = lessonToDelete.title;
      deleteLesson(selectedCourse.id, lessonToDelete.id);
      setLessonToDelete(null);
      if (editingLesson?.id === lessonToDelete.id) {
        setIsUploadModalOpen(false);
        setEditingLesson(null);
      }
      setDeleteSuccessNotice(`وانەیا «${lessonTitle}» ب سەرکەفتن هاتە ژێبرن.`);
      setTimeout(() => setDeleteSuccessNotice(''), 3500);
    }
  };

  const handleSaveLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonForm.title.trim()) return;

    const matchedChapter = courseChapters.find((c) => c.chapter_number === lessonForm.chapter_number);

    if (editingLesson) {
      updateLesson(selectedCourse.id, editingLesson.id, {
        title: lessonForm.title,
        duration: lessonForm.duration,
        video_url: lessonForm.video_url,
        description: lessonForm.description,
        chapter_number: lessonForm.chapter_number,
        chapter_title: matchedChapter?.title,
        is_free_preview: lessonForm.is_free_preview
      });
    } else {
      const newLesson: Lesson = {
        id: 'l-' + Date.now(),
        chapter_number: lessonForm.chapter_number,
        chapter_title: matchedChapter?.title || `بەشێ ${lessonForm.chapter_number}`,
        title: lessonForm.title,
        duration: lessonForm.duration,
        video_url: lessonForm.video_url,
        description: lessonForm.description,
        is_free_preview: lessonForm.is_free_preview
      };
      addLessonToCourse(selectedCourse.id, newLesson);
    }

    setIsUploadModalOpen(false);
  };

  // Helper to filter lessons for a chapter
  const getLessonsForChapter = (chNum: number) => {
    return selectedCourse.lessons.filter((l) => {
      if (l.chapter_number) return l.chapter_number === chNum;
      // Default unassigned lessons to Chapter 1
      return chNum === 1;
    });
  };

  const isCourseUnlocked = hasAccessToCourse(selectedCourse.id);
  const currentCoursePrice = selectedCourse.price || 60000;

  const handleStartBuyCourse = () => {
    setBuySuccess(false);
    setIsBuyModalOpen(true);
  };

  const handleConfirmBuyCourse = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessingBuy(true);
    setTimeout(() => {
      purchaseSingleCourse(selectedCourse.id);
      setIsProcessingBuy(false);
      setBuySuccess(true);
      setTimeout(() => {
        setIsBuyModalOpen(false);
        setBuySuccess(false);
      }, 1500);
    }, 600);
  };

  const displayedChapters = activeChapterFilter === 'all'
    ? courseChapters
    : courseChapters.filter((c) => c.chapter_number === activeChapterFilter);

  return (
    <div className={`space-y-6 pb-12 ${isRtl ? 'dir-rtl' : 'dir-ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Delete Success Notification */}
      {deleteSuccessNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-800 font-bold flex items-center gap-2 shadow-xs animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{deleteSuccessNotice}</span>
        </div>
      )}

      {/* Back Button */}
      <button
        onClick={() => setActiveTab('library')}
        className="inline-flex items-center gap-2 text-xs font-bold text-[#2B7FE0] hover:underline bg-sky-50 px-3.5 py-2 rounded-xl border border-sky-100 cursor-pointer"
      >
        <ArrowLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
        <span>{t('libraryTitle')}</span>
      </button>

      {/* Course Header Hero */}
      <div className="bg-white rounded-3xl overflow-hidden border border-sky-100 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
        <div className="md:col-span-1 rounded-2xl overflow-hidden aspect-video bg-slate-100 relative">
          <img
            src={selectedCourse.thumbnail_url}
            alt={selectedCourse.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2.5 right-2.5 bg-[#2B7FE0] text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
            <Snowflake className="w-3 h-3 text-sky-200 shrink-0" />
            <span>پۆلا 12</span>
          </div>
        </div>

        <div className="md:col-span-2 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold bg-sky-50 text-[#2B7FE0] px-3 py-1 rounded-full border border-sky-100">
                {selectedCourse.category_name_kurdish?.replace(/\s*\(\s*ئحیا\s*\)/gi, '').replace(/\s*\(\s*ئحيا\s*\)/gi, '').replace(/\s*\(\s*احياء\s*\)/gi, '').replace(/\s*\(\s*احيا\s*\)/gi, '')}
              </span>
              <span className="text-xs font-bold bg-amber-50 text-amber-700 px-3 py-1 rounded-full border border-amber-200">
                ٥ بەشێن سەرەکی
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 leading-snug">
              {selectedCourse.title}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              {selectedCourse.description}
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={selectedCourse.instructor_avatar}
                alt={selectedCourse.instructor_name}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full object-cover border-2 border-sky-200"
              />
              <div>
                <h4 className="text-xs font-bold text-slate-800">{selectedCourse.instructor_name}</h4>
                <p className="text-[11px] text-slate-500">{selectedCourse.instructor_title}</p>
              </div>
            </div>

            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3.5 py-1.5 rounded-xl flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5 text-[#2B7FE0]" />
              <span>{selectedCourse.lessons.length} {t('lessons')}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Chapters Header & Filter Tabs */}
      <div className="bg-white rounded-3xl p-5 border border-sky-100 shadow-sm space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#2B7FE0] to-[#1E5BB0] flex items-center justify-center text-white shadow-md shadow-[#2B7FE0]/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-800">
                بەشێن کۆرسی (٥ بەش)
              </h3>
              <p className="text-[11px] text-slate-500">
                ڤیدیۆ بۆ هەر ٥ بەشان هاتینە رێکخستن دا کو بەرزە نەبی
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleOpenUploadNew(1)}
              className="bg-[#2B7FE0] hover:bg-[#1E5BB0] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-[#2B7FE0]/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>+ زێدەکرنا وانەیێ</span>
            </button>
          </div>
        </div>

        {/* 5 Chapter Navigation Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {courseChapters.map((ch) => {
            const count = getLessonsForChapter(ch.chapter_number).length;
            const isActive = activeChapterFilter === ch.chapter_number;

            return (
              <button
                key={ch.chapter_number}
                onClick={() => handleSelectChapterFilter(isActive ? 'all' : ch.chapter_number)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-[#2B7FE0] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-sky-50 hover:text-[#2B7FE0]'
                }`}
              >
                <span>بەشێ {ch.chapter_number}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Individual Subject Purchase Banner under Course Sections */}
        <div className="mt-3 p-4 rounded-2xl bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50/60 border border-sky-200/80 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-2xs">
          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-[#2B7FE0] text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded-lg">
                کڕینا تاکەکەسی (ئێک بابەت)
              </span>
              <span className="text-xs font-bold text-slate-800">
                {selectedCourse.title} - {selectedCourse.instructor_name}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              تە دڤێت بتنێ ڤی بابەتی و هەمی ٥ بەشێن وی بکڕی؟ ب بێ بەشداربوونا تەمام دشێی ئێک بابەت ب جودا بکڕی.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 pt-2 lg:pt-0 border-sky-100">
            {/* Price Display */}
            <div className="flex items-center gap-2.5 bg-white/95 px-3.5 py-2 rounded-xl border border-sky-200 shadow-2xs">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-bold block">بهایێ بابەتی</span>
                <span className="text-sm font-black text-[#1E5BB0]">
                  {selectedCourse.formatted_price || `${currentCoursePrice.toLocaleString()} د.ع`}
                </span>
              </div>
            </div>

            {isCourseUnlocked ? (
              <button
                type="button"
                onClick={handleStartBuyCourse}
                className="bg-[#00897B] hover:bg-[#00796B] text-white px-5 py-2.5 rounded-xl text-xs font-extrabold shadow-md shadow-[#00897B]/25 transition-all flex items-center gap-2 cursor-pointer hover:scale-102 active:scale-98"
              >
                <CreditCard className="w-4 h-4" />
                <span>کڕینا کۆرسی ({selectedCourse.formatted_price || `${currentCoursePrice.toLocaleString()} د.ع`})</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStartBuyCourse}
                className="bg-[#00897B] hover:bg-[#00796B] text-white px-5 py-2.5 rounded-xl text-xs font-extrabold shadow-md shadow-[#00897B]/25 transition-all flex items-center gap-2 cursor-pointer hover:scale-102 active:scale-98"
              >
                <CreditCard className="w-4 h-4" />
                <span>کڕینا کۆرسی ب FIB ({selectedCourse.formatted_price || `${currentCoursePrice.toLocaleString()} د.ع`})</span>
              </button>
            )}
          </div>
        </div>

      </div>

      {/* 5 Chapters Cards / Accordion List */}
      <div className="space-y-4">
        {displayedChapters.map((ch) => {
          const chLessons = getLessonsForChapter(ch.chapter_number);
          const isOpen = !!openChapters[ch.chapter_number];

          return (
            <div
              key={ch.chapter_number}
              className={`bg-white rounded-3xl border transition-all overflow-hidden ${
                isOpen ? 'border-[#2B7FE0]/40 shadow-sm' : 'border-sky-100/80 shadow-2xs hover:border-sky-300'
              }`}
            >
              {/* Chapter Card Header */}
              <div
                onClick={() => toggleChapterOpen(ch.chapter_number)}
                className={`p-5 transition-colors cursor-pointer flex items-center justify-between ${
                  isOpen
                    ? 'bg-gradient-to-r from-sky-100/70 via-sky-50/40 to-white border-b border-sky-100'
                    : 'bg-white hover:bg-sky-50/50'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-11 h-11 rounded-2xl text-white flex items-center justify-center font-black text-sm shadow-md transition-transform shrink-0 ${
                    isOpen 
                      ? 'bg-gradient-to-br from-[#2B7FE0] to-[#1E5BB0] shadow-[#2B7FE0]/25 scale-105' 
                      : 'bg-gradient-to-br from-slate-700 to-slate-800 shadow-slate-700/20'
                  }`}>
                    بەشێ {ch.chapter_number}
                  </div>

                  <div>
                    <h4 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                      <span>{ch.title}</span>
                    </h4>
                    {ch.description ? (
                      <p className="text-xs text-slate-500 mt-0.5">{ch.description}</p>
                    ) : (
                      <p className="text-[11px] text-slate-400 mt-0.5">کلیک بکە بۆ دیتنا ڤیدیۆیێن ڤی بەشی</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <span className={`text-xs font-extrabold px-3 py-1 rounded-full border transition-all ${
                    isOpen
                      ? 'text-[#2B7FE0] bg-sky-100 border-sky-200'
                      : 'text-slate-600 bg-slate-100 border-slate-200'
                  }`}>
                    {chLessons.length} وانە
                  </span>

                  <div
                    className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all ${
                      isOpen
                        ? 'bg-[#2B7FE0] text-white shadow-xs rotate-180'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Chapter Card Body - Video List */}
              {isOpen && (
                <div className="p-4 sm:p-5 space-y-3 bg-white">
                  {chLessons.length === 0 ? (
                    <div className="text-center py-6 px-4 rounded-2xl border-2 border-dashed border-sky-200 bg-sky-50/30 flex flex-col items-center justify-center space-y-2">
                      <FolderOpen className="w-8 h-8 text-sky-400" />
                      <p className="text-xs font-bold text-slate-600">
                        نووکە هیچ ڤیدیۆد ڤی بەشی دا نینە (جهێ بەشێ {ch.chapter_number}).
                      </p>
                      <button
                        onClick={() => handleOpenUploadNew(ch.chapter_number)}
                        className="text-xs font-bold text-[#2B7FE0] bg-white border border-sky-200 hover:bg-sky-50 px-3.5 py-1.5 rounded-xl shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer mt-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>زێدەکرنا ڤیدیۆیێ بۆ بەشێ {ch.chapter_number}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {chLessons.map((lesson) => {
                        const isUnlocked = hasAccessToLesson(lesson, selectedCourse.id);

                        return (
                          <div
                            key={lesson.id}
                            onClick={() => handlePlayLesson(lesson)}
                            className={`p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer group ${
                              isUnlocked
                                ? 'bg-slate-50/60 hover:bg-sky-50/60 border-slate-200 hover:border-[#2B7FE0]'
                                : 'bg-slate-50/30 border-slate-100 opacity-80'
                            }`}
                          >
                            <div className="flex items-center gap-3.5">
                              <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 transition-colors ${
                                  isUnlocked
                                    ? 'bg-[#2B7FE0] text-white shadow-xs group-hover:scale-105'
                                    : 'bg-slate-200 text-slate-500'
                                }`}
                              >
                                {isUnlocked ? (
                                  <Play className={`w-4 h-4 fill-current ${isRtl ? 'rotate-180' : ''}`} />
                                ) : (
                                  <Lock className="w-4 h-4" />
                                )}
                              </div>

                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-slate-800 group-hover:text-[#2B7FE0] transition-colors">
                                    {lesson.title}
                                  </span>
                                  {lesson.is_free_preview && (
                                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                                      {t('freePreview')}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-500 mt-0.5">{lesson.duration}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {/* Edit Lesson */}
                              <button
                                type="button"
                                onClick={(e) => handleOpenEditLesson(lesson, e)}
                                title="دەستکاریکرنا ڤێ وانەیێ"
                                className="p-2 rounded-xl bg-slate-100 hover:bg-sky-100 text-slate-600 hover:text-[#2B7FE0] transition-colors cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete Lesson */}
                              <button
                                type="button"
                                onClick={(e) => handleRequestDeleteLesson(lesson, e)}
                                title="ژێبرنا ڤێ وانەیێ"
                                className="p-2 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>

                              {/* Play / Start Lesson */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePlayLesson(lesson);
                                }}
                                className="text-xs font-bold text-[#2B7FE0] bg-sky-100 hover:bg-[#2B7FE0] hover:text-white px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer"
                              >
                                {t('startLesson')}
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      {/* Quick Add Button inside populated chapter */}
                      <div className="pt-1 flex justify-end">
                        <button
                          onClick={() => handleOpenUploadNew(ch.chapter_number)}
                          className="text-xs font-bold text-[#2B7FE0] hover:underline flex items-center gap-1 cursor-pointer py-1 px-2"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>زێدەکرنا وانەیەکا دی بۆ بەشێ {ch.chapter_number}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* UPLOAD / EDIT LESSON VIDEO MODAL */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-sky-100 space-y-4 my-8">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-sky-100 text-[#2B7FE0] flex items-center justify-center font-bold">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    {editingLesson ? 'دەستکاری / گۆڕینا ڤیدیۆیا وانەیێ' : 'ئاپلۆدکرنا ڤیدیۆ و وانەیەکا نوو'}
                  </h3>
                  <p className="text-[11px] text-slate-500">کۆرس: {selectedCourse.title}</p>
                </div>
              </div>

              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selector: File Upload vs URL Embed */}
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setUploadMode('file')}
                className={`py-2 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  uploadMode === 'file' ? 'bg-white text-[#2B7FE0] shadow-2xs' : 'text-slate-600'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>ئاپلۆدکرنا فایلا MP4</span>
              </button>

              <button
                type="button"
                onClick={() => setUploadMode('url')}
                className={`py-2 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  uploadMode === 'url' ? 'bg-white text-[#2B7FE0] shadow-2xs' : 'text-slate-600'
                }`}
              >
                <Video className="w-4 h-4" />
                <span>لینکا یوتوب یان MP4</span>
              </button>
            </div>

            <form onSubmit={handleSaveLesson} className="space-y-3 text-xs">
              
              {/* CHAPTER SELECTOR DROPDOWN */}
              <div>
                <label className="font-bold text-slate-800 block mb-1">بەشێ خویندنێ (Chapter):</label>
                <select
                  value={lessonForm.chapter_number}
                  onChange={(e) => setLessonForm({ ...lessonForm, chapter_number: Number(e.target.value) })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2B7FE0] font-bold text-slate-800 bg-slate-50"
                >
                  {courseChapters.map((ch) => (
                    <option key={ch.chapter_number} value={ch.chapter_number}>
                      {ch.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* FILE UPLOAD INPUT */}
              {uploadMode === 'file' ? (
                <div className="space-y-2">
                  <label className="font-bold text-slate-700 block">فایلا ڤیدیۆیێ هەڵبژێرە (Video File):</label>
                  <label className="border-2 border-dashed border-sky-300 hover:border-[#2B7FE0] bg-sky-50/50 hover:bg-sky-50 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all">
                    <Upload className="w-8 h-8 text-[#2B7FE0] mb-2 animate-bounce" />
                    <span className="font-bold text-slate-800 text-xs">
                      {videoFile ? `فایلا هەڵبژارتی: ${videoFile.name}` : 'کرتێ بکە یان فایلا ڤیدیۆیێ ل ڤێرە بڕکێشە (Drag & Drop)'}
                    </span>
                    <span className="text-[10px] text-slate-500 mt-1">پشتگیرییا فرماتێن MP4, MOV, WebM, AVI دکەت</span>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                /* URL INPUT */
                <div>
                  <label className="font-bold text-slate-700 block mb-1">لینکا ڤیدیۆیێ (YouTube Embed / Direct MP4 URL):</label>
                  <input
                    type="text"
                    required
                    value={lessonForm.video_url}
                    onChange={(e) => {
                      setLessonForm({ ...lessonForm, video_url: e.target.value });
                      setVideoPreviewUrl(e.target.value);
                    }}
                    placeholder="https://www.youtube.com/embed/LXb3EKWsInQ..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2B7FE0] ltr text-left"
                  />
                </div>
              )}

              {/* VIDEO PREVIEW BOX */}
              {videoPreviewUrl && (
                <div className="rounded-2xl overflow-hidden border border-slate-200 bg-black aspect-video max-h-40 relative">
                  {videoPreviewUrl.startsWith('blob:') || videoPreviewUrl.endsWith('.mp4') ? (
                    <video src={videoPreviewUrl} controls className="w-full h-full object-contain" />
                  ) : (
                    <iframe src={videoPreviewUrl} className="w-full h-full border-0" />
                  )}
                  <span className="absolute top-2 left-2 bg-slate-900/80 text-white text-[9px] px-2 py-0.5 rounded-full backdrop-blur-md">
                    پێشاندانا نەخشەییا ڤیدیۆیێ
                  </span>
                </div>
              )}

              {/* LESSON TITLE */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">ناوی وانەیێ / بابەت:</label>
                <input
                  type="text"
                  required
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                  placeholder="مژار: وانەیا ١: شیکارکرنا هاوکێشەیان"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2B7FE0]"
                />
              </div>

              {/* DURATION & FREE PREVIEW TOGGLE */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">دەمی ڤیدیۆیێ (خولەک):</label>
                  <input
                    type="text"
                    required
                    value={lessonForm.duration}
                    onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })}
                    placeholder="18:20"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2B7FE0]"
                  />
                </div>

                <div className="flex flex-col justify-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer bg-slate-50 p-2 rounded-xl border border-slate-200">
                    <input
                      type="checkbox"
                      checked={lessonForm.is_free_preview}
                      onChange={(e) => setLessonForm({ ...lessonForm, is_free_preview: e.target.checked })}
                      className="w-4 h-4 text-[#2B7FE0] rounded"
                    />
                    <span className="font-bold text-slate-700 text-[11px]">وانە بلاش بیت (Free)</span>
                  </label>
                </div>
              </div>

              {/* DESCRIPTION */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">ڕوونکرنا وانەیێ:</label>
                <textarea
                  rows={2}
                  value={lessonForm.description}
                  onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                  placeholder="دەستپێک دبارا یاسا و شیکارێن زانستی..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2B7FE0]"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                {editingLesson ? (
                  <button
                    type="button"
                    onClick={() => handleRequestDeleteLesson(editingLesson)}
                    className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>ژێبرنا ڤێ وانەیێ</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsUploadModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 cursor-pointer"
                  >
                    پاشگەزبوونەوە
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#2B7FE0] text-white font-bold hover:bg-[#1E5BB0] shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>پاشەکەوتکرنا ڤیدیۆیێ</span>
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* DELETE LESSON CONFIRMATION MODAL */}
      {lessonToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-rose-100 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">پشتڕاستکرنا ژێبرنا وانەیێ</h3>
                <p className="text-xs text-slate-500">ئەڤ کریارە ناهێتە پاشگەزکرن</p>
              </div>
            </div>

            <div className="p-4 bg-rose-50/70 border border-rose-100 rounded-2xl space-y-1.5 text-xs">
              <p className="font-bold text-slate-800">
                ئایا دپشتڕاستی ژ ژێبرنا وانەیا:
              </p>
              <p className="font-black text-rose-700 text-sm">
                «{lessonToDelete.title}»؟
              </p>
              <p className="text-[11px] text-slate-500 pt-1 leading-relaxed">
                دەمێ وانە دهێتە ژێبرن، ڤیدیۆ و هەمی زانیاریێن وێ ژ ناڤ لیستا وانەیێن ڤی کۆرسی دێ هێنە سڕینەوە.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setLessonToDelete(null)}
                className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
              >
                پاشگەزبوونەوە
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteLesson}
                className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-500/20 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>بەڵێ، وانەیێ ژێببە</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BUY SINGLE COURSE MODAL (FIB Payment Gateway) */}
      {isBuyModalOpen && (
        <FIBPaymentModal
          itemType="course"
          course={selectedCourse}
          onClose={() => setIsBuyModalOpen(false)}
          onSuccess={() => setIsBuyModalOpen(false)}
        />
      )}

    </div>
  );
};
