import React, { useState, useEffect } from 'react';
import {
  AVATAR_PRESETS,
  GRADE_OPTIONS,
  POPULAR_SCHOOLS,
  updateUserProfile,
  getUserProfileStats
} from '../lib/profileService';
import {
  X,
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
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ProfileModal = ({ isOpen, onClose, userProfile, onProfileUpdated }) => {
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
  }, [userProfile, isOpen]);

  if (!isOpen) return null;

  // Xử lý tải ảnh đại diện từ máy tính / điện thoại
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

  // Tạo avatar ngẫu nhiên theo tên
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
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch (_) {}

      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      setErrorMessage(err.message || 'Lỗi khi cập nhật hồ sơ cá nhân!');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in font-sans">
      <div className="bg-white rounded-3xl max-w-2xl w-full border-4 border-orange-300 shadow-2xl overflow-hidden relative max-h-[92vh] flex flex-col">
        
        {/* Top Header */}
        <div className="bg-gradient-to-r from-[#FF6600] to-amber-500 p-6 text-white relative flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white rounded-full p-1.5 transition"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="relative group">
              <img
                src={avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=student'}
                alt="Avatar"
                className="w-16 h-16 rounded-2xl bg-white border-2 border-white/80 shadow-md object-cover"
              />
              <button
                type="button"
                onClick={() => setActiveTab('avatar')}
                className="absolute -bottom-1 -right-1 bg-white text-orange-600 p-1 rounded-full shadow hover:bg-orange-100 transition"
                title="Đổi ảnh đại diện"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="bg-white/25 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                  {userProfile?.role === 'teacher'
                    ? 'GIÁO VIÊN 👩‍🏫'
                    : userProfile?.role === 'admin'
                    ? 'QUẢN TRỊ VIÊN 🛡️'
                    : 'HỌC SINH TIỂU HỌC 🎒'}
                </span>
                <span className="text-xs font-bold text-orange-100">
                  {schoolName || 'Trường Tiểu học'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black mt-0.5">
                {fullName || userProfile?.email || 'Hồ Sơ Của Bạn'}
              </h2>
              <p className="text-xs text-orange-100 font-medium truncate max-w-md">
                {userProfile?.email}
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/20">
            <button
              onClick={() => setActiveTab('info')}
              className={`px-4 py-1.5 rounded-xl text-xs font-black transition ${
                activeTab === 'info'
                  ? 'bg-white text-orange-600 shadow'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <User className="w-3.5 h-3.5 inline mr-1" />
              Thông Tin Cá Nhân
            </button>

            <button
              onClick={() => setActiveTab('avatar')}
              className={`px-4 py-1.5 rounded-xl text-xs font-black transition ${
                activeTab === 'avatar'
                  ? 'bg-white text-orange-600 shadow'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <Camera className="w-3.5 h-3.5 inline mr-1" />
              Đổi Ảnh Đại Diện
            </button>

            <button
              onClick={() => setActiveTab('stats')}
              className={`px-4 py-1.5 rounded-xl text-xs font-black transition ${
                activeTab === 'stats'
                  ? 'bg-white text-orange-600 shadow'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 inline mr-1 text-yellow-300" />
              Thành Tích & XP
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: THÔNG TIN CÁ NHÂN */}
          {activeTab === 'info' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Họ và Tên */}
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

                {/* Số điện thoại */}
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

              {/* Trường học & Lớp */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                
                {/* Trường học */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-black text-gray-700 mb-1">
                    Trường Tiểu Học
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      placeholder="Tên trường tiểu học..."
                      list="school-suggestions"
                      className="w-full bg-gray-50 border-2 border-gray-200 focus:border-orange-500 rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold focus:outline-none transition"
                    />
                    <School className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <datalist id="school-suggestions">
                      {POPULAR_SCHOOLS.map((s, idx) => (
                        <option key={idx} value={s} />
                      ))}
                    </datalist>
                  </div>
                </div>

                {/* Khối Lớp */}
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

              {/* Lớp học & Thông tin phụ huynh */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                
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
                    placeholder="Bố/Mẹ của bé..."
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
                    placeholder="SĐT liên hệ..."
                    className="w-full bg-gray-50 border-2 border-gray-200 focus:border-orange-500 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none transition"
                  />
                </div>

              </div>

              {/* Tiểu sử & Giới thiệu */}
              <div>
                <label className="block text-xs font-black text-gray-700 mb-1">
                  Mục Tiêu Học Tập / Lời Nhắn Bản Thân (Bio)
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Chia sẻ sở thích, môn học yêu thích hoặc lời hứa chăm ngoan..."
                  className="w-full bg-gray-50 border-2 border-gray-200 focus:border-orange-500 rounded-xl p-3 text-xs font-medium focus:outline-none transition"
                />
              </div>

              {errorMessage && (
                <p className="text-xs font-bold text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200">
                  ⚠️ {errorMessage}
                </p>
              )}

              {saveSuccess && (
                <p className="text-xs font-black text-emerald-600 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 flex items-center gap-1.5 animate-bounce-slow">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Đã cập nhật hồ sơ cá nhân và đồng bộ CSDL thành công! 🎉</span>
                </p>
              )}

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 font-bold text-xs text-gray-600 hover:bg-gray-100 transition"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-gradient-to-r from-[#FF6600] to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 text-white font-black text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-md kid-btn transition flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSaving ? 'Đang lưu CSDL...' : 'Lưu Thay Đổi & Đồng Bộ'}</span>
                </button>
              </div>

            </form>
          )}

          {/* TAB 2: ĐỔI ẢNH ĐẠI DIỆN */}
          {activeTab === 'avatar' && (
            <div className="space-y-6">
              
              {/* Preview Avatar Hiện Tại */}
              <div className="bg-orange-50/60 p-4 rounded-2xl border border-orange-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={avatarUrl}
                    alt="Active Avatar"
                    className="w-16 h-16 rounded-2xl bg-white border-2 border-orange-300 shadow-md object-cover"
                  />
                  <div>
                    <h4 className="font-extrabold text-xs text-gray-800">
                      Ảnh Đại Diện Đang Chọn
                    </h4>
                    <p className="text-[11px] text-gray-500">
                      Hiển thị trên Bảng Xếp Hạng, Khung Chat AI và Bài Thi.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRandomizeAvatar}
                    className="bg-white hover:bg-orange-100 text-orange-700 border border-orange-300 px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition shadow-sm"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Ngẫu Nhiên</span>
                  </button>

                  <label className="cursor-pointer bg-orange-600 hover:bg-orange-700 text-white px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm transition">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Tải Ảnh Lên</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Danh sách Avatar mẫu theo nhóm */}
              <div className="space-y-4">
                <h4 className="font-black text-xs text-gray-700 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-orange-500" />
                  <span>Bộ Sưu Tập Avatar Đáng Yêu Dành Cho Bạn:</span>
                </h4>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {AVATAR_PRESETS.map((preset) => {
                    const isSelected = avatarUrl === preset.url;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setAvatarUrl(preset.url)}
                        className={`p-2.5 rounded-2xl border-2 transition transform hover:scale-105 flex flex-col items-center gap-1.5 ${
                          isSelected
                            ? 'bg-orange-50 border-orange-500 shadow-md ring-2 ring-orange-400'
                            : 'bg-gray-50 border-gray-200 hover:border-orange-300'
                        }`}
                      >
                        <img
                          src={preset.url}
                          alt={preset.label}
                          className="w-12 h-12 rounded-xl bg-white shadow-inner"
                        />
                        <span className="text-[10px] font-bold text-gray-600 text-center line-clamp-1">
                          {preset.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Image URL */}
              <div className="pt-2 border-t border-gray-100">
                <label className="block text-[11px] font-bold text-gray-500 mb-1">
                  Hoặc Dán Đường Dẫn URL Ảnh Bất Kỳ:
                </label>
                <div className="flex items-center gap-2">
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
                    className="bg-gray-800 text-white font-bold text-xs px-3 py-2 rounded-xl"
                  >
                    Áp Dụng
                  </button>
                </div>
              </div>

              {/* Nút Hoàn tất */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('info')}
                  className="bg-orange-600 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow kid-btn"
                >
                  Xác Nhận Ảnh & Quay Lại Hồ Sơ ➔
                </button>
              </div>

            </div>
          )}

          {/* TAB 3: THÀNH TÍCH & XP */}
          {activeTab === 'stats' && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Huy Hiệu & Danh Hiệu Lớn */}
              <div className="bg-gradient-to-r from-amber-500 to-yellow-400 p-6 rounded-3xl text-white shadow-lg flex items-center justify-between">
                <div>
                  <span className="bg-white/20 px-3 py-0.5 rounded-full text-[10px] font-black uppercase">
                    DANH HIỆU HIỆN TẠI
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black mt-1">
                    {stats?.rankTitle || 'Ngôi Sao Sáng Tri Thức ⭐'}
                  </h3>
                  <p className="text-xs text-yellow-100 font-medium mt-0.5">
                    Tích lũy XP qua các bài tập SGK, giải câu đố và mini game.
                  </p>
                </div>
                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl shadow">
                  🏆
                </div>
              </div>

              {/* Thẻ Thống Kê 4 Ô */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                
                <div className="bg-orange-50 p-4 rounded-2xl border border-orange-200 text-center">
                  <Flame className="w-6 h-6 text-orange-500 mx-auto mb-1" />
                  <span className="text-lg font-black text-orange-700 block">
                    {stats?.totalXp || 450} XP
                  </span>
                  <span className="text-[11px] font-bold text-gray-500">Tổng Điểm XP</span>
                </div>

                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-center">
                  <Trophy className="w-6 h-6 text-yellow-600 mx-auto mb-1" />
                  <span className="text-lg font-black text-yellow-800 block">
                    TOP #{stats?.rank || 1}
                  </span>
                  <span className="text-[11px] font-bold text-gray-500">Xếp Hạng</span>
                </div>

                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 text-center">
                  <BookOpen className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
                  <span className="text-lg font-black text-emerald-800 block">
                    {stats?.completedLessons || 12}
                  </span>
                  <span className="text-[11px] font-bold text-gray-500">Bài Hoàn Thành</span>
                </div>

                <div className="bg-purple-50 p-4 rounded-2xl border border-purple-200 text-center">
                  <Gamepad2 className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                  <span className="text-lg font-black text-purple-800 block">
                    {stats?.gamesPlayed || 18}
                  </span>
                  <span className="text-[11px] font-bold text-gray-500">Game Đã Chơi</span>
                </div>

              </div>

              {/* Huy Hiệu Đạt Được */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3">
                <h4 className="font-black text-xs text-gray-700 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-purple-600" />
                  <span>Bộ Huy Hiệu Tích Lũy ({stats?.badgesCount || 5}):</span>
                </h4>

                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'Ong Vàng Chăm Chỉ 🐝', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
                    { label: 'Thần Tốc Bảng Nhân ⚡', color: 'bg-orange-100 text-orange-800 border-orange-200' },
                    { label: 'Focus Guardian 🛡️', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
                    { label: 'Bạn Thân Của AI 🦉', color: 'bg-blue-100 text-blue-800 border-blue-200' },
                    { label: 'Vua Đấu Trường 👑', color: 'bg-purple-100 text-purple-800 border-purple-200' }
                  ].map((b, idx) => (
                    <span
                      key={idx}
                      className={`px-3 py-1.5 rounded-full text-xs font-black border ${b.color}`}
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
    </div>
  );
};

export default ProfileModal;
