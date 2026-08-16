import React from 'react';
import { Home, BookOpen, CreditCard, User, Edit3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ActiveTab } from '../types';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, isExpired, t, language } = useAuth();

  const isRtl = language !== 'en';

  const navItems: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }>; badge?: string }[] = [
    { id: 'home', label: t('navHome'), icon: Home },
    { id: 'library', label: t('navLibrary'), icon: BookOpen },
    { id: 'admin', label: t('editStudio'), icon: Edit3 },
    { id: 'plans', label: t('navPlans'), icon: CreditCard },
    { id: 'profile', label: t('navProfile'), icon: User },
  ];

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-sky-100 shadow-lg ${isRtl ? 'dir-rtl' : 'dir-ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="max-w-md mx-auto px-4 py-2">
        <nav className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id || (item.id === 'library' && (activeTab === 'course_detail' || activeTab === 'video_player'));

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex flex-col items-center py-1.5 px-3 rounded-2xl transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'text-[#2B7FE0] font-bold bg-sky-50 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-[#2B7FE0]' : ''}`} />
                  {item.badge && (
                    <span className="absolute -top-1.5 -right-2.5 bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[11px] mt-1 font-medium tracking-tight">
                  {item.label}
                </span>
                {isActive && (
                  <span className="absolute bottom-0 w-6 h-1 bg-[#2B7FE0] rounded-full" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
