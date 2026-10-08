import React, { useState, useEffect } from 'react';
import { useFocusGuardian } from '../hooks/useFocusGuardian';
import { FocusGuardianModal } from './FocusGuardianModal';
import { StrictAiTutor } from './StrictAiTutor';
import { ArrowLeft, Bot, CheckCircle2, ShieldAlert, Award, Sparkles, RefreshCw, Volume2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const MaterialViewer = ({ material, studentId, onBack }) => {
  const [activeTab, setActiveTab] = useState('lesson');
  const [isAiTutorOpen, setIsAiTutorOpen] = useState(false);

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

  // Parse AI Generated Content
  const aiData = material?.ai_generated_content || {};

  const handleSelectOption = (qId, optionIdx) => {
    if (submittedQuiz) return;
    setUserAnswers(prev => ({ ...prev, [qId]: optionIdx }));
  };

  const handleSubmitQuiz = async () => {
    if (!aiData.questions || aiData.questions.length === 0) return;

    let correctCount = 0;
    aiData.questions.forEach((q) => {
      if (userAnswers[q.id] === q.correctIndex) {
        correctCount++;
      }
    });

    const calculatedScore = Math.round((correctCount / aiData.questions.length) * 100);
    setScore(calculatedScore);
    setSubmittedQuiz(true);

    // Trigger celebration confetti
    if (calculatedScore >= 70) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    // Save Progress to Supabase DB
    if (studentId && isSupabaseConfigured()) {
      try {
        await supabase
          .from('student_progress')
          .upsert({
            student_id: studentId,
            material_id: material.id,
            status: 'completed',
            score: calculatedScore,
            completed_at: new Date().toISOString()
          }, { onConflict: 'student_id,material_id' });
      } catch (err) {
        console.warn('Failed to save student progress:', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] py-6 px-4 max-w-6xl mx-auto">
      
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

      {/* Top Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white p-4 rounded-3xl border-2 border-orange-100 shadow-sm">
        <button
          onClick={onBack}
          className="flex items-center gap-2 bg-gray-100 hover:bg-orange-100 text-gray-800 font-extrabold text-sm px-4 py-2.5 rounded-2xl transition kid-btn"
        >
          <ArrowLeft className="w-4 h-4 text-orange-600" />
          <span>Quay lại Thư mục Lớp</span>
        </button>

        {/* Live Focus Guardian Counter Indicator */}
        <div className="flex items-center gap-3">
          <div className="bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full text-xs font-bold text-amber-800 flex items-center gap-1.5 shadow-sm">
            <ShieldAlert className="w-4 h-4 text-amber-600 animate-pulse" />
            <span>Chống xao nhãng:</span>
            <span className="bg-amber-200 px-2 py-0.5 rounded-full text-amber-900 font-black">
              {violationCount} vi phạm
            </span>
          </div>

          <button
            onClick={() => setIsAiTutorOpen(!isAiTutorOpen)}
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-sm px-5 py-2.5 rounded-2xl shadow-md flex items-center gap-2 kid-btn animate-bounce-slow"
          >
            <Bot className="w-5 h-5" />
            <span>Hỏi AI Gia Sư gợi ý</span>
          </button>
        </div>
      </div>

      {/* Main Material Viewer Card */}
      <div className="bg-white rounded-3xl border-4 border-orange-200 shadow-xl overflow-hidden p-6 sm:p-8">
        
        {/* Title & Subject Header */}
        <div className="mb-6 pb-4 border-b border-orange-100">
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
                <span>Nộp bài & Kiểm tra kết quả</span>
              </button>
            ) : (
              <div className="bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-6 text-center animate-fade-in">
                <Award className="w-16 h-16 text-emerald-500 mx-auto mb-2 animate-bounce" />
                <h2 className="text-2xl font-black text-emerald-800">
                  Chúc mừng em đã hoàn thành thử thách!
                </h2>
                <p className="text-emerald-700 font-extrabold text-xl mt-1">
                  Điểm số đạt được: <span className="bg-emerald-600 text-white px-4 py-1 rounded-full">{score} / 100</span>
                </p>
              </div>
            )}
          </div>
        )}

        {/* 2. STORY CONTENT TYPE */}
        {material?.content_type === 'story' && (
          <div className="space-y-6">
            <div className="bg-amber-50/70 p-6 rounded-3xl border-2 border-amber-200 leading-relaxed text-gray-800 text-base font-medium space-y-4">
              {aiData.storyParagraphs?.map((p, idx) => (
                <p key={idx} className="indent-4">{p}</p>
              ))}
            </div>

            {aiData.moralLesson && (
              <div className="bg-orange-50 p-4 rounded-2xl border-2 border-orange-300 text-sm font-bold text-orange-900 flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-orange-500 flex-shrink-0" />
                <div>
                  <span className="block font-black text-orange-700">Bài Học Bài Độc/Kiến Thức Cốt Lõi:</span>
                  {aiData.moralLesson}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. GAME CONTENT TYPE */}
        {material?.content_type === 'game' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-6 rounded-3xl text-center shadow-lg">
              <h2 className="text-2xl font-black">🎮 ĐẤU TRƯỜNG TƯ DUY GAME HỌC TẬP</h2>
              <p className="text-purple-100 text-sm font-bold mt-1">Hãy giúp hiệp sĩ nhỏ vượt qua các thử thách!</p>
            </div>

            {aiData.challenges?.map((item, idx) => (
              <div key={idx} className="bg-purple-50 p-5 rounded-2xl border-2 border-purple-200">
                <h4 className="font-black text-purple-900 text-base mb-2">Thử thách {idx + 1}: {item.prompt}</h4>
                <div className="flex flex-wrap gap-3 mt-3">
                  {item.options?.map((opt, oIdx) => (
                    <button
                      key={oIdx}
                      onClick={() => alert(`Chính xác! Em nhận được huy hiệu ${item.rewardBadge || '🏆 Hiệp Sĩ Thông Thái'}`)}
                      className="bg-white hover:bg-purple-600 hover:text-white border-2 border-purple-300 text-purple-800 font-bold px-4 py-2.5 rounded-xl text-sm transition shadow-sm kid-btn"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 4. IFRAME EMBED CONTENT TYPE (QUIZIZZ, WORDWALL, YOUTUBE) */}
        {(material?.content_type === 'iframe_embed' || material?.iframe_url) && (
          <div className="space-y-4">
            <div className="w-full aspect-video rounded-3xl overflow-hidden border-4 border-orange-300 shadow-xl bg-black">
              <iframe
                src={material.iframe_url || 'https://www.youtube.com/embed/dQw4w9WgXcQ'}
                title={material.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <p className="text-center text-xs text-gray-500 italic">
              * Hệ thống Focus Guardian vẫn đang theo dõi tiến độ tập trung của em khi chơi trò chơi nhúng này!
            </p>
          </div>
        )}

        {/* 5. INTERACTIVE LECTURE CONTENT TYPE */}
        {material?.content_type === 'interactive_lecture' && (
          <div className="space-y-6">
            {aiData.sections?.map((sec, idx) => (
              <div key={idx} className="bg-sky-50 p-6 rounded-3xl border-2 border-sky-200">
                <h3 className="font-black text-sky-900 text-lg mb-2">{sec.heading}</h3>
                <p className="text-gray-700 text-sm font-medium leading-relaxed mb-4">{sec.content}</p>
                <div className="bg-white p-4 rounded-2xl border border-sky-300 text-xs font-bold text-sky-800">
                  <span className="font-black text-orange-600">❓ Câu hỏi kiểm tra nhanh:</span> {sec.interactiveCheck}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default MaterialViewer;
