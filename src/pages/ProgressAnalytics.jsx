import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { BarChart3, ShieldAlert, Bot, CheckCircle2, Clock, Award, AlertTriangle, User, Search, RefreshCw, Gamepad2 } from 'lucide-react';

export const ProgressAnalytics = ({ userProfile }) => {
  const [progressData, setProgressData] = useState([]);
  const [violationsData, setViolationsData] = useState([]);
  const [aiLogsData, setAiLogsData] = useState([]);
  const [gameScoresData, setGameScoresData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    setLoading(true);
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
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        
        {/* Total Progress Card */}
        <div className="bg-white p-6 rounded-3xl border-2 border-emerald-100 shadow-md flex items-center gap-4">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center font-black">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-extrabold text-gray-400 uppercase">Bài Hoàn Thành</span>
            <h3 className="text-3xl font-black text-gray-800">{progressData.length}</h3>
          </div>
        </div>

        {/* Total Game Scores Card */}
        <div className="bg-white p-6 rounded-3xl border-2 border-purple-100 shadow-md flex items-center gap-4">
          <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center font-black">
            <Gamepad2 className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-extrabold text-gray-400 uppercase">Lượt Game SDK</span>
            <h3 className="text-3xl font-black text-purple-600">{gameScoresData.length}</h3>
          </div>
        </div>

        {/* Total Focus Violations Card */}
        <div className="bg-white p-6 rounded-3xl border-2 border-red-100 shadow-md flex items-center gap-4">
          <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center font-black">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-extrabold text-gray-400 uppercase">Rời Tab (Focus Lost)</span>
            <h3 className="text-3xl font-black text-red-600">{violationsData.length}</h3>
          </div>
        </div>

        {/* Total AI Tutor Sessions Card */}
        <div className="bg-white p-6 rounded-3xl border-2 border-orange-100 shadow-md flex items-center gap-4">
          <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center font-black">
            <Bot className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-extrabold text-gray-400 uppercase">Hỏi AI Gia Sư</span>
            <h3 className="text-3xl font-black text-orange-600">{aiLogsData.length}</h3>
          </div>
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
