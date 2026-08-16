import React from 'react';
import { Lock, Sparkles, CheckCircle2, ShoppingCart, CreditCard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Lesson, Course } from '../types';

interface SubscriptionGateModalProps {
  course: Course | null;
  lesson: Lesson | null;
  onClose?: () => void;
  onBuySingleCourse?: () => void;
}

export const SubscriptionGateModal: React.FC<SubscriptionGateModalProps> = ({ course, lesson, onClose, onBuySingleCourse }) => {
  const { setActiveTab, t } = useAuth();
  const coursePriceFormatted = course?.formatted_price || `${(course?.price || 60000).toLocaleString()} د.ع`;

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 text-white shadow-2xl border border-sky-500/30 p-6 md:p-8 dir-rtl" dir="rtl">
      
      {/* Arctic Snow Accent Backdrop */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#2B7FE0]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-sky-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-lg mx-auto">
        
        {/* Lock Badge */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#2B7FE0] to-sky-400 p-0.5 shadow-xl shadow-[#2B7FE0]/30 mb-4 animate-bounce">
          <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-sky-300">
            <Lock className="w-8 h-8 text-sky-400" />
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-2 mb-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/30">
            <CreditCard className="w-3.5 h-3.5" />
            <span>کڕینا ئێك بابەتی (تایبەت ب ڤی کۆرسی)</span>
          </span>

          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-snug">
            ئەڤ وانەیە پێویستی ب کڕینا کۆرسی یە
          </h3>

          {lesson && (
            <p className="text-xs sm:text-sm text-sky-200 font-bold bg-sky-900/40 px-3.5 py-1.5 rounded-xl border border-sky-700/50 inline-block">
              {lesson.title}
            </p>
          )}

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mt-2">
            ژ بۆ تەماشاکرنا هەمی وانەیێن پاراستی یێن ڤی بابەتی و تاقیکرنان، دشێی ب ڕێکا ئەپا فەرمی یا FIB کۆرسی بکڕی.
          </p>
        </div>

        {/* Benefits Checklist */}
        <div className="w-full bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60 text-right mb-6 text-xs sm:text-sm space-y-2.5 text-slate-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>دەستپێگەهشتنا تەواو بۆ هەمی بەش و وانەیێن کۆرسێ</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>پشتگیریا ٢٤/٧ یا مامۆستایێ ژیر (AI Tutor)</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>تاقیکرنێن ئەلکترۆنی و شیکارێن هووربین</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          {onBuySingleCourse && (
            <button
              onClick={onBuySingleCourse}
              className="flex-1 bg-[#00897B] hover:bg-[#00796B] text-white font-extrabold py-3.5 px-4 rounded-xl shadow-lg shadow-[#00897B]/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-98 text-xs sm:text-sm cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span>کڕینا ڤی کۆرسی ب FIB ({coursePriceFormatted})</span>
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-colors cursor-pointer"
            >
              زڤڕین
            </button>
          )}
        </div>

        <p className="text-[11px] text-sky-300 font-medium mt-4">
          💳 پارەدان ب ئەپلیکەیشنا FIB (First Iraqi Bank) دهێتە پەسەندکرن
        </p>

      </div>
    </div>
  );
};

