import React, { useState, useEffect } from 'react';
import {
  AVATAR_PRESETS,
  GRADE_OPTIONS,
  POPULAR_SCHOOLS,
  updateUserProfile,
  getUserProfileStats
} from '../lib/profileService';
import {
  User,
  Phone,
  School,
  GraduationCap,
  Sparkles,
  Camera,
  CheckCircle2,
  Trophy,
  Flame,
  BookOpen,
  Gamepad2,
  Upload,
  RefreshCw,
  Heart,
  ShieldCheck,
  Award,
  ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';

export const ProfilePage = ({ userProfile, onProfileUpdated }) => {
  const [activeTab, setActiveTab] = useState('info'); // 'info' | 'avatar' | 'stats'

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [className, setClassName] = useState('');
  const [gradeLevel, setGradeLevel] = useState('Lớp 1');
  const [bio, setBio] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');

  // Stats & States
  const [stats, setStats] = useState(null);
  const [customAvatarInput, setCustomAvatarInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (userProfile) {
      setFullName(userProfile.full_name || '');
      setAvatarUrl(userProfile.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=student');
      setPhoneNumber(userProfile.phone_number || '');
      setSchoolName(userProfile.school_name || 'Tiểu học Chu Văn An');
      setClassName(userProfile.class_name || '1A1');
      setGradeLevel(userProfile.grade_level || 'Lớp 1');
      setBio(userProfile.bio || '');
      setParentName(userProfile.parent_name || '');
      setParentPhone(userProfile.parent_phone || '');
    }

    if (userProfile?.id) {
      getUserProfileStats(userProfile.id).then(setStats);
    }
  }, [userProfile]);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrorMessage('Dung lượng ảnh tối đa là 2MB!');
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setAvatarUrl(uploadEvent.target.result);
          setErrorMessage('');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRandomizeAvatar = () => {
    const randomSeed = Math.random().toString(36).substring(2, 8);
    const styles = ['bottts', 'adventurer', 'lorelei'];
    const randomStyle = styles[Math.floor(Math.random() * styles.length)];
    setAvatarUrl(`https://api.dicebear.com/7.x/${randomStyle}/svg?seed=${randomSeed}`);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMessage('Vui lòng nhập Họ và Tên!');
      return;
    }

    setIsSaving(true);
    setErrorMessage('');
    setSaveSuccess(false);

    try {
      const updated = await updateUserProfile({
        ...userProfile,
        full_name: fullName.trim(),
        avatar_url: avatarUrl,
        phone_number: phoneNumber.trim(),
        school_name: schoolName.trim(),
        class_name: className.trim(),
        grade_level: gradeLevel,
        bio: bio.trim(),
        parent_name: parentName.trim(),
        parent_phone: parentPhone.trim()
      });

      setSaveSuccess(true);
      if (onProfileUpdated) {
        onProfileUpdated(updated);
      }

      try {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (_) {}

      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err) {
      setErrorMessage(err.message || 'Lỗi khi cập nhật hồ sơ cá nhân!');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 font-sans animate-fade-in">
      
      {/* Top Banner Profile Hero */}
      <div className="bg-gradient-to-r from-[#FF6600] via-orange-500 to-amber-500 text-white p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        
        <div className="flex items-center gap-5 z-10">
          <div className="relative group">
            <img
              src={avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=student'}
              alt="Avatar"
              className="w-20 h-20 sm:w-24 sm:w-24 rounded-3xl bg-white border-4 border-white/90 shadow-2xl object-cover"
            />
            <button
              onClick={() => setActiveTab('avatar')}
              className="absolute -bottom-1 -right-1 bg-white text-orange-600 p-2 rounded-2xl shadow-lg hover:bg-orange-100 transition transform hover:scale-110"
              title="Đổi ảnh đại diện"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-white/25 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                {userProfile?.role === 'teacher'
                  ? 'GIÁO VIÊN 👩‍🏫'
                  : userProfile?.role === 'admin'
                  ? 'QUẢN TRỊ VIÊN 🛡️'
                  : 'HỌC SINH TIỂU HỌC 🎒'}
              </span>
              <span className="text-xs font-bold text-orange-100">
                {className ? `Lớp ${className}` : gradeLevel} • {schoolName || 'Tiểu học Chu Văn An'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black">
              {fullName || userProfile?.email || 'Hồ Sơ Cá Nhân'}
            </h1>
            <p className="text-xs sm:text-sm text-orange-100 font-medium mt-1">
              {userProfile?.email}
            </p>
          </div>
        </div>

        {/* Quick Stats Pill */}
        <div className="bg-white/15 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center flex sm:flex-col items-center gap-4 sm:gap-1 z-10">
          <span className="text-xs font-bold text-orange-100">Điểm Tích Lũy</span>
          <span className="text-2xl font-black text-white">{stats?.totalXp || 450} XP</span>
          <span className="text-[11px] font-extrabold text-yellow-300 bg-white/20 px-2 py-0.5 rounded-full">
            {stats?.rankTitle || 'Ngôi Sao Tri Thức ⭐'}
          </span>
        </div>

      </div>

      {/* Navigation Tab Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {[
          { id: 'info', label: 'Thông Tin Cá Nhân 📝', icon: User },
          { id: 'avatar', label: 'Bộ Sưu Tập Avatar 🎨', icon: Camera },
          { id: 'stats', label: 'Bảng Thành Tích & XP 🏆', icon: Trophy }
        ].map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 rounded-2xl font-black text-xs sm:text-sm transition-all whitespace-nowrap shadow-sm ${
                isSelected
                  ? 'bg-gradient-to-r from-[#FF6600] to-amber-500 text-white shadow-orange-200 shadow-md scale-105'
                  : 'bg-white text-gray-700 hover:bg-orange-50 border border-gray-200'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-orange-100 shadow-md">
        
        {/* TAB 1: FORM THÔNG TIN CÁ NHÂN */}
        {activeTab === 'info' && (
          <form onSubmit={handleSaveProfile} className="space-y-6 max-w-3xl">
            
            <div className="border-b border-gray-100 pb-4">
              <h3 className="text-lg font-black text-gray-800 flex items-center gap-2">
                <User className="w-5 h-5 text-orange-600" />
                <span>Cập Nhật Thông Tin Hồ Sơ</span>
              </h3>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                Thông tin này sẽ được đồng bộ vào Cơ sở dữ liệu Supabase và hiển thị trong danh sách lớp học.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              <div>
                <label className="block text-xs font-black text-gray-700 mb-1">
                  Họ và Tên *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ví dụ: Bé Minh Triết"
                    className="w-full bg-gray-50 border-2 border-gray-200 focus:border-orange-500 rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold focus:outline-none transition"
                    required
                  />
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-700 mb-1">
                  Số Điện Thoại Liên Hệ
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Ví dụ: 0987654321"
                    className="w-full bg-gray-50 border-2 border-gray-200 focus:border-orange-500 rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold focus:outline-none transition"
                  />
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                </div>
              </div>

            </div>

            {/* Trường học & Khối lớp */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              <div className="sm:col-span-2">
                <label className="block text-xs font-black text-gray-700 mb-1">
                  Trường Học
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    placeholder="Nhập tên trường học..."
                    list="schools-list"
                    className="w-full bg-gray-50 border-2 border-gray-200 focus:border-orange-500 rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold focus:outline-none transition"
                  />
                  <School className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <datalist id="schools-list">
                    {POPULAR_SCHOOLS.map((s, idx) => (
                      <option key={idx} value={s} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-700 mb-1">
                  Khối Lớp
                </label>
                <select
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-gray-200 focus:border-orange-500 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none transition"
                >
                  {GRADE_OPTIONS.map((g, idx) => (
                    <option key={idx} value={g}>{g}</option>
                  ))}
                </select>
              </div>

            </div>

            {/* Lớp & Phụ huynh */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              <div>
                <label className="block text-xs font-black text-gray-700 mb-1">
                  Lớp Học Cụ Thể
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    placeholder="Ví dụ: 1A1, 2B..."
                    className="w-full bg-gray-50 border-2 border-gray-200 focus:border-orange-500 rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold focus:outline-none transition"
                  />
                  <GraduationCap className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-700 mb-1">
                  Họ Tên Phụ Huynh
                </label>
                <input
                  type="text"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  placeholder="Bố hoặc Mẹ của bé..."
                  className="w-full bg-gray-50 border-2 border-gray-200 focus:border-orange-500 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-700 mb-1">
                  SĐT Phụ Huynh
                </label>
                <input
                  type="tel"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  placeholder="SĐT liên hệ khi cần..."
                  className="w-full bg-gray-50 border-2 border-gray-200 focus:border-orange-500 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none transition"
                />
              </div>

            </div>

            {/* Bio */}
            <div>
              <label className="block text-xs font-black text-gray-700 mb-1">
                Giới Thiệu Bản Thân & Mục Tiêu Học Tập (Bio)
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Chia sẻ sở thích, ước mơ hoặc mục tiêu học tập của bé..."
                className="w-full bg-gray-50 border-2 border-gray-200 focus:border-orange-500 rounded-xl p-3 text-xs font-medium focus:outline-none transition"
              />
            </div>

            {errorMessage && (
              <p className="text-xs font-bold text-red-600 bg-red-50 p-3 rounded-xl border border-red-200">
                ⚠️ {errorMessage}
              </p>
            )}

            {saveSuccess && (
              <p className="text-xs font-black text-emerald-600 bg-emerald-50 p-3 rounded-xl border border-emerald-200 flex items-center gap-2 animate-bounce-slow">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Đã lưu thành công hồ sơ cá nhân và đồng bộ CSDL Supabase! 🎉</span>
              </p>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="bg-gradient-to-r from-[#FF6600] to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 text-white font-black text-sm px-8 py-3.5 rounded-2xl shadow-lg kid-btn transition flex items-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>{isSaving ? 'Đang lưu vào CSDL...' : 'Lưu Thay Đổi & Đồng Bộ CSDL'}</span>
              </button>

              <Link
                to="/"
                className="px-5 py-3.5 rounded-2xl border border-gray-200 font-bold text-xs text-gray-600 hover:bg-gray-100 transition"
              >
                Quay Lại Trang Chủ
              </Link>
            </div>

          </form>
        )}

        {/* TAB 2: ĐỔI AVATAR */}
        {activeTab === 'avatar' && (
          <div className="space-y-6 max-w-4xl">
            
            <div className="bg-orange-50 p-5 rounded-3xl border border-orange-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={avatarUrl}
                  alt="Active Avatar"
                  className="w-20 h-20 rounded-2xl bg-white border-2 border-orange-400 shadow-md object-cover"
                />
                <div>
                  <h4 className="font-extrabold text-sm text-gray-800">
                    Ảnh Đại Diện Đang Được Chọn
                  </h4>
                  <p className="text-xs text-gray-500">
                    Hình ảnh này sẽ đại diện cho bạn trên Bảng Xếp Hạng toàn trường và các cuộc thi!
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRandomizeAvatar}
                  className="bg-white hover:bg-orange-100 text-orange-700 border border-orange-300 px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition shadow-sm"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Đổi Ngẫu Nhiên</span>
                </button>

                <label className="cursor-pointer bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 shadow-sm transition">
                  <Upload className="w-4 h-4" />
                  <span>Tải Ảnh Từ Máy</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Preset Avatars */}
            <div className="space-y-4">
              <h3 className="font-black text-sm text-gray-800 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-orange-500" />
                <span>Chọn Nhanh Từ Bộ Sưu Tập Avatar Vui Nhộn:</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {AVATAR_PRESETS.map((preset) => {
                  const isSelected = avatarUrl === preset.url;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setAvatarUrl(preset.url)}
                      className={`p-3 rounded-2xl border-2 transition transform hover:scale-105 flex flex-col items-center gap-2 ${
                        isSelected
                          ? 'bg-orange-50 border-orange-500 shadow-md ring-2 ring-orange-400'
                          : 'bg-gray-50 border-gray-200 hover:border-orange-300'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="w-16 h-16 rounded-xl bg-white shadow-inner"
                      />
                      <span className="text-[11px] font-bold text-gray-700 text-center line-clamp-1">
                        {preset.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom URL */}
            <div className="pt-4 border-t border-gray-100">
              <label className="block text-xs font-bold text-gray-600 mb-1">
                Hoặc Nhập Đường Dẫn URL Hình Ảnh Của Bạn:
              </label>
              <div className="flex items-center gap-2 max-w-md">
                <input
                  type="url"
                  value={customAvatarInput}
                  onChange={(e) => setCustomAvatarInput(e.target.value)}
                  placeholder="https://..."
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customAvatarInput.trim()) {
                      setAvatarUrl(customAvatarInput.trim());
                      setCustomAvatarInput('');
                    }
                  }}
                  className="bg-gray-800 text-white font-bold text-xs px-4 py-2 rounded-xl"
                >
                  Áp Dụng
                </button>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="button"
                onClick={() => setActiveTab('info')}
                className="bg-orange-600 text-white font-black text-xs px-6 py-3 rounded-xl shadow kid-btn"
              >
                Xác Nhận Ảnh & Quay Lại Lưu Hồ Sơ ➔
              </button>
            </div>

          </div>
        )}

        {/* TAB 3: THÀNH TÍCH & XP */}
        {activeTab === 'stats' && (
          <div className="space-y-6 max-w-4xl animate-fade-in">
            
            <div className="bg-gradient-to-r from-amber-500 to-yellow-400 p-8 rounded-3xl text-white shadow-lg flex items-center justify-between">
              <div>
                <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-black uppercase">
                  DANH HIỆU CAO QUÝ
                </span>
                <h2 className="text-2xl sm:text-3xl font-black mt-1">
                  {stats?.rankTitle || 'Ngôi Sao Sáng Tri Thức ⭐'}
                </h2>
                <p className="text-xs sm:text-sm text-yellow-100 font-medium mt-1">
                  Tích lũy XP qua việc hoàn thành các bài học SGK, thi đấu mini game và nhận điểm thưởng từ thầy cô!
                </p>
              </div>
              <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center text-4xl shadow">
                🏆
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              
              <div className="bg-orange-50 p-5 rounded-3xl border border-orange-200 text-center">
                <Flame className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <span className="text-2xl font-black text-orange-700 block">
                  {stats?.totalXp || 450} XP
                </span>
                <span className="text-xs font-bold text-gray-500">Tổng Điểm XP</span>
              </div>

              <div className="bg-amber-50 p-5 rounded-3xl border border-amber-200 text-center">
                <Trophy className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <span className="text-2xl font-black text-yellow-800 block">
                  TOP #{stats?.rank || 1}
                </span>
                <span className="text-xs font-bold text-gray-500">Xếp Hạng Trường</span>
              </div>

              <div className="bg-emerald-50 p-5 rounded-3xl border border-emerald-200 text-center">
                <BookOpen className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <span className="text-2xl font-black text-emerald-800 block">
                  {stats?.completedLessons || 12}
                </span>
                <span className="text-xs font-bold text-gray-500">Bài Học Hoàn Thành</span>
              </div>

              <div className="bg-purple-50 p-5 rounded-3xl border border-purple-200 text-center">
                <Gamepad2 className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <span className="text-2xl font-black text-purple-800 block">
                  {stats?.gamesPlayed || 18}
                </span>
                <span className="text-xs font-bold text-gray-500">Game Đã Tham Gia</span>
              </div>

            </div>

            {/* Bộ Huy Hiệu */}
            <div className="bg-gray-50 p-6 rounded-3xl border border-gray-200 space-y-3">
              <h4 className="font-black text-sm text-gray-800 flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-600" />
                <span>Bộ Sưu Tập Huy Hiệu Vinh Danh ({stats?.badgesCount || 5}):</span>
              </h4>

              <div className="flex flex-wrap gap-2.5">
                {[
                  { label: 'Ong Vàng Chăm Chỉ 🐝', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
                  { label: 'Thần Tốc Bảng Nhân ⚡', color: 'bg-orange-100 text-orange-800 border-orange-200' },
                  { label: 'Focus Guardian 🛡️', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
                  { label: 'Bạn Thân Của AI 🦉', color: 'bg-blue-100 text-blue-800 border-blue-200' },
                  { label: 'Vua Đấu Trường 👑', color: 'bg-purple-100 text-purple-800 border-purple-200' }
                ].map((b, idx) => (
                  <span
                    key={idx}
                    className={`px-4 py-2 rounded-2xl text-xs font-black border shadow-sm ${b.color}`}
                  >
                    {b.label}
                  </span>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};

export default ProfilePage;
