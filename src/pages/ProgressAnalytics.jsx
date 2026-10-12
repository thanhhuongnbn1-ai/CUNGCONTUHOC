import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { autoGradingService } from '../lib/autoGradingService';
import { BarChart3, ShieldAlert, Bot, CheckCircle2, Clock, Award, AlertTriangle, User, Search, RefreshCw, Gamepad2, FileCheck, Sparkles } from 'lucide-react';

export const ProgressAnalytics = ({ userProfile }) => {
  const [progressData, setProgressData] = useState([]);
  const [violationsData, setViolationsData] = useState([]);
  const [aiLogsData, setAiLogsData] = useState([]);
  const [gameScoresData, setGameScoresData] = useState([]);
  const [autoGradedData, setAutoGradedData] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    setLoading(true);

    // Lấy dữ liệu chấm điểm tự động từ service (hỗ trợ cả Supabase & LocalStorage)
    try {
      const graded = await autoGradingService.getSubmissions();
      setAutoGradedData(graded);
    } catch (e) {
      console.warn('Error fetching auto-graded submissions:', e);
    }

    if (!isSupabaseConfigured()) {
      // Demo analytics data for local testing
      setProgressData([
        { id: '1', student: 'Bé Minh Triết (Lớp 1A)', material: 'Thử Thách Phép Cộng Phạm Vi 10', status: 'completed', score: 100, completed_at: 'Hôm nay 14:30' },
        { id: '2', student: 'Trần Thị Mai (Lớp 2B)', material: 'Truyện Cổ Tích Cây Bút Thần', status: 'in_progress', score: 85, completed_at: 'Hôm nay 10:15' }
      ]);
      setViolationsData([
        { id: 'v1', student: 'Bé Minh Triết', reason: 'Chuyển Tab Trình Duyệt', time: '14:25', count: 2 },
        { id: 'v2', student: 'Trần Thị Mai', reason: 'Thoát Cửa Sổ Trình Duyệt', time: '10:12', count: 1 }
      ]);
      setAiLogsData([
        { id: 'log1', student: 'Bé Minh Triết', topic: 'Gợi ý phép cộng 4 + 3', time: '14:20' }
      ]);
      setGameScoresData([
        { id: 'gs1', student: 'Bé Minh Triết', game: 'Đấu Trường Phép Tính Nhanh', score: 100, max: 100, time: '14:28' },
        { id: 'gs2', student: 'Trần Thị Mai', game: 'Ghép Từ Vựng Phép Thuật', score: 90, max: 100, time: '10:18' }
      ]);
      setLoading(false);
      return;
    }

    try {
      // Fetch progress
      const { data: prog } = await supabase.from('student_progress').select('*, profiles(full_name, email), materials(title)');
      if (prog) setProgressData(prog);

      // Fetch focus violations
      const { data: viols } = await supabase.from('focus_violations').select('*, profiles(full_name, email), materials(title)').order('violation_time', { ascending: false });
      if (viols) setViolationsData(viols);

      // Fetch AI tutor logs
      const { data: logs } = await supabase.from('ai_tutor_logs').select('*, profiles(full_name, email), materials(title)').order('created_at', { ascending: false });
      if (logs) setAiLogsData(logs);

      // Fetch game scores recorded by JavaScript Game SDK
      const { data: scores } = await supabase.from('game_scores').select('*, profiles(full_name, email), materials(title)').order('played_at', { ascending: false });
      if (scores) setGameScoresData(scores);

    } catch (err) {
      console.warn('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 font-sans">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-2 inline-block">
            BÁO CÁO DÀNH CHO GIÁO VIÊN & PHỤ HUYNH
          </span>
          <h1 className="text-3xl sm:text-4xl font-black">Báo Cáo Tiến Độ, Điểm Game & Focus</h1>
          <p className="text-emerald-100 font-medium text-sm mt-1 max-w-xl">
            Tự động đồng bộ điểm số từ Game HTML5 (JavaScript SDK), ghi nhận lượt rời tab (Focus Guardian) và thời gian học tập.
          </p>
        </div>

        <button
          onClick={fetchAnalyticsData}
          className="bg-white text-emerald-700 hover:bg-emerald-50 font-black px-5 py-3 rounded-2xl shadow-lg flex items-center gap-2 kid-btn text-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Cập nhật dữ liệu</span>
        </button>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
        
        {/* Total Progress Card */}
        <div className="bg-white p-5 rounded-3xl border-2 border-emerald-100 shadow-md flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center font-black">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[11px] font-extrabold text-gray-400 uppercase">Hoàn Thành</span>
            <h3 className="text-2xl font-black text-gray-800">{progressData.length}</h3>
          </div>
        </div>

        {/* Total Auto-Graded Exams Card */}
        <div className="bg-white p-5 rounded-3xl border-2 border-amber-100 shadow-md flex items-center gap-3">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center font-black">
            <FileCheck className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[11px] font-extrabold text-gray-400 uppercase">Tự Chấm Đề</span>
            <h3 className="text-2xl font-black text-amber-600">{autoGradedData.length}</h3>
          </div>
        </div>

        {/* Total Game Scores Card */}
        <div className="bg-white p-5 rounded-3xl border-2 border-purple-100 shadow-md flex items-center gap-3">
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center font-black">
            <Gamepad2 className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[11px] font-extrabold text-gray-400 uppercase">Điểm Game SDK</span>
            <h3 className="text-2xl font-black text-purple-600">{gameScoresData.length}</h3>
          </div>
        </div>

        {/* Total Focus Violations Card */}
        <div className="bg-white p-5 rounded-3xl border-2 border-red-100 shadow-md flex items-center gap-3">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center font-black">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[11px] font-extrabold text-gray-400 uppercase">Rời Tab (Focus)</span>
            <h3 className="text-2xl font-black text-red-600">{violationsData.length}</h3>
          </div>
        </div>

        {/* Total AI Tutor Sessions Card */}
        <div className="bg-white p-5 rounded-3xl border-2 border-orange-100 shadow-md flex items-center gap-3">
          <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center font-black">
            <Bot className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[11px] font-extrabold text-gray-400 uppercase">Hỏi Thầy Cú AI</span>
            <h3 className="text-2xl font-black text-orange-600">{aiLogsData.length}</h3>
          </div>
        </div>

      </div>

      {/* SECTION: BẢNG ĐIỂM CHẤM TRẮC NGHIỆM TỰ ĐỘNG TỨC THÌ */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-orange-100 shadow-lg space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-orange-100 text-orange-800 text-xs font-black px-3 py-1 rounded-full uppercase mb-1">
              <Sparkles className="w-3.5 h-3.5 text-orange-600" />
              <span>HỆ THỐNG CHẤM ĐIỂM TỨC THÌ (REALTIME AUTO-GRADING)</span>
            </div>
            <h2 className="text-2xl font-black text-gray-800">
              Nhật Ký Chấm Điểm Trắc Nghiệm Tự Động
            </h2>
            <p className="text-xs text-gray-500 font-medium">
              Chấm ngay lập tức sau khi học sinh bấm "Nộp bài", tự động tính điểm thang 10 & 100 và đồng bộ CSDL Supabase.
            </p>
          </div>

          <span className="bg-emerald-100 text-emerald-800 text-xs font-extrabold px-3 py-1.5 rounded-xl border border-emerald-300">
            ✓ Đồng bộ Supabase exam_submissions & student_progress
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-orange-50 text-orange-800 font-black uppercase border-b border-orange-200">
              <tr>
                <th className="p-3">Học sinh</th>
                <th className="p-3">Đề thi / Bài trắc nghiệm</th>
                <th className="p-3 text-center">Điểm Thang 10</th>
                <th className="p-3 text-center">Điểm Thang 100</th>
                <th className="p-3">Xếp loại</th>
                <th className="p-3">Thời gian nộp</th>
                <th className="p-3 text-center">Trạng thái CSDL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-bold">
              {autoGradedData.length > 0 ? (
                autoGradedData.map((sub) => {
                  const score10 = sub.score_10 ?? parseFloat(((sub.total_score / 100) * 10).toFixed(1));
                  const score100 = sub.total_score ?? 0;
                  let rankBadge = 'bg-emerald-100 text-emerald-800';
                  let rankText = 'Xuất Sắc 🏆';
                  if (score10 < 5.0) { rankBadge = 'bg-rose-100 text-rose-800'; rankText = 'Cần Cố Gắng 💪'; }
                  else if (score10 < 6.5) { rankBadge = 'bg-yellow-100 text-yellow-800'; rankText = 'Đạt Yêu Cầu 📚'; }
                  else if (score10 < 8.0) { rankBadge = 'bg-amber-100 text-amber-800'; rankText = 'Khá 👍'; }
                  else if (score10 < 9.0) { rankBadge = 'bg-blue-100 text-blue-800'; rankText = 'Giỏi 🌟'; }

                  return (
                    <tr key={sub.id} className="hover:bg-orange-50/40 transition">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-700 font-black text-xs flex items-center justify-center">
                            {(sub.student_name || 'H')[0]}
                          </div>
                          <span className="font-extrabold text-gray-800">{sub.student_name || 'Học sinh'}</span>
                        </div>
                      </td>
                      <td className="p-3 font-medium text-gray-700">
                        {sub.material_title || 'Đề thi trắc nghiệm'}
                      </td>
                      <td className="p-3 text-center">
                        <span className="text-base font-black text-orange-600">
                          {score10}
                        </span>
                        <span className="text-gray-400 font-medium">/10</span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="bg-orange-100 text-orange-800 px-2.5 py-0.5 rounded-full font-black text-xs">
                          {score100} đ
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-black ${rankBadge}`}>
                          {sub.rank_label || rankText}
                        </span>
                      </td>
                      <td className="p-3 text-gray-400">
                        {sub.submitted_at ? new Date(sub.submitted_at).toLocaleString('vi-VN') : 'Vừa xong'}
                      </td>
                      <td className="p-3 text-center">
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold">
                          ✓ Realtime Synced
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400 font-medium">
                    Chưa có bài thi nào được nộp. Học sinh làm đề trắc nghiệm và bấm "Nộp bài", hệ thống sẽ tự động chấm và hiển thị tại đây!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>


      {/* Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Table 1: Progress & Game Scores Table */}
        <div className="bg-white p-6 rounded-3xl border-2 border-gray-100 shadow-md space-y-4">
          <h3 className="text-lg font-black text-gray-800 flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-purple-600" />
            Nhật Ký Điểm Game HTML5 (Ghi Tự Động Qua SDK)
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-purple-50 text-purple-700 font-extrabold uppercase border-b border-purple-100">
                <tr>
                  <th className="p-3">Học sinh</th>
                  <th className="p-3">Tựa Game</th>
                  <th className="p-3">Điểm SDK</th>
                  <th className="p-3">Thời gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-bold">
                {gameScoresData.map((item) => (
                  <tr key={item.id} className="hover:bg-purple-50/40">
                    <td className="p-3">{item.profiles?.full_name || item.student || 'Học sinh'}</td>
                    <td className="p-3 font-medium">{item.materials?.title || item.game || 'Game Phép Tính'}</td>
                    <td className="p-3 text-purple-700 font-black">{item.score} / {item.max_score || item.max || 100}</td>
                    <td className="p-3 text-gray-400">{item.played_at ? new Date(item.played_at).toLocaleTimeString('vi-VN') : item.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 2: Focus Violation Logs Table */}
        <div className="bg-white p-6 rounded-3xl border-2 border-red-100 shadow-md space-y-4">
          <h3 className="text-lg font-black text-gray-800 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Nhật Ký Cảnh Báo Rời Tab (Focus Guardian)
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-red-50 text-red-700 font-extrabold uppercase border-b border-red-100">
                <tr>
                  <th className="p-3">Học sinh</th>
                  <th className="p-3">Lý do cảnh báo</th>
                  <th className="p-3">Thời gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-bold">
                {violationsData.map((v) => (
                  <tr key={v.id} className="hover:bg-red-50/40">
                    <td className="p-3">{v.profiles?.full_name || v.student || 'Học sinh'}</td>
                    <td className="p-3 text-red-600 font-medium">{v.reason || 'Chuyển tab trình duyệt'}</td>
                    <td className="p-3 text-gray-400">{v.violation_time ? new Date(v.violation_time).toLocaleTimeString('vi-VN') : v.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};

export default ProgressAnalytics;
