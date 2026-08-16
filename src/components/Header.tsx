import React from 'react';
import { Snowflake, ShieldCheck, Lock, User, Smartphone, Edit3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Header: React.FC = () => {
  const { 
    user, 
    activeTab, 
    setActiveTab, 
    isExpired, 
    timeRemainingFormatted, 
    isMobileFrame, 
    setIsMobileFrame,
    t
  } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-sky-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 dir-rtl" dir="rtl">
          
          {/* Logo & Brand Name */}
          <div 
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2B7FE0] to-[#1E5BB0] flex items-center justify-center text-white shadow-md shadow-[#2B7FE0]/25 transition-transform group-hover:scale-105">
              <Snowflake className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-xl font-bold tracking-tight text-[#1A1A1A] group-hover:text-[#2B7FE0] transition-colors">
                  ئەکادیمیایا ئەلفا
                </h1>
                <span className="text-xs px-2 py-0.5 rounded-full bg-sky-100 text-[#2B7FE0] font-medium border border-sky-200">
                  {t('mobileView')}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                {t('appSubtitle')}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">

            {/* Mobile Simulator Toggle */}
            <button
              onClick={() => setIsMobileFrame(!isMobileFrame)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                isMobileFrame
                  ? 'bg-sky-500 text-white border-sky-600 shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
              title={t('mobileView')}
            >
              <Smartphone className="w-4 h-4" />
              <span className="hidden md:inline">
                {isMobileFrame ? t('fullView') : t('mobileView')}
              </span>
            </button>

            {/* Admin Studio Button (Strictly only visible if logged-in user is an administrator) */}
            {user?.role === 'admin' && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'admin'
                    ? 'bg-[#2B7FE0] text-white border-[#2B7FE0] shadow-sm'
                    : 'bg-sky-50 text-[#2B7FE0] border-sky-200 hover:bg-sky-100'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{t('editStudio')}</span>
              </button>
            )}

            {user && (
              <>
                {!isExpired ? (
                  <div 
                    onClick={() => setActiveTab('profile')}
                    className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 px-2.5 py-1.5 rounded-full text-emerald-800 text-xs font-medium cursor-pointer transition-all"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span className="hidden lg:inline font-semibold">{t('activeSub')}</span>
                    <span className="text-emerald-700 font-bold hidden sm:inline">{timeRemainingFormatted}</span>
                  </div>
                ) : (
                  <button
                    onClick={() => setActiveTab('plans')}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{t('activateSub')}</span>
                  </button>
                )}

                {/* Account / User Menu Button */}
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                    activeTab === 'profile'
                      ? 'bg-sky-50 border-[#2B7FE0] text-[#2B7FE0]'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-sky-50/60'
                  }`}
                >
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.full_name}
                      className="w-7 h-7 rounded-lg object-cover ring-2 ring-sky-200"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-sky-100 flex items-center justify-center text-[#2B7FE0]">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                  <span className="hidden xl:inline font-semibold max-w-[100px] truncate">
                    {user.full_name}
                  </span>
                </button>
              </>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};

