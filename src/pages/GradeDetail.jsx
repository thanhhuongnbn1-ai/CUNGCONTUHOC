import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { MaterialCard } from '../components/MaterialCard';
import { MaterialViewer } from '../components/MaterialViewer';
import { BookOpen, Sparkles, PlusCircle, Search, ArrowLeft, Layers, CheckSquare } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { SAMPLE_EXAM_DATA, ExamCreatorModal } from '../components/ExamCreatorModal';
import { FlexibleAssignmentModal } from '../components/FlexibleAssignmentModal';

const GRADE_CONFIGS = {
  'tien-lop-1': { title: 'TIỀN LỚP 1', desc: 'Kiến thức nền tảng nhận biết chữ cái, con số & hình khối cho bé', color: 'bg-[#FF5376]' },
  'lop-1': { title: 'LỚP 1', desc: 'Chương trình môn Toán, Tiếng Việt, Tiếng Anh tương tác Lớp 1', color: 'bg-[#FF9E00]' },
  'lop-2': { title: 'LỚP 2', desc: 'Kiến thức mở rộng tư duy và tính toán nhanh Lớp 2', color: 'bg-[#2B82C9]' },
  'lop-3': { title: 'LỚP 3', desc: 'Rèn luyện kỹ năng giải bài tập & đọc hiểu Tiếng Việt Lớp 3', color: 'bg-[#10B981]' },
  'lop-4': { title: 'LỚP 4', desc: 'Bứt phá điểm số với các dạng bài nâng cao Lớp 4', color: 'bg-[#059669]' },
  'lop-5': { title: 'LỚP 5', desc: 'Hành trang kiến thức ôn luyện chuyển cấp vững vàng Lớp 5', color: 'bg-[#9333EA]' }
};

