import React, { useState, useEffect } from 'react';
import { xpLeaderboardService } from '../lib/xpLeaderboardService';
import {
  Trophy,
  Medal,
  Award,
  Crown,
  Sparkles,
  Flame,
  Star,
  CheckCircle2,
  TrendingUp,
  RefreshCw,
  Filter,
  ArrowUp,
  GraduationCap,
  Calendar,
  Gift
} from 'lucide-react';
import { Link } from 'react-router-dom';
import TeacherAwardBonusModal from '../components/TeacherAwardBonusModal';

export const LeaderboardPage = ({ userProfile }) => {
  const [timeframe, setTimeframe] = useState('week'); // 'week' | 'month' | 'semester'
  const [gradeLevel, setGradeLevel] = useState('all'); // 'all' | 'Lớp 1' | 'Lớp 2' | 'Lớp 3' | 'Lớp 4' | 'Lớp 5'
  const [leaderboard, setLeaderboard] = useState([]);
  const [myStats, setMyStats] = useState(null);
  const [loading, setLoading] = useState(false);

  // Modal Thầy Cô Tặng Thưởng XP Trực Tiếp
  const [isBonusModalOpen, setIsBonusModalOpen] = useState(false);
  const [selectedStudentForBonus, setSelectedStudentForBonus] = useState(null);

  useEffect(() => {
    loadLeaderboard();
  }, [timeframe, gradeLevel]);

  const loadLeaderboard = async () => {
    setLoading(true);
    const data = await xpLeaderboardService.getLeaderboard({ timeframe, gradeLevel });
    setLeaderboard(data);

    // Lấy thông tin thứ hạng của học sinh đang đăng nhập
    const studentId = userProfile?.id || 'demo-student-id';
    const myRankData = await xpLeaderboardService.getMyRank({ studentId, timeframe, gradeLevel });
    setMyStats(myRankData);

    setLoading(false);
  };

  const handleOpenBonusModal = (student = null) => {
    setSelectedStudentForBonus(student);
    setIsBonusModalOpen(true);
  };

  const handleBonusAwarded = () => {
    loadLeaderboard();
  };

  const top1 = leaderboard[0];
  const top2 = leaderboard[1];
  const top3 = leaderboard[2];
  const rest = leaderboard.slice(3);

  const timeframeLabels = {
    week: 'Tuần này',
    month: 'Tháng này',
    semester: 'Học kỳ này'
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 font-sans">
      
      {/* 1. HERO HEADER BANNER */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 text-center md:text-left space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 bg-white/25 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
            <Crown className="w-4 h-4 text-yellow-200" />
            <span>BẢNG VÀNG DANH DỰ TOÀN TRƯỜNG</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight drop-shadow-sm">
            Bảng Xếp Hạng Học Sinh Xuất Sắc 🏆
          </h1>

          <p className="text-orange-100 font-medium text-sm leading-relaxed">
            Hệ thống tự động xếp hạng dựa trên điểm kinh nghiệm (XP) tích lũy từ các hoạt động học tập, làm đề trắc nghiệm, thử thách game và điểm khen thưởng từ Thầy Cô!
          </p>
        </div>

        {/* Live Refresh Button & Teacher Bonus Button */}
        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <button
            onClick={() => handleOpenBonusModal(null)}
            className="bg-yellow-300 hover:bg-yellow-200 text-orange-950 font-black px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 kid-btn text-xs border-2 border-yellow-100"
          >
            <Gift className="w-4 h-4 text-orange-600" />
            <span>Thầy/Cô Thưởng Điểm XP 🎁</span>
          </button>

          <button
            onClick={loadLeaderboard}
            className="bg-white text-orange-600 hover:bg-orange-50 font-black px-5 py-3 rounded-2xl shadow-lg flex items-center gap-2 kid-btn text-xs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Cập nhật BXH</span>
          </button>
        </div>
      </div>

      {/* 2. FILTER CONTROLS: TIMEFRAME & GRADE LEVEL */}
      <div className="bg-white p-5 rounded-3xl border-2 border-orange-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Timeframe Switcher (Tuần / Tháng / Học kỳ) */}
        <div className="flex items-center gap-1.5 bg-orange-50 p-1.5 rounded-2xl border border-orange-200 w-full sm:w-auto">
          <button
            onClick={() => setTimeframe('week')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 ${
              timeframe === 'week' ? 'bg-[#FF6600] text-white shadow-md' : 'text-gray-700 hover:bg-orange-100'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Tuần Này</span>
          </button>

          <button
            onClick={() => setTimeframe('month')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 ${
              timeframe === 'month' ? 'bg-[#FF6600] text-white shadow-md' : 'text-gray-700 hover:bg-orange-100'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Tháng Này</span>
          </button>

          <button
            onClick={() => setTimeframe('semester')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 ${
              timeframe === 'semester' ? 'bg-[#FF6600] text-white shadow-md' : 'text-gray-700 hover:bg-orange-100'
            }`}
          >
            <Crown className="w-4 h-4" />
            <span>Học Kỳ Này</span>
          </button>
        </div>

        {/* Grade Level Filter */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <span className="text-xs font-extrabold text-gray-500 whitespace-nowrap">Khối lớp:</span>
          {['all', 'Lớp 1', 'Lớp 2', 'Lớp 3', 'Lớp 4', 'Lớp 5'].map((g) => (
            <button
              key={g}
              onClick={() => setGradeLevel(g)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition ${
                gradeLevel === g
                  ? 'bg-amber-500 text-white shadow'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {g === 'all' ? 'Toàn Trường' : g}
            </button>
          ))}
        </div>

      </div>

      {/* 3. TOP 3 PODIUM (BỤC VINH QUANG 3D) */}
      <div className="bg-gradient-to-b from-amber-50/60 to-white rounded-3xl p-6 sm:p-10 border-2 border-amber-200 shadow-md">
        <div className="text-center mb-8">
          <span className="text-xs font-black uppercase text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
            TOP 3 XUẤT SẮC NHẤT ({timeframeLabels[timeframe].toUpperCase()})
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-800 mt-2">
            Ngôi Sao Sáng Tri Thức 🌟
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row items-end justify-center gap-4 sm:gap-6 pt-8 pb-4">
          
          {/* TOP 2 (BÊN TRÁI) */}
          {top2 && (
            <div className="order-2 sm:order-1 flex-1 max-w-[240px] w-full text-center flex flex-col items-center">
              <div className="relative mb-3">
                <img
                  src={top2.avatar_url}
                  alt={top2.student_name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-slate-300 shadow-xl bg-white"
                />
                <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-slate-400 text-white text-xs font-black px-3 py-0.5 rounded-full shadow flex items-center gap-1">
                  <span>🥈 #2</span>
                </div>
              </div>

              <h3 className="font-black text-base text-gray-800 mt-2 truncate w-full">
                {top2.student_name}
              </h3>
              <span className="text-xs font-bold text-gray-500">{top2.class_name || top2.grade_level}</span>
              <span className="text-[11px] font-black text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full mt-1">
                {top2.title}
              </span>

              {/* Bục Top 2 */}
              <div className="w-full mt-4 bg-gradient-to-t from-slate-300 to-slate-200 rounded-2xl p-4 shadow-md border border-slate-300/80 min-h-[140px] flex flex-col items-center justify-center">
                <Medal className="w-8 h-8 text-slate-500 mb-1" />
                <span className="text-2xl font-black text-slate-800">{top2.current_xp}</span>
                <span className="text-[10px] font-extrabold text-slate-600 uppercase">XP TÍCH LŨY</span>
                <span className="text-[11px] font-bold text-slate-600 mt-1">Cấp độ: {top2.level}</span>
              </div>
            </div>
          )}

          {/* TOP 1 (TRUNG TÂM - CAO NHẤT) */}
          {top1 && (
            <div className="order-1 sm:order-2 flex-1 max-w-[260px] w-full text-center flex flex-col items-center sm:-translate-y-4">
              <div className="relative mb-3">
                {/* Crown */}
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 animate-bounce">
                  <Crown className="w-10 h-10 text-yellow-400 fill-yellow-400 drop-shadow" />
                </div>
                <img
                  src={top1.avatar_url}
                  alt={top1.student_name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-yellow-400 shadow-2xl bg-white ring-4 ring-yellow-200"
                />
                <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-yellow-500 text-white text-xs font-black px-3.5 py-0.5 rounded-full shadow-lg flex items-center gap-1">
                  <span>🥇 QUÁN QUÂN</span>
                </div>
              </div>

              <h3 className="font-black text-lg text-gray-900 mt-2 truncate w-full">
                {top1.student_name}
              </h3>
              <span className="text-xs font-bold text-gray-500">{top1.class_name || top1.grade_level}</span>
              <span className="text-xs font-black text-amber-800 bg-amber-100 px-3 py-0.5 rounded-full mt-1 border border-amber-300">
                {top1.title}
              </span>

              {/* Bục Top 1 */}
              <div className="w-full mt-4 bg-gradient-to-t from-yellow-400 via-amber-300 to-yellow-200 rounded-2xl p-5 shadow-xl border-2 border-yellow-400 min-h-[175px] flex flex-col items-center justify-center">
                <Trophy className="w-10 h-10 text-yellow-600 fill-yellow-500 mb-1" />
                <span className="text-3xl font-black text-yellow-900">{top1.current_xp}</span>
                <span className="text-[11px] font-black text-yellow-800 uppercase">XP TÍCH LŨY</span>
                <span className="text-xs font-bold text-yellow-900 mt-1">Cấp độ {top1.level} • {top1.streak_days} ngày streak 🔥</span>
              </div>
            </div>
          )}

          {/* TOP 3 (BÊN PHẢI) */}
          {top3 && (
            <div className="order-3 sm:order-3 flex-1 max-w-[240px] w-full text-center flex flex-col items-center">
              <div className="relative mb-3">
                <img
                  src={top3.avatar_url}
                  alt={top3.student_name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-amber-700/60 shadow-xl bg-white"
                />
                <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-amber-700 text-white text-xs font-black px-3 py-0.5 rounded-full shadow flex items-center gap-1">
                  <span>🥉 #3</span>
                </div>
              </div>

              <h3 className="font-black text-base text-gray-800 mt-2 truncate w-full">
                {top3.student_name}
              </h3>
              <span className="text-xs font-bold text-gray-500">{top3.class_name || top3.grade_level}</span>
              <span className="text-[11px] font-black text-orange-700 bg-orange-50 px-2.5 py-0.5 rounded-full mt-1">
                {top3.title}
              </span>

              {/* Bục Top 3 */}
              <div className="w-full mt-4 bg-gradient-to-t from-amber-600/30 to-amber-100 rounded-2xl p-4 shadow-md border border-amber-300/80 min-h-[120px] flex flex-col items-center justify-center">
                <Award className="w-8 h-8 text-amber-700 mb-1" />
                <span className="text-2xl font-black text-amber-900">{top3.current_xp}</span>
                <span className="text-[10px] font-extrabold text-amber-800 uppercase">XP TÍCH LŨY</span>
                <span className="text-[11px] font-bold text-amber-800 mt-1">Cấp độ: {top3.level}</span>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* 4. THẺ VỊ TRÍ CỦA BẠN (MY RANK CARD BANNER) */}
      {myStats && (
        <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-white p-6 sm:p-7 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="relative">
              <img
                src={myStats.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=student'}
                alt={myStats.student_name}
                className="w-16 h-16 rounded-full border-4 border-white shadow-md bg-white"
              />
              <span className="absolute -bottom-1 -right-1 bg-white text-orange-600 font-black text-xs px-2 py-0.5 rounded-full shadow">
                #{myStats.rank}
              </span>
            </div>

            <div>
              <span className="bg-white/20 text-[11px] font-black px-3 py-0.5 rounded-full uppercase">
                VỊ TRÍ CỦA BẠN
              </span>
              <h3 className="text-xl sm:text-2xl font-black mt-0.5">
                {myStats.student_name} • Hạng {myStats.rank} ({timeframeLabels[timeframe]})
              </h3>
              <p className="text-orange-100 text-xs font-medium">
                Cấp độ {myStats.level} • Tổng {myStats.current_xp} XP • {myStats.completed_tasks} bài hoàn thành
              </p>
            </div>
          </div>

          {/* XP Progress Bar to Next Level & Next Rank */}
          <div className="bg-white/20 p-4 rounded-2xl border border-white/25 min-w-[260px] text-xs">
            <div className="flex items-center justify-between font-bold mb-1.5">
              <span>Tiến độ Level {myStats.level + 1}</span>
              <span>{myStats.progress_percent}%</span>
            </div>
            <div className="w-full bg-black/20 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-yellow-300 h-full rounded-full transition-all duration-500"
                style={{ width: `${myStats.progress_percent}%` }}
              />
            </div>
            {myStats.xp_needed_to_pass > 0 && (
              <p className="text-[11px] font-bold text-yellow-100 mt-2 flex items-center gap-1">
                <ArrowUp className="w-3.5 h-3.5" />
                <span>Cần thêm <strong>{myStats.xp_needed_to_pass} XP</strong> để lên Hạng #{myStats.next_rank}!</span>
              </p>
            )}
          </div>
        </div>
      )}

      {/* 5. FULL LEADERBOARD TABLE (RANK 4 TO 10+) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-orange-100 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-gray-800 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-orange-500" />
            Bảng Xếp Hạng Chi Tiết ({timeframeLabels[timeframe]})
          </h3>
          <span className="text-xs text-gray-500 font-bold">
            Tổng cộng: {leaderboard.length} học sinh
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-orange-50 text-orange-800 font-black uppercase border-b border-orange-200">
              <tr>
                <th className="p-3.5 text-center w-16">Hạng</th>
                <th className="p-3.5">Học Sinh</th>
                <th className="p-3.5">Lớp</th>
                <th className="p-3.5 text-center">Cấp Độ Level</th>
                <th className="p-3.5 text-center">Chuỗi Streak</th>
                <th className="p-3.5 text-center">Bài Hoàn Thành</th>
                <th className="p-3.5 text-right">Tổng XP</th>
                <th className="p-3.5 text-center">Khen Thưởng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-bold">
              {leaderboard.map((item) => {
                const isMe = item.student_id === (userProfile?.id || 'demo-student-id');
                let rankBadge = 'bg-gray-100 text-gray-700';
                if (item.rank === 1) rankBadge = 'bg-yellow-400 text-yellow-900 font-black';
                else if (item.rank === 2) rankBadge = 'bg-slate-300 text-slate-800 font-black';
                else if (item.rank === 3) rankBadge = 'bg-amber-600 text-white font-black';

                return (
                  <tr
                    key={item.student_id}
                    className={`transition ${isMe ? 'bg-orange-50 border-l-4 border-orange-500' : 'hover:bg-orange-50/40'}`}
                  >
                    <td className="p-3.5 text-center">
                      <span className={`w-7 h-7 rounded-full inline-flex items-center justify-center text-xs ${rankBadge}`}>
                        {item.rank <= 3 ? (item.rank === 1 ? '👑' : item.rank === 2 ? '🥈' : '🥉') : item.rank}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.avatar_url}
                          alt={item.student_name}
                          className="w-9 h-9 rounded-full bg-white border border-gray-200 shadow-sm"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-black text-gray-900 text-sm">
                              {item.student_name}
                            </span>
                            {isMe && (
                              <span className="bg-orange-500 text-white text-[10px] px-2 py-0.2 rounded-full font-black">
                                BẠN
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-gray-500 font-medium">
                            {item.title}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 text-gray-600 font-semibold">
                      {item.class_name || item.grade_level}
                    </td>
                    <td className="p-3.5 text-center">
                      <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full text-xs font-black">
                        Lv.{item.level}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <span className="inline-flex items-center gap-1 text-orange-600 font-black text-xs">
                        <Flame className="w-4 h-4 fill-orange-500 text-orange-500" />
                        <span>{item.streak_days || 5} ngày</span>
                      </span>
                    </td>
                    <td className="p-3.5 text-center text-gray-700">
                      {item.completed_tasks || 30} bài
                    </td>
                    <td className="p-3.5 text-right">
                      <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-sm px-3.5 py-1.5 rounded-xl shadow-sm inline-flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-current text-yellow-200" />
                        <span>{item.current_xp} XP</span>
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => handleOpenBonusModal(item)}
                        className="bg-amber-100 hover:bg-amber-200 text-amber-900 font-black text-[11px] px-3 py-1.5 rounded-xl transition inline-flex items-center gap-1.5 shadow-sm active:scale-95 border border-amber-300"
                        title="Thầy cô khen thưởng & tặng điểm XP cho học sinh này"
                      >
                        <Gift className="w-3.5 h-3.5 text-amber-700" />
                        <span>Thưởng XP</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. HỘP THÔNG TIN PHẦN THƯỞNG HỌC KỲ (SEMESTER REWARDS) */}
      <div className="bg-gradient-to-r from-indigo-900 to-purple-900 text-white p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 bg-white/20 text-xs font-black px-3.5 py-1 rounded-full uppercase">
            <Gift className="w-4 h-4 text-pink-300" />
            <span>VINH DANH CUỐI HỌC KỲ</span>
          </div>
          <h3 className="text-2xl font-black">Cơ Cấu Phần Thưởng Vinh Dự 🎁</h3>
          <p className="text-purple-200 text-xs font-medium max-w-xl">
            Top 3 học sinh xuất sắc nhất học kỳ sẽ được trao tặng Cúp Vinh Quang VuiHoc, Giấy Khen Đại Sứ Tri Thức và bộ quà tặng đồ dùng học tập độc quyền!
          </p>
        </div>

        <Link
          to="/"
          className="bg-yellow-400 hover:bg-yellow-300 text-purple-950 font-black text-xs px-6 py-3.5 rounded-2xl shadow-lg kid-btn flex items-center gap-2 whitespace-nowrap"
        >
          <Sparkles className="w-4 h-4" />
          <span>Học Bài Ngay Để Tích Lũy Thêm XP</span>
        </Link>
      </div>

      {/* 7. TEACHER AWARD BONUS MODAL */}
      <TeacherAwardBonusModal
        isOpen={isBonusModalOpen}
        onClose={() => setIsBonusModalOpen(false)}
        initialStudent={selectedStudentForBonus}
        userProfile={userProfile}
        onBonusAwarded={handleBonusAwarded}
      />

    </div>
  );
};

export default LeaderboardPage;
