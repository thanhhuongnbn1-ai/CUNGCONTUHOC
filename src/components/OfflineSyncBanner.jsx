import React, { useState, useEffect } from 'react';
import { pwaSyncService } from '../lib/pwaSyncService';
import { WifiOff, RefreshCw, CheckCircle2, CloudUpload, X } from 'lucide-react';

export const OfflineSyncBanner = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [queueCount, setQueueCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncToast, setSyncToast] = useState(null);

  useEffect(() => {
    // Initial queue count
    setQueueCount(pwaSyncService.getOfflineQueue().length);

    const handleNetworkStatus = (e) => {
      setIsOnline(e.detail.isOnline);
    };

    const handleQueueUpdated = (e) => {
      setQueueCount(e.detail.queueLength || 0);
    };

    const handleSyncStarted = (e) => {
      setIsSyncing(true);
    };

    const handleSyncCompleted = (e) => {
      setIsSyncing(false);
      setQueueCount(e.detail.remainingCount || 0);

      if (e.detail.syncedCount > 0) {
        setSyncToast({
          message: `Đã đồng bộ ${e.detail.syncedCount} bản ghi lên Database Supabase!`,
          time: e.detail.timestamp
        });

        const timer = setTimeout(() => {
          setSyncToast(null);
        }, 4000);

        return () => clearTimeout(timer);
      }
    };

    window.addEventListener('pwa_network_status', handleNetworkStatus);
    window.addEventListener('pwa_queue_updated', handleQueueUpdated);
    window.addEventListener('pwa_sync_started', handleSyncStarted);
    window.addEventListener('pwa_sync_completed', handleSyncCompleted);

    return () => {
      window.removeEventListener('pwa_network_status', handleNetworkStatus);
      window.removeEventListener('pwa_queue_updated', handleQueueUpdated);
      window.removeEventListener('pwa_sync_started', handleSyncStarted);
      window.removeEventListener('pwa_sync_completed', handleSyncCompleted);
    };
  }, []);

  const handleManualSync = () => {
    pwaSyncService.syncOfflineDataToSupabase();
  };

  return (
    <>
      {/* 1. OFFLINE WARNING BANNER */}
      {!isOnline && (
        <div className="bg-amber-600 text-white px-4 py-2 text-xs font-black shadow-md flex items-center justify-between z-40 sticky top-0 transition animate-slide-in">
          <div className="flex items-center gap-2 max-w-4xl mx-auto flex-1">
            <WifiOff className="w-4 h-4 text-amber-200 animate-pulse flex-shrink-0" />
            <span>
              <strong>CHẾ ĐỘ NGOẠI TUYẾN (OFFLINE):</strong> Ứng dụng PWA đang chạy từ bộ nhớ máy. Toàn bộ điểm số, XP và bài làm đang được lưu tạm an toàn ({queueCount} bản ghi chờ).
            </span>
          </div>
        </div>
      )}

      {/* 2. SYNC IN PROGRESS NOTIFICATION */}
      {isSyncing && (
        <div className="fixed bottom-20 left-6 z-50 bg-blue-600 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-black animate-bounce border-2 border-white">
          <RefreshCw className="w-4 h-4 animate-spin text-blue-200" />
          <span>Đang đồng bộ dữ liệu ngoại tuyến lên Supabase...</span>
        </div>
      )}

      {/* 3. SYNC COMPLETED CELEBRATION TOAST */}
      {syncToast && (
        <div className="fixed bottom-20 left-6 z-50 bg-emerald-600 text-white p-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-black border-2 border-white animate-slide-in">
          <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          </div>
          <div>
            <p className="font-black text-sm">{syncToast.message}</p>
            <p className="text-[10px] text-emerald-200 font-medium">Hoàn tất lúc: {syncToast.time}</p>
          </div>
          <button
            onClick={() => setSyncToast(null)}
            className="p-1 hover:bg-white/20 rounded-full text-white ml-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </>
  );
};

export default OfflineSyncBanner;
