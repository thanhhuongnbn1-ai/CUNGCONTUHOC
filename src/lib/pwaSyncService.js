import { supabase, isSupabaseConfigured } from './supabase';

const OFFLINE_QUEUE_KEY = 'vuihoc_offline_db_queue';
const PWA_INSTALLED_KEY = 'vuihoc_pwa_installed';

class PwaSyncService {
  constructor() {
    this.deferredPrompt = null;
    this.isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    this.isSyncing = false;
    this.initListeners();
  }

  initListeners() {
    if (typeof window === 'undefined') return;

    // Listen for beforeinstallprompt event (Chrome, Edge, Android)
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      window.dispatchEvent(new CustomEvent('pwa_can_install', { detail: { canInstall: true } }));
      console.log('[PWA] beforeinstallprompt captured and ready.');
    });

    // Listen for appinstalled event
    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      localStorage.setItem(PWA_INSTALLED_KEY, 'true');
      this.recordInstallation();
      window.dispatchEvent(new CustomEvent('pwa_installed_success'));
      console.log('[PWA] Application successfully installed.');
    });

    // Network connectivity change listeners
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('[PWA] Network restored. Triggering automatic database sync...');
      window.dispatchEvent(new CustomEvent('pwa_network_status', { detail: { isOnline: true } }));
      this.syncOfflineDataToSupabase();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.warn('[PWA] Network lost. Switched to Offline Graceful mode.');
      window.dispatchEvent(new CustomEvent('pwa_network_status', { detail: { isOnline: false } }));
    });

    // Service Worker message listener
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'TRIGGER_OFFLINE_DB_SYNC') {
          this.syncOfflineDataToSupabase();
        }
      });
    }
  }

  // Check if app is running in Standalone (Installed Native) mode
  isStandalone() {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: window-controls-overlay)').matches ||
      window.navigator.standalone === true ||
      document.referrer.includes('android-app://')
    );
  }

  // Detect Client Platform
  getPlatformInfo() {
    if (typeof navigator === 'undefined') return { platform: 'unknown', isMobile: false, isIOS: false };
    const ua = navigator.userAgent || '';
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
    const isAndroid = /Android/i.test(ua);
    const isWindows = /Windows/i.test(ua);
    const isMac = /Macintosh/i.test(ua) && !isIOS;
    const isMobile = /Mobi|Android/i.test(ua) || isIOS;

    let platform = 'desktop';
    if (isAndroid) platform = 'android';
    else if (isIOS) platform = 'ios';
    else if (isWindows) platform = 'windows';
    else if (isMac) platform = 'macos';

    return {
      platform,
      isMobile,
      isIOS,
      deviceType: isMobile ? 'mobile' : 'desktop',
      userAgent: ua
    };
  }

  // Check if installation prompt is available
  canInstall() {
    return Boolean(this.deferredPrompt);
  }

  // Trigger Native Install Prompt
  async triggerInstallPrompt() {
    if (!this.deferredPrompt) {
      return { outcome: 'unavailable' };
    }

    try {
      this.deferredPrompt.prompt();
      const choice = await this.deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        localStorage.setItem(PWA_INSTALLED_KEY, 'true');
        this.recordInstallation();
      }
      this.deferredPrompt = null;
      return choice;
    } catch (err) {
      console.warn('[PWA] Install prompt error:', err);
      return { outcome: 'error', error: err };
    }
  }

  // Record Installation to Supabase & LocalStorage
  async recordInstallation(userProfile = null) {
    const info = this.getPlatformInfo();
    const payload = {
      user_id: userProfile?.id || null,
      user_name: userProfile?.full_name || userProfile?.email || 'Học sinh / Giáo viên',
      device_platform: info.platform,
      device_type: info.deviceType,
      user_agent: info.userAgent,
      installed_at: new Date().toISOString()
    };

    localStorage.setItem(PWA_INSTALLED_KEY, JSON.stringify(payload));

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('pwa_installations').insert([payload]).catch(() => {});
      } catch (e) {
        console.warn('[PWA] Record installation in DB warning:', e);
      }
    }
  }

  // Register Service Worker
  async registerServiceWorker() {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return null;
    }

    try {
      const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      console.log('[PWA] Service Worker registered with scope:', reg.scope);

      // Listen for updates
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[PWA] New version available. Ready to refresh.');
              window.dispatchEvent(new CustomEvent('pwa_update_available'));
            }
          });
        }
      });

      return reg;
    } catch (err) {
      console.warn('[PWA] Service worker registration failed:', err);
      return null;
    }
  }

  // Enqueue offline actions for reliable Database synchronization
  enqueueOfflineAction({ type, table, data }) {
    const queueItem = {
      id: `queue_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      action_type: type, // 'sync_xp', 'sync_game_score', 'sync_exam_submission', 'sync_teacher_bonus'
      table_name: table,
      payload: data,
      created_at: new Date().toISOString(),
      retry_count: 0
    };

    try {
      const queue = this.getOfflineQueue();
      queue.push(queueItem);
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
      window.dispatchEvent(new CustomEvent('pwa_queue_updated', { detail: { queueLength: queue.length } }));
      console.log(`[PWA Offline Queue] Enqueued item for table [${table}]:`, queueItem);
    } catch (e) {
      console.warn('[PWA] Enqueue offline action error:', e);
    }

    // If online, immediately try to flush
    if (this.isOnline) {
      this.syncOfflineDataToSupabase();
    }

    return queueItem;
  }

  getOfflineQueue() {
    try {
      return JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]');
    } catch (e) {
      return [];
    }
  }

  // Synchronize Offline Queue items to Supabase Database
  async syncOfflineDataToSupabase() {
    if (this.isSyncing) return;
    const queue = this.getOfflineQueue();
    if (queue.length === 0) return;

    if (!isSupabaseConfigured() || !this.isOnline) {
      console.log('[PWA Sync] Skipping sync: Supabase not configured or client is offline.');
      return;
    }

    this.isSyncing = true;
    console.log(`[PWA Sync] Starting synchronization for ${queue.length} offline records to Supabase...`);
    window.dispatchEvent(new CustomEvent('pwa_sync_started', { detail: { count: queue.length } }));

    const remaining = [];
    let syncedCount = 0;

    for (const item of queue) {
      try {
        let isSuccess = false;

        // Sync to respective Supabase tables
        if (item.table_name === 'student_xp_logs') {
          const { error } = await supabase.from('student_xp_logs').insert([item.payload]);
          if (!error) isSuccess = true;
        } else if (item.table_name === 'game_scores') {
          const { error } = await supabase.from('game_scores').insert([item.payload]);
          if (!error) isSuccess = true;
        } else if (item.table_name === 'exam_submissions') {
          const { error } = await supabase.from('exam_submissions').insert([item.payload]);
          if (!error) isSuccess = true;
        } else if (item.table_name) {
          const { error } = await supabase.from(item.table_name).insert([item.payload]);
          if (!error) isSuccess = true;
        }

        if (isSuccess) {
          syncedCount++;
          // Log into pwa_sync_logs
          await supabase.from('pwa_sync_logs').insert([{
            action_type: item.action_type || 'offline_sync',
            payload: item.payload,
            status: 'success',
            synced_at: new Date().toISOString()
          }]).catch(() => {});
        } else {
          item.retry_count = (item.retry_count || 0) + 1;
          if (item.retry_count < 5) remaining.push(item);
        }
      } catch (err) {
        console.warn(`[PWA Sync] Error syncing item ${item.id}:`, err);
        item.retry_count = (item.retry_count || 0) + 1;
        if (item.retry_count < 5) remaining.push(item);
      }
    }

    // Save remaining items back to local queue
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remaining));
    this.isSyncing = false;

    console.log(`[PWA Sync] Completed. Synced: ${syncedCount}, Remaining: ${remaining.length}`);
    window.dispatchEvent(
      new CustomEvent('pwa_sync_completed', {
        detail: {
          syncedCount,
          remainingCount: remaining.length,
          timestamp: new Date().toLocaleTimeString('vi-VN')
        }
      })
    );
  }
}

export const pwaSyncService = new PwaSyncService();
export default pwaSyncService;
