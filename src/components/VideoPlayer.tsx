import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  CheckCircle2, 
  Bookmark, 
  FileText, 
  Download, 
  Shield, 
  HelpCircle, 
  Lock, 
  Sparkles,
  RotateCcw,
  RotateCw,
  Gauge,
  Volume2,
  VolumeX,
  Maximize
} from 'lucide-react';
import { Course, Lesson } from '../types';
import { useAuth } from '../context/AuthContext';
import { SubscriptionGateModal } from './SubscriptionGateModal';
import { QuizWidget } from './QuizWidget';
import { AITutorWidget } from './AITutorWidget';
import { FIBPaymentModal } from './FIBPaymentModal';

interface VideoPlayerProps {
  course: Course;
  lesson: Lesson;
  onSelectLesson: (lesson: Lesson) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ course, lesson, onSelectLesson }) => {
  const { user, hasAccessToLesson, toggleCompleteLesson, toggleBookmarkLesson, purchaseSingleCourse, t, language } = useAuth();

  const isRtl = language !== 'en';

  const [activeTab, setActiveTab] = useState<'notes' | 'quiz' | 'ai'>('notes');
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Buy single course modal in video player
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('07504260155');
  const [isProcessingBuy, setIsProcessingBuy] = useState(false);
  const [buySuccess, setBuySuccess] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isAccessAllowed = hasAccessToLesson(lesson);
  const isCompleted = user?.completed_lessons.includes(lesson.id);
  const isBookmarked = user?.bookmarked_lessons.includes(lesson.id);

  const [buyError, setBuyError] = useState<string>('');

  const handleConfirmBuyCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessingBuy(true);
    setBuyError('');

    try {
      const res = await purchaseSingleCourse(course.id, `DIRECT-PHONE-${phoneNumber}`);
      if (res.success) {
        setIsProcessingBuy(false);
        setBuySuccess(true);
        setTimeout(() => {
          setIsBuyModalOpen(false);
          setBuySuccess(false);
        }, 1200);
      } else {
        setIsProcessingBuy(false);
        setBuyError(res.error || 'کڕینا کۆرسی ل سەر سێرڤەری سەرنەکەفت');
      }
    } catch (err) {
      setIsProcessingBuy(false);
      setBuyError('ئاریشەیەک د پەیوەندیا سێرڤەری دا پەیدابوو');
    }
  };

  const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  const showFeedback = (msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setFeedbackToast(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setFeedbackToast(null);
    }, 2000);
  };

  // Convert standard links to interactive embed links with js API enabled
  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('youtube.com/watch?v=')) {
      const id = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&controls=1&enablejsapi=1&playsinline=1&fs=1&autoplay=1`;
    }
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&controls=1&enablejsapi=1&playsinline=1&fs=1&autoplay=1`;
    }
    if (url.includes('drive.google.com/file/d/')) {
      const parts = url.split('/file/d/');
      const fileId = parts[1]?.split('/')[0];
      return `https://drive.google.com/file/d/${fileId}/preview`;
    }
    return url;
  };

  const finalVideoUrl = getEmbedUrl(lesson.video_url);

  const isDirectVideo = 
    finalVideoUrl.startsWith('blob:') || 
    finalVideoUrl.startsWith('data:') || 
    finalVideoUrl.endsWith('.mp4') || 
    finalVideoUrl.endsWith('.webm') || 
    finalVideoUrl.includes('/videos/');

  // Send command to YouTube iframe if applicable
  const sendIframeCommand = (command: string, args: any[] = []) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({
            event: 'command',
            func: command,
            args: args
          }),
          '*'
        );
      } catch (err) {
        console.warn('Cannot send command to iframe', err);
      }
    }
  };

  // Change Playback Speed
  const handleSpeedChange = (speed: number) => {
    setPlaybackRate(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    sendIframeCommand('setPlaybackRate', [speed]);
    showFeedback(`خێرایی: ${speed}x`);
  };

  // Rewind or Fast Forward
  const handleSeekDelta = (seconds: number) => {
    if (isDirectVideo && videoRef.current) {
      const newTime = Math.max(0, Math.min(videoRef.current.duration || 9999, videoRef.current.currentTime + seconds));
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    } else {
      // Seek YouTube iframe
      const delta = seconds;
      if (delta > 0) {
        sendIframeCommand('seekTo', [currentTime + delta, true]);
        setCurrentTime((prev) => prev + delta);
      } else {
        sendIframeCommand('seekTo', [Math.max(0, currentTime + delta), true]);
        setCurrentTime((prev) => Math.max(0, prev + delta));
      }
    }

    if (seconds > 0) {
      showFeedback(`+${seconds} چرکە چوو پێش`);
    } else {
      showFeedback(`${seconds} چرکە چوو پاش`);
    }
  };

  const handleTogglePlay = () => {
    if (isDirectVideo && videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    } else {
      if (isPlaying) {
        sendIframeCommand('pauseVideo');
        setIsPlaying(false);
      } else {
        sendIframeCommand('playVideo');
        setIsPlaying(true);
      }
    }
  };

  const handleToggleMute = () => {
    if (isDirectVideo && videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    } else {
      if (isMuted) {
        sendIframeCommand('unMute');
        setIsMuted(false);
      } else {
        sendIframeCommand('mute');
        setIsMuted(true);
      }
    }
  };

  const handleFullscreen = () => {
    const el = videoRef.current || iframeRef.current;
    if (el) {
      if (el.requestFullscreen) {
        el.requestFullscreen();
      }
    }
  };

  // Reset controls on lesson change
  useEffect(() => {
    setPlaybackRate(1);
    setCurrentTime(0);
    setIsPlaying(true);
  }, [lesson.id]);

  const currentLessonIndex = course.lessons.findIndex((l) => l.id === lesson.id);
  const nextLesson = currentLessonIndex < course.lessons.length - 1 ? course.lessons[currentLessonIndex + 1] : null;

  return (
    <div className={`space-y-4 ${isRtl ? 'dir-rtl' : 'dir-ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Video Player Card */}
      <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-sky-900/40 relative">
        
        {isAccessAllowed ? (
          <div className="relative">
            <div 
              className="relative aspect-video w-full bg-black flex items-center justify-center select-none"
              onContextMenu={(e) => e.preventDefault()}
            >
              
              {/* Direct HTML5 Video Player OR YouTube Iframe */}
              {isDirectVideo ? (
                <video
                  ref={videoRef}
                  src={finalVideoUrl}
                  controls
                  controlsList="nodownload"
                  onTimeUpdate={() => {
                    if (videoRef.current) {
                      setCurrentTime(videoRef.current.currentTime);
                      setDuration(videoRef.current.duration || 0);
                    }
                  }}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  className="w-full h-full object-contain"
                  poster={course.thumbnail_url}
                  autoPlay
                />
              ) : (
                <iframe
                  ref={iframeRef}
                  src={finalVideoUrl}
                  title={lesson.title}
                  className="w-full h-full border-0 pointer-events-auto"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                  referrerPolicy="no-referrer"
                />
              )}

              {/* Toast Feedback for Speed & Seek */}
              {feedbackToast && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/85 backdrop-blur-md px-4 py-2 rounded-2xl border border-sky-400/40 text-white font-bold text-sm shadow-2xl flex items-center gap-2 z-30 pointer-events-none animate-fade-in">
                  <Gauge className="w-4 h-4 text-[#2B7FE0]" />
                  <span>{feedbackToast}</span>
                </div>
              )}

              {/* Anti-Piracy Watermark Overlay */}
              <div className="absolute top-4 right-4 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-full border border-sky-400/30 text-[10px] text-sky-200 font-mono pointer-events-none select-none z-20 flex items-center gap-1.5 opacity-90 shadow-lg">
                <Shield className="w-3.5 h-3.5 text-sky-400" />
                <span>{user?.full_name ? `${user.full_name} (${user.phone || user.uid})` : 'قوتابی • Alpha DRM'}</span>
              </div>

              {/* Free Preview Tag */}
              {lesson.is_free_preview && (
                <div className="absolute top-4 left-4 bg-emerald-500/90 text-white px-3 py-1 rounded-full text-xs font-bold border border-emerald-400 shadow-md z-20">
                  {t('freePreview')}
                </div>
              )}
            </div>

            {/* QUICK CONTROL BAR (Rewind 10s, Forward 10s, Speed 0.5x, 1x, 1.5x, 2x) */}
            <div className="bg-slate-950/95 px-4 py-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-white">
              
              {/* Rewind & Fast Forward Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSeekDelta(-10)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                  title="١٠ چرکە بچۆ پاشڤە (-10s)"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-sky-400" />
                  <span>١٠ چرکە پاشڤە</span>
                </button>

                <button
                  type="button"
                  onClick={handleTogglePlay}
                  className="w-8 h-8 rounded-xl bg-[#2B7FE0] hover:bg-[#1E5BB0] active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer shadow-md shadow-[#2B7FE0]/30"
                  title={isPlaying ? 'ڕاگرتن' : 'لێدان'}
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                </button>

                <button
                  type="button"
                  onClick={() => handleSeekDelta(10)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                  title="١٠ چرکە بچۆ پێشڤە (+10s)"
                >
                  <span>١٠ چرکە پێشڤە</span>
                  <RotateCw className="w-3.5 h-3.5 text-sky-400" />
                </button>
              </div>

              {/* Playback Speed Controller */}
              <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-2xl border border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 px-2 flex items-center gap-1">
                  <Gauge className="w-3.5 h-3.5 text-[#2B7FE0]" />
                  <span>خێرایی:</span>
                </span>

                <div className="flex items-center gap-1">
                  {speedOptions.map((speed) => (
                    <button
                      key={speed}
                      type="button"
                      onClick={() => handleSpeedChange(speed)}
                      className={`px-2 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                        playbackRate === speed
                          ? 'bg-[#2B7FE0] text-white shadow-sm scale-105'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>

            </div>

          </div>
        ) : (
          /* Locked Subscription Gate Overlay */
          <div className="p-4 sm:p-8">
            <SubscriptionGateModal 
              course={course} 
              lesson={lesson} 
              onBuySingleCourse={() => setIsBuyModalOpen(true)}
            />
          </div>
        )}

      </div>

      {/* Lesson Header & Quick Actions */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-sky-100 shadow-sm space-y-4">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold text-[#2B7FE0] bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
                {course.title}
              </span>
              <span className="text-xs text-slate-400">• {lesson.duration}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 leading-snug">
              {lesson.title}
            </h2>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => toggleCompleteLesson(lesson.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                isCompleted
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <CheckCircle2 className={`w-4 h-4 ${isCompleted ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>{isCompleted ? t('completed') : t('complete')}</span>
            </button>

            <button
              onClick={() => toggleBookmarkLesson(lesson.id)}
              className={`p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isBookmarked
                  ? 'bg-amber-50 text-amber-600 border border-amber-200'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
              title="Bookmark Lesson"
            >
              <Bookmark className="w-4 h-4 fill-current" />
            </button>

            {nextLesson && isAccessAllowed && (
              <button
                onClick={() => onSelectLesson(nextLesson)}
                className="px-4 py-2.5 rounded-xl bg-[#2B7FE0] hover:bg-[#1E5BB0] text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#2B7FE0]/20 transition-all cursor-pointer"
              >
                <span>{t('nextLesson')}</span>
                <Play className={`w-3.5 h-3.5 fill-current ${isRtl ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation Below Video */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs font-bold border-b border-slate-100">
          <button
            onClick={() => setActiveTab('notes')}
            className={`px-4 py-2.5 rounded-2xl flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'notes'
                ? 'bg-sky-50 text-[#2B7FE0] border border-sky-200'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{t('lessonNotes')}</span>
          </button>

          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-4 py-2.5 rounded-2xl flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'quiz'
                ? 'bg-sky-50 text-[#2B7FE0] border border-sky-200'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>{t('interactiveQuiz')} ({lesson.quiz?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            className={`px-4 py-2.5 rounded-2xl flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'ai'
                ? 'bg-sky-50 text-[#2B7FE0] border border-sky-200'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>{t('aiTutorTitle')}</span>
          </button>
        </div>

        {/* Tab Content Display */}
        <div className="pt-2">
          {activeTab === 'notes' && (
            <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
              <h4 className="font-bold text-slate-900 text-sm">{t('description')}:</h4>
              <p>{lesson.description}</p>
              
              <div className="pt-3 border-t border-slate-200/60 flex items-center gap-3">
                <img
                  src={course.instructor_avatar}
                  alt={course.instructor_name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-sky-200"
                />
                <div>
                  <h5 className="font-bold text-slate-800">{course.instructor_name}</h5>
                  <p className="text-[11px] text-slate-500">{course.instructor_title}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'quiz' && (
            <QuizWidget lessonId={lesson.id} questions={lesson.quiz || []} />
          )}

          {activeTab === 'ai' && (
            <AITutorWidget course={course} lesson={lesson} />
          )}
        </div>

      </div>

      {/* Buy Single Course Modal Inside Video Player (FIB Payment Gateway) */}
      {isBuyModalOpen && (
        <FIBPaymentModal
          itemType="course"
          course={course}
          onClose={() => setIsBuyModalOpen(false)}
          onSuccess={() => setIsBuyModalOpen(false)}
        />
      )}

    </div>
  );
};
