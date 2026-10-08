import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { X, Mail, Lock, User, Sparkles, LogIn, UserPlus } from 'lucide-react';

export const AuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    if (!isSupabaseConfigured()) {
      // Fast demo auth login fallback
      const demoUser = {
        id: 'demo-user-1',
        email,
        full_name: fullName || email.split('@')[0],
        role,
        avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${email}`
      };
      onAuthSuccess(demoUser);
      onClose();
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role
            }
          }
        });

        if (error) throw error;
        if (data.user) {
          onAuthSuccess({
            id: data.user.id,
            email: data.user.email,
            full_name: fullName,
            role,
            avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${data.user.id}`
          });
          onClose();
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;
        if (data.user) {
          // Fetch profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          onAuthSuccess(profile || {
            id: data.user.id,
            email: data.user.email,
            role: 'student'
          });
          onClose();
        }
      }
    } catch (err) {
      setErrorMessage(err.message || 'Xác thực thất bại! Hãy thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full border-4 border-orange-300 shadow-2xl overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#FF6600] to-amber-500 p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 rounded-full p-1 transition"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          
          <span className="text-3xl">🎓</span>
          <h3 className="text-2xl font-black mt-1">
            {isSignUp ? 'Đăng Ký Tài Khoản Học Tập' : 'Đăng Nhập Nền Tảng'}
          </h3>
          <p className="text-orange-100 text-xs font-bold mt-1">
            {isSignUp ? 'Tạo tài khoản để lưu trữ tiến độ và trò chuyện với AI Gia sư' : 'Chào mừng em quay trở lại trường học AI!'}
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl text-center">
              {errorMessage}
            </div>
          )}

          {isSignUp && (
            <div>
              <label className="block text-xs font-extrabold text-gray-700 mb-1">Họ và Tên Học Sinh / Giáo Viên</label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn Minh"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-extrabold text-gray-700 mb-1">Địa chỉ Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="emhocsinh@vuihoc.vn"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-gray-700 mb-1">Mật Khẩu</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {isSignUp && (
            <div>
              <label className="block text-xs font-extrabold text-gray-700 mb-1">Đăng Ký Với Vai Trò</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-black text-gray-800"
              >
                <option value="student">Học sinh Tiểu học 🎒</option>
                <option value="teacher">Giáo viên / Phụ huynh 👩‍🏫</option>
                <option value="admin">Quản trị viên Hệ thống 🛡️</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FF6600] hover:bg-orange-600 disabled:opacity-50 text-white font-black text-base py-3.5 rounded-2xl shadow-lg flex items-center justify-center gap-2 kid-btn mt-2"
          >
            {isSignUp ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
            <span>{isSignUp ? 'Đăng Ký Tài Khoản' : 'Đăng Nhập Ngay'}</span>
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrorMessage('');
              }}
              className="text-xs font-black text-orange-600 hover:underline"
            >
              {isSignUp ? 'Đã có tài khoản? Đăng nhập tại đây' : 'Chưa có tài khoản? Đăng ký ngay!'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default AuthModal;
