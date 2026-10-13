import React, { useState, useEffect } from 'react';
import { useFocusGuardian } from '../hooks/useFocusGuardian';
import { useContentProtection } from '../hooks/useContentProtection';
import { FocusGuardianModal } from './FocusGuardianModal';
import { StrictAiTutor } from './StrictAiTutor';
import { SecureContentViewer } from './SecureContentViewer';
import { EdTechGameSDK } from '../lib/gameSDK';
import { ArrowLeft, Bot, CheckCircle2, ShieldAlert, Award, Sparkles, RefreshCw, Volume2, Gamepad2, ShieldCheck, Lock, Play, AlertTriangle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { MultiTypeExamViewer } from './MultiTypeExamViewer';
import { autoGradingService } from '../lib/autoGradingService';
import { InstantScoreModal } from './InstantScoreModal';
import { IframeGamePlayer } from './IframeGamePlayer';

export const MaterialViewer = ({ material, studentId, studentName = 'Bé Minh Triết', onBack }) => {
  const [activeTab, setActiveTab] = useState('lesson');
  const [isAiTutorOpen, setIsAiTutorOpen] = useState(false);
  const [gameResult, setGameResult] = useState(null);

  // Content Protection (Anti-copy & Download Limiter)
  const { warningMessage } = useContentProtection({ isProtected: true });

  // Focus Guardian Hook attached to current material & student
  const { isFocusLost, violationCount, lastViolationTime, dismissWarning } = useFocusGuardian({
    studentId,
    materialId: material?.id,
    isEnabled: true
  });

  // Quiz State
  const [userAnswers, setUserAnswers] = useState({});
  const [submittedQuiz, setSubmittedQuiz] = useState(false);
  const [score, setScore] = useState(0);
  const [quizGradeResult, setQuizGradeResult] = useState(null);
  const [showInstantQuizModal, setShowInstantQuizModal] = useState(false);

  // Interactive HTML5 Mini Game State
  const [gameMathA, setGameMathA] = useState(5);
  const [gameMathB, setGameMathB] = useState(3);
  const [gameAnswerInput, setGameAnswerInput] = useState('');
  const [gameScoreCount, setGameScoreCount] = useState(0);
  const [gameTotalQuestions, setGameTotalQuestions] = useState(0);

  // Parse AI Generated Content
  const aiData = material?.ai_generated_content || {};

  useEffect(() => {
    // 1. Khởi tạo Game SDK
    if (material?.id) {
      EdTechGameSDK.init({
        studentId: studentId || 'demo-student',
        materialId: material.id
      });

      // Lắng nghe điểm số được ghi nhận tự động từ SDK
      const unsubscribe = EdTechGameSDK.onScoreSaved((result) => {
        setGameResult(result);
      });

      return () => unsubscribe();
    }
  }, [material, studentId]);

  const handleSelectOption = (qId, optionIdx) => {
    if (submittedQuiz) return;
    setUserAnswers(prev => ({ ...prev, [qId]: optionIdx }));
  };

  const handleSubmitQuiz = async () => {
    if (!aiData.questions || aiData.questions.length === 0) return;

    const formattedQuestions = aiData.questions.map(q => ({
      ...q,
      type: q.type || 'single_choice'
    }));

    // Chấm điểm trắc nghiệm tự động tức thì & đồng bộ Database Supabase
    const gradeResult = await autoGradingService.submitAndSync({
      questions: formattedQuestions,
      answers: userAnswers,
      timeSpentSeconds: 60,
      material,
      studentId: studentId || 'demo-student',
      studentName
    });

    setScore(gradeResult.score100);
    setQuizGradeResult(gradeResult);
    setSubmittedQuiz(true);
    setShowInstantQuizModal(true);

    try {
      confetti({
        particleCount: 110,
        spread: 75,
        origin: { y: 0.6 }
      });
    } catch (_) {}

    // Tự động đồng bộ điểm số vào SDK & Database
    await EdTechGameSDK.submitScore({
      score: gradeResult.score100,
      maxScore: 100,
      metadata: { type: 'quiz', title: material.title }
    });
  };

  const handleRetryQuiz = () => {
    setUserAnswers({});
    setSubmittedQuiz(false);
    setScore(0);
    setQuizGradeResult(null);
  };

  // Submit điểm từ Game HTML5 tương tác
  const handleAnswerGameMath = async (e) => {
    e.preventDefault();
    const parsedAns = Number(gameAnswerInput);
    const correct = parsedAns === (gameMathA + gameMathB);

    const nextScore = correct ? gameScoreCount + 20 : gameScoreCount;
    const nextTotal = gameTotalQuestions + 1;
    setGameScoreCount(nextScore);
    setGameTotalQuestions(nextTotal);
    setGameAnswerInput('');

    if (nextTotal >= 5) {
      // Kết thúc ván game -> Kích hoạt JavaScript Game SDK tự động ghi điểm về Supabase DB
      await EdTechGameSDK.submitScore({
        score: nextScore,
        maxScore: 100,
        metadata: { gameType: 'math_speed_challenge', totalQuestions: 5 }
      });
    } else {
      // Câu hỏi tiếp theo
      setGameMathA(Math.floor(Math.random() * 8) + 2);
      setGameMathB(Math.floor(Math.random() * 8) + 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] py-6 px-4 max-w-6xl mx-auto select-none" style={{ userSelect: 'none' }}>
      
      {/* Cảnh báo bảo vệ bản quyền chống copy */}
      {warningMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white font-black text-xs px-6 py-3 rounded-2xl shadow-2xl border-2 border-white flex items-center gap-2 animate-bounce">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{warningMessage}</span>
        </div>
      )}

      {/* Focus Guardian Warning Pop-up Modal */}
      <FocusGuardianModal
        isOpen={isFocusLost}
        violationCount={violationCount}
        lastViolationTime={lastViolationTime}
        onDismiss={dismissWarning}
      />

      {/* Strict AI Tutor Floating Drawer */}
      <StrictAiTutor
        materialTitle={material?.title}
        materialId={material?.id}
        studentId={studentId}
        isOpen={isAiTutorOpen}
        onClose={() => setIsAiTutorOpen(false)}
      />

      {/* Render Multi-Type Exam nếu học liệu là Đề thi 5 dạng */}
      {(material?.content_type === 'exam' || material?.ai_generated_content?.type === 'multi_type_exam') ? (
        <MultiTypeExamViewer
          material={material}
          studentId={studentId}
          studentName={studentName}
          onBack={onBack}
        />
      ) : (
        <>
          {/* Top Header Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white p-4 rounded-3xl border-2 border-orange-100 shadow-sm">
            <button
              onClick={onBack}
              className="flex items-center gap-2 bg-gray-100 hover:bg-orange-100 text-gray-800 font-extrabold text-sm px-4 py-2.5 rounded-2xl transition kid-btn"
            >
          <ArrowLeft className="w-4 h-4 text-orange-600" />
          <span>Quay lại Thư mục Lớp</span>
        </button>

        {/* Live Focus Guardian & Protection Indicators */}
        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full text-xs font-bold text-emerald-800 flex items-center gap-1.5 shadow-sm">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Chống copy & Tải về: BẬT</span>
          </div>

          <div className="bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full text-xs font-bold text-amber-800 flex items-center gap-1.5 shadow-sm">
            <ShieldAlert className="w-4 h-4 text-amber-600 animate-pulse" />
            <span>Focus:</span>
            <span className="bg-amber-200 px-2 py-0.5 rounded-full text-amber-900 font-black">
              {violationCount} vi phạm
            </span>
          </div>

          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent('open_ai_tutor_with_material', { detail: { material } }));
            }}
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-sm px-5 py-2.5 rounded-2xl shadow-md flex items-center gap-2 kid-btn animate-bounce-slow"
          >
            <Bot className="w-5 h-5" />
            <span>Hỏi Trợ Giảng AI</span>
          </button>
        </div>
      </div>

      {/* Thông báo điểm số Game SDK tự động ghi nhận */}
      {gameResult && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-4 rounded-3xl shadow-xl flex items-center justify-between gap-4 mb-6 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white text-emerald-600 rounded-2xl flex items-center justify-center font-black text-xl shadow">
              🏆
            </div>
            <div>
              <span className="text-xs uppercase font-black text-emerald-200 tracking-wider">
                SDK JAVASCRIPT GHI NHẬN ĐIỂM TỰ ĐỘNG THÀNH CÔNG
              </span>
              <h4 className="text-lg font-black leading-tight">
                Điểm số đạt được: {gameResult.score} / {gameResult.maxScore} ({gameResult.percentage}%)
              </h4>
            </div>
          </div>
          <div className="bg-white/20 px-4 py-2 rounded-2xl text-xs font-extrabold text-white text-center">
            ✓ Đã đồng bộ Supabase DB
          </div>
        </div>
      )}

      {/* Main Material Card */}
      <div className="bg-white rounded-3xl border-4 border-orange-200 shadow-xl overflow-hidden p-6 sm:p-8">
        
        {/* Title & Subject Header */}
        <div className="mb-6 pb-4 border-b border-orange-100 flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="bg-orange-100 text-orange-700 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
              {material?.subject || 'Bài Học'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-800 mt-2">
              {material?.title}
            </h1>
            <p className="text-gray-500 font-medium text-sm mt-1">
              {material?.description}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-2xl text-xs font-bold text-gray-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Bản quyền: {studentName}</span>
          </div>
        </div>

        {/* Dynamic Content Display based on content_type */}

        {/* 1. QUIZ CONTENT TYPE */}
        {material?.content_type === 'quiz' && (
          <div className="space-y-6">
            {aiData.questions?.map((q, idx) => (
              <div key={q.id || idx} className="bg-orange-50/60 rounded-2xl p-5 border-2 border-orange-100">
                <h3 className="font-extrabold text-base text-gray-800 mb-3 flex items-start gap-2">
                  <span className="bg-orange-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 font-black">
                    {idx + 1}
                  </span>
                  <span>{q.question}</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  {q.options?.map((opt, optIdx) => {
                    const isSelected = userAnswers[q.id] === optIdx;
                    const isCorrect = q.correctIndex === optIdx;
                    let btnStyle = "bg-white border-gray-200 text-gray-700 hover:border-orange-400";

                    if (submittedQuiz) {
                      if (isCorrect) btnStyle = "bg-emerald-100 border-emerald-500 text-emerald-900 font-black";
                      else if (isSelected) btnStyle = "bg-red-100 border-red-400 text-red-800";
                    } else if (isSelected) {
                      btnStyle = "bg-orange-500 border-orange-600 text-white font-black shadow";
                    }

                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleSelectOption(q.id, optIdx)}
                        className={`p-3.5 rounded-xl border-2 text-sm font-bold text-left transition ${btnStyle}`}
                      >
                        {String.fromCharCode(65 + optIdx)}. {opt}
                      </button>
                    );
                  })}
                </div>

                {submittedQuiz && (
                  <div className="mt-3 p-3 bg-white rounded-xl border border-orange-200 text-xs font-medium text-gray-700">
                    <span className="font-black text-orange-600">💡 Giải thích của Thầy/Cô AI:</span> {q.explanation}
                  </div>
                )}
              </div>
            ))}

            {!submittedQuiz ? (
              <button
                onClick={handleSubmitQuiz}
                disabled={Object.keys(userAnswers).length === 0}
                className="w-full bg-[#FF6600] hover:bg-orange-600 disabled:opacity-50 text-white font-black text-lg py-4 rounded-2xl shadow-lg kid-btn flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-6 h-6" />
                <span>Nộp bài & Tự động ghi điểm SDK</span>
              </button>
            ) : (
              <div className="bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-6 text-center animate-fade-in space-y-3">
                <Award className="w-16 h-16 text-emerald-500 mx-auto mb-2 animate-bounce" />
                <h2 className="text-2xl font-black text-emerald-800">
                  Chúc mừng em đã hoàn thành thử thách!
                </h2>
                <p className="text-emerald-700 font-extrabold text-xl">
                  Điểm số đạt được: <span className="bg-emerald-600 text-white px-4 py-1 rounded-full">{score} / 100 ({parseFloat(((score/100)*10).toFixed(1))} / 10)</span>
                </p>
                <p className="text-xs text-gray-500 font-bold">
                  ✓ Hệ thống đã tự động chấm điểm và đồng bộ vào bảng exam_submissions & student_progress trên CSDL Supabase.
                </p>

                <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
                  <button
                    onClick={() => setShowInstantQuizModal(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow kid-btn flex items-center gap-2"
                  >
                    <Award className="w-4 h-4 text-yellow-300" />
                    <span>Xem Bảng Điểm Tự Động Chi Tiết</span>
                  </button>
                  <button
                    onClick={handleRetryQuiz}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-extrabold text-xs px-4 py-2.5 rounded-xl transition kid-btn flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-4 h-4 text-orange-600" />
                    <span>Làm Lại Thử Thách</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. GAME HTML5 ĐẤU TRƯỜNG TƯ DUY (KẾT NỐI SDK GHI ĐIỂM TỰ ĐỘNG) */}
        {material?.content_type === 'game' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white p-6 rounded-3xl shadow-lg flex items-center justify-between">
              <div>
                <span className="bg-white/20 text-xs font-black px-3 py-1 rounded-full uppercase">HTML5 GAME SDK LIVE</span>
                <h2 className="text-2xl font-black mt-1">🎮 Đấu Trường Phép Tính Nhanh (Game HTML5)</h2>
                <p className="text-purple-100 text-xs font-bold mt-1">
                  Mỗi câu đúng cộng 20 điểm. Hoàn thành 5 câu để SDK tự động gửi điểm về Database!
                </p>
              </div>
              <div className="bg-white/20 p-3 rounded-2xl text-center">
                <span className="text-xs font-bold block opacity-80">Điểm hiện tại</span>
                <span className="text-2xl font-black">{gameScoreCount}/100</span>
              </div>
            </div>

            {gameTotalQuestions < 5 ? (
              <form onSubmit={handleAnswerGameMath} className="bg-purple-50 p-6 sm:p-8 rounded-3xl border-2 border-purple-200 text-center space-y-4">
                <span className="text-xs font-black text-purple-700 uppercase">CÂU HỎI {gameTotalQuestions + 1} / 5</span>
                <div className="text-4xl sm:text-5xl font-black text-purple-900 tracking-wider">
                  {gameMathA} + {gameMathB} = ?
                </div>

                <div className="max-w-xs mx-auto flex items-center gap-2 pt-2">
                  <input
                    type="number"
                    required
                    value={gameAnswerInput}
                    onChange={(e) => setGameAnswerInput(e.target.value)}
                    placeholder="Nhập kết quả..."
                    className="w-full bg-white border-2 border-purple-300 rounded-2xl p-3 text-xl font-black text-center focus:outline-none focus:border-purple-600 shadow-inner"
                  />
                  <button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-700 text-white font-black text-sm px-6 py-3.5 rounded-2xl shadow kid-btn whitespace-nowrap"
                  >
                    Trả lời
                  </button>
                </div>
              </form>
            ) : (
              <div className="bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-8 text-center space-y-3 animate-fade-in">
                <div className="text-5xl">🎉</div>
                <h3 className="text-2xl font-black text-emerald-800">Hoàn thành ván game xuất sắc!</h3>
                <p className="text-base font-bold text-emerald-700">
                  Tổng điểm: <strong className="text-emerald-900 text-2xl">{gameScoreCount}/100</strong>
                </p>
                <div className="inline-flex items-center gap-2 bg-emerald-600 text-white font-extrabold text-xs px-4 py-2 rounded-full shadow">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>SDK đã gửi kết quả vào bảng game_scores trên Supabase</span>
                </div>
                <div>
                  <button
                    onClick={() => {
                      setGameScoreCount(0);
                      setGameTotalQuestions(0);
                      setGameResult(null);
                    }}
                    className="mt-3 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow kid-btn"
                  >
                    Chơi lại ván mới
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. STORY CONTENT TYPE (BẢO VỆ CHỐNG SAO CHÉP & BÔI ĐEN VĂN BẢN) */}
        {material?.content_type === 'story' && (
          <div className="space-y-6">
            <div className="bg-amber-50/70 p-6 rounded-3xl border-2 border-amber-200 leading-relaxed text-gray-800 text-base font-medium space-y-4 relative select-none">
              {aiData.storyParagraphs?.map((p, idx) => (
                <p key={idx} className="indent-4">{p}</p>
              ))}
            </div>

            {aiData.moralLesson && (
              <div className="bg-orange-50 p-4 rounded-2xl border-2 border-orange-300 text-sm font-bold text-orange-900 flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-orange-500 flex-shrink-0" />
                <div>
                  <span className="block font-black text-orange-700">Bài Học Rút Ra:</span>
                  {aiData.moralLesson}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. IFRAME EMBED (WORDWALL, QUIZIZZ, KAHOOT, CANVA, GENIALLY) */}
        {(material?.content_type === 'iframe_embed' || material?.iframe_url) && (
          <IframeGamePlayer
            material={material}
            studentId={studentId}
            studentName={studentName}
            onBack={onBack}
          />
        )}

        {/* 5. SECURE PDF / VIDEO VIEWER */}
        {(material?.content_type === 'pdf' || material?.content_type === 'video') && (
          <SecureContentViewer
            contentType={material.content_type}
            sourceUrl={material.source_url}
            title={material.title}
            studentName={studentName}
            studentId={studentId || 'HS-2026'}
          />
        )}

      </div>
    </>
  )}

  {/* MODAL BẢNG ĐIỂM CHẤM TỰ ĐỘNG TỨC THÌ */}
  <InstantScoreModal
    isOpen={showInstantQuizModal}
    onClose={() => setShowInstantQuizModal(false)}
    result={quizGradeResult}
    studentName={studentName}
    onReviewDetails={() => setShowInstantQuizModal(false)}
    onRetry={handleRetryQuiz}
  />
</div>
);
};

export default MaterialViewer;
