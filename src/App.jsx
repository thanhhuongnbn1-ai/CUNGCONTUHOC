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
import ProfilePage from './pages/ProfilePage';
import AuthModal from './pages/AuthModal';
import ProfileModal from './components/ProfileModal';
import XpNotificationToast from './components/XpNotificationToast';
import PwaInstallModal from './components/PwaInstallModal';
import OfflineSyncBanner from './components/OfflineSyncBanner';
import AiTutorChatWidget from './components/AiTutorChatWidget';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { getInitialUserProfile } from './lib/profileService';

export function App() {
  const [userProfile, setUserProfile] = useState(getInitialUserProfile);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPwaModalOpen, setIsPwaModalOpen] = useState(false);

  useEffect(() => {
    const handleOpenPwa = () => setIsPwaModalOpen(true);
    const handleOpenProfile = () => setIsProfileModalOpen(true);
    const handleProfileUpdated = (e) => {
      if (e.detail?.profile) {
        setUserProfile(e.detail.profile);
      }
    };

    window.addEventListener('open_pwa_install_modal', handleOpenPwa);
    window.addEventListener('open_profile_modal', handleOpenProfile);
    window.addEventListener('user_profile_updated', handleProfileUpdated);

    if (!isSupabaseConfigured()) {
      return () => {
        window.removeEventListener('open_pwa_install_modal', handleOpenPwa);
        window.removeEventListener('open_profile_modal', handleOpenProfile);
        window.removeEventListener('user_profile_updated', handleProfileUpdated);
      };
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
      window.removeEventListener('open_profile_modal', handleOpenProfile);
      window.removeEventListener('user_profile_updated', handleProfileUpdated);
      subscription?.unsubscribe?.();
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
          onOpenProfile={() => setIsProfileModalOpen(true)}
        />

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onAuthSuccess={(profile) => setUserProfile(profile)}
        />

        {/* Quản Lý Hồ Sơ Cá Nhân (Profile Modal) */}
        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          userProfile={userProfile}
          onProfileUpdated={(updatedProfile) => setUserProfile(updatedProfile)}
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
            <Route path="/profile" element={<ProfilePage userProfile={userProfile} onProfileUpdated={(p) => setUserProfile(p)} />} />
          </Routes>
        </main>

        {/* Global XP Awarding Toast */}
        <XpNotificationToast />

        {/* AI Chatbot Trợ Giảng Thông Minh (Floating Góc Màn Hình) */}
        <AiTutorChatWidget userProfile={userProfile} />

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
