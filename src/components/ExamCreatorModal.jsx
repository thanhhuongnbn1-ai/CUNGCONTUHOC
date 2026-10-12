import React, { useState } from 'react';
import { LatexRenderer } from './LatexRenderer';
import {
  FileText,
  Plus,
  Trash2,
  CheckCircle,
  HelpCircle,
  Sparkles,
  Save,
  Check,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  X,
  Eye,
  BookOpen,
  Code2,
  FileSpreadsheet,
  Upload,
  Download,
  Dices,
  Shuffle,
  FileUp,
  ClipboardList,
  AlertCircle
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { examImportService } from '../lib/examImportService';
import { questionBankService } from '../lib/questionBankService';

// Mẫu đề thi chuẩn SGK chứa đầy đủ 5 dạng câu hỏi
export const SAMPLE_EXAM_DATA = {
  title: 'Đề Khảo Sát Năng Lực Toàn Diện (Đủ 5 Dạng Câu Hỏi SGK)',
  timeLimitMinutes: 20,
  description: 'Đề thi tích hợp công thức Toán LaTeX, trắc nghiệm nhiều đáp án tính % điểm, đúng/sai, điền khuyết và tự luận tải ảnh.',
  questions: [
    {
      id: 'q1',
      type: 'single_choice',
      question: 'Tính giá trị của biểu thức: $A = \\frac{15}{3} + \\sqrt{16} - 2^2$. Giá trị đúng của $A$ là:',
      options: [
        '$A = 3$',
        '$A = 5$',
        '$A = 7$',
        '$A = 9$'
      ],
      correctIndex: 1,
      explanation: 'Ta có: $\\frac{15}{3} = 5$, $\\sqrt{16} = 4$, $2^2 = 4$. Do đó $A = 5 + 4 - 4 = 5$.'
    },
    {
      id: 'q2',
      type: 'multiple_choice',
      question: 'Trong các phân số dưới đây, những phân số nào lớn hơn $\\frac{1}{2}$? (Chọn tất cả đáp án đúng)',
      options: [
        '$\\frac{3}{4}$',
        '$\\frac{2}{5}$',
        '$\\frac{5}{6}$',
        '$\\frac{1}{3}$'
      ],
      correctIndices: [0, 2],
      explanation: 'Ta quy đồng hoặc đổi ra số thập phân: $\\frac{3}{4} = 0.75 > 0.5$ và $\\frac{5}{6} \\approx 0.83 > 0.5$. Còn $\\frac{2}{5} = 0.4 < 0.5$ và $\\frac{1}{3} \\approx 0.33 < 0.5$.'
    },
    {
      id: 'q3',
      type: 'true_false',
      question: 'Xét tính Đúng / Sai của các khẳng định sau về Tự nhiên và Khoa học:',
      items: [
        {
          id: 'tf1',
          statement: 'Nước tinh khiết sôi ở nhiệt độ $100^\\circ\\text{C}$ dưới áp suất tiêu chuẩn.',
          correct: true
        },
        {
          id: 'tf2',
          statement: 'Công thức phân tử của nước cất là $\\text{H}_2\\text{O}_2$.',
          correct: false
        },
        {
          id: 'tf3',
          statement: 'Cây xanh quang hợp hấp thụ khí $\\text{CO}_2$ và giải phóng khí $\\text{O}_2$.',
          correct: true
        },
        {
          id: 'tf4',
          statement: 'Mặt Trời quay quanh Trái Đất theo quỹ đạo tròn hoàn hảo.',
          correct: false
        }
      ],
      explanation: 'Nước sôi ở 100°C. Công thức nước cất là H2O (H2O2 là oxy già). Cây xanh quang hợp tạo ra O2. Trái Đất quay quanh Mặt Trời.'
    },
    {
      id: 'q4',
      type: 'fill_in_the_blank',
      question: 'Điền từ hoặc số chính xác vào các chỗ trống sau:',
      template: 'Thủ đô của nước ta là {blank1}. Vào năm {blank2}, Bác Hồ đã đọc bản Tuyên ngôn Độc lập tại Quảng trường Ba Đình.',
      blanks: [
        {
          id: 'blank1',
          label: 'Chỗ trống (1) - Tên thủ đô',
          acceptableAnswers: ['Hà Nội', 'ha noi', 'Ha Noi'],
          hint: 'Thủ đô nghìn năm văn hiến của Việt Nam'
        },
        {
          id: 'blank2',
          label: 'Chỗ trống (2) - Năm đọc Tuyên ngôn',
          acceptableAnswers: ['1945'],
          hint: 'Năm sinh ra nước Việt Nam Dân chủ Cộng hòa'
        }
      ],
      explanation: 'Thủ đô của Việt Nam là Hà Nội. Năm 1945, Bác Hồ đọc Tuyên ngôn Độc lập.'
    },
    {
      id: 'q5',
      type: 'essay',
      question: 'Em hãy viết một đoạn văn ngắn (từ 5 đến 7 câu) kể về một việc tốt em đã làm để giúp đỡ bạn bè hoặc người thân trong gia đình. (Em có thể gõ văn bản trực tiếp hoặc viết ra vở rồi chụp ảnh tải lên).',
      maxScore: 10,
      guidelines: 'Tiêu chí chấm điểm:\n- Đúng cấu trúc đoạn văn, đủ số câu (5 - 7 câu)\n- Diễn đạt lưu loát, giàu cảm xúc\n- Nếu nộp ảnh: Chữ viết rõ ràng, sạch đẹp.',
      sampleAnswer: 'Đoạn văn mẫu: Hôm qua sau giờ tan học, em thấy bạn Nam bị rơi hộp bút màu xuống sân trường. Em đã nhanh chóng nhặt lên và mang trả tận tay cho bạn...'
    }
  ]
};

export const ExamCreatorModal = ({ userProfile, onClose, onCreated }) => {
  const [gradeSlug, setGradeSlug] = useState('lop-1');
  const [subject, setSubject] = useState('Toán học');
  const [title, setTitle] = useState('');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(20);
  const [description, setDescription] = useState('');

  const [questions, setQuestions] = useState([]);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);

  // Shuffle Settings
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [shuffleOptions, setShuffleOptions] = useState(true);

  // Submodal States
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isRandomGenModalOpen, setIsRandomGenModalOpen] = useState(false);
  const [importRawText, setImportRawText] = useState('');
  const [importStatusMsg, setImportStatusMsg] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  // Random Gen counts
  const [randomEasyCount, setRandomEasyCount] = useState(3);
  const [randomMediumCount, setRandomMediumCount] = useState(2);
  const [randomHardCount, setRandomHardCount] = useState(1);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Load sample template with all 5 types
  const handleLoadSample = () => {
    setTitle(SAMPLE_EXAM_DATA.title);
    setTimeLimitMinutes(SAMPLE_EXAM_DATA.timeLimitMinutes);
    setDescription(SAMPLE_EXAM_DATA.description);
    setQuestions(JSON.parse(JSON.stringify(SAMPLE_EXAM_DATA.questions)));
    setActiveQuestionIdx(0);
  };

  // Import from Word / Excel file
  const handleFileImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportStatusMsg('Đang phân tích dữ liệu tệp tin...');

    try {
      let parsed = [];
      const fileName = file.name.toLowerCase();

      if (fileName.endsWith('.docx')) {
        parsed = await examImportService.parseWordDocx(file);
      } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileName.endsWith('.csv')) {
        parsed = await examImportService.parseExcelSpreadsheet(file);
      } else if (fileName.endsWith('.txt')) {
        const text = await file.text();
        parsed = examImportService.parseTextContent(text);
      } else {
        alert('Vui lòng chọn tệp .docx, .xlsx, .xls, .csv hoặc .txt!');
        setIsImporting(false);
        return;
      }

      if (parsed.length > 0) {
        setQuestions(prev => [...prev, ...parsed]);
        if (!title) {
          setTitle(`Đề thi import từ ${file.name.replace(/\.[^/.]+$/, '')}`);
        }
        setIsImportModalOpen(false);
        setImportStatusMsg('');
        alert(`✓ Đã import thành công ${parsed.length} câu hỏi vào đề thi!`);
      } else {
        setImportStatusMsg('Không tìm thấy câu hỏi phù hợp. Hãy kiểm tra định dạng [Đáp án: A]!');
      }
    } catch (err) {
      console.error('Import error:', err);
      setImportStatusMsg('Lỗi đọc tệp: ' + err.message);
    } finally {
      setIsImporting(false);
    }
  };

  // Import from Pasted Text
  const handleTextImport = () => {
    if (!importRawText.trim()) return;
    try {
      const parsed = examImportService.parseTextContent(importRawText);
      if (parsed.length > 0) {
        setQuestions(prev => [...prev, ...parsed]);
        setIsImportModalOpen(false);
        setImportRawText('');
        setImportStatusMsg('');
        alert(`✓ Đã bóc tách thành công ${parsed.length} câu hỏi từ văn bản!`);
      } else {
        setImportStatusMsg('Không nhận diện được câu hỏi. Hãy kiểm tra cấu trúc "Câu 1: ... A. ... B. ... [Đáp án: A]"!');
      }
    } catch (err) {
      setImportStatusMsg('Lỗi bóc tách văn bản: ' + err.message);
    }
  };

  // Generate Random Exam from Question Bank
  const handleGenerateRandomExam = async () => {
    try {
      const randomExam = await questionBankService.generateRandomExam({
        gradeSlug,
        subject,
        easyCount: Number(randomEasyCount) || 3,
        mediumCount: Number(randomMediumCount) || 2,
        hardCount: Number(randomHardCount) || 1,
        title: title || `Đề Thi Ngẫu Nhiên (${Number(randomEasyCount) + Number(randomMediumCount) + Number(randomHardCount)} Câu - ${subject})`,
        timeLimitMinutes: Number(timeLimitMinutes) || 20
      });

      if (randomExam.questions && randomExam.questions.length > 0) {
        setTitle(randomExam.title);
        setDescription(randomExam.description);
        setTimeLimitMinutes(randomExam.timeLimitMinutes);
        setQuestions(randomExam.questions);
        setShuffleQuestions(true);
        setShuffleOptions(true);
        setActiveQuestionIdx(0);
        setIsRandomGenModalOpen(false);
        alert(`✓ Đã rút ngẫu nhiên thành công ${randomExam.questions.length} câu hỏi từ Ngân hàng câu hỏi!`);
      } else {
        alert('Không có đủ câu hỏi trong ngân hàng cho môn học này!');
      }
    } catch (err) {
      console.error('Random exam error:', err);
      alert('Lỗi tạo đề ngẫu nhiên: ' + err.message);
    }
  };

  // Add question with a default template based on type
  const handleAddQuestion = (type) => {
    let newQ = null;
    const newId = `q_${Date.now()}`;

    switch (type) {
      case 'single_choice':
        newQ = {
          id: newId,
          type: 'single_choice',
          question: 'Câu hỏi Trắc nghiệm 1 Đáp án (Hỗ trợ LaTeX: $x^2 + 2x = 0$):',
          options: ['Đáp án A', 'Đáp án B', 'Đáp án C', 'Đáp án D'],
          correctIndex: 0,
          explanation: 'Lời giải thích chi tiết cho câu hỏi...'
        };
        break;
      case 'multiple_choice':
        newQ = {
          id: newId,
          type: 'multiple_choice',
          question: 'Câu hỏi Trắc nghiệm Nhiều Đáp án (Chọn các ý đúng):',
          options: ['Ý A', 'Ý B', 'Ý C', 'Ý D'],
          correctIndices: [0, 1],
          explanation: 'Lời giải thích chi tiết...'
        };
        break;
      case 'true_false':
        newQ = {
          id: newId,
          type: 'true_false',
          question: 'Xét tính Đúng / Sai của các khẳng định sau:',
          items: [
            { id: 'tf_1', statement: 'Khẳng định số 1...', correct: true },
            { id: 'tf_2', statement: 'Khẳng định số 2...', correct: false }
          ],
          explanation: 'Giải thích chi tiết...'
        };
        break;
      case 'fill_in_the_blank':
        newQ = {
          id: newId,
          type: 'fill_in_the_blank',
          question: 'Điền từ thích hợp vào chỗ trống:',
          template: 'Nước chảy về {blank1}, hoa nở đón {blank2}.',
          blanks: [
            { id: 'blank1', label: 'Chỗ trống (1)', acceptableAnswers: ['nguồn'], hint: 'nguồn nước' },
            { id: 'blank2', label: 'Chỗ trống (2)', acceptableAnswers: ['xuân'], hint: 'mùa đầu năm' }
          ],
          explanation: 'Giải thích chi tiết...'
        };
        break;
      case 'essay':
        newQ = {
          id: newId,
          type: 'essay',
          question: 'Đề bài Tự luận: Em hãy trình bày suy nghĩ hoặc giải bài toán chi tiết sau:',
          maxScore: 10,
          guidelines: 'Ghi rõ các bước làm bài hoặc chụp ảnh vở rõ nét.',
          sampleAnswer: 'Gợi ý đáp án mẫu...'
        };
        break;
      default:
        break;
    }

    if (newQ) {
      const updated = [...questions, newQ];
      setQuestions(updated);
      setActiveQuestionIdx(updated.length - 1);
    }
  };

  const handleDeleteQuestion = (idx) => {
    const updated = questions.filter((_, i) => i !== idx);
    setQuestions(updated);
    if (activeQuestionIdx >= updated.length) {
      setActiveQuestionIdx(Math.max(0, updated.length - 1));
    }
  };

  const handleUpdateCurrentQuestion = (field, value) => {
    setQuestions(prev => {
      const next = [...prev];
      next[activeQuestionIdx] = {
        ...next[activeQuestionIdx],
        [field]: value
      };
      return next;
    });
  };

  // Save to Supabase
  const handleSaveExam = async () => {
    if (!title.trim() || questions.length === 0) return;
    setIsSaving(true);
    setSaveSuccess(false);

    const examPayload = {
      type: 'multi_type_exam',
      title: title.trim(),
      timeLimitMinutes: Number(timeLimitMinutes) || 20,
      description: description.trim(),
      questions,
      shuffle_questions: shuffleQuestions,
      shuffle_options: shuffleOptions
    };

    if (isSupabaseConfigured()) {
      try {
        const { data: gradeFolder } = await supabase
          .from('grades_folders')
          .select('id')
          .eq('slug', gradeSlug)
          .single();

        if (gradeFolder) {
          const { data, error } = await supabase
            .from('materials')
            .insert({
              grade_id: gradeFolder.id,
              subject,
              title: title.trim(),
              description: description.trim() || 'Đề thi kiểm tra 5 dạng câu hỏi',
              content_type: 'quiz', // Using 'quiz' to respect table check constraint
              ai_generated_content: examPayload,
              author_id: userProfile?.id || null
            })
            .select();

          if (!error && data) {
            setSaveSuccess(true);
            if (onCreated) onCreated(data[0]);
          } else {
            console.error('Error saving exam:', error);
          }
        }
      } catch (err) {
        console.error('Supabase save error:', err);
      }
    } else {
      setSaveSuccess(true);
    }

    setIsSaving(false);
  };

  const currentQ = questions[activeQuestionIdx];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl border-4 border-orange-100 flex flex-col max-h-[92vh] overflow-hidden animate-fade-in">
        
        {/* MODAL HEADER */}
        <div className="bg-gradient-to-r from-[#FF6600] to-amber-500 text-white p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-white/20 text-xs font-black px-3 py-0.5 rounded-full uppercase tracking-wider">
                STUDIO SOẠN ĐỀ THI ĐA DẠNG
              </span>
              <span className="bg-white/20 text-xs font-bold px-2 py-0.5 rounded-full">
                5 Dạng Câu Hỏi SGK
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black mt-1">
              Bộ Tạo Đề Thi 5 Dạng Cho Giáo Viên & Admin
            </h2>
            <p className="text-orange-100 text-xs font-medium">
              Trắc nghiệm LaTeX, Nhiều đáp án, Đúng/Sai, Điền khuyết, Tự luận & Import Word/Excel.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setIsImportModalOpen(true)}
              className="bg-white/20 hover:bg-white/30 text-white font-black text-xs px-3 py-2 rounded-xl border border-white/30 transition kid-btn flex items-center gap-1.5"
              title="Tải file Word (.docx) hoặc Excel (.xlsx) để tạo đề tự động"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
              <span>Import Word/Excel</span>
            </button>

            <button
              type="button"
              onClick={() => setIsRandomGenModalOpen(true)}
              className="bg-white/20 hover:bg-white/30 text-white font-black text-xs px-3 py-2 rounded-xl border border-white/30 transition kid-btn flex items-center gap-1.5"
              title="Rút ngẫu nhiên câu hỏi theo độ khó từ Ngân hàng câu hỏi"
            >
              <Dices className="w-4 h-4 text-yellow-300" />
              <span>Rút Đề Ngẫu Nhiên</span>
            </button>

            <button
              onClick={handleLoadSample}
              className="bg-white text-[#FF6600] hover:bg-orange-50 font-black text-xs px-3 py-2 rounded-xl shadow transition kid-btn flex items-center gap-1.5"
              title="Nạp ngay bộ đề mẫu 5 dạng để xem thử"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Nạp Đề Mẫu</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition ml-1"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* MODAL CONTENT BODY */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* 1. GENERAL EXAM CONFIGURATION */}
          <div className="bg-orange-50/60 p-5 rounded-2xl border-2 border-orange-100 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-gray-700 mb-1">Khối Lớp</label>
              <select
                value={gradeSlug}
                onChange={(e) => setGradeSlug(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-orange-500"
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
                className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-orange-500"
              >
                <option value="Toán học">Toán học 🔢</option>
                <option value="Tiếng Việt">Tiếng Việt 📖</option>
                <option value="Tiếng Anh">Tiếng Anh 🔤</option>
                <option value="Khoa học">Khoa học 🧪</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-extrabold text-gray-700 mb-1">Tiêu Đề Đề Thi</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: Đề Kiểm Tra Giữa Kỳ I - Toán Học 1"
                className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="md:col-span-1">
              <label className="block text-xs font-extrabold text-gray-700 mb-1">Thời Gian (Phút)</label>
              <input
                type="number"
                min="5"
                max="180"
                value={timeLimitMinutes}
                onChange={(e) => setTimeLimitMinutes(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-extrabold text-gray-700 mb-1">Mô Tả / Hướng Dẫn Chung</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ví dụ: Đề thi gồm 5 câu kiểm tra toàn diện năng lực..."
                className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs font-medium focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Cấu hình Đảo đề thi chống quay cóp */}
            <div className="md:col-span-4 bg-white/70 p-3 rounded-xl border border-orange-200 flex flex-wrap items-center justify-between gap-4">
              <span className="text-xs font-black text-gray-800 flex items-center gap-1.5">
                <Shuffle className="w-4 h-4 text-[#FF6600]" />
                Tính năng Chống Quay Cóp:
              </span>
              <div className="flex items-center gap-5 flex-wrap">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700 hover:text-orange-600 transition">
                  <input
                    type="checkbox"
                    checked={shuffleQuestions}
                    onChange={(e) => setShuffleQuestions(e.target.checked)}
                    className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                  />
                  <span>🎲 Tự động đảo thứ tự câu hỏi cho từng học sinh</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700 hover:text-orange-600 transition">
                  <input
                    type="checkbox"
                    checked={shuffleOptions}
                    onChange={(e) => setShuffleOptions(e.target.checked)}
                    className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                  />
                  <span>🔀 Tự động đảo vị trí đáp án A, B, C, D</span>
                </label>
              </div>
            </div>
          </div>

          {/* 2. QUESTION TYPES ADD BAR */}
          <div className="bg-gray-50 p-4 rounded-2xl border-2 border-gray-200 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-black text-gray-700 uppercase">Thêm câu hỏi mới:</span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleAddQuestion('single_choice')}
                className="bg-white hover:bg-orange-50 text-orange-700 border border-orange-300 font-bold text-xs px-3 py-2 rounded-xl transition kid-btn flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>1. Trắc nghiệm 1 Đáp Án (LaTeX)</span>
              </button>
              <button
                type="button"
                onClick={() => handleAddQuestion('multiple_choice')}
                className="bg-white hover:bg-blue-50 text-blue-700 border border-blue-300 font-bold text-xs px-3 py-2 rounded-xl transition kid-btn flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>2. Trắc nghiệm Nhiều Đáp Án (%)</span>
              </button>
              <button
                type="button"
                onClick={() => handleAddQuestion('true_false')}
                className="bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold text-xs px-3 py-2 rounded-xl transition kid-btn flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>3. Đúng / Sai Từng Ý</span>
              </button>
              <button
                type="button"
                onClick={() => handleAddQuestion('fill_in_the_blank')}
                className="bg-white hover:bg-amber-50 text-amber-700 border border-amber-300 font-bold text-xs px-3 py-2 rounded-xl transition kid-btn flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>4. Điền Chỗ Trống</span>
              </button>
              <button
                type="button"
                onClick={() => handleAddQuestion('essay')}
                className="bg-white hover:bg-purple-50 text-purple-700 border border-purple-300 font-bold text-xs px-3 py-2 rounded-xl transition kid-btn flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>5. Tự Luận & Tải Ảnh</span>
              </button>
            </div>
          </div>

          {/* 3. QUESTION TABS & ACTIVE EDITOR */}
          {questions.length > 0 ? (
            <div className="space-y-4">
              
              {/* Question list tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {questions.map((q, idx) => (
                  <button
                    key={q.id || idx}
                    type="button"
                    onClick={() => setActiveQuestionIdx(idx)}
                    className={`px-4 py-2 rounded-xl text-xs font-black border-2 transition whitespace-nowrap flex items-center gap-2 ${
                      idx === activeQuestionIdx
                        ? 'bg-[#FF6600] text-white border-orange-600 shadow'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <span>Câu {idx + 1}</span>
                    <span className="text-[10px] opacity-80 uppercase">
                      ({q.type === 'single_choice' && '1 Đáp Án'}
                      {q.type === 'multiple_choice' && 'Nhiều Đáp Án'}
                      {q.type === 'true_false' && 'Đúng/Sai'}
                      {q.type === 'fill_in_the_blank' && 'Điền Khuyết'}
                      {q.type === 'essay' && 'Tự Luận'})
                    </span>
                  </button>
                ))}
              </div>

              {/* ACTIVE QUESTION EDITOR CARD */}
              {currentQ && (
                <div className="bg-white p-6 rounded-3xl border-2 border-orange-200 shadow-sm space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <span className="font-black text-gray-800 text-sm flex items-center gap-2">
                      <Code2 className="w-5 h-5 text-[#FF6600]" />
                      Đang chỉnh sửa: Câu {activeQuestionIdx + 1} - Dạng {currentQ.type.toUpperCase()}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleDeleteQuestion(activeQuestionIdx)}
                      className="text-red-500 hover:text-red-700 text-xs font-extrabold flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Xóa câu này</span>
                    </button>
                  </div>

                  {/* Question Prompt */}
                  <div className="space-y-2">
                    <label className="block text-xs font-extrabold text-gray-700">
                      Nội Dung Đề Bài (Hỗ trợ công thức Toán/Hóa với cú pháp LaTeX: $công\_thức$ hoặc $$khối$$)
                    </label>
                    <textarea
                      rows={3}
                      value={currentQ.question}
                      onChange={(e) => handleUpdateCurrentQuestion('question', e.target.value)}
                      placeholder="Ví dụ: Tính giá trị của biểu thức: $A = \frac{15}{3} + \sqrt{16}$..."
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-medium focus:outline-none focus:border-orange-500 font-mono"
                    />

                    {/* LIVE LATEX PREVIEW */}
                    <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-200 text-xs">
                      <span className="font-extrabold text-amber-700 block mb-1">
                        🔍 Xem trước hiển thị công thức LaTeX:
                      </span>
                      <LatexRenderer content={currentQ.question} />
                    </div>
                  </div>

                  {/* SPECIFIC TYPE EDITORS */}

                  {/* A. SINGLE CHOICE */}
                  {currentQ.type === 'single_choice' && (
                    <div className="space-y-3 pt-2">
                      <label className="block text-xs font-extrabold text-gray-700">
                        Danh Sách Lựa Chọn (Tích tròn vào đáp án đúng duy nhất):
                      </label>
                      {currentQ.options?.map((opt, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-3">
                          <input
                            type="radio"
                            name={`correct-single-${currentQ.id}`}
                            checked={currentQ.correctIndex === optIdx}
                            onChange={() => handleUpdateCurrentQuestion('correctIndex', optIdx)}
                            className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                          />
                          <span className="w-6 font-black text-xs text-gray-600">
                            {String.fromCharCode(65 + optIdx)}.
                          </span>
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => {
                              const newOpts = [...currentQ.options];
                              newOpts[optIdx] = e.target.value;
                              handleUpdateCurrentQuestion('options', newOpts);
                            }}
                            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-medium"
                          />
                          <div className="min-w-[120px] max-w-[200px] overflow-hidden text-xs text-gray-600 bg-gray-100 px-2 py-1.5 rounded-lg truncate">
                            <LatexRenderer content={opt} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* B. MULTIPLE CHOICE */}
                  {currentQ.type === 'multiple_choice' && (
                    <div className="space-y-3 pt-2">
                      <label className="block text-xs font-extrabold text-gray-700">
                        Danh Sách Lựa Chọn (Tích chọn tất cả các đáp án đúng - hệ thống tự tính % điểm):
                      </label>
                      {currentQ.options?.map((opt, optIdx) => {
                        const isChecked = (currentQ.correctIndices || []).includes(optIdx);
                        return (
                          <div key={optIdx} className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                const curList = currentQ.correctIndices || [];
                                const nextList = e.target.checked
                                  ? [...curList, optIdx]
                                  : curList.filter(i => i !== optIdx);
                                handleUpdateCurrentQuestion('correctIndices', nextList);
                              }}
                              className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                            />
                            <span className="w-6 font-black text-xs text-gray-600">
                              {String.fromCharCode(65 + optIdx)}.
                            </span>
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => {
                                const newOpts = [...currentQ.options];
                                newOpts[optIdx] = e.target.value;
                                handleUpdateCurrentQuestion('options', newOpts);
                              }}
                              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-medium"
                            />
                            <div className="min-w-[120px] max-w-[200px] overflow-hidden text-xs text-gray-600 bg-gray-100 px-2 py-1.5 rounded-lg truncate">
                              <LatexRenderer content={opt} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* C. TRUE / FALSE */}
                  {currentQ.type === 'true_false' && (
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-extrabold text-gray-700">
                          Danh Sách Các Mệnh Đề (Chọn Đúng hoặc Sai làm đáp án):
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const newItems = [
                              ...(currentQ.items || []),
                              { id: `tf_${Date.now()}`, statement: 'Mệnh đề mới...', correct: true }
                            ];
                            handleUpdateCurrentQuestion('items', newItems);
                          }}
                          className="text-xs font-black text-[#FF6600] hover:underline"
                        >
                          + Thêm Mệnh Đề
                        </button>
                      </div>

                      {currentQ.items?.map((item, iIdx) => (
                        <div key={item.id || iIdx} className="bg-gray-50 p-3 rounded-xl border border-gray-200 flex items-center gap-3">
                          <span className="w-6 font-black text-xs text-gray-600">
                            {String.fromCharCode(97 + iIdx)}.
                          </span>
                          <input
                            type="text"
                            value={item.statement}
                            onChange={(e) => {
                              const newItems = [...currentQ.items];
                              newItems[iIdx].statement = e.target.value;
                              handleUpdateCurrentQuestion('items', newItems);
                            }}
                            className="flex-1 bg-white border border-gray-200 rounded-lg p-2 text-xs font-medium"
                          />
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                const newItems = [...currentQ.items];
                                newItems[iIdx].correct = true;
                                handleUpdateCurrentQuestion('items', newItems);
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-black ${
                                item.correct === true ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-700'
                              }`}
                            >
                              Đúng
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const newItems = [...currentQ.items];
                                newItems[iIdx].correct = false;
                                handleUpdateCurrentQuestion('items', newItems);
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-black ${
                                item.correct === false ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'
                              }`}
                            >
                              Sai
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* D. FILL IN THE BLANK */}
                  {currentQ.type === 'fill_in_the_blank' && (
                    <div className="space-y-3 pt-2">
                      <div>
                        <label className="block text-xs font-extrabold text-gray-700 mb-1">
                          Đoạn Văn Mẫu Chứa Chỗ Trống (Dùng ký hiệu {'{blank1}'}, {'{blank2}'}...):
                        </label>
                        <input
                          type="text"
                          value={currentQ.template || ''}
                          onChange={(e) => handleUpdateCurrentQuestion('template', e.target.value)}
                          placeholder="Thủ đô của nước ta là {blank1}..."
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-medium"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-extrabold text-gray-700">
                          Từ Khóa Đúng Cho Từng Chỗ Trống:
                        </label>
                        {currentQ.blanks?.map((b, bIdx) => (
                          <div key={b.id || bIdx} className="bg-gray-50 p-3 rounded-xl border border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div>
                              <label className="block text-[11px] font-bold text-gray-500">Tên vị trí:</label>
                              <input
                                type="text"
                                value={b.label}
                                onChange={(e) => {
                                  const newBlanks = [...currentQ.blanks];
                                  newBlanks[bIdx].label = e.target.value;
                                  handleUpdateCurrentQuestion('blanks', newBlanks);
                                }}
                                className="w-full bg-white border border-gray-200 rounded-lg p-1.5 text-xs font-medium"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-gray-500">Đáp án chấp nhận (cách nhau dấu phẩy):</label>
                              <input
                                type="text"
                                value={(b.acceptableAnswers || []).join(', ')}
                                onChange={(e) => {
                                  const newBlanks = [...currentQ.blanks];
                                  newBlanks[bIdx].acceptableAnswers = e.target.value.split(',').map(s => s.trim());
                                  handleUpdateCurrentQuestion('blanks', newBlanks);
                                }}
                                className="w-full bg-white border border-gray-200 rounded-lg p-1.5 text-xs font-medium"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-gray-500">Gợi ý cho học sinh:</label>
                              <input
                                type="text"
                                value={b.hint || ''}
                                onChange={(e) => {
                                  const newBlanks = [...currentQ.blanks];
                                  newBlanks[bIdx].hint = e.target.value;
                                  handleUpdateCurrentQuestion('blanks', newBlanks);
                                }}
                                className="w-full bg-white border border-gray-200 rounded-lg p-1.5 text-xs font-medium"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* E. ESSAY */}
                  {currentQ.type === 'essay' && (
                    <div className="space-y-3 pt-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-extrabold text-gray-700 mb-1">
                            Tiêu Chí & Hướng Dẫn Chấm Điểm
                          </label>
                          <textarea
                            rows={3}
                            value={currentQ.guidelines || ''}
                            onChange={(e) => handleUpdateCurrentQuestion('guidelines', e.target.value)}
                            placeholder="Tiêu chí chấm điểm..."
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-extrabold text-gray-700 mb-1">
                            Gợi Ý Đáp Án Mẫu Cho Giáo Viên
                          </label>
                          <textarea
                            rows={3}
                            value={currentQ.sampleAnswer || ''}
                            onChange={(e) => handleUpdateCurrentQuestion('sampleAnswer', e.target.value)}
                            placeholder="Đáp án mẫu..."
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-medium"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Explanation for all */}
                  <div>
                    <label className="block text-xs font-extrabold text-gray-700 mb-1">
                      Lời Giải Thích Chi Tiết Của Giáo Viên (Hiển thị sau khi học sinh nộp bài, hỗ trợ LaTeX):
                    </label>
                    <textarea
                      rows={2}
                      value={currentQ.explanation || ''}
                      onChange={(e) => handleUpdateCurrentQuestion('explanation', e.target.value)}
                      placeholder="Giải thích từng bước cho học sinh..."
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-medium"
                    />
                  </div>

                </div>
              )}

            </div>
          ) : (
            <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl p-12 text-center space-y-3">
              <FileText className="w-12 h-12 text-gray-400 mx-auto" />
              <h3 className="text-base font-black text-gray-700">Chưa có câu hỏi nào trong đề thi</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                Bấm nút "Nạp Đề Mẫu (1-Click)" ở góc trên để nạp nhanh bộ 5 dạng câu hỏi chuẩn SGK, hoặc chọn các nút thêm câu hỏi ở trên.
              </p>
            </div>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="p-6 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-gray-500 font-bold">
            Tổng số: <strong className="text-gray-800">{questions.length} câu hỏi</strong> • Thời gian: <strong className="text-gray-800">{timeLimitMinutes} phút</strong>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-2xl border-2 border-gray-200 text-xs font-black text-gray-600 hover:bg-gray-100 transition"
            >
              Hủy
            </button>

            <button
              type="button"
              disabled={questions.length === 0 || !title.trim() || isSaving}
              onClick={handleSaveExam}
              className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black text-xs px-6 py-3.5 rounded-2xl shadow-lg transition kid-btn flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Đang lưu vào DB...' : 'Lưu Đề Thi Vào Supabase DB'}</span>
            </button>
          </div>
        </div>

        {/* SUCCESS NOTIFICATION */}
        {saveSuccess && (
          <div className="p-3 bg-emerald-500 text-white text-center text-xs font-black animate-fade-in flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>🎉 Đã lưu đề thi thành công vào Thư mục Lớp trên Supabase!</span>
          </div>
        )}

      </div>

      {/* SUBMODAL 1: IMPORT FROM WORD / EXCEL / TEXT */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-2xl p-6 border-4 border-orange-100 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-800">
                    Import Đề Thi Từ Word / Excel / Văn Bản
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">
                    Hỗ trợ tệp .docx, .xlsx, .csv, .txt cấu trúc chuẩn [Đáp án: A]
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Template Download Buttons */}
            <div className="bg-orange-50/70 p-4 rounded-2xl border border-orange-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs font-bold text-orange-800">
                📥 Chưa có file mẫu? Tải ngay mẫu chuẩn để soạn đề:
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => examImportService.downloadSampleWordFile()}
                  className="bg-white hover:bg-orange-100 text-orange-700 border border-orange-300 font-black text-xs px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Mẫu Word (.txt)</span>
                </button>
                <button
                  type="button"
                  onClick={() => examImportService.downloadSampleExcelFile()}
                  className="bg-white hover:bg-emerald-100 text-emerald-700 border border-emerald-300 font-black text-xs px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Mẫu Excel (.xlsx)</span>
                </button>
              </div>
            </div>

            {/* File Upload Zone */}
            <div className="border-2 border-dashed border-gray-300 hover:border-orange-500 rounded-2xl p-6 text-center transition bg-gray-50/50">
              <input
                type="file"
                id="file-import-input"
                accept=".docx,.xlsx,.xls,.csv,.txt"
                onChange={handleFileImport}
                className="hidden"
                disabled={isImporting}
              />
              <label
                htmlFor="file-import-input"
                className="cursor-pointer inline-flex flex-col items-center gap-2"
              >
                <div className="w-12 h-12 rounded-2xl bg-orange-100 text-[#FF6600] flex items-center justify-center">
                  <FileUp className="w-6 h-6" />
                </div>
                <span className="text-xs font-black text-[#FF6600]">
                  {isImporting ? 'Đang phân tích tệp tin...' : 'Bấm vào đây để chọn tệp Word (.docx) hoặc Excel (.xlsx)'}
                </span>
                <span className="text-[11px] text-gray-400">
                  Hệ thống tự động quét các câu hỏi dạng "Câu 1: ... A. ... B. ... [Đáp án: A]"
                </span>
              </label>
            </div>

            {/* Paste Raw Text Area */}
            <div className="space-y-2">
              <label className="block text-xs font-extrabold text-gray-700 flex items-center justify-between">
                <span>Hoặc Dán Văn Bản Đề Thi Trực Tiếp:</span>
                <span className="text-[11px] text-gray-400">Định dạng [Đáp án: A, B]</span>
              </label>
              <textarea
                rows={5}
                value={importRawText}
                onChange={(e) => setImportRawText(e.target.value)}
                placeholder={`Câu 1: Kết quả của 10 + 20 là:\nA. 25\nB. 30\nC. 35\nD. 40\n[Đáp án: B]\n[Lời giải: 10 + 20 = 30]`}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-mono focus:outline-none focus:border-orange-500"
              />
            </div>

            {importStatusMsg && (
              <p className="text-xs font-bold text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200">
                {importStatusMsg}
              </p>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={handleTextImport}
                disabled={!importRawText.trim() || isImporting}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow transition kid-btn flex items-center gap-1.5"
              >
                <ClipboardList className="w-4 h-4" />
                <span>Bóc Tách & Nạp Vào Đề Thi</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUBMODAL 2: RANDOM EXAM GENERATOR FROM QUESTION BANK */}
      {isRandomGenModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 border-4 border-orange-100 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
                  <Dices className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-800">
                    Tạo Đề Thi Ngẫu Nhiên
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">
                    Rút ngẫu nhiên từ Ngân hàng câu hỏi theo độ khó
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRandomGenModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-200 text-center">
                  <span className="text-[11px] font-black text-emerald-700 uppercase block mb-1">Mức Dễ</span>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={randomEasyCount}
                    onChange={(e) => setRandomEasyCount(e.target.value)}
                    className="w-full bg-white border border-emerald-300 rounded-xl p-2 text-center text-sm font-black focus:outline-none"
                  />
                  <span className="text-[10px] text-emerald-600 font-bold mt-1 block">câu hỏi</span>
                </div>

                <div className="bg-blue-50 p-3 rounded-2xl border border-blue-200 text-center">
                  <span className="text-[11px] font-black text-blue-700 uppercase block mb-1">Trung Bình</span>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={randomMediumCount}
                    onChange={(e) => setRandomMediumCount(e.target.value)}
                    className="w-full bg-white border border-blue-300 rounded-xl p-2 text-center text-sm font-black focus:outline-none"
                  />
                  <span className="text-[10px] text-blue-600 font-bold mt-1 block">câu hỏi</span>
                </div>

                <div className="bg-rose-50 p-3 rounded-2xl border border-rose-200 text-center">
                  <span className="text-[11px] font-black text-rose-700 uppercase block mb-1">Mức Khó</span>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={randomHardCount}
                    onChange={(e) => setRandomHardCount(e.target.value)}
                    className="w-full bg-white border border-rose-300 rounded-xl p-2 text-center text-sm font-black focus:outline-none"
                  />
                  <span className="text-[10px] text-rose-600 font-bold mt-1 block">câu hỏi</span>
                </div>
              </div>

              {/* Summary pill */}
              <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200 text-xs flex items-center justify-between font-bold text-amber-900">
                <span>Tổng số câu hỏi sẽ rút:</span>
                <span className="text-base font-black text-[#FF6600]">
                  {Number(randomEasyCount || 0) + Number(randomMediumCount || 0) + Number(randomHardCount || 0)} câu
                </span>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl text-[11px] text-gray-500">
                💡 Hệ thống sẽ tự động bật tính năng <strong>Trộn ngẫu nhiên câu hỏi & đáp án</strong> để mỗi học sinh khi làm bài đều nhận được đề thi với thứ tự khác nhau!
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsRandomGenModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleGenerateRandomExam}
                className="bg-[#FF6600] hover:bg-orange-600 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow transition kid-btn flex items-center gap-1.5"
              >
                <Dices className="w-4 h-4" />
                <span>Rút Ngẫu Nhiên Ngay</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ExamCreatorModal;
