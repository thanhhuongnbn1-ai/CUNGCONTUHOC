import React, { useState, useEffect } from 'react';
import { GradeWorkspaces } from '../components/GradeWorkspaces';
import { MaterialCard } from '../components/MaterialCard';
import { MaterialViewer } from '../components/MaterialViewer';
import { Sparkles, ShieldCheck, Bot, Layers, ArrowRight, BookOpen, ExternalLink, Gamepad2, Award } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Seed sample production fallback materials if DB is initial
const INITIAL_DEMO_MATERIALS = [
  {
    id: 'mat-1',
    grade_id: 'lop-1',
    subject: 'Toán học',
    title: 'Thử Thách Phép Cộng Trong Phạm Vi 10 (SGK Lớp 1)',
    description: 'Chuyển đổi bài học đếm và cộng SGK thành trò chơi trắc nghiệm vui nhộn với Thầy AI.',
    content_type: 'quiz',
    ai_generated_content: {
      questions: [
        {
          id: 1,
          question: 'Bạn Nhỏ có 4 quả táo đỏ 🍎. Mẹ cho thêm 3 quả táo xanh 🍏. Hỏi Bạn Nhỏ có tất cả bao nhiêu quả táo?',
          options: ['5 quả', '6 quả', '7 quả', '8 quả'],
          correctIndex: 2,
          explanation: '4 + 3 = 7 quả táo đấy em ơi! Đếm tiếp từ 4 thêm 3 là 5, 6, 7 nhé! 🎉'
        },
        {
          id: 2,
          question: 'Con thỏ đếm được 2 củ cà rốt 🥕, sau đó nhổ thêm 5 củ nữa. Tất cả là bao nhiêu củ?',
          options: ['7 củ', '8 củ', '6 củ', '9 củ'],
          correctIndex: 0,
          explanation: '2 + 5 = 7 củ cà rốt! Em làm xuất sắc lắm! 🥕'
        }
      ]
    }
  },
  {
    id: 'mat-2',
    grade_id: 'lop-1',
    subject: 'Tiếng Việt',
    title: 'Truyện Cổ Tích AI: Cậu Bé Chăm Học Và Cây Bút Thần',
    description: 'Rèn luyện khả năng đọc hiểu và rút ra bài học đạo đức về lòng kiên trì tự học.',
    content_type: 'story',
    ai_generated_content: {
      storyParagraphs: [
        'Ngày xưa, ở một làng quê thanh bình, có cậu bé tên là Minh rất ham học. Gia đình nghèo không có tiền mua sách, Minh đã lấy que gỗ vẽ chữ trên cát mỗi ngày.',
        'Cảm động trước tinh thần tự học của Minh, Thầy Cú Thông Thái đã tặng em một cây bút thần kỳ.',
        'Minh không dùng cây bút để ước sự giàu sang, mà dùng nó để vẽ những bài giảng hay giúp các bạn trong làng cùng học giỏi!'
      ],
      moralLesson: 'Tinh thần tự học và sự chia sẻ kiến thức chính là món quà vô giá nhất!'
    }
  },
  {
    id: 'mat-3',
    grade_id: 'lop-2',
    subject: 'Tiếng Anh',
    title: 'Đấu Trường Wordwall: Game Ghép Từ Vựng Phép Thuật',
    description: 'Trò chơi nhúng trực tiếp tương tác kéo thả từ vựng Tiếng Anh lứa tuổi Tiểu học.',
    content_type: 'iframe_embed',
    iframe_url: 'https://wordwall.net/embed/4a1c5b8b8d4f4e249f7e53f191f4d96a?themeId=1&templateId=5&fontStackId=0'
  }
];

export const Home = ({ userProfile, onOpenAuth }) => {
  const [materials, setMaterials] = useState(INITIAL_DEMO_MATERIALS);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    if (!isSupabaseConfigured()) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .order('created_at', { ascending: false });

      if (data && data.length > 0) {
        setMaterials(data);
      }
    } catch (err) {
      console.warn('DB fetch materials error:', err);
    } finally {
      setLoading(false);
    }
  };

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
    <div className="space-y-10 pb-12">
      
      {/* Hero Header Section */}
      <section className="bg-gradient-to-br from-[#FF6600] via-[#FF8533] to-[#FFA366] text-white pt-10 pb-16 px-4 rounded-b-[40px] shadow-lg relative overflow-hidden">
        
        {/* Background decorative circles */}
        <div className="absolute -top-10 -right-10 w-60 h-60 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-40 h-40 bg-yellow-300/20 rounded-full blur-xl pointer-events-none" />

        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          
          <div className="max-w-2xl text-center md:text-left space-y-4">
            <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-black tracking-wider uppercase border border-white/30">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              Nền Tảng EdTech Tự Học Thông Minh Dành Cho Tiểu Học
            </span>

            <h1 className="text-3xl sm:text-5xl font-black leading-tight tracking-tight drop-shadow">
              Học Mà Chơi - Bứt Phá Tư Duy Với AI Gia Sư Socratic
            </h1>

            <p className="text-orange-100 font-bold text-base sm:text-lg leading-relaxed">
              Tự động chuyển đổi SGK khô khan thành Game, Trắc nghiệm vui & Truyện cổ tích tương tác. Kiểm soát gắt gao thái độ tự học với hệ thống chống xao nhãng Focus Guardian.
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
              <a
                href="#workspaces"
                className="bg-white text-[#FF6600] hover:bg-orange-50 font-black text-base px-7 py-3.5 rounded-2xl shadow-xl kid-btn flex items-center gap-2"
              >
                <span>Khám phá 5 Khối Lớp ngay</span>
                <ArrowRight className="w-5 h-5" />
              </a>

              {!userProfile && (
                <button
                  onClick={onOpenAuth}
                  className="bg-orange-700/80 hover:bg-orange-800 text-white font-black text-base px-6 py-3.5 rounded-2xl border border-orange-400/50 shadow-md kid-btn"
                >
                  Đăng ký miễn phí
                </button>
              )}
            </div>
          </div>

          {/* Hero Feature Badges */}
          <div className="bg-white/15 backdrop-blur-md p-6 rounded-3xl border border-white/30 text-white space-y-4 w-full md:w-80 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-yellow-400 text-orange-900 flex items-center justify-center font-black">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-black text-sm">AI Gia Sư Nghiêm Ngặt</h4>
                <p className="text-xs text-orange-100">Không cho đáp án, gợi mở tư duy</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-400 text-emerald-950 flex items-center justify-center font-black">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-black text-sm">Focus Guardian</h4>
                <p className="text-xs text-orange-100">Cảnh báo & ghi nhận lượt rời tab</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-400 text-purple-950 flex items-center justify-center font-black">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-black text-sm">AI Content Studio</h4>
                <p className="text-xs text-orange-100">Biến SGK thành Game trong 1-click</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Grade Workspaces Section matching VuiHoc design */}
      <div id="workspaces">
        <GradeWorkspaces />
      </div>

      {/* Popular Production Materials Grid */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-black text-gray-800 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-[#FF6600]" />
              Học Liệu Nổi Bật Dành Cho Học Sinh Tiểu Học
            </h3>
            <p className="text-xs text-gray-500 font-bold">Nội dung tương tác trực tiếp qua Supabase DB</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.map((mat) => (
            <MaterialCard
              key={mat.id}
              material={mat}
              onSelect={(item) => setSelectedMaterial(item)}
            />
          ))}
        </div>
      </section>

    </div>
  );
};

export default Home;
