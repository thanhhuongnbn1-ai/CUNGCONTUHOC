import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Sparkles, MessageCircle, BarChart3, User, LogOut, ShieldCheck, GraduationCap, PlusCircle } from 'lucide-react';

export const Navbar = ({ userProfile, onOpenAuth, onRoleSwitch, onLogout }) => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-30 shadow-md font-sans">
      {/* Top Banner Header inspired by VuiHoc orange header styling */}
      <div className="bg-[#FF6600] text-white px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Logo & Platform Name */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 bg-white rounded-2xl flex items-center justify-center text-[#FF6600] font-black text-2xl shadow-md group-hover:scale-105 transition transform">
              🎓
            </div>
            <div>
              <h1 className="font-black text-xl tracking-tight leading-none text-white drop-shadow-sm flex items-center gap-1.5">
                VUI HỌC - ĐỒNG HÀNH CÙNG CON TRƯỞNG THÀNH
              </h1>
              <p className="text-xs text-orange-100 font-bold tracking-wide mt-0.5">
                Hệ thống Web App Học tập & Quản lý Giáo dục tích hợp AI Tiểu Học
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2 text-sm font-extrabold flex-wrap justify-center">
            <Link
              to="/"
              className={`px-3.5 py-1.5 rounded-full transition flex items-center gap-1.5 ${
                isActive('/') ? 'bg-white text-[#FF6600] shadow' : 'hover:bg-orange-600 text-white'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>TỰ ÔN LUYỆN</span>
            </Link>

            <Link
              to="/grade/lop-1"
              className={`px-3.5 py-1.5 rounded-full transition flex items-center gap-1.5 ${
                location.pathname.startsWith('/grade') ? 'bg-white text-[#FF6600] shadow' : 'hover:bg-orange-600 text-white'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>GÓC HỌC TẬP</span>
            </Link>

            <Link
              to="/teacher-studio"
              className={`px-3.5 py-1.5 rounded-full transition flex items-center gap-1.5 ${
                isActive('/teacher-studio') ? 'bg-white text-[#FF6600] shadow' : 'hover:bg-orange-600 text-white'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>AI CONTENT STUDIO</span>
            </Link>

            <Link
              to="/analytics"
              className={`px-3.5 py-1.5 rounded-full transition flex items-center gap-1.5 ${
                isActive('/analytics') ? 'bg-white text-[#FF6600] shadow' : 'hover:bg-orange-600 text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>TIẾN ĐỘ & VI PHẠM</span>
            </Link>
          </nav>

          {/* Right Action Profile & Role Switcher */}
          <div className="flex items-center gap-2">
            {/* Quick Role Switcher Selector for evaluation */}
            <div className="bg-orange-700/60 p-1 rounded-full flex items-center text-xs font-bold border border-orange-400/50">
              <span className="text-orange-200 px-2 text-[11px] hidden lg:inline">Vai trò:</span>
              <select
                value={userProfile?.role || 'student'}
                onChange={(e) => onRoleSwitch(e.target.value)}
                className="bg-white text-gray-800 rounded-full px-2.5 py-0.5 text-xs font-black cursor-pointer outline-none shadow-sm"
              >
                <option value="student">Học sinh 🎒</option>
                <option value="teacher">Giáo viên 👩‍🏫</option>
                <option value="admin">Quản trị Admin 🛡️</option>
              </select>
            </div>

            {userProfile ? (
              <div className="flex items-center gap-2 bg-orange-700/80 px-3 py-1 rounded-full border border-orange-400/40">
                <img
                  src={userProfile.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=student'}
                  alt="Avatar"
                  className="w-7 h-7 rounded-full bg-white border border-orange-200"
                />
                <span className="text-xs font-black text-white max-w-[100px] truncate">
                  {userProfile.full_name || userProfile.email}
                </span>
                <button
                  onClick={onLogout}
                  className="text-orange-200 hover:text-white ml-1 p-0.5"
                  title="Đăng xuất"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="bg-white text-[#FF6600] hover:bg-orange-50 font-black text-xs px-4 py-1.5 rounded-full shadow-md kid-btn flex items-center gap-1.5"
              >
                <User className="w-4 h-4" />
                <span>Đăng nhập / Đăng ký</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
