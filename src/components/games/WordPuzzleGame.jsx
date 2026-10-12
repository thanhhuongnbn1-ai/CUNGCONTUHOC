import React, { useState, useEffect } from 'react';
import { EdTechGameSDK } from '../../lib/gameSDK';
import { saveScoreToLocalLeaderboard } from '../../lib/gameLeaderboardService';
import { Clock, RotateCcw, Award, CheckCircle2, HelpCircle, Sparkles } from 'lucide-react';

const PUZZLE_WORDS = [
  { word: 'CONVOI', hint: 'Loài động vật to lớn có chiếc vòi dài và đôi ngà trắng' },
  { word: 'TOANHOC', hint: 'Môn học giúp chúng mình làm quen với các con số và phép tính' },
  { word: 'TIENGVIET', hint: 'Môn học dạy chúng mình ghép vần, đọc bài thơ và kể chuyện' },
  { word: 'MATTROI', hint: 'Vật thể sáng nhất trên bầu trời tỏa ánh nắng ấm áp buổi sớm' }
];

const ALPHABET = 'AĂÂBCDĐEÊGHIKLMNOÔƠPQRSTUƯVXY'.split('');

export const WordPuzzleGame = ({ studentName = 'Bé Minh Triết', studentId = 'demo-student' }) => {
  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  const [guessedLetters, setGuessedLetters] = useState(new Set());
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  const currentPuzzle = PUZZLE_WORDS[currentWordIdx];
  const targetLetters = currentPuzzle.word.split('');
  const isWordCompleted = targetLetters.every(letter => guessedLetters.has(letter));

  useEffect(() => {
    let interval = null;
    if (!isFinished) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isFinished]);

  const handleGuess = (letter) => {
    if (isFinished || isWordCompleted) return;
    if (guessedLetters.has(letter)) return;

    const nextGuessed = new Set(guessedLetters);
    nextGuessed.add(letter);
    setGuessedLetters(nextGuessed);

    if (!targetLetters.includes(letter)) {
      setWrongGuesses(prev => prev + 1);
    }

    // Check if whole word solved
    const allFound = targetLetters.every(l => nextGuessed.has(l));
    if (allFound) {
      if (currentWordIdx + 1 < PUZZLE_WORDS.length) {
        // Move to next word after short delay
        setTimeout(() => {
          setCurrentWordIdx(prev => prev + 1);
          setGuessedLetters(new Set());
        }, 1200);
      } else {
        // All words solved! Finish game
        finishGame(timerSeconds, wrongGuesses);
      }
    }
  };

  const finishGame = async (totalTime, totalWrong) => {
    setIsFinished(true);
    let score = 100 - (totalWrong * 5);
    if (totalTime > 45) score -= Math.floor((totalTime - 45) / 2);
    score = Math.max(score, 65);
    setFinalScore(score);

    // Sync via Game SDK to Supabase
    await EdTechGameSDK.submitScore({
      score,
      maxScore: 100,
      timeSpentSeconds: totalTime,
      metadata: { gameName: 'Khung Chữ Kỳ Diệu', wrongGuesses: totalWrong }
    });

    // Save to Leaderboard cache
    saveScoreToLocalLeaderboard({
      id: `game-${Date.now()}`,
      student_name: studentName,
      avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${studentName}`,
      grade_level: 'Lớp 1',
      game_name: 'Khung Chữ Kỳ Diệu',
      score,
      time_spent_seconds: totalTime,
      played_at: new Date().toISOString()
    });
  };

  const resetGame = () => {
    setCurrentWordIdx(0);
    setGuessedLetters(new Set());
    setTimerSeconds(0);
    setWrongGuesses(0);
    setIsFinished(false);
    setFinalScore(0);
  };

  return (
    <div className="bg-white rounded-3xl border-3 border-sky-200 p-6 shadow-xl space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-sky-100">
        <div>
          <span className="bg-sky-100 text-sky-700 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
            MINI GAME 2: TƯ DUY NGÔN NGỮ
          </span>
          <h3 className="text-2xl font-black text-gray-800 mt-1 flex items-center gap-2">
            🔤 Khung Chữ Kỳ Diệu (Word Puzzle)
          </h3>
          <p className="text-xs text-gray-500 font-bold">
            Đoán các chữ cái để giải ô chữ theo gợi ý bài học SGK!
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-sky-50 border border-sky-200 px-3.5 py-1.5 rounded-2xl flex items-center gap-1.5 text-xs font-black text-sky-700">
            <Clock className="w-4 h-4 text-sky-500" />
            <span>{timerSeconds}s</span>
          </div>
          <button
            onClick={resetGame}
            className="p-2 bg-gray-100 hover:bg-sky-100 text-gray-700 rounded-2xl transition"
            title="Làm mới game"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isFinished ? (
        <div className="space-y-6 max-w-2xl mx-auto text-center py-2">
          
          {/* Hint card */}
          <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 text-amber-900 font-extrabold text-sm flex items-center justify-center gap-2 shadow-sm">
            <HelpCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <span>Gợi ý ({currentWordIdx + 1}/{PUZZLE_WORDS.length}): {currentPuzzle.hint}</span>
          </div>

          {/* Letter Slots */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 py-4">
            {targetLetters.map((letter, idx) => {
              const isRevealed = guessedLetters.has(letter);
              return (
                <div
                  key={idx}
                  className={`w-12 h-14 sm:w-14 sm:h-16 rounded-2xl border-3 flex items-center justify-center font-black text-2xl sm:text-3xl shadow transition-all ${
                    isRevealed
                      ? 'bg-sky-500 text-white border-sky-600 scale-105'
                      : 'bg-gray-100 text-transparent border-gray-300'
                  }`}
                >
                  {isRevealed ? letter : '_'}
                </div>
              );
            })}
          </div>

          {/* Virtual Keyboard */}
          <div className="flex flex-wrap justify-center gap-1.5 max-w-xl mx-auto pt-2">
            {ALPHABET.map((letter) => {
              const isUsed = guessedLetters.has(letter);
              const isCorrect = isUsed && targetLetters.includes(letter);
              const isWrong = isUsed && !targetLetters.includes(letter);

              let btnStyle = 'bg-gray-100 hover:bg-sky-100 text-gray-800 border-gray-200';
              if (isCorrect) btnStyle = 'bg-emerald-500 text-white border-emerald-600';
              else if (isWrong) btnStyle = 'bg-gray-300 text-gray-500 border-gray-400 opacity-50 cursor-not-allowed';

              return (
                <button
                  key={letter}
                  onClick={() => handleGuess(letter)}
                  disabled={isUsed}
                  className={`w-9 h-10 sm:w-10 sm:h-11 rounded-xl border-2 font-black text-xs sm:text-sm transition kid-btn ${btnStyle}`}
                >
                  {letter}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* Victory Screen */
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-8 text-center space-y-4 animate-fade-in max-w-md mx-auto">
          <div className="text-6xl animate-bounce">🥇</div>
          <h3 className="text-2xl font-black text-emerald-800">
            Tuyệt vời! Em đã giải mã hết các ô chữ!
          </h3>
          <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-sm space-y-2">
            <p className="text-xs text-gray-500 font-bold">Điểm số tự động ghi nhận:</p>
            <div className="text-4xl font-black text-sky-600">{finalScore} / 100 Điểm</div>
            <p className="text-xs font-black text-gray-700">
              Thời gian: <span className="text-emerald-700">{timerSeconds} giây</span> • Số lần đoán sai: <span className="text-red-600">{wrongGuesses} lần</span>
            </p>
          </div>
          <div className="bg-sky-600 text-white text-xs font-bold px-4 py-2 rounded-full inline-block shadow">
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

export default WordPuzzleGame;
