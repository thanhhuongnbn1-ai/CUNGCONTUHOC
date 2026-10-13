import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import GradeDetail from './pages/GradeDetail';
import TeacherStudio from './pages/TeacherStudio';
import ProgressAnalytics from './pages/ProgressAnalytics';
import ClassManager from './pages/ClassManager';
import SchedulePage from './pages/SchedulePage';
import GameLibraryPage from './pages/GameLibraryPage';
import LeaderboardPage from './pages/LeaderboardPage';
import AuthModal from './pages/AuthModal';
import XpNotificationToast from './components/XpNotificationToast';
import PwaInstallModal from './components/PwaInstallModal';
import OfflineSyncBanner from './components/OfflineSyncBanner';
import { supabase, isSupabaseConfigured } from './lib/supabase';

export function App() {
  const [userProfile, setUserProfile] = useState({
    id: 'demo-student-id',
    email: 'hocsinh@vuihoc.vn',
    full_name: 'Bé Minh Triết',
    role: 'student',
    avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=student'
  });
  
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPwaModalOpen, setIsPwaModalOpen] = useState(false);

  useEffect(() => {
    const handleOpenPwa = () => setIsPwaModalOpen(true);
    window.addEventListener('open_pwa_install_modal', handleOpenPwa);

    if (!isSupabaseConfigured()) {
      return () => window.removeEventListener('open_pwa_install_modal', handleOpenPwa);
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user.id, session.user.email);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUserProfile(session.user.id, session.user.email);
      } else {
        setUserProfile(null);
      }
    });

    return () => {
      window.removeEventListener('open_pwa_install_modal', handleOpenPwa);
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId, email) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data) {
        setUserProfile(data);
      } else {
        setUserProfile({
          id: userId,
          email,
          role: 'student'
        });
      }
    } catch (err) {
      console.warn('Profile fetch error:', err);
    }
  };

  const handleRoleSwitch = (newRole) => {
    setUserProfile(prev => ({
      ...(prev || { id: 'demo-user', email: 'user@vuihoc.vn', full_name: 'Demo User' }),
      role: newRole
    }));
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    setUserProfile(null);
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-[#FFF9F3] text-gray-800 font-sans selection:bg-orange-200">
        
        {/* PWA Offline Mode & Database Sync Banner */}
        <OfflineSyncBanner />

        <Navbar
          userProfile={userProfile}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onRoleSwitch={handleRoleSwitch}
          onLogout={handleLogout}
          onOpenInstallModal={() => setIsPwaModalOpen(true)}
        />

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onAuthSuccess={(profile) => setUserProfile(profile)}
        />

        {/* PWA Native Installation Modal */}
        <PwaInstallModal
          isOpen={isPwaModalOpen}
          onClose={() => setIsPwaModalOpen(false)}
          userProfile={userProfile}
        />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home userProfile={userProfile} onOpenAuth={() => setIsAuthModalOpen(true)} />} />
            <Route path="/grade/:gradeSlug" element={<GradeDetail userProfile={userProfile} />} />
            <Route path="/games" element={<GameLibraryPage userProfile={userProfile} />} />
            <Route path="/leaderboard" element={<LeaderboardPage userProfile={userProfile} />} />
            <Route path="/ranking" element={<LeaderboardPage userProfile={userProfile} />} />
            <Route path="/schedule" element={<SchedulePage userProfile={userProfile} />} />
            <Route path="/classes" element={<ClassManager userProfile={userProfile} />} />
            <Route path="/teacher-studio" element={<TeacherStudio userProfile={userProfile} />} />
            <Route path="/analytics" element={<ProgressAnalytics userProfile={userProfile} />} />
          </Routes>
        </main>

        {/* Global XP Awarding Toast */}
        <XpNotificationToast />

        <footer className="bg-gray-900 text-gray-400 py-8 px-4 text-center border-t border-gray-800 text-xs font-medium">
          <div className="max-w-6xl mx-auto space-y-2">
            <p className="text-white font-extrabold text-sm">🎓 ĐỒNG HÀNH CÙNG CON TRƯỞNG THÀNH</p>
            <p>Hệ Thống Web App Học Tập & Quản Lý Giáo Dục AI Tiểu Học (Lớp 1 đến Lớp 5) - Hỗ trợ PWA Native & Offline CSDL</p>
            <p className="text-gray-500">Tích hợp Thư viện Game Tương tác, Bảng Xếp Hạng Toàn Trường, JavaScript SDK, Thời khóa biểu & Focus Guardian.</p>
          </div>
        </footer>

      </div>
    </Router>
  );
}

export default App;
