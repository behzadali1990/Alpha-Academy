import React, { useState } from 'react';
import { HelpCircle, CheckCircle, XCircle, Award, RotateCcw, ArrowRight, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { QuizQuestion } from '../types';
import { useAuth } from '../context/AuthContext';

interface QuizWidgetProps {
  lessonId: string;
  questions: QuizQuestion[];
}

export const QuizWidget: React.FC<QuizWidgetProps> = ({ lessonId, questions }) => {
  const { recordQuizScore, t, language } = useAuth();

  const isRtl = language !== 'en';

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);

  if (!questions || questions.length === 0) {
    return (
      <div className="bg-sky-50/60 rounded-2xl p-6 text-center border border-sky-100 text-xs text-slate-500">
        هیچ تاقیکرنەک بۆ ڤێ وانەیێ بەردەست نینە.
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  const handleSelect = (optionId: string) => {
    if (isSubmitted) return;
    setSelectedOption(optionId);
  };

  const handleCheckAnswer = () => {
    if (!selectedOption) return;
    setIsSubmitted(true);

    if (selectedOption === currentQ.correctOptionId) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
    } else {
      setQuizFinished(true);
      const percentage = Math.round(((score + (selectedOption === currentQ.correctOptionId ? 1 : 0)) / questions.length) * 100);
      recordQuizScore(lessonId, percentage);

      if (percentage >= 80) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsSubmitted(false);
    setScore(0);
    setQuizFinished(false);
  };

  const finalPercentage = Math.round((score / questions.length) * 100);

  return (
    <div className={`bg-white rounded-3xl p-5 sm:p-6 border border-sky-100 shadow-sm ${isRtl ? 'dir-rtl' : 'dir-ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-sky-100 text-[#2B7FE0] flex items-center justify-center font-bold">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800">{t('testYourself')}</h4>
            <p className="text-[11px] text-slate-500">تاقیکرنا ئاستێ تێگەهشتنێ</p>
          </div>
        </div>

        {!quizFinished && (
          <span className="text-xs bg-sky-50 text-[#2B7FE0] font-bold px-3 py-1 rounded-full border border-sky-200">
            {currentIndex + 1} / {questions.length}
          </span>
        )}
      </div>

      {!quizFinished ? (
        <div className="space-y-4">
          
          {/* Question Text */}
          <h5 className="text-sm font-bold text-slate-800 leading-snug">
            {currentQ.questionText}
          </h5>

          {/* Options list */}
          <div className="space-y-2">
            {currentQ.options.map((option) => {
              const isSelected = selectedOption === option.id;
              const isCorrect = option.id === currentQ.correctOptionId;

              let optionStyle = 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700';

              if (isSubmitted) {
                if (isCorrect) {
                  optionStyle = 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold';
                } else if (isSelected) {
                  optionStyle = 'border-rose-500 bg-rose-50 text-rose-800 font-bold';
                } else {
                  optionStyle = 'border-slate-100 bg-slate-50/50 text-slate-400 opacity-60';
                }
              } else if (isSelected) {
                optionStyle = 'border-[#2B7FE0] bg-sky-50 text-[#2B7FE0] font-bold shadow-2xs';
              }

              return (
                <button
                  key={option.id}
                  onClick={() => handleSelect(option.id)}
                  className={`w-full p-3.5 rounded-2xl border text-xs ${isRtl ? 'text-right' : 'text-left'} transition-all flex items-center justify-between cursor-pointer ${optionStyle}`}
                >
                  <span>{option.text}</span>
                  {isSubmitted && isCorrect && <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />}
                  {isSubmitted && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-500 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Explanation when submitted */}
          {isSubmitted && currentQ.explanation && (
            <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200 text-xs text-sky-900 leading-relaxed">
              <span className="font-bold block mb-0.5">💡 ڕوونکرن:</span>
              <p>{currentQ.explanation}</p>
            </div>
          )}

          {/* Actions */}
          <div className={`pt-2 flex ${isRtl ? 'justify-end' : 'justify-start'}`}>
            {!isSubmitted ? (
              <button
                onClick={handleCheckAnswer}
                disabled={!selectedOption}
                className="py-2.5 px-6 rounded-xl bg-[#2B7FE0] hover:bg-[#1E5BB0] text-white font-bold text-xs shadow-md shadow-[#2B7FE0]/25 transition-all disabled:opacity-50 cursor-pointer"
              >
                {t('checkAnswer')}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="py-2.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>{currentIndex < questions.length - 1 ? t('nextQuestion') : t('quizFinished')}</span>
                <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>

        </div>
      ) : (
        /* Quiz Finished View */
        <div className="text-center py-6 space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto font-bold shadow-md">
            <Award className="w-8 h-8" />
          </div>

          <div>
            <h4 className="text-lg font-bold text-slate-800">{t('quizFinished')}</h4>
            <p className="text-2xl font-extrabold text-[#2B7FE0] mt-1">% {finalPercentage}</p>
          </div>

          <button
            onClick={handleRestart}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t('tryAgain')}</span>
          </button>
        </div>
      )}

    </div>
  );
};
