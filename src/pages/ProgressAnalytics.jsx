import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { BarChart3, ShieldAlert, Bot, CheckCircle2, Clock, Award, AlertTriangle, User, Search, RefreshCw } from 'lucide-react';

export const ProgressAnalytics = ({ userProfile }) => {
  const [progressData, setProgressData] = useState([]);
  const [violationsData, setViolationsData] = useState([]);
  const [aiLogsData, setAiLogsData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    if (!isSupabaseConfigured()) {
      // Demo analytics data for local testing
      setProgressData([
        { id: '1', student: 'Nguyễn Văn Minh (Lớp 1A)', material: 'Phép cộng phạm vi 10', status: 'completed', score: 100, completed_at: 'Hôm nay 14:30' },
        { id: '2', student: 'Trần Thị Mai (Lớp 2B)', material: 'Truyện Cổ Tích Cây Bút Thần', status: 'in_progress', score: 85, completed_at: 'Hôm nay 10:15' }
      ]);
      setViolationsData([
        { id: 'v1', student: 'Nguyễn Văn Minh', reason: 'Chuyển Tab Trình Duyệt', time: '14:25', count: 2 },
        { id: 'v2', student: 'Trần Thị Mai', reason: 'Thoát Cửa Sổ Trình Duyệt', time: '10:12', count: 1 }
      ]);
      setAiLogsData([
        { id: 'log1', student: 'Nguyễn Văn Minh', topic: 'Gợi ý phép cộng 4 + 3', time: '14:20' }
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

    } catch (err) {
      console.warn('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-2 inline-block">
            BÁO CÁO DÀNH CHO GIÁO VIÊN & PHỤ HUYNH
          </span>
          <h1 className="text-3xl sm:text-4xl font-black">Báo Cáo Tiến Độ & Thái Độ Tự Học</h1>
          <p className="text-emerald-100 font-medium text-sm mt-1 max-w-xl">
            Thống kê thời gian hoàn thành bài học, số lần nhờ AI Gia Sư Socratic gợi ý, và số lượt vi phạm chuyển tab (Focus Guardian).
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        {/* Total Progress Card */}
        <div className="bg-white p-6 rounded-3xl border-2 border-emerald-100 shadow-md flex items-center gap-4">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center font-black">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-extrabold text-gray-400 uppercase">Bài Học Hoàn Thành</span>
            <h3 className="text-3xl font-black text-gray-800">{progressData.length}</h3>
          </div>
        </div>

        {/* Total Focus Violations Card */}
        <div className="bg-white p-6 rounded-3xl border-2 border-red-100 shadow-md flex items-center gap-4">
          <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center font-black">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-extrabold text-gray-400 uppercase">Lượt Rời Tab (Focus Lost)</span>
            <h3 className="text-3xl font-black text-red-600">{violationsData.length}</h3>
          </div>
        </div>

        {/* Total AI Tutor Sessions Card */}
        <div className="bg-white p-6 rounded-3xl border-2 border-orange-100 shadow-md flex items-center gap-4">
          <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center font-black">
            <Bot className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-extrabold text-gray-400 uppercase">Phiên Hỏi AI Gia Sư</span>
            <h3 className="text-3xl font-black text-orange-600">{aiLogsData.length}</h3>
          </div>
        </div>

      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Table 1: Progress Table */}
        <div className="bg-white p-6 rounded-3xl border-2 border-gray-100 shadow-md space-y-4">
          <h3 className="text-lg font-black text-gray-800 flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-600" />
            Bảng Điểm & Tiến Độ Học Tập
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 font-extrabold uppercase border-b">
                <tr>
                  <th className="p-3">Học sinh</th>
                  <th className="p-3">Bài học</th>
                  <th className="p-3">Trạng thái</th>
                  <th className="p-3">Điểm số</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-bold">
                {progressData.map((item) => (
                  <tr key={item.id} className="hover:bg-emerald-50/50">
                    <td className="p-3">{item.profiles?.full_name || item.student || 'Học sinh'}</td>
                    <td className="p-3 font-medium">{item.materials?.title || item.material}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-black ${
                        item.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {item.status === 'completed' ? 'Hoàn thành' : 'Đang học'}
                      </span>
                    </td>
                    <td className="p-3 text-emerald-600 font-black">{item.score || 100} điểm</td>
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
