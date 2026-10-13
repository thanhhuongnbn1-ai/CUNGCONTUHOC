import React, { useState, useEffect } from 'react';
import { pwaSyncService } from '../lib/pwaSyncService';
import {
  Download,
  Smartphone,
  Laptop,
  Wifi,
  WifiOff,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  X,
  Share2,
  PlusSquare,
  ShieldCheck,
  Zap
} from 'lucide-react';

export const PwaInstallModal = ({ isOpen, onClose, userProfile }) => {
  const [canInstall, setCanInstall] = useState(pwaSyncService.canInstall());
  const [isStandalone, setIsStandalone] = useState(pwaSyncService.isStandalone());
  const [platformInfo, setPlatformInfo] = useState(pwaSyncService.getPlatformInfo());
  const [isInstalling, setIsInstalling] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  useEffect(() => {
    const handleCanInstall = () => setCanInstall(true);
    const handleInstalled = () => {
      setInstallSuccess(true);
      setIsStandalone(true);
      setCanInstall(false);
    };

    window.addEventListener('pwa_can_install', handleCanInstall);
    window.addEventListener('pwa_installed_success', handleInstalled);

    setCanInstall(pwaSyncService.canInstall());
    setIsStandalone(pwaSyncService.isStandalone());
    setPlatformInfo(pwaSyncService.getPlatformInfo());

    return () => {
      window.removeEventListener('pwa_can_install', handleCanInstall);
      window.removeEventListener('pwa_installed_success', handleInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    setIsInstalling(true);
    const res = await pwaSyncService.triggerInstallPrompt();
    setIsInstalling(false);
    if (res.outcome === 'accepted') {
      setInstallSuccess(true);
      setIsStandalone(true);
      pwaSyncService.recordInstallation(userProfile);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border-4 border-orange-300 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* 1. MODAL HEADER */}
        <div className="bg-gradient-to-r from-[#FF6600] via-amber-500 to-yellow-500 text-white p-6 relative overflow-hidden flex items-center justify-between">
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />

          <div className="flex items-center gap-3.5 relative z-10">
            <div className="w-13 h-13 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-md p-1 border-2 border-white/40">
              🎓
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 bg-white/20 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-yellow-200" />
                <span>PROGRESSIVE WEB APP (PWA)</span>
              </div>
              <h2 className="text-xl font-black text-white drop-shadow-sm mt-0.5">
                Cài Đặt VuiHoc Về Màn Hình
              </h2>
              <p className="text-orange-100 text-xs font-semibold">
                Dùng như ứng dụng Native trên Điện thoại & Máy tính
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition flex-shrink-0 relative z-10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. BODY CONTENT */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Status Badge if already installed */}
          {isStandalone ? (
            <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl flex items-center gap-3 text-emerald-800">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
              <div className="text-xs">
                <p className="font-black text-sm text-emerald-900">
                  🎉 Bạn đang sử dụng ứng dụng Native đã cài đặt!
                </p>
                <p className="text-emerald-700 font-semibold mt-0.5">
                  Ứng dụng đã được cài đặt trên thiết bị của bạn với đầy đủ tính năng ngoại tuyến và đồng bộ tự động.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Core Features Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-orange-50/70 border border-orange-200 rounded-2xl space-y-1">
                  <div className="flex items-center gap-1.5 text-orange-600 font-black text-xs">
                    <Zap className="w-4 h-4" />
                    <span>Mở Tức Thì</span>
                  </div>
                  <p className="text-[11px] text-gray-600 font-medium">
                    1 chạm mở ngay từ màn hình chính, không cần gõ trình duyệt web.
                  </p>
                </div>

                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-600 font-black text-xs">
                    <WifiOff className="w-4 h-4" />
                    <span>Học Ngoại Tuyến</span>
                  </div>
                  <p className="text-[11px] text-gray-600 font-medium">
                    Làm bài, chơi game học tập kể cả khi mất mạng hoặc mạng yếu.
                  </p>
                </div>

                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-1">
                  <div className="flex items-center gap-1.5 text-blue-600 font-black text-xs">
                    <RefreshCw className="w-4 h-4" />
                    <span>Đồng Bộ CSDL</span>
                  </div>
                  <p className="text-[11px] text-gray-600 font-medium">
                    Tự động lưu tạm và đồng bộ điểm số về Supabase ngay khi có mạng.
                  </p>
                </div>

                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-600 font-black text-xs">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Nhẹ & An Toàn</span>
                  </div>
                  <p className="text-[11px] text-gray-600 font-medium">
                    Chiếm dưới 5MB dung lượng, bảo mật DRM và luôn cập nhật bản mới nhất.
                  </p>
                </div>
              </div>

              {/* Platform Specific Instructions */}
              {platformInfo.isIOS ? (
                /* iOS Safari Instructions */
                <div className="p-4 bg-orange-50 border-2 border-orange-200 rounded-2xl space-y-2">
                  <p className="text-xs font-black text-orange-950 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-orange-600" />
                    <span>Hướng Dẫn Cài Đặt Trên iPhone / iPad (iOS Safari):</span>
                  </p>
                  <ol className="text-xs text-gray-700 font-medium space-y-1.5 list-decimal list-inside">
                    <li>
                      Bấm vào biểu tượng <strong>Chia sẻ (Share) <Share2 className="w-3.5 h-3.5 inline text-blue-600" /></strong> ở thanh dưới của Safari.
                    </li>
                    <li>
                      Cuộn xuống và chọn <strong>"Thêm vào Màn hình chính" (Add to Home Screen) <PlusSquare className="w-3.5 h-3.5 inline text-orange-600" /></strong>.
                    </li>
                    <li>
                      Bấm <strong>"Thêm" (Add)</strong> ở góc trên bên phải để hoàn tất!
                    </li>
                  </ol>
                </div>
              ) : (
                /* Android & Desktop Windows/Mac Instructions */
                <div className="p-4 bg-orange-50 border-2 border-orange-200 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-xs font-black text-orange-900">
                    {platformInfo.isMobile ? (
                      <Smartphone className="w-4 h-4 text-orange-600" />
                    ) : (
                      <Laptop className="w-4 h-4 text-orange-600" />
                    )}
                    <span>
                      {platformInfo.isMobile
                        ? 'Cài đặt trực tiếp lên Màn hình điện thoại Android:'
                        : 'Cài đặt làm ứng dụng máy tính (Windows / MacOS / Linux):'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 font-medium leading-relaxed">
                    Chỉ cần nhấn nút <strong>"Cài Đặt Ứng Dụng Ngay"</strong> bên dưới. Trình duyệt sẽ thêm icon 🎓 VuiHoc vào màn hình chính của bạn.
                  </p>
                </div>
              )}
            </>
          )}

        </div>

        {/* 3. MODAL FOOTER ACTIONS */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl text-xs font-bold text-gray-600 hover:bg-gray-200 transition"
          >
            Đóng
          </button>

          {!isStandalone && !platformInfo.isIOS && (
            <button
              onClick={handleInstallClick}
              disabled={isInstalling}
              className="bg-gradient-to-r from-[#FF6600] via-amber-500 to-yellow-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs px-6 py-3 rounded-2xl shadow-lg flex items-center gap-2 kid-btn active:scale-95 transition"
            >
              <Download className="w-4 h-4" />
              <span>{isInstalling ? 'Đang cài đặt...' : 'Cài Đặt Ứng Dụng Ngay'}</span>
            </button>
          )}

          {platformInfo.isIOS && !isStandalone && (
            <button
              onClick={onClose}
              className="bg-[#FF6600] text-white font-black text-xs px-6 py-3 rounded-2xl shadow-lg flex items-center gap-2 kid-btn"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Đã Hiểu Cách Cài Đặt</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default PwaInstallModal;
