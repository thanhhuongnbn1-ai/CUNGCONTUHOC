import React, { useState, useEffect } from 'react';
import { EdTechGameSDK } from '../../lib/gameSDK';
import { saveScoreToLocalLeaderboard } from '../../lib/gameLeaderboardService';
import { Clock, RotateCcw, Award, Sparkles, CheckCircle2 } from 'lucide-react';

const WHEEL_SECTIONS = [
  { label: 'Toán 20đ', points: 20, color: 'bg-red-500', question: '7 + 8 bằng bao nhiêu?', options: ['14', '15', '16'], correct: '15' },
  { label: 'Tiếng Việt 25đ', points: 25, color: 'bg-orange-500', question: 'Từ nào chỉ hoạt động học tập?', options: ['Đọc sách', 'Ngủ say', 'Chạy chơi'], correct: 'Đọc sách' },
  { label: 'Tiếng Anh 20đ', points: 20, color: 'bg-amber-500', question: 'Con mèo trong tiếng Anh là gì?', options: ['Dog', 'Cat', 'Bird'], correct: 'Cat' },
  { label: 'Khoa Học 20đ', points: 20, color: 'bg-emerald-500', question: 'Cây xanh cần gì để quang hợp?', options: ['Bóng tối', 'Ánh sáng', 'Gió lốc'], correct: 'Ánh sáng' },
  { label: 'Bonus 15đ', points: 15, color: 'bg-blue-500', question: 'Hôm nay em học tập có vui không?', options: ['Rất vui!', 'Bình thường'], correct: 'Rất vui!' },
  { label: 'Cực Đỉnh 30đ', points: 30, color: 'bg-purple-500', question: '9 x 2 bằng bao nhiêu?', options: ['18', '20', '16'], correct: '18' }
];

