import React, { useState, useEffect } from 'react';
import { fetchTopGameLeaderboard } from '../lib/gameLeaderboardService';
import { Trophy, Medal, Clock, Award, Sparkles, Filter, RefreshCw, Star } from 'lucide-react';

export const GameLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [filterGame, setFilterGame] = useState('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadLeaderboard();
  }, [filterGame]);

  const loadLeaderboard = async () => {
    setLoading(true);
    const data = await fetchTopGameLeaderboard(filterGame);
    setLeaderboard(data);
    setLoading(false);
  };

  const top1 = leaderboard[0];
  const top2 = leaderboard[1];
  const top3 = leaderboard[2];
  const rest = leaderboard.slice(3);

  return (
    <div className="bg-white rounded-3xl border-3 border-amber-200 p-6 sm:p-8 shadow-2xl space-y-8 font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-gray-100 text-center md:text-left">
        <div>
          <span className="bg-amber-100 text-amber-700 font-black text-xs px-4 py-1.5 rounded-full inline-flex items-center gap-1.5 uppercase tracking-wider mb-2">
            <Trophy className="w-4 h-4 text-amber-500 fill-current" />
            BẢNG VÀNG DANH DỰ TOÀN TRƯỜNG
          </span>
          <h2 className="text-3xl font-black text-gray-800">
            Bảng Xếp Hạng Đấu Trường Game 🏆
          </h2>
          <p className="text-xs text-gray-500 font-bold mt-1">
            Vinh danh TOP học sinh có điểm game cao nhất và thời gian hoàn thành ngắn nhất!
          </p>
        </div>

        {/* Filter & Refresh */}
        <div className="flex items-center gap-2">
          <select
            value={filterGame}
            onChange={(e) => setFilterGame(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-2xl px-3 py-2 text-xs font-black text-gray-800 outline-none focus:border-amber-400 cursor-pointer shadow-sm"
          >
            <option value="all">Tất Cả Game Mini 🎮</option>
            <option value="Lật Thẻ">Lật Thẻ Ghi Nhớ 🃏</option>
            <option value="Khung Chữ">Khung Chữ Kỳ Diệu 🔤</option>
            <option value="Vòng Quay">Vòng Quay May Mắn 🎡</option>
          </select>

          <button
            onClick={loadLeaderboard}
            className="p-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-2xl transition shadow-sm"
            title="Làm mới bảng xếp hạng"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* TOP 3 PODIUM (BỤC VINH QUANG) */}
      {leaderboard.length >= 3 && (
        <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end pt-4 max-w-2xl mx-auto text-center">
          
          {/* TOP 2 (SILVER) */}
          {top2 && (
            <div className="flex flex-col items-center">
              <div className="relative mb-2">
                <img
                  src={top2.avatar_url}
                  alt={top2.student_name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-slate-300 shadow-md bg-white mx-auto"
                />
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-slate-400 text-white text-xs font-black px-2 py-0.5 rounded-full shadow">
                  🥈 #2
                </span>
              </div>
              <h4 className="font-black text-xs sm:text-sm text-gray-800 truncate w-full">{top2.student_name}</h4>
              <span className="text-[10px] text-gray-400 font-bold">{top2.grade_level}</span>
              <div className="bg-slate-100 border-2 border-slate-300 rounded-2xl w-full p-3 mt-2 shadow-inner">
                <span className="text-base sm:text-lg font-black text-slate-700 block">{top2.score}đ</span>
                <span className="text-[10px] text-gray-500 font-bold flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3" /> {top2.time_spent_seconds}s
                </span>
              </div>
            </div>
          )}

          {/* TOP 1 (GOLD) */}
          {top1 && (
            <div className="flex flex-col items-center scale-105">
              <div className="relative mb-2">
                <div className="text-2xl animate-bounce">👑</div>
                <img
                  src={top1.avatar_url}
                  alt={top1.student_name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-yellow-400 shadow-xl bg-white mx-auto ring-4 ring-yellow-200"
                />
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-yellow-500 text-white text-xs font-black px-2.5 py-0.5 rounded-full shadow-md">
                  🥇 QUÁN QUÂN
                </span>
              </div>
              <h4 className="font-black text-sm sm:text-base text-gray-900 truncate w-full">{top1.student_name}</h4>
              <span className="text-[11px] text-orange-600 font-extrabold">{top1.grade_level}</span>
              <div className="bg-gradient-to-t from-yellow-100 to-amber-50 border-2 border-yellow-400 rounded-2xl w-full p-4 mt-2 shadow-lg">
                <span className="text-xl sm:text-2xl font-black text-yellow-700 block">{top1.score}đ</span>
                <span className="text-xs text-amber-800 font-black flex items-center justify-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {top1.time_spent_seconds}s
                </span>
                <span className="text-[9px] text-gray-500 font-bold block mt-1 truncate">{top1.game_name}</span>
              </div>
            </div>
          )}

          {/* TOP 3 (BRONZE) */}
          {top3 && (
            <div className="flex flex-col items-center">
              <div className="relative mb-2">
                <img
                  src={top3.avatar_url}
                  alt={top3.student_name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-amber-600 shadow-md bg-white mx-auto"
                />
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-amber-700 text-white text-xs font-black px-2 py-0.5 rounded-full shadow">
                  🥉 #3
                </span>
              </div>
              <h4 className="font-black text-xs sm:text-sm text-gray-800 truncate w-full">{top3.student_name}</h4>
              <span className="text-[10px] text-gray-400 font-bold">{top3.grade_level}</span>
              <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl w-full p-3 mt-2 shadow-inner">
                <span className="text-base sm:text-lg font-black text-amber-800 block">{top3.score}đ</span>
                <span className="text-[10px] text-gray-500 font-bold flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3" /> {top3.time_spent_seconds}s
                </span>
              </div>
            </div>
          )}

        </div>
      )}

      {/* DETAILED RANKING LIST */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-amber-50 text-amber-800 font-extrabold uppercase border-b border-amber-200">
            <tr>
              <th className="p-3 text-center">Hạng</th>
              <th className="p-3">Học sinh</th>
              <th className="p-3">Khối Lớp</th>
              <th className="p-3">Tựa Game</th>
              <th className="p-3 text-center">Điểm số</th>
              <th className="p-3 text-center">Thời gian</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-bold">
            {leaderboard.map((item, index) => {
              const rank = index + 1;
              let rankBadge = `${rank}`;
              if (rank === 1) rankBadge = '🥇';
              if (rank === 2) rankBadge = '🥈';
              if (rank === 3) rankBadge = '🥉';

              return (
                <tr key={item.id} className="hover:bg-amber-50/50 transition">
                  <td className="p-3 text-center font-black text-base">{rankBadge}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={item.avatar_url}
                        alt={item.student_name}
                        className="w-8 h-8 rounded-full border border-amber-200 bg-white"
                      />
                      <span className="font-black text-gray-800">{item.student_name}</span>
                    </div>
                  </td>
                  <td className="p-3 text-gray-500">{item.grade_level}</td>
                  <td className="p-3">
                    <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-lg text-[11px]">
                      {item.game_name}
                    </span>
                  </td>
                  <td className="p-3 text-center text-amber-600 font-black text-sm">
                    {item.score} điểm
                  </td>
                  <td className="p-3 text-center text-gray-500 font-mono">
                    {item.time_spent_seconds} giây
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default GameLeaderboard;
