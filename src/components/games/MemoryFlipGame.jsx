import React, { useState, useEffect } from 'react';
import { EdTechGameSDK } from '../../lib/gameSDK';
import { saveScoreToLocalLeaderboard } from '../../lib/gameLeaderboardService';
import { Sparkles, RotateCcw, Clock, Award, CheckCircle2, Zap } from 'lucide-react';

const CARD_PAIRS = [
  { id: 1, pairId: 'pair-1', content: '4 + 5', type: 'math' },
  { id: 2, pairId: 'pair-1', content: '9', type: 'math' },
  { id: 3, pairId: 'pair-2', content: 'Quả Táo 🍎', type: 'word' },
  { id: 4, pairId: 'pair-2', content: 'Apple 🍏', type: 'word' },
  { id: 5, pairId: 'pair-3', content: '10 - 4', type: 'math' },
  { id: 6, pairId: 'pair-3', content: '6', type: 'math' },
  { id: 7, pairId: 'pair-4', content: 'Mặt Trời ☀️', type: 'word' },
  { id: 8, pairId: 'pair-4', content: 'Sun 🌞', type: 'word' }
];

export const MemoryFlipGame = ({ studentName = 'Bé Minh Triết', studentId = 'demo-student' }) => {
  const [cards, setCards] = useState([]);
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [moves, setMoves] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  useEffect(() => {
    initNewGame();
  }, []);

  // Timer interval
  useEffect(() => {
    let interval = null;
    if (isPlaying && !isFinished) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isFinished]);

  const initNewGame = () => {
    const shuffled = [...CARD_PAIRS].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlippedIndices([]);
    setMatchedPairs([]);
    setMoves(0);
    setTimerSeconds(0);
    setIsPlaying(false);
    setIsFinished(false);
    setFinalScore(0);
  };

  const handleCardClick = (index) => {
    if (!isPlaying) setIsPlaying(true);
    if (flippedIndices.length === 2) return;
    if (flippedIndices.includes(index)) return;
    if (matchedPairs.includes(cards[index].pairId)) return;

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(prev => prev + 1);
      const [idx1, idx2] = newFlipped;
      const card1 = cards[idx1];
      const card2 = cards[idx2];

      if (card1.pairId === card2.pairId) {
        // Matched!
        const nextMatched = [...matchedPairs, card1.pairId];
        setMatchedPairs(nextMatched);
        setFlippedIndices([]);

        // Check if finished (all 4 pairs found)
        if (nextMatched.length === 4) {
          finishGame(moves + 1, timerSeconds);
        }
      } else {
        // No match -> flip back after 800ms
        setTimeout(() => {
          setFlippedIndices([]);
        }, 800);
      }
    }
  };

  const finishGame = async (totalMoves, totalTime) => {
    setIsFinished(true);
    setIsPlaying(false);

    // Calculate score (Max 100, deduct based on extra moves and time)
    let score = 100;
    if (totalMoves > 6) score -= (totalMoves - 6) * 5;
    if (totalTime > 30) score -= Math.floor((totalTime - 30) / 2);
    score = Math.max(score, 60);
    setFinalScore(score);

    // 1. Submit score automatically via JavaScript SDK to Supabase DB
    await EdTechGameSDK.submitScore({
      score,
      maxScore: 100,
      timeSpentSeconds: totalTime,
      metadata: { gameName: 'Lật Thẻ Ghi Nhớ', moves: totalMoves }
    });

    // 2. Save directly to Leaderboard Cache
    saveScoreToLocalLeaderboard({
      id: `game-${Date.now()}`,
      student_name: studentName,
      avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${studentName}`,
      grade_level: 'Lớp 1',
      game_name: 'Lật Thẻ Ghi Nhớ',
      score,
      time_spent_seconds: totalTime,
      played_at: new Date().toISOString()
    });
  };

  return (
    <div className="bg-white rounded-3xl border-3 border-pink-200 p-6 shadow-xl space-y-6">
      
      {/* Game Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-pink-100">
        <div>
          <span className="bg-pink-100 text-pink-700 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
            MINI GAME 1: RÈN LUYỆN TRÍ NHỚ
          </span>
          <h3 className="text-2xl font-black text-gray-800 mt-1 flex items-center gap-2">
            🃏 Lật Thẻ Ghi Nhớ (Memory Flip)
          </h3>
          <p className="text-xs text-gray-500 font-bold">
            Tìm các cặp thẻ tương ứng (Phép toán & Kết quả, Tiếng Anh & Tiếng Việt)!
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3">
          <div className="bg-pink-50 border border-pink-200 px-3.5 py-1.5 rounded-2xl flex items-center gap-1.5 text-xs font-black text-pink-700">
            <Clock className="w-4 h-4 text-pink-500" />
            <span>{timerSeconds}s</span>
          </div>
          <div className="bg-purple-50 border border-purple-200 px-3.5 py-1.5 rounded-2xl flex items-center gap-1.5 text-xs font-black text-purple-700">
            <Zap className="w-4 h-4 text-purple-500" />
            <span>{moves} lượt</span>
          </div>
          <button
            onClick={initNewGame}
            className="p-2 bg-gray-100 hover:bg-pink-100 text-gray-700 rounded-2xl transition"
            title="Chơi lại ván mới"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      {!isFinished ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 max-w-2xl mx-auto">
          {cards.map((card, idx) => {
            const isFlipped = flippedIndices.includes(idx);
            const isMatched = matchedPairs.includes(card.pairId);

            return (
              <button
                key={card.id}
                onClick={() => handleCardClick(idx)}
                disabled={isMatched || isFlipped}
                className={`h-28 rounded-2xl font-black text-base sm:text-lg transition-all duration-300 transform kid-btn flex items-center justify-center p-2 text-center shadow-md ${
                  isMatched
                    ? 'bg-emerald-100 border-2 border-emerald-400 text-emerald-800 scale-95 opacity-80 cursor-default'
                    : isFlipped
                    ? 'bg-gradient-to-br from-pink-400 to-rose-500 text-white border-2 border-pink-600 scale-105'
                    : 'bg-gradient-to-br from-amber-400 via-orange-400 to-yellow-500 hover:scale-102 text-white border-2 border-amber-300'
                }`}
              >
                {isFlipped || isMatched ? (
                  <span>{card.content}</span>
                ) : (
                  <span className="text-3xl filter drop-shadow">❓</span>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        /* Victory Screen */
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-8 text-center space-y-4 animate-fade-in max-w-md mx-auto">
          <div className="text-6xl animate-bounce">🏆</div>
          <h3 className="text-2xl font-black text-emerald-800">
            Chúc mừng em đã hoàn thành thử thách!
          </h3>
          <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-sm space-y-2">
            <p className="text-xs text-gray-500 font-bold">Điểm số tự động ghi nhận:</p>
            <div className="text-4xl font-black text-emerald-600">{finalScore} / 100 Điểm</div>
            <p className="text-xs font-black text-gray-700">
              Thời gian: <span className="text-emerald-700">{timerSeconds} giây</span> • Số lần lật: <span className="text-purple-700">{moves} lượt</span>
            </p>
          </div>
          <div className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-full inline-block shadow">
            ✓ Điểm số & thời gian đã cập nhật trực tiếp lên Bảng Xếp Hạng!
          </div>
          <div>
            <button
              onClick={initNewGame}
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

export default MemoryFlipGame;