export const GradeDetail = ({ userProfile }) => {
  const { gradeSlug } = useParams();
  const [searchParams] = useSearchParams();
  const initialSubject = searchParams.get('subject') || 'Tất cả';
  const initialSearch = searchParams.get('q') || '';

  const [activeSubject, setActiveSubject] = useState(initialSubject);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [materials, setMaterials] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [assigningMaterial, setAssigningMaterial] = useState(null);

  const gradeInfo = GRADE_CONFIGS[gradeSlug] || GRADE_CONFIGS['lop-1'];

  useEffect(() => {
    fetchGradeMaterials();
  }, [gradeSlug]);

  const fetchGradeMaterials = async () => {
    setLoading(true);
    if (!isSupabaseConfigured()) {
      // Fallback sample materials for grade
      setMaterials([
        {
          id: `demo-${gradeSlug}-exam`,
          grade_id: gradeSlug,
          subject: 'Toán học',
          title: `Đề Khảo Sát Năng Lực 5 Dạng SGK (${gradeInfo.title})`,
          description: 'Hỗ trợ công thức Toán LaTeX, trắc nghiệm nhiều đáp án tính % điểm, đúng/sai, điền khuyết và tự luận tải ảnh.',
          content_type: 'quiz',
          ai_generated_content: SAMPLE_EXAM_DATA
        },
        {
          id: `demo-${gradeSlug}-1`,
          grade_id: gradeSlug,
          subject: 'Toán học',
          title: `Bài Học Toán Tư Duy Vui Nhộn (${gradeInfo.title})`,
          description: 'Bài tập tương tác với sự đồng hành của Thầy/Cô AI Socratic.',
          content_type: 'quiz',
          ai_generated_content: {
            questions: [
              {
                id: 1,
                question: 'Thử thách: Em hãy chọn con số tiếp theo trong dãy số 2, 4, 6, 8, ...?',
                options: ['9', '10', '11', '12'],
                correctIndex: 1,
                explanation: 'Đúng rồi! Quy luật là cộng thêm 2 đơn vị mỗi bước đấy! 🎉'
              }
            ]
          }
        },
        {
          id: `demo-${gradeSlug}-2`,
          grade_id: gradeSlug,
          subject: 'Tiếng Việt',
          title: `Khám Phá Câu Truyện Cổ Tích Tương Tác (${gradeInfo.title})`,
          description: 'Câu chuyện rèn luyện kỹ năng đọc hiểu và vốn từ phong phú.',
          content_type: 'story',
          ai_generated_content: {
            storyParagraphs: [
              'Có một chú thỏ thông minh sống trong khu rừng tri thức. Chú rất thích đọc sách mỗi buổi sáng.',
              'Nhờ đọc sách chăm chỉ, chú thỏ đã giúp các bạn thú khác giải được nhiều câu đố học tập hóc húa.'
            ],
            moralLesson: 'Mỗi cuốn sách là một kho báu tri thức vô giá!'
          }
        },
        {
          id: `demo-${gradeSlug}-iframe`,
          grade_id: gradeSlug,
          subject: 'Toán học',
          title: `Đấu Trường Trò Chơi Tương Tác Nhúng (Wordwall / Quizizz - ${gradeInfo.title})`,
          description: 'Trò chơi kéo thả và thi đấu tốc độ nhúng trực tiếp qua chuẩn W3C iFrame mượt mà.',
          content_type: 'iframe_embed',
          iframe_url: 'https://wordwall.net/embed/4a1c5b8b8d4f4e249f7e53f191f4d96a?themeId=1&templateId=5&fontStackId=0',
          source_url: 'https://wordwall.net/resource/4a1c5b8b8d4f4e249f7e53f191f4d96a',
          ai_generated_content: {
            provider: 'wordwall',
            xpReward: 50,
            durationMinutes: 10
          }
        }
      ]);
      setLoading(false);
      return;
    }

    try {
      // First get grade_id from grades_folders table
      const { data: folderData } = await supabase
        .from('grades_folders')
        .select('id')
        .eq('slug', gradeSlug)
        .single();

      if (folderData) {
        const { data: materialData } = await supabase
          .from('materials')
          .select('*')
          .eq('grade_id', folderData.id);

        if (materialData) {
          const hasExam = materialData.some(m => m.ai_generated_content?.type === 'multi_type_exam' || m.content_type === 'exam');
          if (!hasExam) {
            setMaterials([
              {
                id: `sample-exam-${gradeSlug}`,
                grade_id: folderData.id,
                subject: 'Toán học',
                title: `Đề Khảo Sát Năng Lực 5 Dạng Câu Hỏi SGK (${gradeInfo.title})`,
                description: 'Trắc nghiệm Toán LaTeX, nhiều đáp án tính % điểm, đúng/sai, điền khuyết và tự luận tải ảnh bài làm.',
                content_type: 'quiz',
                ai_generated_content: SAMPLE_EXAM_DATA
              },
              ...materialData
            ]);
          } else {
            setMaterials(materialData);
          }
        }
      }
    } catch (err) {
      console.warn('Error loading materials:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredMaterials = materials.filter(m => {
    const matchesSubject = activeSubject === 'Tất cả' || m.subject === activeSubject;
    const matchesSearch = !searchTerm || m.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  if (selectedMaterial) {
    return (
      <MaterialViewer
        material={selectedMaterial}
        studentId={userProfile?.id}
        onBack={() => setSelectedMaterial(null)}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      
      {/* Grade Header Card */}
      <div className={`${gradeInfo.color} text-white p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6`}>
        <div>
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-black bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full mb-3 transition">
            <ArrowLeft className="w-3.5 h-3.5" /> Tất cả khối lớp
          </Link>
          <h1 className="text-4xl font-black">{gradeInfo.title}</h1>
          <p className="text-white/90 text-base font-medium mt-1 max-w-xl">{gradeInfo.desc}</p>
        </div>

        {/* Teacher Studio & Exam Creator Quick Launch */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setIsExamModalOpen(true)}
            className="bg-white/20 hover:bg-white/30 text-white font-black px-5 py-3 rounded-2xl shadow border border-white/30 flex items-center gap-2 kid-btn whitespace-nowrap text-xs"
          >
            <CheckSquare className="w-4 h-4 text-yellow-300" />
            <span>Tạo Đề Thi 5 Dạng</span>
          </button>
          {userProfile?.role === 'teacher' && (
            <Link
              to="/teacher-studio"
              className="bg-white text-gray-900 hover:bg-orange-50 font-black px-5 py-3 rounded-2xl shadow-lg flex items-center gap-2 kid-btn whitespace-nowrap text-xs"
            >
              <PlusCircle className="w-4 h-4 text-orange-600" />
              <span>AI Studio</span>
            </Link>
          )}
        </div>
      </div>

      {/* Subject Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border-2 border-orange-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Subject Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          {['Tất cả', 'Toán học', 'Tiếng Việt', 'Tiếng Anh', 'Khoa học'].map((sub) => (
            <button
              key={sub}
              onClick={() => setActiveSubject(sub)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition whitespace-nowrap ${
                activeSubject === sub
                  ? 'bg-[#FF6600] text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-orange-100'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm bài học..."
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs font-bold focus:outline-none focus:border-orange-500"
          />
        </div>

      </div>

      {/* Materials Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-500 font-bold">Đang tải bài học...</div>
      ) : filteredMaterials.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map((mat) => (
            <MaterialCard
              key={mat.id}
              material={mat}
              onSelect={(item) => setSelectedMaterial(item)}
              onAssign={(item) => setAssigningMaterial(item)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-orange-50 border-2 border-orange-200 rounded-3xl p-12 text-center text-orange-900">
          <BookOpen className="w-12 h-12 text-orange-400 mx-auto mb-3" />
          <h3 className="text-xl font-black">Chưa có học liệu nào trong mục này!</h3>
          <p className="text-sm font-medium mt-1">Giáo viên có thể sử dụng AI Content Studio để đăng tải bài giảng mới.</p>
        </div>
      )}

      {/* EXAM CREATOR MODAL POPUP */}
      {isExamModalOpen && (
        <ExamCreatorModal
          userProfile={userProfile}
          onClose={() => setIsExamModalOpen(false)}
          onCreated={() => {
            setIsExamModalOpen(false);
            fetchGradeMaterials();
          }}
        />
      )}

      {/* FLEXIBLE ASSIGNMENT MODAL POPUP */}
      {assigningMaterial && (
        <FlexibleAssignmentModal
          material={assigningMaterial}
          userProfile={userProfile}
          onClose={() => setAssigningMaterial(null)}
          onAssigned={() => {
            setAssigningMaterial(null);
            fetchGradeMaterials();
          }}
        />
      )}

    </div>
  );
};

export default GradeDetail;