export const LuckyWheelGame = ({ studentName = 'Bé Minh Triết', studentId = 'demo-student' }) => {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [spinsLeft, setSpinsLeft] = useState(4);
  const [totalScore, setTotalScore] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [showQuestion, setShowQuestion] = useState(false);

  useEffect(() => {
    let interval = null;
    if (!isFinished) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isFinished]);

  const spinWheel = () => {
    if (isSpinning || spinsLeft <= 0 || isFinished) return;

    setIsSpinning(true);
    setShowQuestion(false);

    // Random section index
    const randomIndex = Math.floor(Math.random() * WHEEL_SECTIONS.length);
    const degreesPerSection = 360 / WHEEL_SECTIONS.length;
    // Extra full spins (5 to 8 rounds)
    const extraRounds = (Math.floor(Math.random() * 4) + 5) * 360;
    const targetDegree = extraRounds + (randomIndex * degreesPerSection);

    setRotation(prev => prev + targetDegree);

    setTimeout(() => {
      setIsSpinning(false);
      setSelectedSection(WHEEL_SECTIONS[randomIndex]);
      setShowQuestion(true);
      setSpinsLeft(prev => prev - 1);
    }, 3200);
  };

  const handleAnswer = async (selectedOption) => {
    let earned = 0;
    if (selectedSection && selectedOption === selectedSection.correct) {
      earned = selectedSection.points;
    }
    const nextScore = Math.min(totalScore + earned, 100);
    setTotalScore(nextScore);
    setShowQuestion(false);

    if (spinsLeft <= 0) {
      // Finished all spins!
      finishGame(nextScore, timerSeconds);
    }
  };

  const finishGame = async (finalPoints, totalTime) => {
    setIsFinished(true);
    const score = Math.max(finalPoints, 70);

    // Sync via Game SDK to Supabase
    await EdTechGameSDK.submitScore({
      score,
      maxScore: 100,
      timeSpentSeconds: totalTime,
      metadata: { gameName: 'Vòng Quay May Mắn' }
    });

    // Save to Leaderboard cache
    saveScoreToLocalLeaderboard({
      id: `game-${Date.now()}`,
      student_name: studentName,
      avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${studentName}`,
      grade_level: 'Lớp 1',
      game_name: 'Vòng Quay May Mắn',
      score,
      time_spent_seconds: totalTime,
      played_at: new Date().toISOString()
    });
  };

  const resetGame = () => {
    setSpinsLeft(4);
    setTotalScore(0);
    setTimerSeconds(0);
    setIsFinished(false);
    setSelectedSection(null);
    setShowQuestion(false);
  };

  return (
    <div className="bg-white rounded-3xl border-3 border-amber-200 p-6 shadow-xl space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-amber-100">
        <div>
          <span className="bg-amber-100 text-amber-700 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
            MINI GAME 3: THỬ THÁCH MAY MẮN
          </span>
          <h3 className="text-2xl font-black text-gray-800 mt-1 flex items-center gap-2">
            🎡 Vòng Quay May Mắn (Lucky Wheel)
          </h3>
          <p className="text-xs text-gray-500 font-bold">
            Quay kim thử thách và trả lời câu hỏi nhanh để tích lũy điểm thưởng!
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-amber-50 border border-amber-200 px-3.5 py-1.5 rounded-2xl flex items-center gap-1.5 text-xs font-black text-amber-700">
            <Clock className="w-4 h-4 text-amber-500" />
            <span>{timerSeconds}s</span>
          </div>
          <div className="bg-orange-50 border border-orange-200 px-3.5 py-1.5 rounded-2xl text-xs font-black text-orange-700">
            Còn: <strong>{spinsLeft} lượt quay</strong>
          </div>
          <button
            onClick={resetGame}
            className="p-2 bg-gray-100 hover:bg-amber-100 text-gray-700 rounded-2xl transition"
            title="Làm mới game"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isFinished ? (
        <div className="flex flex-col lg:flex-row items-center justify-around gap-8 py-4">
          
          {/* Wheel Graphic */}
          <div className="relative flex items-center justify-center">
            {/* Pointer / Arrow */}
            <div className="absolute -top-3 z-20 w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[28px] border-t-red-600 filter drop-shadow-md" />

            <div
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: isSpinning ? 'transform 3.2s cubic-bezier(0.15, 0.9, 0.2, 1)' : 'none'
              }}
              className="w-64 h-64 sm:w-72 sm:h-72 rounded-full border-8 border-amber-400 shadow-2xl relative overflow-hidden bg-gradient-to-tr from-amber-200 to-yellow-100 flex items-center justify-center"
            >
              {/* Wheel Slice Visual Segments */}
              {WHEEL_SECTIONS.map((sec, i) => (
                <div
                  key={i}
                  style={{ transform: `rotate(${i * 60}deg)` }}
                  className="absolute w-full h-full flex justify-center pt-3 text-[11px] font-black text-gray-800"
                >
                  <span className="bg-white/80 px-2 py-0.5 rounded-full shadow-sm">{sec.label}</span>
                </div>
              ))}

              {/* Center Pin */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#FF6600] to-yellow-400 border-4 border-white shadow-xl flex items-center justify-center text-white font-black text-xs z-10">
                QUAY
              </div>
            </div>
          </div>

          {/* Action / Question Container */}
          <div className="flex-1 max-w-md w-full space-y-4 text-center">
            
            <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4">
              <span className="text-xs font-bold text-gray-500 block">Tổng Điểm Tích Lũy</span>
              <span className="text-4xl font-black text-[#FF6600]">{totalScore} / 100</span>
            </div>

            {!showQuestion ? (
              <button
                onClick={spinWheel}
                disabled={isSpinning || spinsLeft <= 0}
                className="w-full bg-gradient-to-r from-amber-500 to-[#FF6600] hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 text-white font-black text-lg py-4 rounded-2xl shadow-xl kid-btn flex items-center justify-center gap-2"
              >
                <Sparkles className="w-6 h-6" />
                <span>{isSpinning ? 'Đang quay may mắn...' : 'Nhấn Quay Ngay!'}</span>
              </button>
            ) : (
              /* Question popup when wheel stops */
              <div className="bg-white border-2 border-orange-300 rounded-3xl p-5 shadow-lg space-y-3 animate-fade-in text-left">
                <span className="bg-orange-100 text-orange-700 text-[11px] font-black px-2.5 py-0.5 rounded-full">
                  Thử Thách: {selectedSection?.label}
                </span>
                <h4 className="font-black text-base text-gray-800">{selectedSection?.question}</h4>
                <div className="grid grid-cols-1 gap-2 pt-1">
                  {selectedSection?.options.map((opt, oIdx) => (
                    <button
                      key={oIdx}
                      onClick={() => handleAnswer(opt)}
                      className="p-2.5 rounded-xl border-2 border-gray-200 hover:border-orange-500 hover:bg-orange-50 text-xs font-bold text-gray-800 transition text-left"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      ) : (
        /* Victory Screen */
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-8 text-center space-y-4 animate-fade-in max-w-md mx-auto">
          <div className="text-6xl animate-bounce">🎡</div>
          <h3 className="text-2xl font-black text-emerald-800">
            Em đã quay xong tất cả các lượt!
          </h3>
          <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-sm space-y-2">
            <p className="text-xs text-gray-500 font-bold">Điểm số tự động ghi nhận:</p>
            <div className="text-4xl font-black text-amber-600">{totalScore} / 100 Điểm</div>
            <p className="text-xs font-black text-gray-700">
              Thời gian hoàn thành: <span className="text-emerald-700">{timerSeconds} giây</span>
            </p>
          </div>
          <div className="bg-amber-600 text-white text-xs font-bold px-4 py-2 rounded-full inline-block shadow">
            ✓ Đã đồng bộ điểm về Supabase DB và cập nhật Bảng Xếp Hạng!
          </div>
          <div>
            <button
              onClick={resetGame}
              className="mt-2 bg-[#FF6600] hover:bg-orange-600 text-white font-black text-sm px-6 py-3 rounded-2xl shadow kid-btn"
            >
              Chơi Lại Ván Mới
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default LuckyWheelGame;
