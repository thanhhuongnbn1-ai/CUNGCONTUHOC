import React, { useState } from 'react';
import { generateMaterialWithAI } from '../lib/aiContentStudio';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Sparkles, FileText, ExternalLink, Gamepad2, HelpCircle, BookOpen, CheckCircle, RefreshCw, Upload, Image as ImageIcon, PlusCircle, CheckSquare, ListOrdered, Edit3, Gift } from 'lucide-react';
import { ExamCreatorModal } from '../components/ExamCreatorModal';
import TeacherAwardBonusModal from '../components/TeacherAwardBonusModal';

export const TeacherStudio = ({ userProfile }) => {
  const [studioMode, setStudioMode] = useState('ai_generator'); // 'ai_generator' | 'iframe_embed' | 'multi_type_exam'
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [isBonusModalOpen, setIsBonusModalOpen] = useState(false);
  
  // Form State
  const [gradeSlug, setGradeSlug] = useState('lop-1');
  const [subject, setSubject] = useState('Toán học');
  const [contentType, setContentType] = useState('quiz'); // 'quiz' | 'story' | 'game' | 'interactive_lecture'
  const [rawText, setRawText] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');
  
  // iFrame Embed state
  const [embedTitle, setEmbedTitle] = useState('');
  const [embedUrl, setEmbedUrl] = useState('');
  const [embedDescription, setEmbedDescription] = useState('');

  // Processing state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleGenerateAI = async (e) => {
    e.preventDefault();
    if (!rawText.trim()) return;

    setIsGenerating(true);
    setGeneratedResult(null);
    setSaveSuccess(false);

    const gradeMap = {
      'tien-lop-1': 'TIỀN LỚP 1',
      'lop-1': 'LỚP 1',
      'lop-2': 'LỚP 2',
      'lop-3': 'LỚP 3',
      'lop-4': 'LỚP 4',
      'lop-5': 'LỚP 5'
    };

    const aiOutput = await generateMaterialWithAI({
      gradeName: gradeMap[gradeSlug] || 'LỚP 1',
      subject,
      contentType,
      rawInputText: rawText,
      customInstructions
    });

    setGeneratedResult(aiOutput);
    setIsGenerating(false);
  };

  const handleSaveToDB = async () => {
    if (!generatedResult && studioMode === 'ai_generator') return;
    setSaveSuccess(false);

    let titleToSave = '';
    let descToSave = '';
    let iframeUrlToSave = null;
    let contentTypeToSave = contentType;
    let aiContentToSave = null;

    if (studioMode === 'ai_generator') {
      titleToSave = generatedResult.title || 'Bài học AI';
      descToSave = generatedResult.summary || 'Bài học tương tác tạo tự động từ AI Content Studio.';
      aiContentToSave = generatedResult;
    } else {
      titleToSave = embedTitle || 'Trò chơi nhúng iFrame';
      descToSave = embedDescription || 'Bài học/Game nhúng từ nền tảngQuizizz, Wordwall hoặc YouTube.';
      iframeUrlToSave = embedUrl;
      contentTypeToSave = 'iframe_embed';
    }

    if (isSupabaseConfigured()) {
      try {
        // Query grade_id
        const { data: gradeFolder } = await supabase
          .from('grades_folders')
          .select('id')
          .eq('slug', gradeSlug)
          .single();

        if (gradeFolder) {
          const { error } = await supabase
            .from('materials')
            .insert({
              grade_id: gradeFolder.id,
              subject,
              title: titleToSave,
              description: descToSave,
              content_type: contentTypeToSave,
              iframe_url: iframeUrlToSave,
              ai_generated_content: aiContentToSave,
              author_id: userProfile?.id || null
            });

          if (!error) {
            setSaveSuccess(true);
          } else {
            console.error('Save material error:', error);
          }
        }
      } catch (err) {
        console.error('Database save error:', err);
      }
    } else {
      // Demo save success state
      setSaveSuccess(true);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      
      {/* Studio Header */}
      <div className="bg-gradient-to-r from-[#FF6600] to-amber-500 text-white p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-2 inline-block">
            DÀNH CHO GIÁO VIÊN & QUẢN TRỊ VIÊN
          </span>
          <h1 className="text-3xl sm:text-4xl font-black">AI Content Studio & Embed Hub</h1>
          <p className="text-orange-100 font-medium text-sm mt-1 max-w-xl">
            Tự động biến tài liệu SGK khô khan thành Trắc nghiệm, Game, Truyện cổ tích tương tác hoặc nhúng Quizizz, Wordwall, YouTube.
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="bg-white/20 p-1.5 rounded-2xl flex items-center gap-2">
          <button
            onClick={() => setStudioMode('ai_generator')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition ${
              studioMode === 'ai_generator' ? 'bg-white text-[#FF6600] shadow' : 'text-white hover:bg-white/10'
            }`}
          >
            <Sparkles className="w-4 h-4 inline mr-1" />
            Tạo từ AI SGK
          </button>
          <button
            onClick={() => setStudioMode('iframe_embed')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition ${
              studioMode === 'iframe_embed' ? 'bg-white text-[#FF6600] shadow' : 'text-white hover:bg-white/10'
            }`}
          >
            <ExternalLink className="w-4 h-4 inline mr-1" />
            Nhúng iFrame
          </button>
          <button
            onClick={() => {
              setStudioMode('multi_type_exam');
              setIsExamModalOpen(true);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-black transition ${
              studioMode === 'multi_type_exam' ? 'bg-white text-[#FF6600] shadow' : 'text-white hover:bg-white/10'
            }`}
          >
            <CheckSquare className="w-4 h-4 inline mr-1" />
            Tạo Đề Thi 5 Dạng
          </button>
          <button
            onClick={() => setIsBonusModalOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-black transition bg-yellow-300 text-orange-950 shadow-md hover:bg-yellow-200 flex items-center gap-1 border border-yellow-100"
          >
            <Gift className="w-4 h-4 text-orange-600" />
            Khen Thưởng XP 🎁
          </button>
        </div>
      </div>

      {/* Main Studio Body */}
      {studioMode === 'ai_generator' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Form Input Column */}
          <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border-2 border-orange-100 shadow-md space-y-6">
            <h3 className="text-xl font-black text-gray-800 flex items-center gap-2">
              <FileText className="w-6 h-6 text-[#FF6600]" />
              Nhập Thông Tin Bài Học / Văn Bản SGK
            </h3>

            <form onSubmit={handleGenerateAI} className="space-y-4">
              
              {/* Select Grade & Subject */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-gray-700 mb-1">Khối Lớp</label>
                  <select
                    value={gradeSlug}
                    onChange={(e) => setGradeSlug(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-orange-500"
                  >
                    <option value="tien-lop-1">Tiền Lớp 1</option>
                    <option value="lop-1">Lớp 1</option>
                    <option value="lop-2">Lớp 2</option>
                    <option value="lop-3">Lớp 3</option>
                    <option value="lop-4">Lớp 4</option>
                    <option value="lop-5">Lớp 5</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-gray-700 mb-1">Môn Học</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-orange-500"
                  >
                    <option value="Toán học">Toán học 🔢</option>
                    <option value="Tiếng Việt">Tiếng Việt 📖</option>
                    <option value="Tiếng Anh">Tiếng Anh 🔤</option>
                    <option value="Khoa học">Khoa học 🧪</option>
                  </select>
                </div>
              </div>

              {/* Select Content Type */}
              <div>
                <label className="block text-xs font-extrabold text-gray-700 mb-1">Dạng Học Liệu AI Muốn Tạo</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'quiz', label: 'Trắc Nghiệm Vui', icon: HelpCircle },
                    { id: 'story', label: 'Truyện Cổ Tích AI', icon: BookOpen },
                    { id: 'game', label: 'Game Đấu Trường', icon: Gamepad2 },
                    { id: 'interactive_lecture', label: 'Bài Giảng Tương Tác', icon: Sparkles }
                  ].map((item) => {
                    const IconComp = item.icon;
                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => setContentType(item.id)}
                        className={`p-3 rounded-xl border-2 text-xs font-bold flex items-center gap-2 transition ${
                          contentType === item.id
                            ? 'bg-orange-50 border-[#FF6600] text-[#FF6600]'
                            : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <IconComp className="w-4 h-4" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Raw Input Text Area */}
              <div>
                <label className="block text-xs font-extrabold text-gray-700 mb-1">
                  Nội Dung Bài Học SGK (Dán văn bản hoặc Đề bài vào đây)
                </label>
                <textarea
                  rows={6}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="Ví dụ: Bài 5 - Phép cộng trong phạm vi 10. Đề bài: Thỏ có 3 củ cà rốt, nhổ thêm 4 củ..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-medium focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Custom instructions */}
              <div>
                <label className="block text-xs font-extrabold text-gray-700 mb-1">Ghi Chú Thêm Cho AI (Tùy chọn)</label>
                <input
                  type="text"
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  placeholder="Ví dụ: Dùng ngôn từ cực kỳ ngộ nghĩnh cho học sinh Lớp 1..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-medium focus:outline-none focus:border-orange-500"
                />
              </div>

              <button
                type="submit"
                disabled={!rawText.trim() || isGenerating}
                className="w-full bg-[#FF6600] hover:bg-orange-600 disabled:opacity-50 text-white font-black text-base py-3.5 rounded-2xl shadow-lg flex items-center justify-center gap-2 kid-btn"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>AI đang phân tích & thiết kế học liệu...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Tạo Học Liệu AI Ngay</span>
                  </>
                )}
              </button>

            </form>
          </div>

          {/* Generated Result Preview Column */}
          <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border-2 border-orange-100 shadow-md space-y-6 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-black text-gray-800 flex items-center gap-2 mb-4">
                <Sparkles className="w-6 h-6 text-amber-500" />
                Xem Trước Kết Quả Học Liệu AI
              </h3>

              {generatedResult ? (
                <div className="bg-orange-50/70 p-5 rounded-2xl border-2 border-orange-200 text-xs text-gray-800 space-y-4 max-h-[420px] overflow-y-auto">
                  <div className="bg-white p-3 rounded-xl border border-orange-200 shadow-sm">
                    <span className="font-black text-orange-600 text-sm">{generatedResult.title}</span>
                    <p className="text-gray-500 mt-1">{generatedResult.summary}</p>
                  </div>

                  <pre className="whitespace-pre-wrap font-sans text-xs bg-white p-3 rounded-xl border border-gray-200">
                    {JSON.stringify(generatedResult, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center text-gray-400 font-bold text-xs">
                  Kết quả học liệu AI chuyển đổi sẽ hiển thị tại đây sau khi nhấn "Tạo Học Liệu AI Ngay".
                </div>
              )}
            </div>

            {/* Save Button */}
            {generatedResult && (
              <div className="pt-4 border-t border-gray-100">
                <button
                  onClick={handleSaveToDB}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base py-3.5 rounded-2xl shadow-lg flex items-center justify-center gap-2 kid-btn"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Đăng Tải Học Liệu Vào Supabase DB</span>
                </button>

                {saveSuccess && (
                  <p className="text-center text-xs font-black text-emerald-600 mt-2">
                    🎉 Đã lưu học liệu thành công vào Thư mục Lớp!
                  </p>
                )}
              </div>
            )}
          </div>

        </div>
      ) : studioMode === 'iframe_embed' ? (
        /* iFrame Embed Studio Form */
        <div className="bg-white p-8 rounded-3xl border-2 border-orange-100 shadow-md max-w-3xl mx-auto space-y-6">
          <h3 className="text-xl font-black text-gray-800 flex items-center gap-2">
            <ExternalLink className="w-6 h-6 text-[#FF6600]" />
            Nhúng Trò Chơi / Bài Giảng iFrame (Quizizz, Wordwall, YouTube...)
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-extrabold text-gray-700 mb-1">Khối Lớp</label>
                <select
                  value={gradeSlug}
                  onChange={(e) => setGradeSlug(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-bold"
                >
                  <option value="tien-lop-1">Tiền Lớp 1</option>
                  <option value="lop-1">Lớp 1</option>
                  <option value="lop-2">Lớp 2</option>
                  <option value="lop-3">Lớp 3</option>
                  <option value="lop-4">Lớp 4</option>
                  <option value="lop-5">Lớp 5</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-gray-700 mb-1">Môn Học</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-bold"
                >
                  <option value="Toán học">Toán học 🔢</option>
                  <option value="Tiếng Việt">Tiếng Việt 📖</option>
                  <option value="Tiếng Anh">Tiếng Anh 🔤</option>
                  <option value="Khoa học">Khoa học 🧪</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-gray-700 mb-1">Tiêu Đề Trò Chơi / Bài Học</label>
              <input
                type="text"
                value={embedTitle}
                onChange={(e) => setEmbedTitle(e.target.value)}
                placeholder="Ví dụ: Đấu trường ghép từ vựng Wordwall Tiếng Anh 1"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-gray-700 mb-1">Đường Dẫn iFrame URL (Embed Link)</label>
              <input
                type="url"
                value={embedUrl}
                onChange={(e) => setEmbedUrl(e.target.value)}
                placeholder="https://wordwall.net/embed/..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-gray-700 mb-1">Mô Tả Bài Học</label>
              <textarea
                rows={3}
                value={embedDescription}
                onChange={(e) => setEmbedDescription(e.target.value)}
                placeholder="Mô tả nhiệm vụ cho học sinh..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-medium"
              />
            </div>

            <button
              onClick={handleSaveToDB}
              disabled={!embedTitle || !embedUrl}
              className="w-full bg-[#FF6600] hover:bg-orange-600 disabled:opacity-50 text-white font-black text-base py-3.5 rounded-2xl shadow-lg flex items-center justify-center gap-2 kid-btn"
            >
              <CheckCircle className="w-5 h-5" />
              <span>Đăng Tải iFrame Embed Vào Supabase DB</span>
            </button>

            {saveSuccess && (
              <p className="text-center text-xs font-black text-emerald-600 mt-2">
                🎉 Đã lưu trò chơi nhúng iFrame thành công!
              </p>
            )}
          </div>
        </div>
      ) : (
        /* Multi-Type Exam Dashboard & Creator Trigger */
        <div className="bg-white p-8 rounded-3xl border-2 border-orange-100 shadow-md max-w-4xl mx-auto space-y-8 animate-fade-in">
          <div className="text-center space-y-3">
            <span className="bg-orange-100 text-orange-700 text-xs font-black px-4 py-1 rounded-full uppercase tracking-wider inline-block">
              BỘ CÔNG CỤ TẠO ĐỀ THI ĐA DẠNG 5 DẠNG CÂU HỎI
            </span>
            <h2 className="text-3xl font-black text-gray-800">
              Soạn Đề Thi Trắc Nghiệm LaTeX & Tự Luận Chuyên Sâu
            </h2>
            <p className="text-gray-500 font-medium text-sm max-w-2xl mx-auto">
              Hỗ trợ đầy đủ 5 dạng bài tập hiện đại: Công thức Toán/Hóa KaTeX, tính % điểm cho câu nhiều đáp án, Đúng/Sai, Điền khuyết và Tải ảnh bài làm viết tay.
            </p>
          </div>

          {/* 5 Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-orange-50/60 p-5 rounded-2xl border border-orange-200 space-y-2">
              <span className="text-2xl block">🔢</span>
              <h4 className="font-black text-gray-800 text-sm">1. Trắc Nghiệm 1 Đáp Án (LaTeX)</h4>
              <p className="text-xs text-gray-600">
                Hỗ trợ công thức Toán, Lý, Hóa phức tạp như phân số, căn bậc hai, lũy thừa, phương trình phản ứng hóa học.
              </p>
            </div>

            <div className="bg-blue-50/60 p-5 rounded-2xl border border-blue-200 space-y-2">
              <span className="text-2xl block">☑️</span>
              <h4 className="font-black text-gray-800 text-sm">2. Trắc Nghiệm Nhiều Đáp Án</h4>
              <p className="text-xs text-gray-600">
                Cho phép chọn nhiều đáp án đúng kèm thuật toán tính điểm theo tỷ lệ phần trăm (Partial Scoring) công bằng.
              </p>
            </div>

            <div className="bg-emerald-50/60 p-5 rounded-2xl border border-emerald-200 space-y-2">
              <span className="text-2xl block">⚖️</span>
              <h4 className="font-black text-gray-800 text-sm">3. Câu Hỏi Đúng / Sai</h4>
              <p className="text-xs text-gray-600">
                Đánh giá từng ý/mệnh đề độc lập. Tự động chia đều điểm số cho các ý học sinh trả lời đúng.
              </p>
            </div>

            <div className="bg-amber-50/60 p-5 rounded-2xl border border-amber-200 space-y-2">
              <span className="text-2xl block">✍️</span>
              <h4 className="font-black text-gray-800 text-sm">4. Điền Chỗ Trống</h4>
              <p className="text-xs text-gray-600">
                Học sinh nhập từ hoặc số chính xác vào đoạn văn còn thiếu, tự động chuẩn hóa dấu câu và chữ hoa/thường.
              </p>
            </div>

            <div className="bg-purple-50/60 p-5 rounded-2xl border border-purple-200 space-y-2 md:col-span-2 lg:col-span-2">
              <span className="text-2xl block">📝</span>
              <h4 className="font-black text-gray-800 text-sm">5. Tự Luận & Tải Ảnh Bài Làm Thủ Công</h4>
              <p className="text-xs text-gray-600">
                Học sinh có thể gõ văn bản dài trực tiếp hoặc chụp ảnh bài làm viết tay từ vở để nộp. Hỗ trợ xem trước ảnh phóng to và lưu vào database.
              </p>
            </div>
          </div>

          {/* Action Callouts */}
          <div className="p-6 bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div>
              <h3 className="text-xl font-black">Bắt Đầu Soạn Đề Thi Ngay Bây Giờ</h3>
              <p className="text-orange-100 text-xs font-medium mt-1">
                Có sẵn tính năng Nạp Đề Mẫu Chuẩn SGK 1-Click để trải nghiệm ngay lập tức!
              </p>
            </div>
            <button
              onClick={() => setIsExamModalOpen(true)}
              className="bg-white text-[#FF6600] hover:bg-orange-50 font-black text-sm px-6 py-3.5 rounded-2xl shadow-lg transition kid-btn whitespace-nowrap flex items-center gap-2"
            >
              <PlusCircle className="w-5 h-5 text-orange-600" />
              <span>Mở Bộ Soạn Đề Thi 5 Dạng</span>
            </button>
          </div>

          {saveSuccess && (
            <p className="text-center text-xs font-black text-emerald-600 bg-emerald-50 p-3 rounded-2xl border border-emerald-200">
              🎉 Đã lưu đề thi thành công vào Thư mục Lớp trên Supabase!
            </p>
          )}
        </div>
      )}

      {/* EXAM CREATOR MODAL POPUP */}
      {isExamModalOpen && (
        <ExamCreatorModal
          userProfile={userProfile}
          onClose={() => setIsExamModalOpen(false)}
          onCreated={() => {
            setIsExamModalOpen(false);
            setSaveSuccess(true);
          }}
        />
      )}

      {/* TEACHER AWARD BONUS XP MODAL */}
      <TeacherAwardBonusModal
        isOpen={isBonusModalOpen}
        onClose={() => setIsBonusModalOpen(false)}
        userProfile={userProfile}
      />

    </div>
  );
};

export default TeacherStudio;
