import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { LoginScreen } from './components/LoginScreen';
import { HomeView } from './views/HomeView';
import { LibraryView } from './views/LibraryView';
import { PlansView } from './views/PlansView';
import { ProfileView } from './views/ProfileView';
import { CourseDetailView } from './views/CourseDetailView';
import { VideoPlayer } from './components/VideoPlayer';
import { AdminView } from './views/AdminView';
import { Wifi, Battery, Signal } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeTab, selectedCourse, selectedLesson, setSelectedLesson, isMobileFrame, isLoggedIn, language } = useAuth();

  const isRtl = language !== 'en';

  if (!isLoggedIn) {
    if (isMobileFrame) {
      return (
        <div className={`min-h-screen bg-slate-900 flex flex-col items-center justify-center p-2 sm:p-6 text-[#1A1A1A] font-sans antialiased ${isRtl ? 'dir-rtl' : 'dir-ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
          <div className="w-full max-w-[420px] bg-white rounded-[44px] border-[10px] border-slate-800 shadow-2xl overflow-hidden flex flex-col h-[88vh] max-h-[850px] relative ring-1 ring-white/10 my-auto">
            {/* Smartphone Notch / Top Bar */}
            <div className="bg-slate-900 text-white text-[10px] px-6 py-1.5 flex items-center justify-between shrink-0 z-50">
              <span className="font-bold">09:41</span>
              <div className="w-20 h-4 bg-black rounded-full mx-auto -mt-1 shadow-inner flex items-center justify-center">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-700" />
              </div>
              <div className="flex items-center gap-1 text-slate-300">
                <Signal className="w-3 h-3" />
                <Wifi className="w-3 h-3" />
                <Battery className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar">
              <LoginScreen />
            </div>

            {/* Home Bar Indicator */}
            <div className="bg-white py-1 flex justify-center shrink-0 border-t border-slate-100 z-50">
              <div className="w-32 h-1 bg-slate-300 rounded-full" />
            </div>
          </div>
        </div>
      );
    }

    return <LoginScreen />;
  }

  const renderViews = () => (
    <>
      {activeTab === 'home' && <HomeView />}
      {activeTab === 'library' && <LibraryView />}
      {activeTab === 'plans' && <PlansView />}
      {activeTab === 'profile' && <ProfileView />}
      {activeTab === 'course_detail' && <CourseDetailView />}
      {activeTab === 'admin' && <AdminView />}
      {activeTab === 'video_player' && selectedCourse && selectedLesson && (
        <VideoPlayer
          course={selectedCourse}
          lesson={selectedLesson}
          onSelectLesson={(l) => setSelectedLesson(l)}
        />
      )}
    </>
  );

  if (isMobileFrame) {
    return (
      <div className={`min-h-screen bg-slate-900 flex flex-col items-center justify-center p-2 sm:p-6 text-[#1A1A1A] font-sans antialiased ${isRtl ? 'dir-rtl' : 'dir-ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="w-full max-w-[420px] bg-white rounded-[44px] border-[10px] border-slate-800 shadow-2xl overflow-hidden flex flex-col h-[88vh] max-h-[850px] relative ring-1 ring-white/10 my-auto">
          {/* Smartphone Notch / Top Bar */}
          <div className="bg-slate-900 text-white text-[10px] px-6 py-1.5 flex items-center justify-between shrink-0 z-50">
            <span className="font-bold">09:41</span>
            <div className="w-20 h-4 bg-black rounded-full mx-auto -mt-1 shadow-inner flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-700" />
            </div>
            <div className="flex items-center gap-1 text-slate-300">
              <Signal className="w-3 h-3" />
              <Wifi className="w-3 h-3" />
              <Battery className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* App Header Inside Phone */}
          <Header />

          {/* Phone Screen Scrollable Area */}
          <div className="flex-1 overflow-y-auto px-3 pt-4 pb-24 bg-[#F4F8FD] no-scrollbar">
            {renderViews()}
          </div>

          {/* Fixed Bottom Nav Inside Phone */}
          <BottomNav />

          {/* Home Bar Indicator */}
          <div className="bg-white py-1 flex justify-center shrink-0 border-t border-slate-100 z-50">
            <div className="w-32 h-1 bg-slate-300 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-[#F4F8FD] text-[#1A1A1A] font-sans antialiased selection:bg-sky-200 selection:text-[#1E5BB0] pb-24 ${isRtl ? 'dir-rtl' : 'dir-ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Main Top Header */}
      <Header />

      {/* Main App Canvas */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {renderViews()}
      </main>

      {/* Fixed Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}
