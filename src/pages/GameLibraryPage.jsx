import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MemoryFlipGame from '../components/games/MemoryFlipGame';
import WordPuzzleGame from '../components/games/WordPuzzleGame';
import LuckyWheelGame from '../components/games/LuckyWheelGame';
import GameLeaderboard from '../components/GameLeaderboard';
import { Gamepad2, Trophy, Sparkles, Zap, Award, Layers, ArrowRight, Crown } from 'lucide-react';

export const GameLibraryPage = ({ userProfile }) => {
  const [activeTab, setActiveTab] = useState('memory'); // 'memory' | 'puzzle' | 'wheel' | 'leaderboard'

  const studentName = userProfile?.full_name || userProfile?.email?.split('@')[0] || 'Bé Minh Triết';
  const studentId = userProfile?.id || 'demo-student';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 font-sans">
      
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-500 text-white p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <span className="bg-white/20 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-2 inline-block">
            ĐẤU TRƯỜNG TRÍ TUỆ & GAMIFICATION
          </span>
          <h1 className="text-3xl sm:text-4xl font-black flex items-center gap-2">
            Thư Viện Game & Bảng Xếp Hạng 🎮
          </h1>
          <p className="text-purple-100 font-medium text-sm mt-1 max-w-xl">
            Tập hợp các mini game rèn luyện tư duy: Lật thẻ ghi nhớ, Khung chữ kỳ diệu & Vòng quay may mắn. Kết nối JavaScript SDK tự động lưu điểm và cập nhật BXH thời gian thực!
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="bg-white/15 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center">
            <span className="text-xs font-bold text-purple-200 block">Đang thi đấu dưới tên</span>
            <span className="text-lg font-black text-white">{studentName}</span>
          </div>

          <Link
            to="/leaderboard"
            className="bg-yellow-400 hover:bg-yellow-300 text-purple-950 font-black text-xs px-4 py-3.5 rounded-2xl shadow-lg kid-btn flex items-center gap-2 whitespace-nowrap"
          >
            <Crown className="w-4 h-4 text-purple-900" />
            <span>BXH Học Sinh Toàn Trường</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Navigation Game Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {[
          { id: 'memory', label: 'Lật Thẻ Ghi Nhớ 🃏', icon: Zap },
          { id: 'puzzle', label: 'Khung Chữ Kỳ Diệu 🔤', icon: Sparkles },
          { id: 'wheel', label: 'Vòng Quay May Mắn 🎡', icon: Award },
          { id: 'leaderboard', label: 'Bảng Xếp Hạng TOP 10 🏆', icon: Trophy }
        ].map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 rounded-2xl font-black text-xs sm:text-sm transition-all whitespace-nowrap shadow-sm ${
                isSelected
                  ? 'bg-gradient-to-r from-[#FF6600] to-amber-500 text-white shadow-orange-200 shadow-md scale-105'
                  : 'bg-white text-gray-700 hover:bg-orange-50 border border-gray-200'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Active Game / Leaderboard Display */}
      <div>
        {activeTab === 'memory' && (
          <MemoryFlipGame studentName={studentName} studentId={studentId} />
        )}

        {activeTab === 'puzzle' && (
          <WordPuzzleGame studentName={studentName} studentId={studentId} />
        )}

        {activeTab === 'wheel' && (
          <LuckyWheelGame studentName={studentName} studentId={studentId} />
        )}

        {activeTab === 'leaderboard' && (
          <GameLeaderboard />
        )}
      </div>

      {/* Secondary Bottom Leaderboard when playing games */}
      {activeTab !== 'leaderboard' && (
        <div className="pt-6">
          <GameLeaderboard />
        </div>
      )}

    </div>
  );
};

export default GameLibraryPage;
