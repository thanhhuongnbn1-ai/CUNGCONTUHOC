import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MemoryFlipGame from '../components/games/MemoryFlipGame';
import WordPuzzleGame from '../components/games/WordPuzzleGame';
import LuckyWheelGame from '../components/games/LuckyWheelGame';
import GameLeaderboard from '../components/GameLeaderboard';
import { IframeGamePlayer } from '../components/IframeGamePlayer';
import { getStoredEmbeddedGames, EMBED_PROVIDERS } from '../lib/embedGameService';
import {
  Gamepad2,
  Trophy,
  Sparkles,
  Zap,
  Award,
  Layers,
  ArrowRight,
  Crown,
  ExternalLink,
  Play,
  ArrowLeft
} from 'lucide-react';

export const GameLibraryPage = ({ userProfile }) => {
  const [activeTab, setActiveTab] = useState('memory'); // 'memory' | 'puzzle' | 'wheel' | 'embed_games' | 'leaderboard'
  const [embedGames, setEmbedGames] = useState([]);
  const [selectedEmbedGame, setSelectedEmbedGame] = useState(null);
  const [filterProvider, setFilterProvider] = useState('all');

  const studentName = userProfile?.full_name || userProfile?.email?.split('@')[0] || 'Bé Minh Triết';
  const studentId = userProfile?.id || 'demo-student';

  useEffect(() => {
    getStoredEmbeddedGames().then((list) => {
      setEmbedGames(list);
      if (list.length > 0 && !selectedEmbedGame) {
        setSelectedEmbedGame(list[0]);
      }
    });
  }, []);

  const filteredEmbedGames = embedGames.filter(
    (g) => filterProvider === 'all' || g.provider === filterProvider
  );

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
            Tập hợp các mini game rèn luyện tư duy: Lật thẻ ghi nhớ, Khung chữ kỳ diệu, Vòng quay may mắn & <strong>Game nhúng iFrame từ Wordwall, Quizizz, Kahoot, Canva, Genially</strong>. Tự động lưu điểm và tích lũy XP!
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
          { id: 'embed_games', label: 'Game Nhúng iFrame 🌐', icon: ExternalLink },
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

        {activeTab === 'embed_games' && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Filter Pills */}
            <div className="flex items-center justify-between flex-wrap gap-4 bg-white p-4 rounded-3xl border-2 border-orange-100 shadow-sm">
              <div className="flex items-center gap-2 overflow-x-auto">
                <span className="text-xs font-black text-gray-500 whitespace-nowrap mr-1">
                  Nền Tảng:
                </span>
                {[
                  { id: 'all', label: 'Tất Cả 🎮' },
                  { id: 'wordwall', label: 'Wordwall' },
                  { id: 'quizizz', label: 'Quizizz' },
                  { id: 'kahoot', label: 'Kahoot!' },
                  { id: 'canva', label: 'Canva' },
                  { id: 'genially', label: 'Genially' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setFilterProvider(item.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition ${
                      filterProvider === item.id
                        ? 'bg-purple-600 text-white shadow'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {userProfile?.role === 'teacher' || userProfile?.role === 'admin' ? (
                <Link
                  to="/teacher-studio"
                  className="bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl shadow flex items-center gap-1.5 transition kid-btn"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>+ Nhúng Thêm Game Mới</span>
                </Link>
              ) : null}
            </div>

            {/* Selected Game Player */}
            {selectedEmbedGame && (
              <div className="bg-white p-6 rounded-3xl border-2 border-orange-100 shadow-md">
                <IframeGamePlayer
                  material={selectedEmbedGame}
                  studentId={studentId}
                  studentName={studentName}
                />
              </div>
            )}

            {/* Playlist Cards Grid */}
            <div className="space-y-3">
              <h3 className="font-black text-base text-gray-800">
                Kho Game Nhúng Dành Cho Bé ({filteredEmbedGames.length})
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredEmbedGames.map((game) => {
                  const prov = EMBED_PROVIDERS[game.provider] || EMBED_PROVIDERS.custom;
                  const isCurrent = selectedEmbedGame?.id === game.id;
                  return (
                    <div
                      key={game.id}
                      onClick={() => setSelectedEmbedGame(game)}
                      className={`cursor-pointer p-4 rounded-2xl border-2 transition transform hover:-translate-y-0.5 flex flex-col justify-between ${
                        isCurrent
                          ? 'bg-purple-50 border-purple-500 shadow-md ring-2 ring-purple-300'
                          : 'bg-white border-gray-200 hover:border-purple-300 shadow-sm'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${prov.bgLight}`}>
                            {prov.name}
                          </span>
                          <span className="text-[11px] font-black text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
                            +{game.xp_reward || 50} XP
                          </span>
                        </div>
                        <h4 className="font-extrabold text-xs text-gray-800 line-clamp-1 mb-1">
                          {game.title}
                        </h4>
                        <p className="text-[11px] text-gray-500 line-clamp-2">
                          {game.description}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] font-extrabold text-gray-400">
                        <span>{game.grade_name || game.grade_slug?.toUpperCase()} • {game.subject}</span>
                        <span className="text-purple-600 flex items-center gap-1 font-black">
                          <Play className="w-3 h-3 fill-current" />
                          <span>{isCurrent ? 'Đang chơi' : 'Chơi ngay'}</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {activeTab === 'leaderboard' && (
          <GameLeaderboard />
        )}
      </div>

      {/* Secondary Bottom Leaderboard when playing games */}
      {activeTab !== 'leaderboard' && activeTab !== 'embed_games' && (
        <div className="pt-6">
          <GameLeaderboard />
        </div>
      )}

    </div>
  );
};

export default GameLibraryPage;
