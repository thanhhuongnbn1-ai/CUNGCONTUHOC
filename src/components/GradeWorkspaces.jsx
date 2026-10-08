import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ChevronRight, Sparkles, BookOpen, Layers, CheckCircle2 } from 'lucide-react';

export const GradeWorkspaces = ({ onSearchFilter }) => {
  const navigate = useNavigate();
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');

  const gradeCards = [
    {
      id: 'tien-lop-1',
      title: 'Tiền Lớp 1',
      number: '1',
      badge: 'BÉ CHUẨN BỊ VÀO LỚP 1',
      bgColor: 'bg-[#FF5376]',
      borderColor: 'border-[#FF5376]',
      hoverBg: 'hover:bg-[#E04060]',
      lightBg: 'bg-pink-50',
      textColor: 'text-[#FF5376]',
      subjects: ['Toán học', 'Tiếng Việt']
    },
    {
      id: 'lop-1',
      title: 'Lớp 1',
      number: '1',
      badge: 'KHÁM PHÁ TRI THỨC',
      bgColor: 'bg-[#FF9E00]',
      borderColor: 'border-[#FF9E00]',
      hoverBg: 'hover:bg-[#E58E00]',
      lightBg: 'bg-amber-50',
      textColor: 'text-[#FF9E00]',
      subjects: ['Toán học', 'Tiếng Việt', 'Tiếng Anh']
    },
    {
      id: 'lop-2',
      title: 'Lớp 2',
      number: '2',
      badge: 'MỞ RỘNG TƯ DUY',
      bgColor: 'bg-[#2B82C9]',
      borderColor: 'border-[#2B82C9]',
      hoverBg: 'hover:bg-[#206CA8]',
      lightBg: 'bg-sky-50',
      textColor: 'text-[#2B82C9]',
      subjects: ['Toán học', 'Tiếng Việt', 'Tiếng Anh']
    },
    {
      id: 'lop-3',
      title: 'Lớp 3',
      number: '3',
      badge: 'RÈN LUYỆN KỸ NĂNG',
      bgColor: 'bg-[#10B981]',
      borderColor: 'border-[#10B981]',
      hoverBg: 'hover:bg-[#0D9668]',
      lightBg: 'bg-emerald-50',
      textColor: 'text-[#10B981]',
      subjects: ['Toán học', 'Tiếng Việt', 'Tiếng Anh']
    },
    {
      id: 'lop-4',
      title: 'Lớp 4',
      number: '4',
      badge: 'BỨC PHÁ ĐIỂM SỐ',
      bgColor: 'bg-[#059669]',
      borderColor: 'border-[#059669]',
      hoverBg: 'hover:bg-[#047857]',
      lightBg: 'bg-teal-50',
      textColor: 'text-[#059669]',
      subjects: ['Toán học', 'Tiếng Việt', 'Tiếng Anh']
    },
    {
      id: 'lop-5',
      title: 'Lớp 5',
      number: '5',
      badge: 'VỮNG VÀNG CHUYỂN CẤP',
      bgColor: 'bg-[#9333EA]',
      borderColor: 'border-[#9333EA]',
      hoverBg: 'hover:bg-[#7E22CE]',
      lightBg: 'bg-purple-50',
      textColor: 'text-[#9333EA]',
      subjects: ['Toán học', 'Tiếng Việt', 'Tiếng Anh']
    }
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const targetGrade = selectedGrade || 'lop-1';
    navigate(`/grade/${targetGrade}?subject=${encodeURIComponent(selectedSubject)}&q=${encodeURIComponent(searchKeyword)}`);
  };

  return (
    <section className="py-8 px-4 max-w-7xl mx-auto">
      {/* Title Header */}
      <div className="text-center mb-8">
        <span className="bg-orange-100 text-orange-700 font-extrabold text-xs px-4 py-1.5 rounded-full inline-flex items-center gap-1.5 uppercase tracking-wider mb-2 border border-orange-200 shadow-sm">
          <Sparkles className="w-4 h-4 text-orange-500 fill-current" />
          Cấu trúc Thư Mục Học Tập Phân Cấp (Grade Workspaces)
        </span>
        <h2 className="text-3xl sm:text-4xl font-black text-gray-800 tracking-tight">
          Chọn Khối Lớp & Môn Học Ưa Thích Để Bắt Đầu!
        </h2>
        <p className="text-gray-600 font-medium text-base mt-1 max-w-2xl mx-auto">
          Môi trường tương tác game, câu chuyện cổ tích và bài tập tự học chuyển đổi từ SGK tích hợp AI Gia sư
        </p>
      </div>

      {/* Grid of 6 Grade Workspaces matching VuiHoc design */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
        {gradeCards.map((grade) => (
          <div
            key={grade.id}
            className={`rounded-3xl border-2 ${grade.borderColor} bg-white overflow-hidden shadow-lg hover:shadow-2xl transition transform hover:-translate-y-1 flex flex-col`}
          >
            {/* Top Grade Header Card */}
            <Link
              to={`/grade/${grade.id}`}
              className={`${grade.bgColor} text-white p-5 text-center flex flex-col items-center justify-center relative group min-h-[140px]`}
            >
              <span className="text-xs font-black opacity-90 tracking-wide uppercase">
                {grade.title.startsWith('Tiền') ? 'TIỀN LỚP' : 'LỚP HỌC'}
              </span>
              <span className="text-5xl font-black leading-none my-1 drop-shadow">
                {grade.number}
              </span>
              <span className="text-[11px] font-extrabold bg-white/20 px-2 py-0.5 rounded-full mt-1">
                {grade.title}
              </span>
            </Link>

            {/* Subject Links List */}
            <div className="p-3 flex-1 flex flex-col justify-between space-y-2 bg-white">
              {grade.subjects.map((sub, idx) => (
                <Link
                  key={idx}
                  to={`/grade/${grade.id}?subject=${encodeURIComponent(sub)}`}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl border border-gray-100 bg-gray-50 hover:bg-orange-50 hover:border-orange-300 text-gray-800 font-bold text-sm transition group"
                >
                  <span className="group-hover:text-orange-600 transition">{sub}</span>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-orange-500 group-hover:translate-x-0.5 transition" />
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Search & Filter Bar matching reference image bottom bar */}
      <div className="bg-gradient-to-r from-sky-400 via-sky-500 to-blue-500 rounded-3xl p-4 sm:p-6 shadow-xl text-white">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-center gap-4">
          
          <div className="flex items-center gap-3 font-black text-xl whitespace-nowrap">
            <Search className="w-8 h-8 text-yellow-300 animate-pulse" />
            <span>Tìm bài giảng</span>
          </div>

          <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Grade Selector */}
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full bg-white text-gray-800 rounded-2xl px-4 py-3 font-bold text-sm outline-none shadow border-2 border-transparent focus:border-amber-300"
            >
              <option value="">Chọn tất cả lớp</option>
              {gradeCards.map(g => (
                <option key={g.id} value={g.id}>{g.title}</option>
              ))}
            </select>

            {/* Subject Selector */}
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full bg-white text-gray-800 rounded-2xl px-4 py-3 font-bold text-sm outline-none shadow border-2 border-transparent focus:border-amber-300"
            >
              <option value="">Chọn tất cả môn</option>
              <option value="Toán học">Toán học 🔢</option>
              <option value="Tiếng Việt">Tiếng Việt 📖</option>
              <option value="Tiếng Anh">Tiếng Anh 🔤</option>
              <option value="Khoa học">Khoa học 🧪</option>
            </select>

            {/* Keyword Input */}
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Nhập tên bài học / từ khóa..."
              className="w-full bg-white text-gray-800 rounded-2xl px-4 py-3 font-medium text-sm outline-none shadow border-2 border-transparent focus:border-amber-300"
            />
          </div>

          <button
            type="submit"
            className="w-full md:w-auto bg-[#FF6600] hover:bg-orange-600 text-white font-black text-base px-8 py-3.5 rounded-2xl shadow-lg flex items-center justify-center gap-2 kid-btn whitespace-nowrap"
          >
            <Search className="w-5 h-5" />
            <span>Tìm kiếm</span>
          </button>

        </form>
      </div>
    </section>
  );
};

export default GradeWorkspaces;
