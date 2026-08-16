import React, { useState } from 'react';
import { Mail, ShieldCheck, ShieldAlert, Award, BookOpen, Calendar, LogOut, Sparkles, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ProfileView: React.FC = () => {
  const { 
    user, 
    isExpired, 
    timeRemainingFormatted, 
    activateSubscription, 
    cancelSubscription,
    resetAllPurchasesAndSubscription,
    logoutUser, 
    setActiveTab,
    t
  } = useAuth();
  
  const [adminMode, setAdminMode] = useState<boolean>(false);

  if (!user) return null;

  return (
    <div className="space-y-6 pb-12 dir-rtl" dir="rtl">
      
      {/* Profile Card Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sky-100 shadow-sm relative overflow-hidden">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
              alt={user.full_name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-sky-100 shadow-md"
            />
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800">{user.full_name}</h2>
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{user.email}</span>
              </p>
              <p className="text-[11px] text-slate-400 font-mono">UID: {user.uid}</p>
            </div>
          </div>

          <div className="shrink-0">
            {!isExpired ? (
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-right">
                <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold mb-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>{t('statusActive')}</span>
                </div>
                <p className="text-xs text-emerald-700 font-semibold">{timeRemainingFormatted}</p>
              </div>
            ) : (
              <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl text-right">
                <div className="flex items-center gap-2 text-rose-800 text-xs font-bold mb-1">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>{t('statusExpired')}</span>
                </div>
                <button
                  onClick={() => setActiveTab('plans')}
                  className="mt-2 text-xs font-bold text-rose-700 hover:underline block cursor-pointer"
                >
                  {t('activateSub')} →
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Progress & Achievements Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="bg-white p-5 rounded-3xl border border-sky-100 shadow-2xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#2B7FE0] flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-800">{user.completed_lessons.length}</span>
            <p className="text-xs text-slate-500">{t('completedCount')}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-sky-100 shadow-2xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-800">
              {Object.keys(user.quiz_scores).length}
            </span>
            <p className="text-xs text-slate-500">{t('quizScores')}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-sky-100 shadow-2xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-sm font-bold text-slate-800">
              {new Date(user.created_at).toLocaleDateString('ku-IQ')}
            </span>
            <p className="text-xs text-slate-500">{t('subStatus')}</p>
          </div>
        </div>

      </div>

      {/* Logout Button */}
      <div className="flex justify-start pt-2">
        <button
          onClick={logoutUser}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all cursor-pointer shadow-2xs"
        >
          <LogOut className="w-4 h-4 text-rose-600" />
          <span>{t('logout')}</span>
        </button>
      </div>

      {/* Admin Test Toolbar (Strictly restricted to Admin role users) */}
      {user.role === 'admin' && (
        <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold">ئامرازێن کۆنترۆڵا بەڕێوەبەری (Server Admin)</h3>
            </div>

            <button
              onClick={() => setAdminMode(!adminMode)}
              className="text-xs text-sky-400 hover:underline font-semibold cursor-pointer"
            >
              {adminMode ? 'ڤەشارتن' : 'نیشاندان'}
            </button>
          </div>

          {adminMode && (
            <div className="space-y-4 pt-2 text-xs">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => activateSubscription('monthly', 1, 'ADMIN-OVERRIDE')}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+٣٠ ڕۆژ بەشداریکرن (ل سەر سێرڤەری)</span>
                </button>

                <button
                  onClick={cancelSubscription}
                  className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition-colors cursor-pointer"
                >
                  بەسەرڤەچوونا بەشداریکرنێ
                </button>

                <button
                  onClick={resetAllPurchasesAndSubscription}
                  className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold transition-colors cursor-pointer"
                >
                  قوفلکرنا هەمی کۆرسان
                </button>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
