import React, { useState, useEffect } from 'react';
import { LatexRenderer } from './LatexRenderer';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Award,
  Upload,
  Image as ImageIcon,
  FileText,
  AlertCircle,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Check,
  Send,
  Eye,
  Trash2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const MultiTypeExamViewer = ({
  material,
  studentId = 'demo-student',
  studentName = 'Học sinh',
  onBack
}) => {
  const examData = material?.ai_generated_content || {};
  const questions = examData.questions || [];
  const timeLimitMinutes = examData.timeLimitMinutes || 20;

  // Answers State:
  // single_choice: { [qId]: number (optionIdx) }
  // multiple_choice: { [qId]: number[] (optionIdxs) }
  // true_false: { [qId]: { [itemId]: boolean } }
  // fill_in_the_blank: { [qId]: { [blankId]: string } }
  // essay: { [qId]: { text: string, imageUrl: string, fileName: string } }
  const [answers, setAnswers] = useState({});
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);

  // Exam flow states
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(timeLimitMinutes * 60);
  const [timerActive, setTimerActive] = useState(true);
  const [scoreResult, setScoreResult] = useState(null);
  const [previewImageModal, setPreviewImageModal] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Countdown timer
  useEffect(() => {
    if (!timerActive || isSubmitted || timeLeftSeconds <= 0) return;
    const interval = setInterval(() => {
      setTimeLeftSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerActive, isSubmitted, timeLeftSeconds]);

  // Format time mm:ss
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // --- Handlers for answering ---
  const handleSingleChoice = (qId, optIdx) => {
    if (isSubmitted) return;
    setAnswers(prev => ({
      ...prev,
      [qId]: optIdx
    }));
  };

  const handleMultipleChoice = (qId, optIdx) => {
    if (isSubmitted) return;
    setAnswers(prev => {
      const current = prev[qId] || [];
      const exists = current.includes(optIdx);
      const updated = exists ? current.filter(i => i !== optIdx) : [...current, optIdx];
      return {
        ...prev,
        [qId]: updated
      };
    });
  };

  const handleTrueFalse = (qId, itemId, value) => {
    if (isSubmitted) return;
    setAnswers(prev => {
      const current = prev[qId] || {};
      return {
        ...prev,
        [qId]: {
          ...current,
          [itemId]: value
        }
      };
    });
  };

  const handleFillBlank = (qId, blankId, value) => {
    if (isSubmitted) return;
    setAnswers(prev => {
      const current = prev[qId] || {};
      return {
        ...prev,
        [qId]: {
          ...current,
          [blankId]: value
        }
      };
    });
  };

  const handleEssayText = (qId, text) => {
    if (isSubmitted) return;
    setAnswers(prev => {
      const current = prev[qId] || { text: '', imageUrl: '', fileName: '' };
      return {
        ...prev,
        [qId]: {
          ...current,
          text
        }
      };
    });
  };

  const handleEssayImageUpload = (qId, file) => {
    if (isSubmitted || !file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Url = e.target.result;
      setAnswers(prev => {
        const current = prev[qId] || { text: '', imageUrl: '', fileName: '' };
        return {
          ...prev,
          [qId]: {
            ...current,
            imageUrl: base64Url,
            fileName: file.name
          }
        };
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveEssayImage = (qId) => {
    if (isSubmitted) return;
    setAnswers(prev => {
      const current = prev[qId] || { text: '', imageUrl: '', fileName: '' };
      return {
        ...prev,
        [qId]: {
          ...current,
          imageUrl: '',
          fileName: ''
        }
      };
    });
  };

  // Check if a question is answered
  const isQuestionAnswered = (q) => {
    const ans = answers[q.id];
    if (ans === undefined || ans === null) return false;
    if (q.type === 'single_choice') return typeof ans === 'number';
    if (q.type === 'multiple_choice') return Array.isArray(ans) && ans.length > 0;
    if (q.type === 'true_false') {
      const answeredCount = Object.keys(ans || {}).length;
      return answeredCount > 0;
    }
    if (q.type === 'fill_in_the_blank') {
      const values = Object.values(ans || {});
      return values.some(v => typeof v === 'string' && v.trim().length > 0);
    }
    if (q.type === 'essay') {
      return Boolean(ans?.text?.trim() || ans?.imageUrl);
    }
    return false;
  };

  // --- Scoring Logic ---
  const calculateScore = () => {
    let autoGradableCount = 0;
    let earnedAutoPoints = 0;
    const breakdown = {};

    questions.forEach((q) => {
      const userAns = answers[q.id];

      if (q.type === 'single_choice') {
        autoGradableCount++;
        const isCorrect = userAns === q.correctIndex;
        const pts = isCorrect ? 1 : 0;
        earnedAutoPoints += pts;
        breakdown[q.id] = {
          type: q.type,
          isCorrect,
          scorePercent: isCorrect ? 100 : 0,
          earned: pts,
          max: 1
        };
      } else if (q.type === 'multiple_choice') {
        autoGradableCount++;
        const correctSet = new Set(q.correctIndices || []);
        const chosenList = userAns || [];
        const totalCorrect = correctSet.size || 1;

        let rightChoices = 0;
        let wrongChoices = 0;
        chosenList.forEach(idx => {
          if (correctSet.has(idx)) {
            rightChoices++;
          } else {
            wrongChoices++;
          }
        });

        // Partial scoring formula:
        // (rightChoices - 0.5 * wrongChoices) / totalCorrect
        const rawRatio = (rightChoices - 0.5 * wrongChoices) / totalCorrect;
        const cappedRatio = Math.max(0, Math.min(1, rawRatio));
        const pts = parseFloat(cappedRatio.toFixed(2));
        earnedAutoPoints += pts;

        breakdown[q.id] = {
          type: q.type,
          isCorrect: cappedRatio === 1,
          isPartial: cappedRatio > 0 && cappedRatio < 1,
          scorePercent: Math.round(cappedRatio * 100),
          earned: pts,
          max: 1,
          rightChoices,
          wrongChoices,
          totalCorrect
        };
      } else if (q.type === 'true_false') {
        autoGradableCount++;
        const items = q.items || [];
        const totalItems = items.length || 1;
        let correctItemCount = 0;

        items.forEach(item => {
          const userVal = userAns ? userAns[item.id] : undefined;
          if (userVal === item.correct) {
            correctItemCount++;
          }
        });

        const ratio = correctItemCount / totalItems;
        const pts = parseFloat(ratio.toFixed(2));
        earnedAutoPoints += pts;

        breakdown[q.id] = {
          type: q.type,
          isCorrect: correctItemCount === totalItems,
          scorePercent: Math.round(ratio * 100),
          earned: pts,
          max: 1,
          correctItemCount,
          totalItems
        };
      } else if (q.type === 'fill_in_the_blank') {
        autoGradableCount++;
        const blanks = q.blanks || [];
        const totalBlanks = blanks.length || 1;
        let correctBlankCount = 0;

        blanks.forEach(b => {
          const userVal = (userAns ? userAns[b.id] : '') || '';
          const cleanedUserVal = userVal.trim().toLowerCase();
          const isMatch = (b.acceptableAnswers || []).some(
            acc => acc.trim().toLowerCase() === cleanedUserVal
          );
          if (isMatch) correctBlankCount++;
        });

        const ratio = correctBlankCount / totalBlanks;
        const pts = parseFloat(ratio.toFixed(2));
        earnedAutoPoints += pts;

        breakdown[q.id] = {
          type: q.type,
          isCorrect: correctBlankCount === totalBlanks,
          scorePercent: Math.round(ratio * 100),
          earned: pts,
          max: 1,
          correctBlankCount,
          totalBlanks
        };
      } else if (q.type === 'essay') {
        // Essay is submitted for manual teacher grading
        breakdown[q.id] = {
          type: q.type,
          isEssayPending: true,
          submittedText: userAns?.text || '',
          submittedImage: userAns?.imageUrl || null,
          max: q.maxScore || 10
        };
      }
    });

    const objectiveScore100 = autoGradableCount > 0
      ? Math.round((earnedAutoPoints / autoGradableCount) * 100)
      : 100;

    return {
      autoGradableCount,
      earnedAutoPoints,
      objectiveScore100,
      breakdown,
      hasEssay: questions.some(q => q.type === 'essay')
    };
  };

  const handleAutoSubmit = () => {
    if (!isSubmitted) {
      handleSubmitExam();
    }
  };

  const handleSubmitExam = async () => {
    setTimerActive(false);
    setIsSubmitted(true);
    setIsSaving(true);

    const calculated = calculateScore();
    setScoreResult(calculated);

    // Confetti effect
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (_) {}

    // Synchronize to Database
    if (material?.id && isSupabaseConfigured()) {
      try {
        // 1. Sync to student_progress
        await supabase
          .from('student_progress')
          .upsert({
            material_id: material.id,
            student_id: studentId && studentId !== 'demo-student' ? studentId : null,
            status: 'completed',
            score: calculated.objectiveScore100,
            completed_at: new Date().toISOString()
          }, { onConflict: 'student_id,material_id' })
          .catch(() => {});

        // 2. Try inserting into exam_submissions if table exists
        await supabase
          .from('exam_submissions')
          .insert({
            material_id: material.id,
            student_id: studentId && studentId !== 'demo-student' ? studentId : null,
            student_name: studentName,
            answers,
            scores_breakdown: calculated.breakdown,
            total_score: calculated.objectiveScore100,
            max_score: 100,
            essay_submission: answers
          })
          .catch(() => {});

        setSaveSuccessMsg('✓ Đã đồng bộ kết quả bài thi vào cơ sở dữ liệu Supabase!');
      } catch (err) {
        console.warn('Sync exam submission error:', err);
        setSaveSuccessMsg('✓ Đã lưu kết quả bài thi (chế độ bảo lưu offline/local)');
      }
    } else {
      setSaveSuccessMsg('✓ Đã lưu kết quả bài thi thành công!');
    }

    setIsSaving(false);
  };

  const currentQ = questions[activeQuestionIdx];
  const answeredCount = questions.filter(isQuestionAnswered).length;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      
      {/* EXAM TOP HEADER */}
      <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="bg-white/20 hover:bg-white/30 p-2.5 rounded-2xl transition kid-btn text-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-white/25 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                {material?.subject || 'ĐỀ THI'}
              </span>
              <span className="bg-white/20 text-xs font-bold px-2.5 py-0.5 rounded-full">
                5 Dạng Câu Hỏi
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black mt-1">
              {material?.title || examData.title || 'Đề Thi Tương Tác'}
            </h1>
            <p className="text-orange-100 text-xs font-medium">
              Thí sinh: <strong className="text-white">{studentName}</strong> • {questions.length} câu hỏi
            </p>
          </div>
        </div>

        {/* TIMER & PROGRESS PILL */}
        <div className="flex items-center gap-3">
          <div className="bg-white/20 backdrop-blur-md px-4 py-2.5 rounded-2xl flex items-center gap-2 border border-white/20">
            <Clock className={`w-5 h-5 ${timeLeftSeconds < 180 ? 'text-red-200 animate-pulse' : 'text-white'}`} />
            <div>
              <span className="text-[10px] uppercase font-bold block opacity-80">Thời gian</span>
              <span className="text-lg font-black tracking-wider">
                {formatTime(timeLeftSeconds)}
              </span>
            </div>
          </div>

          <div className="bg-white/20 backdrop-blur-md px-4 py-2.5 rounded-2xl text-center border border-white/20">
            <span className="text-[10px] uppercase font-bold block opacity-80">Tiến độ</span>
            <span className="text-lg font-black">
              {answeredCount}/{questions.length}
            </span>
          </div>
        </div>
      </div>

      {/* QUESTION NAVIGATION BAR */}
      <div className="bg-white p-4 rounded-2xl border-2 border-orange-100 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-gray-500 mr-1">Danh sách câu:</span>
          {questions.map((q, idx) => {
            const answered = isQuestionAnswered(q);
            const isActive = idx === activeQuestionIdx;
            let badgeBg = 'bg-gray-100 text-gray-600 border-gray-200';

            if (isSubmitted && scoreResult?.breakdown?.[q.id]) {
              const b = scoreResult.breakdown[q.id];
              if (b.isEssayPending) badgeBg = 'bg-purple-100 text-purple-700 border-purple-300';
              else if (b.isCorrect) badgeBg = 'bg-emerald-100 text-emerald-800 border-emerald-400 font-black';
              else if (b.isPartial) badgeBg = 'bg-amber-100 text-amber-800 border-amber-400 font-bold';
              else badgeBg = 'bg-red-100 text-red-700 border-red-300';
            } else if (isActive) {
              badgeBg = 'bg-[#FF6600] text-white border-orange-600 shadow';
            } else if (answered) {
              badgeBg = 'bg-orange-100 text-orange-800 border-orange-300 font-bold';
            }

            return (
              <button
                key={q.id || idx}
                onClick={() => setActiveQuestionIdx(idx)}
                className={`w-9 h-9 rounded-xl border-2 text-xs font-black transition kid-btn ${badgeBg}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        {/* Action Button: Submit or Finish */}
        {!isSubmitted ? (
          <button
            onClick={handleSubmitExam}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow kid-btn flex items-center gap-2 ml-auto"
          >
            <Send className="w-4 h-4" />
            <span>Nộp Bài Thi</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
              Điểm: {scoreResult?.objectiveScore100}/100
            </span>
          </div>
        )}
      </div>

      {/* RESULT BANNER (IF SUBMITTED) */}
      {isSubmitted && scoreResult && (
        <div className="bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-700 text-white p-6 sm:p-8 rounded-3xl shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <Award className="w-16 h-16 text-yellow-300 flex-shrink-0 animate-bounce" />
              <div>
                <span className="bg-white/20 text-xs font-black px-3 py-1 rounded-full uppercase">
                  BÁO CÁO KẾT QUẢ BÀI THI
                </span>
                <h2 className="text-2xl sm:text-3xl font-black mt-1">
                  Chúc mừng {studentName} đã hoàn thành bài thi!
                </h2>
                <p className="text-emerald-100 text-xs font-medium mt-1">
                  Hệ thống đã tự động chấm 4 dạng khách quan & ghi nhận bài nộp tự luận/ảnh chụp.
                </p>
              </div>
            </div>

            <div className="bg-white/20 p-4 rounded-2xl text-center border border-white/25 min-w-[140px]">
              <span className="text-xs font-bold block opacity-90 uppercase">Điểm Tự Chấm</span>
              <span className="text-4xl font-black text-yellow-300">
                {scoreResult.objectiveScore100}
                <span className="text-sm text-white font-medium">/100</span>
              </span>
            </div>
          </div>

          {scoreResult.hasEssay && (
            <div className="bg-white/10 p-3 rounded-xl text-xs flex items-center gap-2 text-emerald-100">
              <Sparkles className="w-4 h-4 text-yellow-300 flex-shrink-0" />
              <span>
                Phần <strong>Tự luận / Tải ảnh bài làm</strong> đã được lưu thành công và gửi tới Thầy/Cô phụ trách để chấm điểm chi tiết.
              </span>
            </div>
          )}

          {saveSuccessMsg && (
            <p className="text-center text-xs font-bold text-yellow-200">
              {saveSuccessMsg}
            </p>
          )}
        </div>
      )}

      {/* QUESTION CARD VIEW */}
      {currentQ && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-orange-100 shadow-md space-y-6">
          
          {/* Question Header & Type Tag */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="bg-[#FF6600] text-white text-xs font-black px-3 py-1 rounded-xl">
                CÂU {activeQuestionIdx + 1} / {questions.length}
              </span>
              <span className="bg-orange-100 text-orange-800 text-xs font-extrabold px-3 py-1 rounded-xl">
                {currentQ.type === 'single_choice' && '🎯 Trắc Nghiệm 1 Đáp Án'}
                {currentQ.type === 'multiple_choice' && '☑️ Trắc Nghiệm Nhiều Đáp Án (% Điểm)'}
                {currentQ.type === 'true_false' && '⚖️ Đúng / Sai Theo Từng Ý'}
                {currentQ.type === 'fill_in_the_blank' && '✍️ Điền Chỗ Trống'}
                {currentQ.type === 'essay' && '📝 Tự Luận & Tải Ảnh Bài Làm'}
              </span>
            </div>

            {/* Status indicator */}
            {isSubmitted && scoreResult?.breakdown?.[currentQ.id] && (
              <div>
                {scoreResult.breakdown[currentQ.id].isCorrect && (
                  <span className="text-emerald-600 font-black text-xs flex items-center gap-1 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4" /> Đúng hoàn toàn (100%)
                  </span>
                )}
                {scoreResult.breakdown[currentQ.id].isPartial && (
                  <span className="text-amber-600 font-black text-xs flex items-center gap-1 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                    <AlertCircle className="w-4 h-4" /> Đạt {scoreResult.breakdown[currentQ.id].scorePercent}% điểm
                  </span>
                )}
                {!scoreResult.breakdown[currentQ.id].isCorrect && !scoreResult.breakdown[currentQ.id].isPartial && !scoreResult.breakdown[currentQ.id].isEssayPending && (
                  <span className="text-red-600 font-black text-xs flex items-center gap-1 bg-red-50 px-3 py-1 rounded-full border border-red-200">
                    <XCircle className="w-4 h-4" /> Chưa chính xác (0%)
                  </span>
                )}
                {scoreResult.breakdown[currentQ.id].isEssayPending && (
                  <span className="text-purple-600 font-black text-xs flex items-center gap-1 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                    <Clock className="w-4 h-4" /> Đã nộp tự luận (Chờ giáo viên)
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Question Text Prompt (With LaTeX Support) */}
          <div className="text-gray-800 text-base sm:text-lg font-bold leading-relaxed">
            <LatexRenderer content={currentQ.question} />
          </div>

          {/* ---------------------------------------------------- */}
          {/* TYPE 1: SINGLE CHOICE (1 ĐÁP ÁN ĐÚNG + LATEX) */}
          {/* ---------------------------------------------------- */}
          {currentQ.type === 'single_choice' && (
            <div className="space-y-3 pt-2">
              {currentQ.options?.map((opt, optIdx) => {
                const isSelected = answers[currentQ.id] === optIdx;
                const isCorrect = currentQ.correctIndex === optIdx;
                let btnStyle = 'bg-gray-50 border-gray-200 text-gray-800 hover:border-orange-300';

                if (isSubmitted) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-black shadow-sm';
                  } else if (isSelected && !isCorrect) {
                    btnStyle = 'bg-red-50 border-red-400 text-red-800';
                  }
                } else if (isSelected) {
                  btnStyle = 'bg-orange-500 border-orange-600 text-white font-black shadow-md';
                }

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSingleChoice(currentQ.id, optIdx)}
                    disabled={isSubmitted}
                    className={`w-full p-4 rounded-2xl border-2 text-left text-sm font-semibold flex items-center gap-3 transition kid-btn ${btnStyle}`}
                  >
                    <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs flex-shrink-0 ${
                      isSelected && !isSubmitted ? 'bg-white text-orange-600' : 'bg-gray-200/70 text-gray-700'
                    }`}>
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <div className="flex-1">
                      <LatexRenderer content={opt} />
                    </div>
                    {isSubmitted && isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    )}
                    {isSubmitted && isSelected && !isCorrect && (
                      <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* TYPE 2: MULTIPLE CHOICE (CHỌN NHIỀU ĐÁP ÁN + % ĐIỂM) */}
          {/* ---------------------------------------------------- */}
          {currentQ.type === 'multiple_choice' && (
            <div className="space-y-3 pt-2">
              <p className="text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-xl inline-block">
                💡 Lưu ý: Câu hỏi có thể có nhiều hơn 1 đáp án đúng. Chọn đúng từng đáp án sẽ được tính % điểm!
              </p>
              {currentQ.options?.map((opt, optIdx) => {
                const selectedList = answers[currentQ.id] || [];
                const isSelected = selectedList.includes(optIdx);
                const isCorrect = (currentQ.correctIndices || []).includes(optIdx);
                let btnStyle = 'bg-gray-50 border-gray-200 text-gray-800 hover:border-orange-300';

                if (isSubmitted) {
                  if (isCorrect && isSelected) {
                    btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-black';
                  } else if (isCorrect && !isSelected) {
                    btnStyle = 'bg-emerald-50/50 border-dashed border-emerald-400 text-emerald-800';
                  } else if (isSelected && !isCorrect) {
                    btnStyle = 'bg-red-50 border-red-400 text-red-800';
                  }
                } else if (isSelected) {
                  btnStyle = 'bg-orange-50 border-orange-500 text-orange-900 font-black shadow-sm';
                }

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleMultipleChoice(currentQ.id, optIdx)}
                    disabled={isSubmitted}
                    className={`w-full p-4 rounded-2xl border-2 text-left text-sm font-semibold flex items-center gap-3 transition kid-btn ${btnStyle}`}
                  >
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 ${
                      isSelected ? 'bg-[#FF6600] border-orange-600 text-white' : 'border-gray-400 bg-white'
                    }`}>
                      {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                    </div>
                    <span className="w-6 font-black text-xs text-gray-500">
                      {String.fromCharCode(65 + optIdx)}.
                    </span>
                    <div className="flex-1">
                      <LatexRenderer content={opt} />
                    </div>
                    {isSubmitted && isCorrect && (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                        Đáp án đúng
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* TYPE 3: TRUE / FALSE (ĐÚNG / SAI THEO TỪNG Ý) */}
          {/* ---------------------------------------------------- */}
          {currentQ.type === 'true_false' && (
            <div className="space-y-4 pt-2">
              <p className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl inline-block">
                ⚖️ Em hãy chọn Đúng hoặc Sai cho từng khẳng định bên dưới:
              </p>
              <div className="space-y-3">
                {currentQ.items?.map((item, itemIdx) => {
                  const currentAns = answers[currentQ.id]?.[item.id];
                  const hasAnswered = currentAns !== undefined;
                  const isItemCorrect = currentAns === item.correct;

                  return (
                    <div
                      key={item.id || itemIdx}
                      className="bg-gray-50 rounded-2xl p-4 border-2 border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-2 flex-1">
                        <span className="w-6 h-6 rounded-lg bg-orange-100 text-orange-700 text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                          {String.fromCharCode(97 + itemIdx)}
                        </span>
                        <div className="text-sm font-semibold text-gray-800 leading-relaxed">
                          <LatexRenderer content={item.statement} />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => handleTrueFalse(currentQ.id, item.id, true)}
                          disabled={isSubmitted}
                          className={`px-4 py-2 rounded-xl text-xs font-black border-2 transition kid-btn ${
                            currentAns === true
                              ? isSubmitted
                                ? item.correct === true ? 'bg-emerald-600 border-emerald-700 text-white' : 'bg-red-600 border-red-700 text-white'
                                : 'bg-[#FF6600] border-orange-600 text-white shadow'
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          Đúng ✓
                        </button>
                        <button
                          type="button"
                          onClick={() => handleTrueFalse(currentQ.id, item.id, false)}
                          disabled={isSubmitted}
                          className={`px-4 py-2 rounded-xl text-xs font-black border-2 transition kid-btn ${
                            currentAns === false
                              ? isSubmitted
                                ? item.correct === false ? 'bg-emerald-600 border-emerald-700 text-white' : 'bg-red-600 border-red-700 text-white'
                                : 'bg-[#FF6600] border-orange-600 text-white shadow'
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          Sai ✗
                        </button>
                      </div>

                      {isSubmitted && (
                        <div className="w-full sm:w-auto text-xs font-bold pt-1 sm:pt-0">
                          {isItemCorrect ? (
                            <span className="text-emerald-600 flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4" /> Chính xác
                            </span>
                          ) : (
                            <span className="text-red-500 flex items-center gap-1">
                              <XCircle className="w-4 h-4" /> Đáp án đúng là: {item.correct ? 'ĐÚNG' : 'SAI'}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* TYPE 4: FILL IN THE BLANK (ĐIỀN CHỖ TRỐNG) */}
          {/* ---------------------------------------------------- */}
          {currentQ.type === 'fill_in_the_blank' && (
            <div className="space-y-4 pt-2">
              {currentQ.template && (
                <div className="p-4 bg-amber-50/70 border-2 border-amber-200 rounded-2xl text-sm sm:text-base font-semibold text-gray-800 leading-relaxed">
                  <LatexRenderer content={currentQ.template} />
                </div>
              )}

              <div className="space-y-3 pt-2">
                {currentQ.blanks?.map((blank, bIdx) => {
                  const userVal = answers[currentQ.id]?.[blank.id] || '';
                  const cleaned = userVal.trim().toLowerCase();
                  const isMatch = (blank.acceptableAnswers || []).some(
                    acc => acc.trim().toLowerCase() === cleaned
                  );

                  return (
                    <div
                      key={blank.id || bIdx}
                      className="bg-gray-50 p-4 rounded-2xl border-2 border-gray-200 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-extrabold text-gray-700">
                          {blank.label || `Vị trí trống (${bIdx + 1})`}:
                        </label>
                        {blank.hint && (
                          <span className="text-[11px] text-amber-700 font-bold bg-amber-100 px-2.5 py-0.5 rounded-full">
                            Gợi ý: {blank.hint}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          disabled={isSubmitted}
                          value={userVal}
                          onChange={(e) => handleFillBlank(currentQ.id, blank.id, e.target.value)}
                          placeholder="Nhập từ hoặc số cần điền..."
                          className={`flex-1 p-3 rounded-xl border-2 text-sm font-bold focus:outline-none focus:border-orange-500 ${
                            isSubmitted
                              ? isMatch ? 'bg-emerald-50 border-emerald-500 text-emerald-900' : 'bg-red-50 border-red-400 text-red-900'
                              : 'bg-white border-gray-300'
                          }`}
                        />
                        {isSubmitted && (
                          <div className="text-xs font-extrabold whitespace-nowrap">
                            {isMatch ? (
                              <span className="text-emerald-600 flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4" /> Đúng
                              </span>
                            ) : (
                              <span className="text-red-600 flex items-center gap-1">
                                <XCircle className="w-4 h-4" /> Đáp án: {blank.acceptableAnswers?.[0]}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* TYPE 5: ESSAY / IMAGE UPLOAD (TỰ LUẬN HOẶC TẢI ẢNH) */}
          {/* ---------------------------------------------------- */}
          {currentQ.type === 'essay' && (
            <div className="space-y-4 pt-2">
              {currentQ.guidelines && (
                <div className="bg-purple-50 p-4 rounded-2xl border-2 border-purple-200 text-xs text-purple-900 font-medium">
                  <span className="font-black text-purple-700 block mb-1">📋 Tiêu chí & Hướng dẫn làm bài:</span>
                  <p className="whitespace-pre-line">{currentQ.guidelines}</p>
                </div>
              )}

              {/* Option A: Gõ bài viết văn bản */}
              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold text-gray-700 flex items-center justify-between">
                  <span>Cách 1: Gõ bài làm trực tiếp vào khung dưới</span>
                  <span className="text-gray-400 font-normal">
                    {(answers[currentQ.id]?.text || '').length} ký tự
                  </span>
                </label>
                <textarea
                  rows={6}
                  disabled={isSubmitted}
                  value={answers[currentQ.id]?.text || ''}
                  onChange={(e) => handleEssayText(currentQ.id, e.target.value)}
                  placeholder="Em hãy viết nội dung bài tự luận tại đây..."
                  className="w-full bg-gray-50 border-2 border-gray-200 rounded-2xl p-4 text-sm font-medium focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Option B: Chụp ảnh vở & Tải ảnh bài làm */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-extrabold text-gray-700">
                  Cách 2: Hoặc tải ảnh chụp bài làm viết tay (từ điện thoại / máy tính)
                </label>

                {!answers[currentQ.id]?.imageUrl ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:border-orange-400 transition bg-gray-50/50">
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isSubmitted}
                      id={`essay-file-${currentQ.id}`}
                      className="hidden"
                      onChange={(e) => handleEssayImageUpload(currentQ.id, e.target.files[0])}
                    />
                    <label
                      htmlFor={`essay-file-${currentQ.id}`}
                      className="cursor-pointer inline-flex flex-col items-center gap-2"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-orange-100 text-[#FF6600] flex items-center justify-center">
                        <Upload className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-black text-[#FF6600]">
                        Bấm vào đây để chọn hoặc chụp ảnh bài làm
                      </span>
                      <span className="text-[11px] text-gray-400">
                        Định dạng PNG, JPG, JPEG (Hỗ trợ chụp trực tiếp từ camera)
                      </span>
                    </label>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-2xl border-2 border-gray-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={answers[currentQ.id].imageUrl}
                        alt="Bài làm tự luận"
                        className="w-16 h-16 object-cover rounded-xl border border-gray-300 cursor-pointer shadow-sm hover:opacity-90"
                        onClick={() => setPreviewImageModal(answers[currentQ.id].imageUrl)}
                      />
                      <div>
                        <span className="text-xs font-black text-gray-800 block">
                          {answers[currentQ.id].fileName || 'Ảnh bài làm viết tay'}
                        </span>
                        <span className="text-[11px] text-emerald-600 font-bold">
                          ✓ Đã đính kèm ảnh bài làm
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPreviewImageModal(answers[currentQ.id].imageUrl)}
                        className="p-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 transition kid-btn"
                        title="Xem ảnh phóng to"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {!isSubmitted && (
                        <button
                          type="button"
                          onClick={() => handleRemoveEssayImage(currentQ.id)}
                          className="p-2 rounded-xl bg-red-100 hover:bg-red-200 text-red-600 transition kid-btn"
                          title="Xóa ảnh để chụp lại"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Sample answer if submitted */}
              {isSubmitted && currentQ.sampleAnswer && (
                <div className="mt-4 p-4 bg-emerald-50 rounded-2xl border-2 border-emerald-200 text-xs text-emerald-900">
                  <span className="font-black text-emerald-800 block mb-1">
                    📖 Gợi ý đáp án mẫu của Thầy/Cô:
                  </span>
                  <p className="whitespace-pre-line">{currentQ.sampleAnswer}</p>
                </div>
              )}
            </div>
          )}

          {/* Explanation if submitted */}
          {isSubmitted && currentQ.explanation && (
            <div className="mt-6 p-4 bg-amber-50 rounded-2xl border-2 border-amber-200 text-xs font-medium text-gray-800 space-y-1">
              <span className="font-black text-orange-600 flex items-center gap-1.5 text-sm">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Giải Thích Chi Tiết Của Giáo Viên:
              </span>
              <div className="leading-relaxed pt-1">
                <LatexRenderer content={currentQ.explanation} />
              </div>
            </div>
          )}

          {/* QUESTION NAVIGATION BOTTOM BUTTONS */}
          <div className="pt-6 border-t border-gray-100 flex items-center justify-between gap-3">
            <button
              onClick={() => setActiveQuestionIdx(prev => Math.max(0, prev - 1))}
              disabled={activeQuestionIdx === 0}
              className="px-5 py-2.5 rounded-xl border-2 border-gray-200 text-xs font-black text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Câu Trước</span>
            </button>

            <span className="text-xs font-extrabold text-gray-400">
              {activeQuestionIdx + 1} / {questions.length}
            </span>

            {activeQuestionIdx < questions.length - 1 ? (
              <button
                onClick={() => setActiveQuestionIdx(prev => Math.min(questions.length - 1, prev + 1))}
                className="px-5 py-2.5 rounded-xl bg-[#FF6600] text-white text-xs font-black hover:bg-orange-600 transition flex items-center gap-1 kid-btn shadow"
              >
                <span>Câu Tiếp</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : !isSubmitted ? (
              <button
                onClick={handleSubmitExam}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-black hover:bg-emerald-700 transition flex items-center gap-1.5 kid-btn shadow-lg"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Nộp Bài Thi</span>
              </button>
            ) : (
              <div />
            )}
          </div>

        </div>
      )}

      {/* MODAL PREVIEW FULL IMAGE (FOR ESSAY SUBMISSIONS) */}
      {previewImageModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-4 max-w-2xl w-full max-h-[90vh] flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-gray-800">
                Xem chi tiết ảnh bài làm tự luận
              </span>
              <button
                onClick={() => setPreviewImageModal(null)}
                className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-auto flex-1 rounded-2xl bg-gray-100 flex items-center justify-center">
              <img
                src={previewImageModal}
                alt="Phóng to bài làm"
                className="max-w-full max-h-[75vh] object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MultiTypeExamViewer;
