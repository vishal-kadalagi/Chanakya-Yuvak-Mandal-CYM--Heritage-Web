import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import {
  UploadCloud,
  LogOut,
  ExternalLink,
  Film,
  Sparkles,
  Camera,
  Layers,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  Plus,
  X,
  AlertCircle,
  Search,
  Users,
  Calendar,
  Award,
  Megaphone,
  CheckCircle2,
  Save,
  Activity,
  Youtube,
  Radio,
  Crop,
  Lock,
  ChevronDown,
  Globe,
  ArrowUp,
  ArrowDown,
  Trophy,
  Sliders,
  MapPin,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { PhotoCropAdjustModal } from '../components/admin/PhotoCropAdjustModal';
import { AdminPinLockModal } from '../components/admin/AdminPinLockModal';
import { extractYoutubeVideoId, getYoutubeEmbedUrl } from '../utils/youtubeUtils';
import { useAuth, AUTHORIZED_ADMIN_EMAILS, MASTER_ADMIN_CREDENTIALS } from '../context/AuthContext';
import { uploadToCloudinary, MAX_CLOUDINARY_BYTES } from '../lib/firebase';
import { compressVideoInBrowser } from '../utils/videoCompressor';
import { SystemHealthMonitor } from '../components/admin/SystemHealthMonitor';
import {
  subscribeToAllMedia,
  addMediaItem,
  updateMediaItem,
  deleteMediaItem,
  toggleMediaActive,
} from '../services/mediaService';
import { MediaItem, MediaPlacement, MediaCategory } from '../types/media';
import {
  subscribeToCommittee,
  addCommitteeMember,
  updateCommitteeMember,
  deleteCommitteeMember,
  CommitteeMemberDoc,
  sortCommitteeMembers,
} from '../services/committeeService';
import {
  subscribeToHistory,
  addHistoryMilestone,
  updateHistoryMilestone,
  deleteHistoryMilestone,
  HistoryMilestoneDoc,
} from '../services/historyService';
import {
  subscribeToAchievements,
  addAchievement,
  updateAchievement,
  deleteAchievement,
  AchievementDoc,
} from '../services/achievementsService';
import {
  subscribeToSiteSettings,
  updateSiteSettings,
  SiteSettings,
} from '../services/siteService';
import {
  subscribeToEvents,
  addEvent,
  updateEvent,
  deleteEvent,
  CommunityEventDoc,
  EventCategory,
} from '../services/eventsService';

export interface PresetRole {
  id: string;
  labelKn: string;
  labelEn: string;
  category: 'office' | 'core' | 'youth' | 'advisory';
}

export const PRESET_COMMITTEE_ROLES: PresetRole[] = [
  { id: 'president', labelKn: 'ಅಧ್ಯಕ್ಷರು', labelEn: 'President', category: 'office' },
  { id: 'vice_president', labelKn: 'ಉಪಾಧ್ಯಕ್ಷರು', labelEn: 'Vice-President', category: 'office' },
  { id: 'treasurer', labelKn: 'ಖಜಾಂಚಿ', labelEn: 'Treasurer', category: 'office' },
  { id: 'advisor', labelKn: 'ಗೌರವ ಸಲಹೆಗಾರರು', labelEn: 'Advisor', category: 'advisory' },
  { id: 'secretary', labelKn: 'ಕಾರ್ಯದರ್ಶಿ', labelEn: 'Secretary', category: 'office' },
  { id: 'gen_secretary', labelKn: 'ಪ್ರಧಾನ ಕಾರ್ಯದರ್ಶಿ', labelEn: 'General Secretary', category: 'office' },
  { id: 'joint_secretary', labelKn: 'ಸಹ ಕಾರ್ಯದರ್ಶಿ', labelEn: 'Joint Secretary', category: 'office' },
  { id: 'joint_treasurer', labelKn: 'ಸಹ ಖಜಾಂಚಿ', labelEn: 'Joint Treasurer', category: 'office' },
  { id: 'hon_president', labelKn: 'ಗೌರವ ಅಧ್ಯಕ್ಷರು', labelEn: 'Honorary President', category: 'office' },
  { id: 'chief_advisor', labelKn: 'ಮುಖ್ಯ ಸಲಹೆಗಾರರು', labelEn: 'Chief Advisor', category: 'advisory' },
  { id: 'organizing_secretary', labelKn: 'ಸಂಘಟನಾ ಕಾರ್ಯದರ್ಶಿ', labelEn: 'Organizing Secretary', category: 'office' },
  { id: 'committee_member', labelKn: 'ಕಮಿಟಿ ಸದಸ್ಯರು', labelEn: 'Committee Member', category: 'core' },
  { id: 'youth_wing_lead', labelKn: 'ಯುವ ಘಟಕ ಸಂಚಾಲಕರು', labelEn: 'Youth Wing Coordinator', category: 'youth' },
  { id: 'cultural_lead', labelKn: 'ಸಾಂಸ್ಕೃತಿಕ ಪ್ರಮುಖರು', labelEn: 'Cultural Coordinator', category: 'core' },
  { id: 'puja_lead', labelKn: 'ಪೂಜಾ ಸಮಿತಿ ಪ್ರಮುಖರು', labelEn: 'Pooja Lead', category: 'core' },
  { id: 'media_lead', labelKn: 'ಮಾಧ್ಯಮ ಮತ್ತು ಪ್ರಚಾರ ಪ್ರಮುಖರು', labelEn: 'Media & PR Lead', category: 'core' },
  { id: 'seva_lead', labelKn: 'ಅನ್ನಸಂತರ್ಪಣೆ ಸೇವಾ ಪ್ರಮುಖರು', labelEn: 'Annasantarpane Seva Lead', category: 'core' },
  { id: 'custom', labelKn: 'ಇತರೆ (Custom)', labelEn: 'Custom / Other', category: 'core' },
];

export interface PlacementOption {
  id: MediaPlacement;
  labelKn: string;
  labelEn: string;
  icon: string;
  badge: string;
}

export const PLACEMENT_OPTIONS: PlacementOption[] = [
  { id: 'hero', labelKn: 'ಮುಖ್ಯ ಹೀರೋ ವಿಭಾಗ', labelEn: 'Hero Top Banner', icon: '🌟', badge: 'HERO' },
  { id: 'carousel', labelKn: '35mm ಫಿಲ್ಮ್ ರೀಲ್', labelEn: '35mm Film Reel', icon: '🎞️', badge: '35MM' },
  { id: 'gallery', labelKn: 'ದರ್ಶನ ಗ್ಯಾಲರಿ', labelEn: 'Darshan Gallery', icon: '🖼️', badge: 'GALLERY' },
  { id: 'history', labelKn: 'ಹಬ್ಬದ ಇತಿಹಾಸ ಪುಟ', labelEn: 'Festival History', icon: '📜', badge: 'HISTORY' },
  { id: 'seva', labelKn: 'ಸೇವೆ & ಸಾಧನೆಗಳು', labelEn: 'Seva & Impact', icon: '🙏', badge: 'SEVA' },
];

type AdminTab = 'media' | 'hero_order' | 'events' | 'committee' | 'history' | 'achievements' | 'site' | 'health';

export const AdminDashboardPage: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active Tab
  const initialTab = (searchParams.get('tab') as AdminTab) || 'media';
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);

  const handleTabChange = (tab: AdminTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Auth Guard: Device Remembered or Active Session
  useEffect(() => {
    const isDeviceRemembered =
      localStorage.getItem('cym_device_authenticated') === 'true' ||
      sessionStorage.getItem('cym_admin_session') === 'true';

    if (!currentUser && !isDeviceRemembered) {
      navigate('/admin/login');
      return;
    }
    const userEmail = currentUser?.email?.toLowerCase();
    if (userEmail && !AUTHORIZED_ADMIN_EMAILS.includes(userEmail)) {
      logout();
      navigate('/admin/login');
    }
  }, [currentUser, navigate, logout]);

  // ================= CONTROLLED PIN LOCK SYSTEM =================
  // Require PIN on initial entry, or after prolonged absence, or upon manual lock.
  // NEVER lock when opening the file picker to upload photos/videos!
  const [isPinLocked, setIsPinLocked] = useState<boolean>(() => {
    return sessionStorage.getItem('cym_pin_unlocked') !== 'true';
  });

  // Track native file picker window to prevent blur locking during media selection
  const isFilePickerActiveRef = React.useRef<boolean>(false);

  const handleUnlock = () => {
    setIsPinLocked(false);
    sessionStorage.setItem('cym_pin_unlocked', 'true');
    sessionStorage.setItem('cym_last_activity', String(Date.now()));
  };

  const handleLockPortal = () => {
    setIsPinLocked(true);
    sessionStorage.removeItem('cym_pin_unlocked');
  };

  // 1. Monitor file inputs so OS file-picker window NEVER triggers a lock
  useEffect(() => {
    const handleFileInputClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'file' ||
         target.closest('input[type="file"]') ||
         target.closest('label[class*="cursor-pointer"]'))
      ) {
        isFilePickerActiveRef.current = true;
      }
    };

    const handleWindowFocus = () => {
      // Regained focus after selecting a file; allow 1.5s grace period before resetting
      setTimeout(() => {
        isFilePickerActiveRef.current = false;
      }, 1500);
    };

    document.addEventListener('click', handleFileInputClick, true);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      document.removeEventListener('click', handleFileInputClick, true);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, []);

  // 2. Controlled Background Lock: ONLY lock if user has left the tab for more than 5 minutes
  useEffect(() => {
    let awayTimer: ReturnType<typeof setTimeout> | null = null;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // If the file picker dialog is currently open in Windows, do NOT lock!
        if (isFilePickerActiveRef.current) return;

        // User switched tabs or minimized: give a 5-minute grace window before locking
        awayTimer = setTimeout(() => {
          setIsPinLocked(true);
          sessionStorage.removeItem('cym_pin_unlocked');
        }, 5 * 60 * 1000);
      } else {
        // Returned within 5 minutes: cancel the lock timer!
        if (awayTimer) {
          clearTimeout(awayTimer);
          awayTimer = null;
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (awayTimer) clearTimeout(awayTimer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // 3. Inactivity Auto-Lock (15 mins of zero activity) & Auto-Logout (45 mins)
  useEffect(() => {
    const INACTIVITY_LOCK_MS = 15 * 60 * 1000; // 15 mins of complete inactivity -> Lock PIN
    const INACTIVITY_LOGOUT_MS = 45 * 60 * 1000; // 45 mins -> Full Logout

    let lockTimer: ReturnType<typeof setTimeout>;
    let logoutTimer: ReturnType<typeof setTimeout>;

    const resetTimers = () => {
      // If the file picker is active, don't count as inactive
      if (isFilePickerActiveRef.current) return;

      sessionStorage.setItem('cym_last_activity', String(Date.now()));

      clearTimeout(lockTimer);
      clearTimeout(logoutTimer);

      lockTimer = setTimeout(() => {
        setIsPinLocked(true);
        sessionStorage.removeItem('cym_pin_unlocked');
      }, INACTIVITY_LOCK_MS);

      logoutTimer = setTimeout(() => {
        logout();
        navigate('/admin/login');
      }, INACTIVITY_LOGOUT_MS);
    };

    const activityEvents = ['mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    activityEvents.forEach((ev) => {
      window.addEventListener(ev, resetTimers, { passive: true });
    });

    resetTimers();

    return () => {
      clearTimeout(lockTimer);
      clearTimeout(logoutTimer);
      activityEvents.forEach((ev) => {
        window.removeEventListener(ev, resetTimers);
      });
    };
  }, [logout, navigate]);

  // ================= 1. MEDIA STATE =================
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [mediaLoading, setMediaLoading] = useState(true);
  const [filterPlacement, setFilterPlacement] = useState<string>('all');
  const [filterYear, setFilterYear] = useState<string>('all');
  const [filterMediaCategory, setFilterMediaCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Media Modals & Multi-Photo/Video Batch Upload
  const [isMediaUploadOpen, setIsMediaUploadOpen] = useState(false);
  const [batchMediaFiles, setBatchMediaFiles] = useState<{
    id: string;
    file: File;
    previewUrl: string;
    mediaType: 'image' | 'video';
    sizeText: string;
    name: string;
    isOverLimit?: boolean;
  }[]>([]);
  const [batchUploadStatus, setBatchUploadStatus] = useState<{
    current: number;
    total: number;
    currentFileName: string;
    overallPercent: number;
    itemPercent: number;
  } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Upload Mode: Local File vs YouTube Link
  const [mediaUploadTab, setMediaUploadTab] = useState<'file' | 'youtube'>('file');
  const [youtubeMediaUrl, setYoutubeMediaUrl] = useState('');
  const [compressingBatchId, setCompressingBatchId] = useState<string | null>(null);
  const [compressingBatchProgress, setCompressingBatchProgress] = useState(0);

  const handleCompressBatchItem = async (id: string) => {
    const target = batchMediaFiles.find((f) => f.id === id);
    if (!target || target.mediaType !== 'video') return;

    setCompressingBatchId(id);
    setCompressingBatchProgress(0);
    try {
      const compressed = await compressVideoInBrowser(target.file, {
        onProgress: (p) => setCompressingBatchProgress(p),
      });
      const newSizeMB = (compressed.size / (1024 * 1024)).toFixed(1);
      setBatchMediaFiles((prev) =>
        prev.map((f) => {
          if (f.id !== id) return f;
          if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
          return {
            ...f,
            file: compressed,
            previewUrl: URL.createObjectURL(compressed),
            sizeText: `${newSizeMB} MB (Compressed)`,
            isOverLimit: compressed.size > MAX_CLOUDINARY_BYTES,
          };
        })
      );
    } catch (err) {
      alert(
        language === 'kn'
          ? 'ವೀಡಿಯೊ ಕುಗ್ಗಿಸುವಲ್ಲಿ ದೋಷ: ' + (err as Error).message
          : 'Failed to compress video: ' + (err as Error).message
      );
    } finally {
      setCompressingBatchId(null);
      setCompressingBatchProgress(0);
    }
  };

  const handleBatchFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newItems: {
      id: string;
      file: File;
      previewUrl: string;
      mediaType: 'image' | 'video';
      sizeText: string;
      name: string;
      isOverLimit?: boolean;
    }[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isVideo = file.type.startsWith('video/');
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      const isOverLimit = file.size > MAX_CLOUDINARY_BYTES;
      newItems.push({
        id: `${Date.now()}-${i}-${Math.random().toString(36).substring(2, 7)}`,
        file,
        previewUrl: URL.createObjectURL(file),
        mediaType: isVideo ? 'video' : 'image',
        sizeText: `${sizeMB} MB`,
        name: file.name,
        isOverLimit,
      });
    }
    setBatchMediaFiles((prev) => [...prev, ...newItems]);
    setUploadError(null);
  };

  const handleRemoveBatchFile = (id: string) => {
    setBatchMediaFiles((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  const handleClearAllBatchFiles = () => {
    batchMediaFiles.forEach((item) => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    });
    setBatchMediaFiles([]);
    setUploadError(null);
  };

  // Form Fields
  const [formTitleKn, setFormTitleKn] = useState('');
  const [formTitleEn, setFormTitleEn] = useState('');
  const [formPlacements, setFormPlacements] = useState<MediaPlacement[]>(['gallery', 'carousel']);
  const [formCategory, setFormCategory] = useState<MediaCategory>('darshan');
  const [formYear, setFormYear] = useState<number>(2026);
  const [formIsActive, setFormIsActive] = useState<boolean>(true);

  // Media Edit / Delete
  const [editingMedia, setEditingMedia] = useState<MediaItem | null>(null);
  const [deletingMediaId, setDeletingMediaId] = useState<string | null>(null);

  // ================= 2. COMMITTEE STATE =================
  const [committeeMembers, setCommitteeMembers] = useState<CommitteeMemberDoc[]>([]);
  const [committeeLoading, setCommitteeLoading] = useState(true);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<CommitteeMemberDoc | null>(null);
  const [deletingMemberId, setDeletingMemberId] = useState<string | null>(null);

  const [memberNameKn, setMemberNameKn] = useState('');
  const [memberNameEn, setMemberNameEn] = useState('');
  const [memberRoleKn, setMemberRoleKn] = useState('');
  const [memberRoleEn, setMemberRoleEn] = useState('');
  const [selectedRolePreset, setSelectedRolePreset] = useState<string>('committee_member');
  const [memberCategory, setMemberCategory] = useState<'office' | 'core' | 'youth' | 'advisory'>('core');

  const handleRolePresetChange = (presetId: string) => {
    setSelectedRolePreset(presetId);
    const found = PRESET_COMMITTEE_ROLES.find((r) => r.id === presetId);
    if (found && found.id !== 'custom') {
      setMemberRoleKn(found.labelKn);
      setMemberRoleEn(found.labelEn);
      setMemberCategory(found.category);

      // Strictly assign canonical role priority rank
      if (presetId === 'president' || presetId === 'hon_president') {
        setMemberOrder(1);
      } else if (presetId === 'vice_president') {
        setMemberOrder(2);
      } else if (presetId === 'treasurer' || presetId === 'joint_treasurer') {
        setMemberOrder(3);
      } else if (presetId === 'advisor' || presetId === 'chief_advisor') {
        setMemberOrder(4);
      } else if (presetId === 'secretary' || presetId === 'gen_secretary' || presetId === 'joint_secretary' || presetId === 'organizing_secretary') {
        setMemberOrder(5);
      } else if (presetId === 'committee_member') {
        setMemberOrder(6);
      } else {
        setMemberOrder(7);
      }
    }
  };
  const [memberPeriodKn, setMemberPeriodKn] = useState('ಸ್ಥಾಪಕ ಸದಸ್ಯರು (2019 ರಿಂದ ನಿರಂತರ)');
  const [memberPeriodEn, setMemberPeriodEn] = useState('Founding Member (2019 – Present)');
  const [memberIsFounding, setMemberIsFounding] = useState(true);
  const [memberOrder, setMemberOrder] = useState<number>(1);
  const [memberPhotoUrl, setMemberPhotoUrl] = useState('');
  const [memberPhotoFile, setMemberPhotoFile] = useState<File | null>(null);
  const [memberPhotoPreview, setMemberPhotoPreview] = useState<string | null>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [rawCropImageSrc, setRawCropImageSrc] = useState<string | null>(null);
  const [memberSaving, setMemberSaving] = useState(false);
  const [memberUploadProgress, setMemberUploadProgress] = useState<number | null>(null);
  const [memberError, setMemberError] = useState<string | null>(null);

  // ================= 3. HISTORY STATE =================
  const [historyItems, setHistoryItems] = useState<HistoryMilestoneDoc[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [editingHistory, setEditingHistory] = useState<HistoryMilestoneDoc | null>(null);
  const [deletingHistoryId, setDeletingHistoryId] = useState<string | null>(null);

  const [historyYear, setHistoryYear] = useState<number>(2026);
  const [historyTitleKn, setHistoryTitleKn] = useState('');
  const [historyTitleEn, setHistoryTitleEn] = useState('');
  const [historySamvatsaraKn, setHistorySamvatsaraKn] = useState('');
  const [historySamvatsaraEn, setHistorySamvatsaraEn] = useState('');
  const [historyThemeKn, setHistoryThemeKn] = useState('');
  const [historyThemeEn, setHistoryThemeEn] = useState('');
  const [historySummaryKn, setHistorySummaryKn] = useState('');
  const [historySummaryEn, setHistorySummaryEn] = useState('');
  const [historyHighlightsKnText, setHistoryHighlightsKnText] = useState('');
  const [historyHighlightsEnText, setHistoryHighlightsEnText] = useState('');
  const [historyCoverUrl, setHistoryCoverUrl] = useState('');
  const [historyCoverFile, setHistoryCoverFile] = useState<File | null>(null);
  const [historyCoverPreview, setHistoryCoverPreview] = useState<string | null>(null);
  const [historyMediaType, setHistoryMediaType] = useState<'image' | 'video'>('image');
  const [historyShowInHero, setHistoryShowInHero] = useState<boolean>(false);
  const [historyShowIn35mm, setHistoryShowIn35mm] = useState<boolean>(true);
  const [historyShowInGallery, setHistoryShowInGallery] = useState<boolean>(true);
  const [historySaving, setHistorySaving] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [historyYearFilter, setHistoryYearFilter] = useState<number | 'all'>('all');

  // ================= 4. ACHIEVEMENTS STATE =================
  const [achievements, setAchievements] = useState<AchievementDoc[]>([]);
  const [achievementsLoading, setAchievementsLoading] = useState(true);
  const [isAchievementModalOpen, setIsAchievementModalOpen] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<AchievementDoc | null>(null);
  const [deletingAchievementId, setDeletingAchievementId] = useState<string | null>(null);

  const [achTitleKn, setAchTitleKn] = useState('');
  const [achTitleEn, setAchTitleEn] = useState('');
  const [achCategory, setAchCategory] = useState<'feast' | 'pooja' | 'miravanige' | 'other' | string>('feast');
  const [achYear, setAchYear] = useState<number>(2026);
  const [achYearKn, setAchYearKn] = useState('');
  const [achYearEn, setAchYearEn] = useState('');
  const [achMetricKn, setAchMetricKn] = useState('');
  const [achMetricEn, setAchMetricEn] = useState('');
  const [achDescKn, setAchDescKn] = useState('');
  const [achDescEn, setAchDescEn] = useState('');
  const [achHighlightsKnText, setAchHighlightsKnText] = useState('');
  const [achHighlightsEnText, setAchHighlightsEnText] = useState('');
  const [achImageUrl, setAchImageUrl] = useState('');
  const [achMediaUrl, setAchMediaUrl] = useState('');
  const [achMediaType, setAchMediaType] = useState<'image' | 'video'>('image');
  const [achSponsorKn, setAchSponsorKn] = useState('');
  const [achSponsorEn, setAchSponsorEn] = useState('');
  const [achEventDate, setAchEventDate] = useState('');
  const [achShowInHero, setAchShowInHero] = useState<boolean>(false);
  const [achShowIn35mm, setAchShowIn35mm] = useState<boolean>(false);
  const [achShowInGallery, setAchShowInGallery] = useState<boolean>(true);
  const [achAlsoAddToGallery, setAchAlsoAddToGallery] = useState(false);
  const [achExistingMedia, setAchExistingMedia] = useState<{ url: string; type: 'image' | 'video'; showInHero?: boolean }[]>([]);
  interface BatchFileItem {
    id: string;
    file: File;
    previewUrl: string;
    mediaType: 'image' | 'video';
    sizeText: string;
    name: string;
    showInHero?: boolean;
    isOverLimit?: boolean;
  }
  const [achBatchFiles, setAchBatchFiles] = useState<BatchFileItem[]>([]);
  const [achBatchUploadStatus, setAchBatchUploadStatus] = useState<{
    current: number;
    total: number;
  } | null>(null);
  const [achOrder, setAchOrder] = useState<number>(1);
  const [achSaving, setAchSaving] = useState(false);
  const [achError, setAchError] = useState<string | null>(null);
  const [compressingAchId, setCompressingAchId] = useState<string | null>(null);
  const [compressingAchProgress, setCompressingAchProgress] = useState(0);

  const handleCompressAchItem = async (id: string) => {
    const target = achBatchFiles.find((f) => f.id === id);
    if (!target || target.mediaType !== 'video') return;

    setCompressingAchId(id);
    setCompressingAchProgress(0);
    try {
      const compressed = await compressVideoInBrowser(target.file, {
        onProgress: (p) => setCompressingAchProgress(p),
      });
      const newSizeMB = (compressed.size / (1024 * 1024)).toFixed(1);
      setAchBatchFiles((prev) =>
        prev.map((f) => {
          if (f.id !== id) return f;
          if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
          return {
            ...f,
            file: compressed,
            previewUrl: URL.createObjectURL(compressed),
            sizeText: `${newSizeMB} MB (Compressed)`,
            isOverLimit: compressed.size > MAX_CLOUDINARY_BYTES,
          };
        })
      );
    } catch (err) {
      alert(
        language === 'kn'
          ? 'ವೀಡಿಯೊ ಕುಗ್ಗಿಸುವಲ್ಲಿ ದೋಷ: ' + (err as Error).message
          : 'Failed to compress video: ' + (err as Error).message
      );
    } finally {
      setCompressingAchId(null);
      setCompressingAchProgress(0);
    }
  };

  const handleAchBatchFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newItems: {
      id: string;
      file: File;
      previewUrl: string;
      mediaType: 'image' | 'video';
      sizeText: string;
      name: string;
      showInHero?: boolean;
      isOverLimit?: boolean;
    }[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isVideo = file.type.startsWith('video/');
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      const isOverLimit = file.size > MAX_CLOUDINARY_BYTES;
      newItems.push({
        id: `${Date.now()}-${i}-${Math.random().toString(36).substring(2, 7)}`,
        file,
        previewUrl: URL.createObjectURL(file),
        mediaType: isVideo ? 'video' : 'image',
        sizeText: `${sizeMB} MB`,
        name: file.name,
        showInHero: achShowInHero,
        isOverLimit,
      });
    }
    setAchBatchFiles((prev) => [...prev, ...newItems]);
    setAchError(null);
  };

  const handleRemoveAchBatchFile = (id: string) => {
    setAchBatchFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleRemoveAchExistingMedia = (index: number) => {
    setAchExistingMedia((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleToggleAchExistingHero = (index: number) => {
    setAchExistingMedia((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, showInHero: !item.showInHero } : item
      )
    );
  };

  const handleToggleAchBatchHero = (id: string) => {
    setAchBatchFiles((prev) =>
      prev.map((b) => (b.id === id ? { ...b, showInHero: !b.showInHero } : b))
    );
  };

  // ================= 5. SITE SETTINGS =================
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    announcementActive: false,
    announcementKn: '',
    announcementEn: '',
    announcementLink: '',
    liveStreamActive: false,
    liveStreamYoutubeUrl: '',
    liveStreamTitleKn: 'ಶ್ರೀ ಗಣೇಶ ಮಹೋತ್ಸವ | ಮಹಾಮಂಗಳಾರತಿ ನೇರ ಪ್ರಸಾರ',
    liveStreamTitleEn: 'Shri Ganesh Mahotsav | Live Darshan Streaming',
    liveStreamDescriptionKn: 'ಕಡಲಗಿ ಖೂಟ, ಯಮಕನಮರಡಿ • ನಿತ್ಯ ದರ್ಶನ ಹಾಗೂ ಮಹಾಮಂಗಳಾರತಿ ನೇರ ವೀಕ್ಷಣೆ',
    liveStreamDescriptionEn: 'Kadalagi Khoot, Yamakanmardi • Daily Darshan & Mahamangalaarti Live Broadcast',
  });
  const [siteSettingsSaved, setSiteSettingsSaved] = useState(false);
  const [siteSettingsSaving, setSiteSettingsSaving] = useState(false);

  // ================= 7. COMMUNITY & EXTRA-CURRICULAR EVENTS STATE =================
  const [events, setEvents] = useState<CommunityEventDoc[]>([]);

  // ================= 6. HERO SLIDE PRIORITY & ORDERING STATE =================
  const [isSavingHeroOrder, setIsSavingHeroOrder] = useState(false);
  const [heroOrderSuccessId, setHeroOrderSuccessId] = useState<string | null>(null);

  interface HeroSlideItem {
    id: string;
    source: 'media' | 'history' | 'achievement' | 'event';
    rawItem: MediaItem | HistoryMilestoneDoc | AchievementDoc | CommunityEventDoc;
    titleKn: string;
    titleEn: string;
    mediaUrl: string;
    mediaType: 'image' | 'video';
    order: number;
    isActive: boolean;
    year?: number;
    extraInfo?: string;
  }

  const heroSlideItems = useMemo<HeroSlideItem[]>(() => {
    const list: HeroSlideItem[] = [];

    // From Media items
    mediaItems.forEach((m) => {
      const isHero =
        m.placement === 'hero' ||
        (Array.isArray(m.placements) && m.placements.includes('hero'));
      if (isHero) {
        list.push({
          id: m.id,
          source: 'media',
          rawItem: m,
          titleKn: m.titleKn,
          titleEn: m.titleEn,
          mediaUrl: m.mediaUrl,
          mediaType: m.mediaType,
          order: m.order ?? 999,
          isActive: m.isActive,
          year: m.year,
          extraInfo: 'Media Library',
        });
      }
    });

    // From History items
    historyItems.forEach((h) => {
      if (h.showInHero) {
        list.push({
          id: h.id,
          source: 'history',
          rawItem: h,
          titleKn: h.titleKn,
          titleEn: h.titleEn,
          mediaUrl: h.coverImage || '',
          mediaType: h.mediaType || 'image',
          order: h.order ?? 999,
          isActive: h.isActive ?? true,
          year: h.year,
          extraInfo: h.pandalThemeEn || h.pandalThemeKn || 'Festival History',
        });
      }
    });

    // From Seva items
    achievements.forEach((a) => {
      if (a.galleryMedia && a.galleryMedia.length > 0) {
        let taggedCount = 0;
        a.galleryMedia.forEach((m, mIdx) => {
          if (m.showInHero) {
            taggedCount++;
            list.push({
              id: `${a.id}-${mIdx}`,
              source: 'achievement',
              rawItem: a,
              titleKn: a.titleKn,
              titleEn: a.titleEn,
              mediaUrl: m.url,
              mediaType: m.type,
              order: a.order ?? 999,
              isActive: a.isActive ?? true,
              year: a.year,
              extraInfo: a.sponsorNameEn || a.sponsorNameKn || 'Seva Initiative',
            });
          }
        });
        if (taggedCount === 0 && a.showInHero) {
          list.push({
            id: `${a.id}-0`,
            source: 'achievement',
            rawItem: a,
            titleKn: a.titleKn,
            titleEn: a.titleEn,
            mediaUrl: a.galleryMedia[0].url,
            mediaType: a.galleryMedia[0].type,
            order: a.order ?? 999,
            isActive: a.isActive ?? true,
            year: a.year,
            extraInfo: a.sponsorNameEn || a.sponsorNameKn || 'Seva Initiative',
          });
        }
      } else if (a.showInHero && (a.mediaUrl || a.imageUrl)) {
        list.push({
          id: a.id,
          source: 'achievement',
          rawItem: a,
          titleKn: a.titleKn,
          titleEn: a.titleEn,
          mediaUrl: a.mediaUrl || a.imageUrl || '',
          mediaType: a.mediaType || 'image',
          order: a.order ?? 999,
          isActive: a.isActive ?? true,
          year: a.year,
          extraInfo: a.sponsorNameEn || a.sponsorNameKn || 'Seva Initiative',
        });
      }
    });

    // From Community Events
    events.forEach((ev) => {
      if (ev.galleryMedia && ev.galleryMedia.length > 0) {
        let taggedCount = 0;
        ev.galleryMedia.forEach((m, mIdx) => {
          if (m.showInHero) {
            taggedCount++;
            list.push({
              id: `${ev.id}-${mIdx}`,
              source: 'event',
              rawItem: ev,
              titleKn: ev.titleKn,
              titleEn: ev.titleEn,
              mediaUrl: m.url,
              mediaType: m.type,
              order: ev.order ?? 999,
              isActive: ev.isActive ?? true,
              year: ev.year,
              extraInfo: ev.locationEn || ev.locationKn || 'Community Event',
            });
          }
        });
        if (taggedCount === 0 && ev.showInHero) {
          list.push({
            id: `${ev.id}-0`,
            source: 'event',
            rawItem: ev,
            titleKn: ev.titleKn,
            titleEn: ev.titleEn,
            mediaUrl: ev.galleryMedia[0].url,
            mediaType: ev.galleryMedia[0].type,
            order: ev.order ?? 999,
            isActive: ev.isActive ?? true,
            year: ev.year,
            extraInfo: ev.locationEn || ev.locationKn || 'Community Event',
          });
        }
      } else if (ev.showInHero && ev.mediaUrl) {
        list.push({
          id: ev.id,
          source: 'event',
          rawItem: ev,
          titleKn: ev.titleKn,
          titleEn: ev.titleEn,
          mediaUrl: ev.mediaUrl,
          mediaType: ev.mediaType || 'image',
          order: ev.order ?? 999,
          isActive: ev.isActive ?? true,
          year: ev.year,
          extraInfo: ev.locationEn || ev.locationKn || 'Community Event',
        });
      }
    });

    return list.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
  }, [mediaItems, historyItems, achievements, events]);

  /**
   * Reorder Hero slide: Moves item from fromIndex to targetRank (1-based),
   * shifting existing items down/up and normalizing all orders sequentially (1, 2, 3...)
   */
  const handleReorderHeroSlide = async (fromIndex: number, targetRank: number) => {
    if (fromIndex < 0 || fromIndex >= heroSlideItems.length) return;
    const clampedRank = Math.max(1, Math.min(heroSlideItems.length, targetRank));
    const toIndex = clampedRank - 1;

    // Shift items in array
    const updated = [...heroSlideItems];
    const [movedItem] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, movedItem);

    setIsSavingHeroOrder(true);
    // Save continuous sequential order (1, 2, 3...) for all affected items
    try {
      const promises: Promise<any>[] = [];
      const seenDocKeys = new Set<string>();

      for (let i = 0; i < updated.length; i++) {
        const item = updated[i];
        const newOrder = i + 1;
        const docId = item.rawItem.id;
        const key = `${item.source}-${docId}`;

        if (!seenDocKeys.has(key)) {
          seenDocKeys.add(key);
          if (item.source === 'media') {
            promises.push(updateMediaItem(docId, { order: newOrder }));
          } else if (item.source === 'history') {
            promises.push(updateHistoryMilestone(docId, { order: newOrder }));
          } else if (item.source === 'achievement') {
            promises.push(updateAchievement(docId, { order: newOrder }));
          } else if (item.source === 'event') {
            promises.push(updateEvent(docId, { order: newOrder }));
          }
        }
      }
      await Promise.all(promises);
      setHeroOrderSuccessId(movedItem.id);
      setTimeout(() => setHeroOrderSuccessId(null), 2500);
    } catch (err) {
      console.error('Failed to reorder hero slides:', err);
    } finally {
      setIsSavingHeroOrder(false);
    }
  };

  const handleMoveSlideUp = async (index: number) => {
    if (index <= 0) return;
    await handleReorderHeroSlide(index, index);
  };

  const handleMoveSlideDown = async (index: number) => {
    if (index >= heroSlideItems.length - 1) return;
    await handleReorderHeroSlide(index, index + 2);
  };

  const handleRenumberAllHeroSlides = async () => {
    setIsSavingHeroOrder(true);
    try {
      const promises: Promise<any>[] = [];
      const seenDocKeys = new Set<string>();
      for (let i = 0; i < heroSlideItems.length; i++) {
        const item = heroSlideItems[i];
        const newOrder = i + 1;
        const docId = item.rawItem.id;
        const key = `${item.source}-${docId}`;
        if (!seenDocKeys.has(key)) {
          seenDocKeys.add(key);
          if (item.source === 'media') {
            promises.push(updateMediaItem(docId, { order: newOrder }));
          } else if (item.source === 'history') {
            promises.push(updateHistoryMilestone(docId, { order: newOrder }));
          } else if (item.source === 'achievement') {
            promises.push(updateAchievement(docId, { order: newOrder }));
          } else if (item.source === 'event') {
            promises.push(updateEvent(docId, { order: newOrder }));
          }
        }
      }
      await Promise.all(promises);
    } catch (err) {
      console.error('Failed to renumber slides:', err);
    } finally {
      setIsSavingHeroOrder(false);
    }
  };

  /**
   * Committee Members priority sorting & reordering
   */
  const sortedCommitteeMembers = useMemo(() => {
    return sortCommitteeMembers(committeeMembers);
  }, [committeeMembers]);

  const handleReorderCommitteeMember = async (fromIndex: number, targetRank: number) => {
    if (fromIndex < 0 || fromIndex >= sortedCommitteeMembers.length) return;
    const clampedRank = Math.max(1, Math.min(sortedCommitteeMembers.length, targetRank));
    const toIndex = clampedRank - 1;

    const updated = [...sortedCommitteeMembers];
    const [movedMember] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, movedMember);

    try {
      const promises: Promise<any>[] = [];
      for (let i = 0; i < updated.length; i++) {
        const member = updated[i];
        const newOrder = i + 1;
        if (member.order !== newOrder) {
          promises.push(updateCommitteeMember(member.id, { order: newOrder }));
        }
      }
      await Promise.all(promises);
    } catch (err) {
      console.error('Failed to reorder committee members:', err);
    }
  };

  const handleMoveMemberUp = async (index: number) => {
    if (index <= 0) return;
    await handleReorderCommitteeMember(index, index);
  };

  const handleMoveMemberDown = async (index: number) => {
    if (index >= sortedCommitteeMembers.length - 1) return;
    await handleReorderCommitteeMember(index, index + 2);
  };

  /**
   * Seva & Impact priority sorting & reordering
   */
  const sortedAchievements = useMemo(() => {
    return [...achievements].sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
  }, [achievements]);

  const handleReorderAchievement = async (fromIndex: number, targetRank: number) => {
    if (fromIndex < 0 || fromIndex >= sortedAchievements.length) return;
    const clampedRank = Math.max(1, Math.min(sortedAchievements.length, targetRank));
    const toIndex = clampedRank - 1;

    const updated = [...sortedAchievements];
    const [movedItem] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, movedItem);

    try {
      const promises: Promise<any>[] = [];
      for (let i = 0; i < updated.length; i++) {
        const item = updated[i];
        const newOrder = i + 1;
        if (item.order !== newOrder) {
          promises.push(updateAchievement(item.id, { order: newOrder }));
        }
      }
      await Promise.all(promises);
    } catch (err) {
      console.error('Failed to reorder achievements:', err);
    }
  };

  const handleMoveAchievementUp = async (index: number) => {
    if (index <= 0) return;
    await handleReorderAchievement(index, index);
  };

  const handleMoveAchievementDown = async (index: number) => {
    if (index >= sortedAchievements.length - 1) return;
    await handleReorderAchievement(index, index + 2);
  };

  const handleRemoveFromHero = async (item: HeroSlideItem) => {
    try {
      if (item.source === 'media') {
        const media = item.rawItem as MediaItem;
        const newPlacements = (media.placements || []).filter((p) => p !== 'hero');
        const fallbackPlacement = newPlacements[0] || 'gallery';
        await updateMediaItem(media.id, {
          placement: fallbackPlacement,
          placements: newPlacements.length > 0 ? newPlacements : ['gallery'],
        });
      } else if (item.source === 'history') {
        await updateHistoryMilestone(item.id, { showInHero: false });
      } else if (item.source === 'achievement') {
        const rawAch = item.rawItem as AchievementDoc;
        if (rawAch.galleryMedia && rawAch.galleryMedia.length > 0) {
          const updated = rawAch.galleryMedia.map((m) =>
            m.url === item.mediaUrl ? { ...m, showInHero: false } : m
          );
          const stillHasHero = updated.some((m) => m.showInHero);
          await updateAchievement(rawAch.id, {
            galleryMedia: updated,
            showInHero: stillHasHero,
          });
        } else {
          await updateAchievement(rawAch.id, { showInHero: false });
        }
      } else if (item.source === 'event') {
        const rawEv = item.rawItem as CommunityEventDoc;
        if (rawEv.galleryMedia && rawEv.galleryMedia.length > 0) {
          const updated = rawEv.galleryMedia.map((m) =>
            m.url === item.mediaUrl ? { ...m, showInHero: false } : m
          );
          const stillHasHero = updated.some((m) => m.showInHero);
          await updateEvent(rawEv.id, {
            galleryMedia: updated,
            showInHero: stillHasHero,
          });
        } else {
          await updateEvent(rawEv.id, { showInHero: false });
        }
      }
    } catch (err) {
      console.error('Failed to remove from hero:', err);
    }
  };

  const handleAddMediaToHero = async (mediaId: string) => {
    const item = mediaItems.find((m) => m.id === mediaId);
    if (!item) return;
    const existingPlacements = item.placements || [item.placement || 'gallery'];
    const updatedPlacements = Array.from(new Set([...existingPlacements, 'hero'])) as MediaPlacement[];

    // Priority 1st: Newly added hero slide gets order: 1, shifting previous hero slides down
    setIsSavingHeroOrder(true);
    try {
      const promises: Promise<any>[] = [];
      const seenDocKeys = new Set<string>();
      heroSlideItems.forEach((s, idx) => {
        const shiftedOrder = idx + 2;
        const docId = s.rawItem.id;
        const key = `${s.source}-${docId}`;
        if (!seenDocKeys.has(key)) {
          seenDocKeys.add(key);
          if (s.source === 'media') {
            promises.push(updateMediaItem(docId, { order: shiftedOrder }));
          } else if (s.source === 'history') {
            promises.push(updateHistoryMilestone(docId, { order: shiftedOrder }));
          } else if (s.source === 'achievement') {
            promises.push(updateAchievement(docId, { order: shiftedOrder }));
          } else if (s.source === 'event') {
            promises.push(updateEvent(docId, { order: shiftedOrder }));
          }
        }
      });
      promises.push(
        updateMediaItem(mediaId, {
          placements: updatedPlacements,
          placement: 'hero',
          order: 1,
        })
      );
      await Promise.all(promises);
    } catch (err) {
      console.error('Failed to add media to hero:', err);
    } finally {
      setIsSavingHeroOrder(false);
    }
  };

  const [eventsLoading, setEventsLoading] = useState(true);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CommunityEventDoc | null>(null);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);

  const [eventTitleKn, setEventTitleKn] = useState('');
  const [eventTitleEn, setEventTitleEn] = useState('');
  const [eventCategory, setEventCategory] = useState<EventCategory>('sports');
  const [eventDate, setEventDate] = useState('');
  const [eventYear, setEventYear] = useState<number>(2026);
  const [eventLocationKn, setEventLocationKn] = useState('');
  const [eventLocationEn, setEventLocationEn] = useState('');
  const [eventDescKn, setEventDescKn] = useState('');
  const [eventDescEn, setEventDescEn] = useState('');
  const [eventHighlightsKnText, setEventHighlightsKnText] = useState('');
  const [eventHighlightsEnText, setEventHighlightsEnText] = useState('');
  const [eventChiefGuestsKn, setEventChiefGuestsKn] = useState('');
  const [eventChiefGuestsEn, setEventChiefGuestsEn] = useState('');
  const [eventMediaUrl, setEventMediaUrl] = useState('');
  const [eventMediaType, setEventMediaType] = useState<'image' | 'video'>('image');
  const [eventExistingMedia, setEventExistingMedia] = useState<{ url: string; type: 'image' | 'video'; showInHero?: boolean }[]>([]);
  const [eventBatchFiles, setEventBatchFiles] = useState<BatchFileItem[]>([]);
  const [eventBatchUploadStatus, setEventBatchUploadStatus] = useState<{ current: number; total: number } | null>(null);
  const [compressingEventId, setCompressingEventId] = useState<string | null>(null);
  const [eventDirectUrlInput, setEventDirectUrlInput] = useState('');
  const [eventOrder, setEventOrder] = useState<number>(1);
  const [eventIsActive, setEventIsActive] = useState<boolean>(true);
  const [eventShowInHero, setEventShowInHero] = useState<boolean>(false);
  const [eventShowIn35mm, setEventShowIn35mm] = useState<boolean>(false);
  const [eventShowInGallery, setEventShowInGallery] = useState<boolean>(true);
  const [eventSaving, setEventSaving] = useState(false);
  const [eventError, setEventError] = useState<string | null>(null);
  const [eventCategoryFilter, setEventCategoryFilter] = useState<string>('all');
  const [eventYearFilter, setEventYearFilter] = useState<number | 'all'>('all');
  const [eventSearchQuery, setEventSearchQuery] = useState('');

  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      const matchCat = eventCategoryFilter === 'all' || ev.category === eventCategoryFilter;
      const matchYear = eventYearFilter === 'all' || ev.year === eventYearFilter;
      const q = eventSearchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        ev.titleKn.toLowerCase().includes(q) ||
        ev.titleEn.toLowerCase().includes(q) ||
        (ev.locationKn && ev.locationKn.toLowerCase().includes(q)) ||
        (ev.locationEn && ev.locationEn.toLowerCase().includes(q));
      return matchCat && matchYear && matchSearch;
    });
  }, [events, eventCategoryFilter, eventYearFilter, eventSearchQuery]);

  const openEventAddModal = () => {
    setEditingEvent(null);
    setEventTitleKn('');
    setEventTitleEn('');
    setEventCategory('sports');
    setEventDate(new Date().toISOString().split('T')[0]);
    setEventYear(typeof eventYearFilter === 'number' ? eventYearFilter : 2026);
    setEventLocationKn('ಯಮಕನಮರಡಿ (Yamakanmardi)');
    setEventLocationEn('Yamakanmardi');
    setEventDescKn('');
    setEventDescEn('');
    setEventHighlightsKnText('');
    setEventHighlightsEnText('');
    setEventChiefGuestsKn('');
    setEventChiefGuestsEn('');
    setEventMediaUrl('');
    setEventMediaType('image');
    setEventExistingMedia([]);
    setEventBatchFiles([]);
    setEventBatchUploadStatus(null);
    setEventDirectUrlInput('');
    setEventOrder(events.length + 1);
    setEventIsActive(true);
    setEventShowInHero(false);
    setEventShowIn35mm(false);
    setEventShowInGallery(true);
    setEventError(null);
    setIsEventModalOpen(true);
  };

  const openEventEditModal = (ev: CommunityEventDoc) => {
    setEditingEvent(ev);
    setEventTitleKn(ev.titleKn || '');
    setEventTitleEn(ev.titleEn || '');
    setEventCategory(ev.category || 'sports');
    setEventDate(ev.eventDate || '');
    setEventYear(ev.year || 2026);
    setEventLocationKn(ev.locationKn || '');
    setEventLocationEn(ev.locationEn || '');
    setEventDescKn(ev.descriptionKn || '');
    setEventDescEn(ev.descriptionEn || '');
    setEventHighlightsKnText((ev.highlightsKn || []).join('\n'));
    setEventHighlightsEnText((ev.highlightsEn || []).join('\n'));
    setEventChiefGuestsKn(ev.chiefGuestsKn || '');
    setEventChiefGuestsEn(ev.chiefGuestsEn || '');
    setEventMediaUrl(ev.mediaUrl || '');
    setEventMediaType(ev.mediaType || 'image');

    // Populate all existing uploaded photos & videos for this event
    const existingList: { url: string; type: 'image' | 'video'; showInHero?: boolean }[] = [];
    if (ev.galleryMedia && ev.galleryMedia.length > 0) {
      existingList.push(
        ...ev.galleryMedia.map((m) => ({
          ...m,
          showInHero: m.showInHero ?? ev.showInHero ?? false,
        }))
      );
    } else if (ev.mediaUrl) {
      existingList.push({
        url: ev.mediaUrl,
        type: ev.mediaType || (ev.mediaUrl.match(/\.(mp4|webm|mov)$/i) || ev.mediaUrl.includes('/video/upload/') ? 'video' : 'image'),
        showInHero: ev.showInHero ?? false,
      });
    }
    setEventExistingMedia(existingList);
    setEventBatchFiles([]);
    setEventBatchUploadStatus(null);
    setEventDirectUrlInput('');

    setEventOrder(ev.order ?? 1);
    setEventIsActive(ev.isActive ?? true);
    setEventShowInHero(ev.showInHero ?? false);
    setEventShowIn35mm(ev.showIn35mm ?? false);
    setEventShowInGallery(ev.showInGallery ?? true);
    setEventError(null);
    setIsEventModalOpen(true);
  };

  const handleEventBatchFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newItems: BatchFileItem[] = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      // Only photos/media and video can be uploaded
      if (!f.type.startsWith('image/') && !f.type.startsWith('video/')) {
        continue;
      }
      const isVid = f.type.startsWith('video/');
      newItems.push({
        id: `evt-file-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 5)}`,
        file: f,
        previewUrl: URL.createObjectURL(f),
        mediaType: isVid ? 'video' : 'image',
        sizeText: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
        name: f.name,
        showInHero: eventShowInHero,
      });
    }
    setEventBatchFiles((prev) => [...prev, ...newItems]);
  };

  const handleRemoveEventExistingMedia = (index: number) => {
    setEventExistingMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const handleToggleEventExistingHero = (index: number) => {
    setEventExistingMedia((prev) =>
      prev.map((item, i) => (i === index ? { ...item, showInHero: !item.showInHero } : item))
    );
  };

  const handleRemoveEventBatchFile = (id: string) => {
    setEventBatchFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleToggleEventBatchHero = (id: string) => {
    setEventBatchFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, showInHero: !f.showInHero } : f))
    );
  };

  const handleAddEventDirectUrl = () => {
    const url = eventDirectUrlInput.trim();
    if (!url) return;
    const isVid =
      url.toLowerCase().includes('.mp4') ||
      url.toLowerCase().includes('.webm') ||
      url.toLowerCase().includes('.mov') ||
      url.toLowerCase().includes('/video/upload/');
    setEventExistingMedia((prev) => [
      ...prev,
      {
        url,
        type: isVid ? 'video' : 'image',
        showInHero: eventShowInHero,
      },
    ]);
    setEventDirectUrlInput('');
  };

  const handleCompressEventVideo = async (fileId: string) => {
    const item = eventBatchFiles.find((f) => f.id === fileId);
    if (!item) return;

    setCompressingEventId(fileId);
    try {
      const compressed = await compressVideoInBrowser(item.file, {});
      setEventBatchFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? {
                ...f,
                file: compressed,
                previewUrl: URL.createObjectURL(compressed),
                sizeText: `${(compressed.size / (1024 * 1024)).toFixed(1)} MB (⚡ Compressed)`,
                isOverLimit: compressed.size > MAX_CLOUDINARY_BYTES,
              }
            : f
        )
      );
    } catch (err: any) {
      console.error('Failed to compress event video:', err);
      alert(language === 'kn' ? 'ವೀಡಿಯೊ ಕುಗ್ಗಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.' : 'Video compression failed.');
    } finally {
      setCompressingEventId(null);
    }
  };

  const handleEventFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitleKn.trim() && !eventTitleEn.trim()) {
      setEventError('ಕಾರ್ಯಕ್ರಮದ ಶೀರ್ಷಿಕೆಯನ್ನು ನಮೂದಿಸಿ / Enter event title');
      return;
    }

    const oversizedEvents = eventBatchFiles.filter((f) => f.file.size > MAX_CLOUDINARY_BYTES);
    if (oversizedEvents.length > 0) {
      setEventError(
        language === 'kn'
          ? `"${oversizedEvents[0].name}" (${(oversizedEvents[0].file.size / (1024 * 1024)).toFixed(1)} MB) Cloudinary ಯ 100 MB ಮಿತಿಯನ್ನು ಮೀರಿದೆ. ದಯವಿಟ್ಟು "⚡ ಕುಗ್ಗಿಸಿ (Compress)" ಬಟನ್ ಕ್ಲಿಕ್ ಮಾಡಿ.`
          : `"${oversizedEvents[0].name}" (${(oversizedEvents[0].file.size / (1024 * 1024)).toFixed(1)} MB) exceeds Cloudinary's 100 MB limit. Please click "⚡ Compress (<100MB)".`
      );
      return;
    }

    setEventSaving(true);
    setEventError(null);

    try {
      let uploadedItems: { url: string; type: 'image' | 'video'; showInHero?: boolean }[] = [];

      if (eventBatchFiles.length > 0) {
        setEventBatchUploadStatus({ current: 1, total: eventBatchFiles.length });
        for (let i = 0; i < eventBatchFiles.length; i++) {
          setEventBatchUploadStatus({ current: i + 1, total: eventBatchFiles.length });
          const bFile = eventBatchFiles[i];
          const { url, mediaType } = await uploadToCloudinary(bFile.file);
          uploadedItems.push({
            url,
            type: mediaType,
            showInHero: bFile.showInHero ?? eventShowInHero,
          });
        }
      }

      // Merge all existing saved media and newly uploaded batch media
      const allMedia = [...eventExistingMedia, ...uploadedItems];
      let anyHeroTagged = allMedia.some((m) => m.showInHero === true);
      if (eventShowInHero && allMedia.length > 0 && !anyHeroTagged) {
        allMedia[0].showInHero = true;
        anyHeroTagged = true;
      }
      const finalShowInHero = eventShowInHero || anyHeroTagged;
      const finalMediaUrl = allMedia.length > 0 ? allMedia[0].url : (eventMediaUrl.trim() || undefined);
      const finalMediaType: 'image' | 'video' = allMedia.length > 0 ? allMedia[0].type : eventMediaType;

      const highlightsKn = eventHighlightsKnText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      const highlightsEn = eventHighlightsEnText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        titleKn: eventTitleKn.trim() || eventTitleEn.trim(),
        titleEn: eventTitleEn.trim() || eventTitleKn.trim(),
        category: eventCategory,
        eventDate: eventDate || new Date().toISOString().split('T')[0],
        year: Number(eventYear) || 2026,
        locationKn: eventLocationKn.trim() || undefined,
        locationEn: eventLocationEn.trim() || undefined,
        descriptionKn: eventDescKn.trim(),
        descriptionEn: eventDescEn.trim(),
        highlightsKn: highlightsKn.length > 0 ? highlightsKn : undefined,
        highlightsEn: highlightsEn.length > 0 ? highlightsEn : undefined,
        chiefGuestsKn: eventChiefGuestsKn.trim() || undefined,
        chiefGuestsEn: eventChiefGuestsEn.trim() || undefined,
        mediaUrl: finalMediaUrl,
        mediaType: finalMediaType,
        galleryMedia: allMedia,
        order: Number(eventOrder) || 1,
        isActive: eventIsActive,
        showInHero: finalShowInHero,
        showIn35mm: eventShowIn35mm,
        showInGallery: eventShowInGallery,
      };

      if (editingEvent) {
        await updateEvent(editingEvent.id, payload);
      } else {
        await addEvent(payload);
      }

      setIsEventModalOpen(false);
    } catch (err: any) {
      console.error('Error saving event:', err);
      setEventError(err.message || 'ಕಾರ್ಯಕ್ರಮ ಉಳಿಸಲು ವಿಫಲವಾಗಿದೆ / Failed to save event');
    } finally {
      setEventSaving(false);
      setEventBatchUploadStatus(null);
    }
  };

  const handleEventDeleteConfirm = async () => {
    if (!deletingEventId) return;
    try {
      await deleteEvent(deletingEventId);
    } catch (err) {
      console.error('Failed to delete event:', err);
    } finally {
      setDeletingEventId(null);
    }
  };

  // Real-time Subscriptions
  useEffect(() => {
    const unsubMedia = subscribeToAllMedia(
      (items) => {
        setMediaItems(items);
        setMediaLoading(false);
      },
      () => setMediaLoading(false)
    );

    const unsubCommittee = subscribeToCommittee(
      (members) => {
        setCommitteeMembers(members);
        setCommitteeLoading(false);
      },
      () => setCommitteeLoading(false)
    );

    const unsubHistory = subscribeToHistory(
      (items) => {
        setHistoryItems(items);
        setHistoryLoading(false);
      },
      () => setHistoryLoading(false)
    );

    const unsubAchievements = subscribeToAchievements(
      (items) => {
        setAchievements(items);
        setAchievementsLoading(false);
      },
      () => setAchievementsLoading(false)
    );

    const unsubEvents = subscribeToEvents(
      (evs) => {
        setEvents(evs);
        setEventsLoading(false);
      },
      () => setEventsLoading(false)
    );

    const unsubSite = subscribeToSiteSettings((settings) => {
      setSiteSettings(settings);
    });

    return () => {
      unsubMedia();
      unsubCommittee();
      unsubHistory();
      unsubAchievements();
      unsubEvents();
      unsubSite();
    };
  }, []);

  // Handlers: Media (Multi-Photo & Video Batch Upload)
  const handleMediaCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalPlacements: MediaPlacement[] =
      formPlacements.length > 0 ? formPlacements : ['gallery'];

    // Handle YouTube Video Link mode (unlimited size, 4K, 100MB+)
    if (mediaUploadTab === 'youtube') {
      const vidId = extractYoutubeVideoId(youtubeMediaUrl);
      if (!vidId) {
        setUploadError(
          language === 'kn'
            ? 'ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ ಯೂಟ್ಯೂಬ್ ಲಿಂಕ್ ನಮೂದಿಸಿ (Valid YouTube URL required).'
            : 'Please enter a valid YouTube video URL or 11-digit Video ID.'
        );
        return;
      }

      setIsUploading(true);
      setUploadError(null);
      try {
        const youtubeUrl = `https://www.youtube.com/watch?v=${vidId}`;
        const itemTitleKn = formTitleKn.trim() || `ಚಾಣಕ್ಯ ಯುವಕ ಮಂಡಳ ಗಣೇಶೋತ್ಸವ ${formYear}`;
        const itemTitleEn = formTitleEn.trim() || `CYM Festival Video ${formYear}`;

        await addMediaItem({
          titleKn: itemTitleKn,
          titleEn: itemTitleEn,
          mediaType: 'video',
          mediaUrl: youtubeUrl,
          publicId: `youtube_${vidId}`,
          placement: (finalPlacements[0] || 'gallery') as MediaPlacement,
          placements: finalPlacements,
          category: formCategory,
          year: formYear,
          order: mediaItems.length + 1,
          isActive: formIsActive,
        });

        setIsMediaUploadOpen(false);
        setYoutubeMediaUrl('');
        setFormTitleKn('');
        setFormTitleEn('');
      } catch (err) {
        setUploadError((err as Error).message);
      } finally {
        setIsUploading(false);
      }
      return;
    }

    if (batchMediaFiles.length === 0) {
      setUploadError(
        language === 'kn'
          ? 'ದಯವಿಟ್ಟು ಅಪ್‌ಲೋಡ್ ಮಾಡಲು ಕನಿಷ್ಠ ಒಂದು ಫೋಟೋ ಅಥವಾ ವಿಡಿಯೋ ಆಯ್ಕೆಮಾಡಿ.'
          : 'Please select at least one photo or video to upload.'
      );
      return;
    }

    // Check if any file exceeds Cloudinary's 100 MB free plan limit
    const oversized = batchMediaFiles.filter((f) => f.file.size > MAX_CLOUDINARY_BYTES);
    if (oversized.length > 0) {
      setUploadError(
        language === 'kn'
          ? `"${oversized[0].name}" (${(oversized[0].file.size / (1024 * 1024)).toFixed(1)} MB) Cloudinary ಯ 100 MB ಮಿತಿಯನ್ನು ಮೀರಿದೆ. ದಯವಿಟ್ಟು "⚡ ಕುಗ್ಗಿಸಿ (Compress)" ಬಟನ್ ಕ್ಲಿಕ್ ಮಾಡಿ ಅಥವಾ YouTube ಲಿಂಕ್ ಬಳಸಿ.`
          : `"${oversized[0].name}" (${(oversized[0].file.size / (1024 * 1024)).toFixed(1)} MB) exceeds Cloudinary's 100 MB limit. Please click "⚡ Compress" or use the YouTube Link tab.`
      );
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    const totalFiles = batchMediaFiles.length;
    let successCount = 0;

    try {
      for (let i = 0; i < totalFiles; i++) {
        const item = batchMediaFiles[i];

        setBatchUploadStatus({
          current: i + 1,
          total: totalFiles,
          currentFileName: item.name,
          overallPercent: Math.round((i / totalFiles) * 100),
          itemPercent: 0,
        });

        const { url, publicId, mediaType } = await uploadToCloudinary(item.file, (percent) => {
          setBatchUploadStatus((prev) =>
            prev
              ? {
                  ...prev,
                  itemPercent: percent,
                  overallPercent: Math.round(((i + percent / 100) / totalFiles) * 100),
                }
              : null
          );
        });

        const cleanFileName = item.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        const itemTitleKn = formTitleKn.trim()
          ? totalFiles > 1
            ? `${formTitleKn.trim()} #${i + 1}`
            : formTitleKn.trim()
          : `ಚಾಣಕ್ಯ ಯುವಕ ಮಂಡಳ ಗಣೇಶೋತ್ಸವ ${formYear}`;

        const itemTitleEn = formTitleEn.trim()
          ? totalFiles > 1
            ? `${formTitleEn.trim()} #${i + 1}`
            : formTitleEn.trim()
          : totalFiles > 1
          ? `CYM Festival Darshan ${formYear} - ${cleanFileName}`
          : `CYM Festival Darshan ${formYear}`;

        const isHeroPlacement = finalPlacements.includes('hero');
        const assignedOrder = isHeroPlacement ? (i + 1) : (mediaItems.length + i + 1);

        await addMediaItem({
          titleKn: itemTitleKn,
          titleEn: itemTitleEn,
          mediaType,
          mediaUrl: url,
          publicId,
          placement: (finalPlacements[0] || 'gallery') as MediaPlacement,
          placements: finalPlacements,
          category: formCategory,
          year: formYear,
          order: assignedOrder,
          isActive: formIsActive,
        });

        successCount++;
      }

      // If added to Hero, shift existing hero slides down so new media is 1st priority!
      if (finalPlacements.includes('hero') && heroSlideItems.length > 0) {
        try {
          const shiftPromises: Promise<any>[] = [];
          const seenDocKeys = new Set<string>();
          heroSlideItems.forEach((s, sIdx) => {
            const shiftedOrder = sIdx + 1 + totalFiles;
            const docId = s.rawItem.id;
            const key = `${s.source}-${docId}`;
            if (!seenDocKeys.has(key)) {
              seenDocKeys.add(key);
              if (s.source === 'media') {
                shiftPromises.push(updateMediaItem(docId, { order: shiftedOrder }));
              } else if (s.source === 'history') {
                shiftPromises.push(updateHistoryMilestone(docId, { order: shiftedOrder }));
              } else if (s.source === 'achievement') {
                shiftPromises.push(updateAchievement(docId, { order: shiftedOrder }));
              } else if (s.source === 'event') {
                shiftPromises.push(updateEvent(docId, { order: shiftedOrder }));
              }
            }
          });
          await Promise.all(shiftPromises);
        } catch (shiftErr) {
          console.error('Failed to shift previous hero slides:', shiftErr);
        }
      }

      // Cleanup preview URLs
      batchMediaFiles.forEach((item) => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      });

      setBatchMediaFiles([]);
      setIsMediaUploadOpen(false);
      setFormTitleKn('');
      setFormTitleEn('');
      setBatchUploadStatus(null);
    } catch (err: unknown) {
      const e = err as Error;
      setUploadError(
        language === 'kn'
          ? `ಅಪ್‌ಲೋಡ್ ದೋಷ: ${e.message || 'ನೆಟ್‌ವರ್ಕ್ ಪರಿಶೀಲಿಸಿ'}. (${successCount}/${totalFiles} ಯಶಸ್ವಿಯಾಗಿದೆ)`
          : `Upload error: ${e.message || 'Check network'}. (${successCount}/${totalFiles} completed)`
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleMediaEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMedia) return;

    try {
      const activePlacements: MediaPlacement[] =
        editingMedia.placements && editingMedia.placements.length > 0
          ? editingMedia.placements
          : [editingMedia.placement || 'gallery'];

      await updateMediaItem(editingMedia.id, {
        titleKn: editingMedia.titleKn,
        titleEn: editingMedia.titleEn,
        placement: (activePlacements[0] || 'gallery') as MediaPlacement,
        placements: activePlacements,
        category: editingMedia.category,
        year: editingMedia.year,
        isActive: editingMedia.isActive,
      });
      setEditingMedia(null);
    } catch (err: unknown) {
      const e = err as Error;
      alert('Failed to update: ' + e.message);
    }
  };

  const handleMediaDeleteConfirm = async () => {
    if (!deletingMediaId) return;
    try {
      await deleteMediaItem(deletingMediaId);
      setDeletingMediaId(null);
    } catch (err: unknown) {
      const e = err as Error;
      alert('Failed to delete: ' + e.message);
    }
  };

  // Handlers: Committee
  const openMemberAddModal = () => {
    setEditingMember(null);
    setMemberNameKn('');
    setMemberNameEn('');
    setSelectedRolePreset('committee_member');
    setMemberRoleKn('ಕಮಿಟಿ ಸದಸ್ಯರು');
    setMemberRoleEn('Committee Member');
    setMemberCategory('core');
    setMemberPeriodKn('ಸ್ಥಾಪಕ ಸದಸ್ಯರು (2019 ರಿಂದ ನಿರಂತರ)');
    setMemberPeriodEn('Founding Member (2019 – Present)');
    setMemberIsFounding(true);
    setMemberOrder(committeeMembers.length + 1);
    setMemberPhotoUrl('');
    setMemberPhotoFile(null);
    setMemberPhotoPreview(null);
    setMemberError(null);
    setIsMemberModalOpen(true);
  };

  const openMemberEditModal = (m: CommitteeMemberDoc) => {
    setEditingMember(m);
    setMemberNameKn(m.nameKn);
    setMemberNameEn(m.nameEn);
    setMemberRoleKn(m.roleKn);
    setMemberRoleEn(m.roleEn);
    const matched = PRESET_COMMITTEE_ROLES.find(
      (r) =>
        r.labelKn === m.roleKn ||
        r.labelEn.toLowerCase() === m.roleEn.toLowerCase()
    );
    setSelectedRolePreset(matched ? matched.id : 'custom');
    setMemberCategory((m.category as any) || 'office');
    setMemberPeriodKn(m.servicePeriodKn || '');
    setMemberPeriodEn(m.servicePeriodEn || '');
    setMemberIsFounding(m.isFounding ?? false);
    setMemberOrder(m.order ?? 1);
    setMemberPhotoUrl(m.photoUrl || '');
    setMemberPhotoFile(null);
    setMemberPhotoPreview(m.photoUrl || null);
    setMemberError(null);
    setIsMemberModalOpen(true);
  };

  const handleMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberNameKn.trim() && !memberNameEn.trim()) {
      setMemberError('Please enter the member name.');
      return;
    }

    setMemberSaving(true);
    setMemberError(null);
    setMemberUploadProgress(null);

    try {
      let finalPhotoUrl = memberPhotoUrl.trim();
      if (memberPhotoFile) {
        setMemberUploadProgress(15);
        const { url } = await uploadToCloudinary(memberPhotoFile, (pct) => {
          setMemberUploadProgress(pct);
        });
        finalPhotoUrl = url;
      }

      const payload = {
        nameKn: memberNameKn.trim() || memberNameEn.trim(),
        nameEn: memberNameEn.trim() || memberNameKn.trim(),
        roleKn: memberRoleKn.trim() || 'ಸದಸ್ಯರು',
        roleEn: memberRoleEn.trim() || 'Member',
        category: memberCategory,
        servicePeriodKn: memberPeriodKn.trim(),
        servicePeriodEn: memberPeriodEn.trim(),
        isFounding: memberIsFounding,
        order: Number(memberOrder) || 1,
        photoUrl: finalPhotoUrl || '',
        isActive: true,
      };

      if (editingMember) {
        await updateCommitteeMember(editingMember.id, payload);
      } else {
        await addCommitteeMember(payload);
      }

      setIsMemberModalOpen(false);
      setEditingMember(null);
      setMemberPhotoFile(null);
      setMemberPhotoPreview(null);
      setMemberPhotoUrl('');
      setMemberUploadProgress(null);
    } catch (err: unknown) {
      const e = err as Error;
      setMemberError(e.message || 'Failed to save member.');
    } finally {
      setMemberSaving(false);
      setMemberUploadProgress(null);
    }
  };

  const handleMemberDeleteConfirm = async () => {
    if (!deletingMemberId) return;
    try {
      await deleteCommitteeMember(deletingMemberId);
      setDeletingMemberId(null);
    } catch (err: unknown) {
      const e = err as Error;
      alert('Failed to delete member: ' + e.message);
    }
  };

  // Handlers: History
  const openHistoryAddModal = (presetYear?: number) => {
    const targetYear = presetYear ?? (historyYearFilter !== 'all' ? Number(historyYearFilter) : 2026);
    setEditingHistory(null);
    setHistoryYear(targetYear);
    setHistoryTitleKn(`${targetYear} ಶ್ರೀ ಗಣೇಶ ಮಹೋತ್ಸವ`);
    setHistoryTitleEn(`${targetYear} Royal Ganesh Mahotsav`);
    setHistorySamvatsaraKn('');
    setHistorySamvatsaraEn('');
    setHistoryThemeKn('');
    setHistoryThemeEn('');
    setHistorySummaryKn('');
    setHistorySummaryEn('');
    setHistoryHighlightsKnText('');
    setHistoryHighlightsEnText('');
    setHistoryCoverUrl('');
    setHistoryCoverFile(null);
    setHistoryCoverPreview(null);
    setHistoryMediaType('image');
    setHistoryShowInHero(false);
    setHistoryShowIn35mm(true);
    setHistoryShowInGallery(true);
    setHistoryError(null);
    setIsHistoryModalOpen(true);
  };

  const openHistoryEditModal = (h: HistoryMilestoneDoc) => {
    setEditingHistory(h);
    setHistoryYear(h.year);
    setHistoryTitleKn(h.titleKn);
    setHistoryTitleEn(h.titleEn);
    setHistorySamvatsaraKn(h.samvatsaraKn || '');
    setHistorySamvatsaraEn(h.samvatsaraEn || '');
    setHistoryThemeKn(h.pandalThemeKn || '');
    setHistoryThemeEn(h.pandalThemeEn || '');
    setHistorySummaryKn(h.summaryKn || '');
    setHistorySummaryEn(h.summaryEn || '');
    setHistoryHighlightsKnText((h.highlightsKn || []).join('\n'));
    setHistoryHighlightsEnText((h.highlightsEn || []).join('\n'));
    setHistoryCoverUrl(h.coverImage || '');
    setHistoryCoverFile(null);
    setHistoryCoverPreview(h.coverImage || null);
    setHistoryMediaType(
      h.mediaType ||
        (h.coverImage?.match(/\.(mp4|webm|mov)$/i) || h.coverImage?.includes('/video/upload/')
          ? 'video'
          : 'image')
    );
    setHistoryShowInHero(Boolean(h.showInHero));
    setHistoryShowIn35mm(Boolean(h.showIn35mm ?? true));
    setHistoryShowInGallery(Boolean(h.showInGallery ?? true));
    setHistoryError(null);
    setIsHistoryModalOpen(true);
  };

  const handleHistorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHistorySaving(true);
    setHistoryError(null);

    try {
      let finalCoverUrl = historyCoverUrl;
      let finalMediaType: 'image' | 'video' = historyMediaType;
      if (historyCoverFile) {
        const { url, mediaType } = await uploadToCloudinary(historyCoverFile);
        finalCoverUrl = url;
        finalMediaType = mediaType;
      }

      const highlightsKn = historyHighlightsKnText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      const highlightsEn = historyHighlightsEnText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        year: Number(historyYear),
        titleKn: historyTitleKn.trim() || `${historyYear} ಉತ್ಸವ`,
        titleEn: historyTitleEn.trim() || `${historyYear} Annual Utsav`,
        samvatsaraKn: historySamvatsaraKn.trim(),
        samvatsaraEn: historySamvatsaraEn.trim(),
        pandalThemeKn: historyThemeKn.trim(),
        pandalThemeEn: historyThemeEn.trim(),
        summaryKn: historySummaryKn.trim(),
        summaryEn: historySummaryEn.trim(),
        highlightsKn,
        highlightsEn,
        coverImage: finalCoverUrl,
        mediaType: finalMediaType,
        showInHero: historyShowInHero,
        showIn35mm: historyShowIn35mm,
        showInGallery: historyShowInGallery,
        isActive: true,
      };

      if (editingHistory) {
        await updateHistoryMilestone(editingHistory.id, payload);
      } else {
        await addHistoryMilestone(payload);
      }

      setIsHistoryModalOpen(false);
      setEditingHistory(null);
    } catch (err: unknown) {
      const e = err as Error;
      setHistoryError(e.message || 'Failed to save milestone.');
    } finally {
      setHistorySaving(false);
    }
  };

  const handleHistoryDeleteConfirm = async () => {
    if (!deletingHistoryId) return;
    try {
      await deleteHistoryMilestone(deletingHistoryId);
      setDeletingHistoryId(null);
    } catch (err: unknown) {
      const e = err as Error;
      alert('Failed to delete history: ' + e.message);
    }
  };

  // Handlers: Achievements
  const openAchievementAddModal = () => {
    setEditingAchievement(null);
    setAchTitleKn('');
    setAchTitleEn('');
    setAchCategory('feast');
    setAchSponsorKn('');
    setAchSponsorEn('');
    setAchEventDate('');
    setAchYear(2026);
    setAchYearKn('');
    setAchYearEn('');
    setAchMetricKn('');
    setAchMetricEn('');
    setAchDescKn('');
    setAchDescEn('');
    setAchHighlightsKnText('');
    setAchHighlightsEnText('');
    setAchImageUrl('');
    setAchMediaUrl('');
    setAchMediaType('image');
    setAchExistingMedia([]);
    setAchBatchFiles([]);
    setAchBatchUploadStatus(null);
    setAchShowInHero(false);
    setAchShowIn35mm(false);
    setAchShowInGallery(true);
    setAchAlsoAddToGallery(false);
    setAchOrder(achievements.length + 1);
    setAchError(null);
    setIsAchievementModalOpen(true);
  };

  const openAchievementEditModal = (a: AchievementDoc) => {
    setEditingAchievement(a);
    setAchTitleKn(a.titleKn || '');
    setAchTitleEn(a.titleEn || '');
    setAchCategory((a.category as any) || 'feast');
    setAchSponsorKn(a.sponsorNameKn || '');
    setAchSponsorEn(a.sponsorNameEn || '');
    setAchEventDate(a.eventDate || '');
    const detectedYear =
      a.year ||
      (a.eventDate ? parseInt(a.eventDate.match(/\d{4}/)?.[0] || '2026') : 2026);
    setAchYear(detectedYear);
    setAchYearKn(a.yearKn || '');
    setAchYearEn(a.yearEn || '');
    setAchMetricKn(a.impactMetricKn || '');
    setAchMetricEn(a.impactMetricEn || '');
    setAchDescKn(a.descriptionKn || '');
    setAchDescEn(a.descriptionEn || '');
    setAchHighlightsKnText((a.highlightsKn || []).join('\n'));
    setAchHighlightsEnText((a.highlightsEn || []).join('\n'));
    const existingMedia = a.mediaUrl || a.imageUrl || '';
    setAchImageUrl(existingMedia);
    setAchMediaUrl(existingMedia);
    setAchMediaType(
      a.mediaType ||
        (existingMedia.toLowerCase().includes('.mp4') ||
        existingMedia.toLowerCase().includes('.webm') ||
        existingMedia.toLowerCase().includes('.mov') ||
        existingMedia.toLowerCase().includes('/video/upload/')
          ? 'video'
          : 'image')
    );

    const existingList: { url: string; type: 'image' | 'video'; showInHero?: boolean }[] = [];
    if (a.galleryMedia && a.galleryMedia.length > 0) {
      existingList.push(
        ...a.galleryMedia.map((m) => ({
          ...m,
          showInHero: m.showInHero ?? a.showInHero ?? false,
        }))
      );
    } else if (existingMedia) {
      existingList.push({
        url: existingMedia,
        type: (a.mediaType || 'image') as 'image' | 'video',
        showInHero: a.showInHero ?? false,
      });
    }
    setAchExistingMedia(existingList);
    setAchBatchFiles([]);
    setAchBatchUploadStatus(null);

    setAchShowInHero(Boolean(a.showInHero));
    setAchShowIn35mm(Boolean(a.showIn35mm));
    setAchShowInGallery(Boolean(a.showInGallery ?? true));
    setAchAlsoAddToGallery(false);
    setAchOrder(a.order ?? 1);
    setAchError(null);
    setIsAchievementModalOpen(true);
  };

  const handleAchievementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const oversizedAch = achBatchFiles.filter((f) => f.file.size > MAX_CLOUDINARY_BYTES);
    if (oversizedAch.length > 0) {
      setAchError(
        language === 'kn'
          ? `"${oversizedAch[0].name}" (${(oversizedAch[0].file.size / (1024 * 1024)).toFixed(1)} MB) Cloudinary ಯ 100 MB ಮಿತಿಯನ್ನು ಮೀರಿದೆ. ದಯವಿಟ್ಟು "⚡ ಕುಗ್ಗಿಸಿ (Compress)" ಬಟನ್ ಒತ್ತಿ.`
          : `"${oversizedAch[0].name}" (${(oversizedAch[0].file.size / (1024 * 1024)).toFixed(1)} MB) exceeds Cloudinary's 100 MB limit. Please click "⚡ Compress (<100MB)".`
      );
      return;
    }

    setAchSaving(true);
    setAchError(null);

    try {
      let uploadedItems: { url: string; type: 'image' | 'video'; showInHero?: boolean }[] = [];

      if (achBatchFiles.length > 0) {
        setAchBatchUploadStatus({ current: 1, total: achBatchFiles.length });
        for (let i = 0; i < achBatchFiles.length; i++) {
          setAchBatchUploadStatus({ current: i + 1, total: achBatchFiles.length });
          const bFile = achBatchFiles[i];
          const { url, mediaType } = await uploadToCloudinary(bFile.file);
          uploadedItems.push({
            url,
            type: mediaType,
            showInHero: bFile.showInHero ?? achShowInHero,
          });
        }
      }

      const allMedia = [...achExistingMedia, ...uploadedItems];
      let anyHeroTagged = allMedia.some((m) => m.showInHero === true);
      if (achShowInHero && allMedia.length > 0 && !anyHeroTagged) {
        allMedia[0].showInHero = true;
        anyHeroTagged = true;
      }
      const finalShowInHero = achShowInHero || anyHeroTagged;
      const finalMediaUrl = allMedia.length > 0 ? allMedia[0].url : (achMediaUrl || achImageUrl || '');
      const finalMediaType: 'image' | 'video' = allMedia.length > 0 ? allMedia[0].type : achMediaType;

      const highlightsKn = achHighlightsKnText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      const highlightsEn = achHighlightsEnText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload: Omit<AchievementDoc, 'id' | 'createdAt'> = {
        titleKn: achTitleKn.trim() || achTitleEn.trim(),
        titleEn: achTitleEn.trim() || achTitleKn.trim(),
        category: achCategory,
        sponsorNameKn: achSponsorKn.trim(),
        sponsorNameEn: achSponsorEn.trim(),
        eventDate: achEventDate.trim(),
        year: Number(achYear) || 2026,
        yearKn: achYearKn.trim(),
        yearEn: achYearEn.trim(),
        impactMetricKn: achMetricKn.trim(),
        impactMetricEn: achMetricEn.trim(),
        descriptionKn: achDescKn.trim(),
        descriptionEn: achDescEn.trim(),
        highlightsKn,
        highlightsEn,
        imageUrl: finalMediaUrl,
        mediaUrl: finalMediaUrl,
        mediaType: finalMediaType,
        galleryMedia: allMedia,
        showInHero: finalShowInHero,
        showIn35mm: achShowIn35mm,
        showInGallery: achShowInGallery,
        order: Number(achOrder) || 1,
        isActive: true,
      };

      if (editingAchievement) {
        await updateAchievement(editingAchievement.id, payload);
      } else {
        await addAchievement(payload);
      }

      // Cross-section placement: if checked, also create entries in media_items for uploaded items
      const itemsToCrossPost = uploadedItems.length > 0 ? uploadedItems : (allMedia.length > 0 ? [allMedia[0]] : []);
      if ((achAlsoAddToGallery || achShowInGallery || achShowIn35mm || achShowInHero) && itemsToCrossPost.length > 0) {
        try {
          const crossPlacements: ('seva' | 'gallery' | 'carousel' | 'hero')[] = ['seva'];
          if (achShowInGallery || achAlsoAddToGallery) crossPlacements.push('gallery');
          if (achShowIn35mm) crossPlacements.push('carousel');
          if (achShowInHero) crossPlacements.push('hero');

          for (let idx = 0; idx < itemsToCrossPost.length; idx++) {
            const m = itemsToCrossPost[idx];
            await addMediaItem({
              titleKn: achTitleKn.trim() || 'ಸೇವಾ ಕೈಂಕರ್ಯ',
              titleEn: achTitleEn.trim() || 'Seva Initiative',
              descriptionKn:
                achDescKn.trim() ||
                (achSponsorKn.trim() ? `ಸೇವಾಕರ್ತರು: ${achSponsorKn.trim()}` : ''),
              descriptionEn:
                achDescEn.trim() ||
                (achSponsorEn.trim() ? `Sponsor: ${achSponsorEn.trim()}` : ''),
              mediaUrl: m.url,
              mediaType: m.type,
              year: Number(achYear) || new Date().getFullYear(),
              category: 'seva',
              placement: 'seva',
              placements: crossPlacements as any,
              order: idx + 1,
              isActive: true,
            });
          }
        } catch (mediaCrossErr) {
          console.warn('Cross-posting to media library skipped or failed:', mediaCrossErr);
        }
      }

      setIsAchievementModalOpen(false);
      setEditingAchievement(null);
      setAchBatchFiles([]);
      setAchExistingMedia([]);
      setAchBatchUploadStatus(null);
    } catch (err: unknown) {
      const e = err as Error;
      setAchError(e.message || 'Failed to save achievement.');
    } finally {
      setAchSaving(false);
      setAchBatchUploadStatus(null);
    }
  };

  const handleAchievementDeleteConfirm = async () => {
    if (!deletingAchievementId) return;
    try {
      await deleteAchievement(deletingAchievementId);
      setDeletingAchievementId(null);
    } catch (err: unknown) {
      const e = err as Error;
      alert('Failed to delete achievement: ' + e.message);
    }
  };

  // Handlers: Site Settings
  const handleSiteSettingsSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSiteSettingsSaving(true);
    try {
      await updateSiteSettings(siteSettings);
      setSiteSettingsSaved(true);
      setTimeout(() => setSiteSettingsSaved(false), 3000);
    } catch (err: unknown) {
      const e = err as Error;
      alert('Failed to update settings: ' + e.message);
    } finally {
      setSiteSettingsSaving(false);
    }
  };

  // Dynamic Festival Years (Includes 2027, 2028 + any years uploaded by admin)
  const adminFilterYears = useMemo(() => {
    const defaultYears = [2028, 2027, 2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019];
    const itemYears = mediaItems.map((m) => m.year).filter(Boolean);
    return Array.from(new Set([...defaultYears, ...itemYears])).sort((a, b) => b - a);
  }, [mediaItems]);

  // Dynamic History Milestone Years & Filtered Milestones
  const availableHistoryYears = useMemo(() => {
    const defaultYears = [2028, 2027, 2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019];
    const itemYears = historyItems.map((h) => h.year);
    return Array.from(new Set([...defaultYears, ...itemYears])).sort((a, b) => b - a);
  }, [historyItems]);

  const displayedHistoryItems = useMemo(() => {
    const sorted = [...historyItems].sort((a, b) => b.year - a.year);
    if (historyYearFilter === 'all') return sorted;
    return sorted.filter((h) => h.year === Number(historyYearFilter));
  }, [historyItems, historyYearFilter]);

  // Filter Media
  const filteredMedia = mediaItems.filter((item) => {
    const matchPlacement =
      filterPlacement === 'all' ||
      item.placement === filterPlacement ||
      (Array.isArray(item.placements) && item.placements.includes(filterPlacement as any));
    const matchYear = filterYear === 'all' || item.year === parseInt(filterYear);
    const matchCategory =
      filterMediaCategory === 'all' ||
      item.category === filterMediaCategory ||
      (filterMediaCategory === 'visarjan' && (item.category as string) === 'miravanige');
    const matchSearch =
      searchQuery === '' ||
      item.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.titleKn.includes(searchQuery);
    return matchPlacement && matchYear && matchCategory && matchSearch;
  });

  const heroCount = mediaItems.filter(
    (i) => (i.placement === 'hero' || i.placements?.includes('hero')) && i.isActive
  ).length;
  const carouselCount = mediaItems.filter(
    (i) => (i.placement === 'carousel' || i.placements?.includes('carousel')) && i.isActive
  ).length;
  const galleryCount = mediaItems.filter(
    (i) => (i.placement === 'gallery' || !i.placement || i.placements?.includes('gallery')) && i.isActive
  ).length;
  const historyMediaCount = mediaItems.filter(
    (i) => i.placements?.includes('history') && i.isActive
  ).length;
  const sevaMediaCount = mediaItems.filter(
    (i) => i.placements?.includes('seva') && i.isActive
  ).length;

  return (
    <div className="min-h-screen bg-[#09090b] text-neutral-100 font-sans selection:bg-[#E5A812] selection:text-black">
      {/* ================= HEADER BAR ================= */}
      <header className="sticky top-0 z-40 bg-[#09090b]/95 backdrop-blur-xl border-b border-neutral-800 px-3 sm:px-6 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Brand Info */}
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-neutral-900 border border-amber-400/30 flex items-center justify-center p-1.5 shrink-0 shadow-inner">
              <img src="/assets/logo_tight.png" alt="CYM" className="w-full h-full object-contain" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-1.5 truncate">
                <span>{language === 'kn' ? 'ಕಂಟ್ರೋಲ್ ಸೆಂಟರ್ • CYM' : 'CYM Admin Dashboard'}</span>
                <span className="hidden md:inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-400/10 text-amber-400 border border-amber-400/30">
                  {language === 'kn' ? 'ಅಡ್ಮಿನ್ ಪೋರ್ಟಲ್' : 'Admin Portal'}
                </span>
              </h1>
              <p className="text-[11px] text-neutral-400 truncate font-sans">
                {currentUser?.email || (language === 'kn' ? 'ಚಾಣಕ್ಯ ಯುವಕ ಮಂಡಳ • ಕಡಲಗಿ ಖೂಟ' : 'Chanakya Yuvak Mandal • Kadalagi Khuta')}
              </p>
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex items-center space-x-2 shrink-0">
            {/* Language Switcher Capsule */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="flex items-center space-x-1.5 px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/25 border border-amber-400/40 text-xs font-bold text-white transition-all shadow-xs cursor-pointer whitespace-nowrap"
              title={language === 'kn' ? 'Switch to English' : 'ಕನ್ನಡಕ್ಕೆ ಬದಲಿಸಿ'}
              aria-label="Language switcher"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-mono uppercase text-[11px] font-bold tracking-wider text-white">
                {language === 'kn' ? 'ENGLISH' : 'ಕನ್ನಡ'}
              </span>
            </button>

            <Link
              to="/"
              target="_blank"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-neutral-800/80 hover:bg-neutral-800 border border-neutral-700/60 text-xs font-semibold text-neutral-200 hover:text-white transition-colors cursor-pointer"
            >
              <span className="hidden sm:inline">{language === 'kn' ? 'ಲೈವ್ ಸೈಟ್' : 'Live Site'}</span>
              <span className="sm:hidden">{language === 'kn' ? 'ಸೈಟ್' : 'Site'}</span>
              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
            </Link>

            {/* Manual PIN Lock Button */}
            <button
              type="button"
              onClick={handleLockPortal}
              title={language === 'kn' ? 'ಪಿನ್ ಮೂಲಕ ಪೋರ್ಟಲ್ ಲಾಕ್ ಮಾಡಿ' : 'Lock portal with PIN'}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 text-xs font-semibold text-amber-300 hover:text-amber-200 transition-colors cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">{language === 'kn' ? 'ಲಾಕ್' : 'Lock'}</span>
            </button>

            <button
              onClick={() => logout()}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-xs font-semibold text-red-400 hover:text-red-300 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{language === 'kn' ? 'ಲಾಗ್ ಔಟ್' : 'Sign Out'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ================= TABS NAVIGATION ================= */}
      <nav className="bg-[#0a0a0d]/95 backdrop-blur-md border-b border-amber-500/20 sticky top-[57px] z-30 px-3 sm:px-6 lg:px-8 py-2.5 shadow-xl shadow-black/50">
        <div className="max-w-7xl mx-auto">
          {/* Mobile View: Prominent Luxury Selector */}
          <div className="sm:hidden">
            <label htmlFor="admin-mobile-tab-select" className="sr-only">
              {language === 'kn' ? 'ವಿಭಾಗ ಆಯ್ಕೆಮಾಡಿ' : 'Select Section'}
            </label>
            <div className="relative">
              <select
                id="admin-mobile-tab-select"
                value={activeTab}
                onChange={(e) => handleTabChange(e.target.value as AdminTab)}
                className="w-full appearance-none bg-neutral-900/90 border border-amber-400/50 rounded-xl px-4 py-2.5 text-xs font-bold text-white pr-9 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 shadow-lg cursor-pointer"
              >
                <option value="media">
                  📷 {language === 'kn' ? 'ಮೀಡಿಯಾ ಸಂಗ್ರಹ' : 'Media Library'} ({mediaItems.length})
                </option>
                <option value="hero_order">
                  🌟 {language === 'kn' ? 'ಹೀರೋ ಸ್ಲೈಡರ್ ಆದ್ಯತೆ' : 'Hero Priority'} ({heroSlideItems.length})
                </option>
                <option value="events">
                  🏆 {language === 'kn' ? 'ಇತರ ಕಾರ್ಯಕ್ರಮಗಳು' : 'Activities'} ({events.length})
                </option>
                <option value="committee">
                  👥 {language === 'kn' ? 'ಸಮಿತಿ ಸದಸ್ಯರು' : 'Committee Members'} ({committeeMembers.length})
                </option>
                <option value="history">
                  📜 {language === 'kn' ? 'ಹಬ್ಬದ ಇತಿಹಾಸ' : 'Festival History'} ({historyItems.length})
                </option>
                <option value="achievements">
                  🙏 {language === 'kn' ? 'ಸೇವೆ & ಸಾಧನೆಗಳು' : 'Seva & Impact'} ({achievements.length})
                </option>
                <option value="site">
                  🔴 {language === 'kn' ? 'ಲೈವ್ & ಪ್ರಕಟಣೆ' : 'Live & Alerts'} {(siteSettings.announcementActive || siteSettings.liveStreamActive) ? '●' : ''}
                </option>
                <option value="health">
                  ⚡ {language === 'kn' ? 'ಸಿಸ್ಟಮ್ ಸ್ಥಿತಿ' : 'Health Monitor'}
                </option>
              </select>
              <ChevronDown className="w-4 h-4 text-amber-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Desktop & Laptop View: Premium Executive Segmented Pills */}
          <div className="hidden sm:flex items-center flex-wrap gap-2 py-0.5">
            {/* Tab 1: Media Library */}
            <button
              onClick={() => handleTabChange('media')}
              className={`group inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs transition-all duration-200 cursor-pointer ${
                activeTab === 'media'
                  ? 'bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-neutral-950 font-black shadow-lg shadow-amber-400/25 ring-1 ring-amber-300 scale-[1.02]'
                  : 'text-neutral-300 hover:text-white bg-neutral-900/60 hover:bg-neutral-800/90 border border-neutral-800/80 hover:border-amber-400/40'
              }`}
            >
              <Camera className={`w-3.5 h-3.5 ${activeTab === 'media' ? 'text-neutral-950' : 'text-amber-400/80 group-hover:text-amber-300'}`} />
              <span className="font-semibold">{language === 'kn' ? 'ಮೀಡಿಯಾ ಸಂಗ್ರಹ' : 'Media Library'}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold transition-all ${
                activeTab === 'media'
                  ? 'bg-neutral-950/85 text-amber-300 shadow-xs'
                  : 'bg-neutral-800/90 text-neutral-300 border border-neutral-700/60 group-hover:border-amber-400/40 group-hover:text-amber-300'
              }`}>
                {mediaItems.length}
              </span>
            </button>

            {/* Tab 2: Hero Priority */}
            <button
              onClick={() => handleTabChange('hero_order')}
              className={`group inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs transition-all duration-200 cursor-pointer ${
                activeTab === 'hero_order'
                  ? 'bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-neutral-950 font-black shadow-lg shadow-amber-400/25 ring-1 ring-amber-300 scale-[1.02]'
                  : 'text-neutral-300 hover:text-white bg-neutral-900/60 hover:bg-neutral-800/90 border border-neutral-800/80 hover:border-amber-400/40'
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${activeTab === 'hero_order' ? 'text-neutral-950' : 'text-amber-400/80 group-hover:text-amber-300'}`} />
              <span className="font-semibold">{language === 'kn' ? 'ಹೀರೋ ಸ್ಲೈಡರ್ ಆದ್ಯತೆ' : 'Hero Priority'}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold transition-all ${
                activeTab === 'hero_order'
                  ? 'bg-neutral-950/85 text-amber-300 shadow-xs'
                  : 'bg-neutral-800/90 text-neutral-300 border border-neutral-700/60 group-hover:border-amber-400/40 group-hover:text-amber-300'
              }`}>
                {heroSlideItems.length}
              </span>
            </button>

            {/* Tab 3: Activities */}
            <button
              onClick={() => handleTabChange('events')}
              className={`group inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs transition-all duration-200 cursor-pointer ${
                activeTab === 'events'
                  ? 'bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-neutral-950 font-black shadow-lg shadow-amber-400/25 ring-1 ring-amber-300 scale-[1.02]'
                  : 'text-neutral-300 hover:text-white bg-neutral-900/60 hover:bg-neutral-800/90 border border-neutral-800/80 hover:border-amber-400/40'
              }`}
            >
              <Trophy className={`w-3.5 h-3.5 ${activeTab === 'events' ? 'text-neutral-950' : 'text-amber-400/80 group-hover:text-amber-300'}`} />
              <span className="font-semibold">{language === 'kn' ? 'ಇತರ ಕಾರ್ಯಕ್ರಮಗಳು' : 'Activities'}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold transition-all ${
                activeTab === 'events'
                  ? 'bg-neutral-950/85 text-amber-300 shadow-xs'
                  : 'bg-neutral-800/90 text-neutral-300 border border-neutral-700/60 group-hover:border-amber-400/40 group-hover:text-amber-300'
              }`}>
                {events.length}
              </span>
            </button>

            {/* Tab 4: Committee Members */}
            <button
              onClick={() => handleTabChange('committee')}
              className={`group inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs transition-all duration-200 cursor-pointer ${
                activeTab === 'committee'
                  ? 'bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-neutral-950 font-black shadow-lg shadow-amber-400/25 ring-1 ring-amber-300 scale-[1.02]'
                  : 'text-neutral-300 hover:text-white bg-neutral-900/60 hover:bg-neutral-800/90 border border-neutral-800/80 hover:border-amber-400/40'
              }`}
            >
              <Users className={`w-3.5 h-3.5 ${activeTab === 'committee' ? 'text-neutral-950' : 'text-amber-400/80 group-hover:text-amber-300'}`} />
              <span className="font-semibold">{language === 'kn' ? 'ಸಮಿತಿ ಸದಸ್ಯರು' : 'Committee Members'}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold transition-all ${
                activeTab === 'committee'
                  ? 'bg-neutral-950/85 text-amber-300 shadow-xs'
                  : 'bg-neutral-800/90 text-neutral-300 border border-neutral-700/60 group-hover:border-amber-400/40 group-hover:text-amber-300'
              }`}>
                {committeeMembers.length}
              </span>
            </button>

            {/* Tab 5: Festival History */}
            <button
              onClick={() => handleTabChange('history')}
              className={`group inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs transition-all duration-200 cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-neutral-950 font-black shadow-lg shadow-amber-400/25 ring-1 ring-amber-300 scale-[1.02]'
                  : 'text-neutral-300 hover:text-white bg-neutral-900/60 hover:bg-neutral-800/90 border border-neutral-800/80 hover:border-amber-400/40'
              }`}
            >
              <Calendar className={`w-3.5 h-3.5 ${activeTab === 'history' ? 'text-neutral-950' : 'text-amber-400/80 group-hover:text-amber-300'}`} />
              <span className="font-semibold">{language === 'kn' ? 'ಹಬ್ಬದ ಇತಿಹಾಸ' : 'Festival History'}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold transition-all ${
                activeTab === 'history'
                  ? 'bg-neutral-950/85 text-amber-300 shadow-xs'
                  : 'bg-neutral-800/90 text-neutral-300 border border-neutral-700/60 group-hover:border-amber-400/40 group-hover:text-amber-300'
              }`}>
                {historyItems.length}
              </span>
            </button>

            {/* Tab 6: Seva & Impact */}
            <button
              onClick={() => handleTabChange('achievements')}
              className={`group inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs transition-all duration-200 cursor-pointer ${
                activeTab === 'achievements'
                  ? 'bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-neutral-950 font-black shadow-lg shadow-amber-400/25 ring-1 ring-amber-300 scale-[1.02]'
                  : 'text-neutral-300 hover:text-white bg-neutral-900/60 hover:bg-neutral-800/90 border border-neutral-800/80 hover:border-amber-400/40'
              }`}
            >
              <Award className={`w-3.5 h-3.5 ${activeTab === 'achievements' ? 'text-neutral-950' : 'text-amber-400/80 group-hover:text-amber-300'}`} />
              <span className="font-semibold">{language === 'kn' ? 'ಸೇವೆ & ಸಾಧನೆ' : 'Seva & Impact'}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold transition-all ${
                activeTab === 'achievements'
                  ? 'bg-neutral-950/85 text-amber-300 shadow-xs'
                  : 'bg-neutral-800/90 text-neutral-300 border border-neutral-700/60 group-hover:border-amber-400/40 group-hover:text-amber-300'
              }`}>
                {achievements.length}
              </span>
            </button>

            {/* Tab 7: Live & Alerts */}
            <button
              onClick={() => handleTabChange('site')}
              className={`group inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs transition-all duration-200 cursor-pointer ${
                activeTab === 'site'
                  ? 'bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-neutral-950 font-black shadow-lg shadow-amber-400/25 ring-1 ring-amber-300 scale-[1.02]'
                  : 'text-neutral-300 hover:text-white bg-neutral-900/60 hover:bg-neutral-800/90 border border-neutral-800/80 hover:border-amber-400/40'
              }`}
            >
              <Radio className={`w-3.5 h-3.5 ${activeTab === 'site' ? 'text-neutral-950' : 'text-amber-400/80 group-hover:text-amber-300'}`} />
              <span className="font-semibold">{language === 'kn' ? 'ಲೈವ್ & ಪ್ರಕಟಣೆ' : 'Live & Alerts'}</span>
              {(siteSettings.announcementActive || siteSettings.liveStreamActive) ? (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                </span>
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
              )}
            </button>

            {/* Tab 8: Health Monitor */}
            <button
              onClick={() => handleTabChange('health')}
              className={`group inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs transition-all duration-200 cursor-pointer ${
                activeTab === 'health'
                  ? 'bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-neutral-950 font-black shadow-lg shadow-amber-400/25 ring-1 ring-amber-300 scale-[1.02]'
                  : 'text-neutral-300 hover:text-white bg-neutral-900/60 hover:bg-neutral-800/90 border border-neutral-800/80 hover:border-amber-400/40'
              }`}
            >
              <Activity className={`w-3.5 h-3.5 ${activeTab === 'health' ? 'text-neutral-950' : 'text-emerald-400 group-hover:text-emerald-300'}`} />
              <span className="font-semibold">{language === 'kn' ? 'ಸಿಸ್ಟಮ್ ಸ್ಥಿತಿ' : 'Health Monitor'}</span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* ================= MAIN CONTENT CONTAINER ================= */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* ========================================================================= */}
        {/* TAB 1: MEDIA LIBRARY */}
        {/* ========================================================================= */}
        {activeTab === 'media' && (
          <div className="space-y-6">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-[#121215] border border-neutral-800/80 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold mb-1.5">
                  <span>{language === 'kn' ? 'ಒಟ್ಟು ಮೀಡಿಯಾ' : 'Total Media'}</span>
                  <Layers className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-bold text-white tracking-tight">{mediaItems.length}</div>
                <div className="text-[11px] text-neutral-400 mt-0.5">Cloudinary + Firestore</div>
              </div>

              <div className="bg-[#121215] border border-neutral-800/80 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold mb-1.5">
                  <span>{language === 'kn' ? 'ಹೀರೋ ಲೂಪ್' : 'Hero Loops'}</span>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-bold text-amber-400 tracking-tight">{heroCount}</div>
                <div className="text-[11px] text-neutral-400 mt-0.5">{language === 'kn' ? 'ಸಕ್ರಿಯ ವೀಡಿಯೊ ಲೂಪ್‌ಗಳು' : 'Active background media'}</div>
              </div>

              <div className="bg-[#121215] border border-neutral-800/80 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold mb-1.5">
                  <span>{language === 'kn' ? '೩೫ಮಿಮಿ ರೀಲ್' : '35mm Film Reel'}</span>
                  <Film className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-white tracking-tight">{carouselCount}</div>
                <div className="text-[11px] text-neutral-400 mt-0.5">{language === 'kn' ? 'ವಿಂಟೇಜ್ ರೀಲ್ ಚೌಕಟ್ಟುಗಳು' : 'Vintage carousel frames'}</div>
              </div>

              <div className="bg-[#121215] border border-neutral-800/80 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold mb-1.5">
                  <span>{language === 'kn' ? 'ಫೋಟೋ ಗ್ಯಾಲರಿ' : 'Photo Gallery'}</span>
                  <Camera className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-white tracking-tight">{galleryCount}</div>
                <div className="text-[11px] text-neutral-400 mt-0.5">{language === 'kn' ? 'ದರ್ಶನ ಗ್ಯಾಲರಿ ಫೋಟೋಗಳು' : 'Archive gallery photos'}</div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  {language === 'kn' ? 'ಮೀಡಿಯಾ ಸಂಗ್ರಹ & ಪ್ರದರ್ಶನ ವಿಭಾಗಗಳು' : 'Media Library & Website Sections'}
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {language === 'kn'
                    ? 'ಹೀರೋ, ೩೫ಮಿಮಿ ರೀಲ್, ಗ್ಯಾಲರಿ ಮತ್ತು ಇತರ ಪುಟಗಳಲ್ಲಿ ತೋರಿಸಲಾಗುವ ಫೋಟೋ & ವಿಡಿಯೋ ನಿರ್ವಹಿಸಿ.'
                    : 'Manage photos and videos displayed across Hero, 35mm Reel, Gallery, and other sections.'}
                </p>
              </div>

              <button
                onClick={() => {
                  handleClearAllBatchFiles();
                  setUploadError(null);
                  setBatchUploadStatus(null);
                  if (filterYear !== 'all') {
                    setFormYear(parseInt(filterYear, 10));
                  } else {
                    setFormYear(2026);
                  }
                  setIsMediaUploadOpen(true);
                }}
                className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs tracking-wide transition-colors cursor-pointer shadow-md self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>
                  {language === 'kn'
                    ? (filterYear !== 'all' ? `ಫೋಟೋ / ವಿಡಿಯೋ ಸೇರಿಸಿ (${filterYear})` : 'ಫೋಟೋ / ವಿಡಿಯೋ ಸೇರಿಸಿ (Batch Upload)')
                    : (filterYear !== 'all' ? `Upload Media (${filterYear})` : 'Upload Media (Batch Upload)')}
                </span>
              </button>
            </div>

            {/* Unified Filter & Search Bar with Dropdowns (No Horizontal Scroll) */}
            <div className="bg-[#121215] border border-neutral-800/80 rounded-2xl p-4 shadow-lg space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* 1. Year Filter Dropdown */}
                <div className="space-y-1.5">
                  <label htmlFor="media-filter-year" className="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider flex items-center space-x-1">
                    <Calendar className="w-3 h-3 text-amber-400" />
                    <span>{language === 'kn' ? 'ವರ್ಷ' : 'Festival Year'}</span>
                  </label>
                  <div className="relative">
                    <select
                      id="media-filter-year"
                      value={filterYear}
                      onChange={(e) => setFilterYear(e.target.value)}
                      className="w-full appearance-none bg-neutral-900 border border-neutral-700/80 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-white pr-9 focus:outline-none focus:border-amber-400 shadow-inner cursor-pointer"
                    >
                      <option value="all">
                        {language === 'kn' ? 'ಎಲ್ಲಾ ವರ್ಷಗಳು' : 'All Festival Years'} ({mediaItems.length})
                      </option>
                      {adminFilterYears.map((yr) => {
                        const count = mediaItems.filter((m) => m.year === yr).length;
                        return (
                          <option key={yr} value={yr} className="bg-neutral-900 text-neutral-100">
                            {yr} {count > 0 ? `(${count} ${language === 'kn' ? 'ಮೀಡಿಯಾ' : 'items'})` : `(${language === 'kn' ? 'ಖಾಲಿ' : 'empty'})`}
                          </option>
                        );
                      })}
                    </select>
                    <ChevronDown className="w-4 h-4 text-amber-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* 2. Category Filter Dropdown */}
                <div className="space-y-1.5">
                  <label htmlFor="media-filter-category" className="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider flex items-center space-x-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>{language === 'kn' ? 'ವರ್ಗ (Category)' : 'Category'}</span>
                  </label>
                  <div className="relative">
                    <select
                      id="media-filter-category"
                      value={filterMediaCategory}
                      onChange={(e) => setFilterMediaCategory(e.target.value)}
                      className="w-full appearance-none bg-neutral-900 border border-neutral-700/80 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-white pr-9 focus:outline-none focus:border-amber-400 shadow-inner cursor-pointer"
                    >
                      <option value="all">
                        {language === 'kn' ? 'ಎಲ್ಲಾ ವರ್ಗಗಳು' : 'All Categories'} ({mediaItems.length})
                      </option>
                      <option value="aagamana">🚩 {language === 'kn' ? 'ಗಣಪತಿ ಆಗಮನ (ಪ್ರಾರಂಭ)' : 'Ganesh Aagamana'}</option>
                      <option value="saval">👑 {language === 'kn' ? 'ಪವಿತ್ರ ಸವಾಲ್ & ಲೇಲಾವ್' : 'Sacred Saval & Auction'}</option>
                      <option value="darshan">🪔 {language === 'kn' ? 'ಮಹಾ ದರ್ಶನ' : 'Royal Darshan'}</option>
                      <option value="aarti">🔥 {language === 'kn' ? 'ಮಹಾ ಮಂಗಳಾರತಿ' : 'Maha Aarti'}</option>
                      <option value="pandal">🏛️ {language === 'kn' ? 'ಭವ್ಯ ಮಂಟಪ' : 'Pandal & Decor'}</option>
                      <option value="visarjan">🥁 {language === 'kn' ? 'ವಿಸರ್ಜನಾ ಮೆರವಣಿಗೆ' : 'Visarjan Miravanige'}</option>
                      <option value="cultural">🎭 {language === 'kn' ? 'ಪ್ರವಚನ & ಸಾಂಸ್ಕೃತಿಕ' : 'Cultural Events'}</option>
                      <option value="seva">🙏 {language === 'kn' ? 'ಮಹಾ ಅನ್ನದಾಸೋಹ' : 'Anna Prasad Seva'}</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-amber-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* 3. Section / Placement Dropdown */}
                <div className="space-y-1.5">
                  <label htmlFor="media-filter-section" className="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider flex items-center space-x-1">
                    <Layers className="w-3 h-3 text-amber-400" />
                    <span>{language === 'kn' ? 'ವೆಬ್‌ಸೈಟ್ ವಿಭಾಗ' : 'Website Section'}</span>
                  </label>
                  <div className="relative">
                    <select
                      id="media-filter-section"
                      value={filterPlacement}
                      onChange={(e) => setFilterPlacement(e.target.value as any)}
                      className="w-full appearance-none bg-neutral-900 border border-neutral-700/80 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-white pr-9 focus:outline-none focus:border-amber-400 shadow-inner cursor-pointer"
                    >
                      <option value="all">{language === 'kn' ? 'ಎಲ್ಲಾ ವಿಭಾಗಗಳು' : 'All Sections'} ({mediaItems.length})</option>
                      <option value="hero">{language === 'kn' ? 'ಮುಖ್ಯ ಹೀರೋ ವಿಡಿಯೋ ಲೂಪ್' : 'Hero Video Loop'} ({heroCount})</option>
                      <option value="carousel">{language === 'kn' ? '೩೫ಮಿಮಿ ರೀಲ್' : '35mm Vintage Reel'} ({carouselCount})</option>
                      <option value="gallery">{language === 'kn' ? 'ದರ್ಶನ ಗ್ಯಾಲರಿ' : 'Darshan Gallery Archive'} ({galleryCount})</option>
                      <option value="history">{language === 'kn' ? 'ಹಬ್ಬದ ಇತಿಹಾಸ' : 'Festival History'} ({historyMediaCount})</option>
                      <option value="seva">{language === 'kn' ? 'ಸೇವೆ & ಸಾಧನೆಗಳು' : 'Seva & Impact'} ({sevaMediaCount})</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-amber-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* 4. Search Title */}
                <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
                  <label htmlFor="media-search-title" className="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider flex items-center space-x-1">
                    <Search className="w-3 h-3 text-amber-400" />
                    <span>{language === 'kn' ? 'ಶೀರ್ಷಿಕೆ ಹುಡುಕಿ' : 'Search Title'}</span>
                  </label>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="media-search-title"
                      type="text"
                      placeholder={language === 'kn' ? 'ಫೋಟೋ ಅಥವಾ ವಿಡಿಯೋ ಹೆಸರು ಹುಡುಕಿ...' : 'Search photo or video title...'}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700/80 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 shadow-inner"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Status and Active Filter Reset Pill */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-800/80 text-xs">
                <div className="text-neutral-300 flex items-center space-x-2 font-medium">
                  <span>{language === 'kn' ? 'ತೋರಿಸಲಾಗುತ್ತಿದೆ:' : 'Showing:'}</span>
                  <span className="font-bold text-amber-400">{filteredMedia.length}</span>
                  <span className="text-neutral-400">/ {mediaItems.length} {language === 'kn' ? 'ಮೀಡಿಯಾಗಳು' : 'media items'}</span>
                </div>

                {(filterYear !== 'all' || filterPlacement !== 'all' || filterMediaCategory !== 'all' || searchQuery.trim() !== '') && (
                  <button
                    type="button"
                    onClick={() => {
                      setFilterYear('all');
                      setFilterPlacement('all');
                      setFilterMediaCategory('all');
                      setSearchQuery('');
                    }}
                    className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5 text-red-400" />
                    <span>{language === 'kn' ? 'ಫಿಲ್ಟರ್ ತೆರವುಗೊಳಿಸಿ' : 'Reset All Filters'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Media Items Grid */}
            {mediaLoading ? (
              <div className="py-16 text-center text-neutral-400 text-xs">
                {language === 'kn' ? 'ಮೀಡಿಯಾ ಲೋಡ್ ಆಗುತ್ತಿದೆ...' : 'Loading media items...'}
              </div>
            ) : filteredMedia.length === 0 ? (
              <div className="bg-[#121215] border border-neutral-800/80 rounded-xl p-10 text-center text-neutral-400">
                <Camera className="w-8 h-8 mx-auto text-neutral-400 mb-2" />
                <p className="text-sm font-medium text-neutral-200">
                  {language === 'kn' ? 'ಯಾವುದೇ ಮೀಡಿಯಾ ಕಂಡುಬಂದಿಲ್ಲ' : 'No media items found'}
                </p>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {language === 'kn'
                    ? 'ಹೊಸ ಮೀಡಿಯಾ ಸೇರಿಸಲು ಮೇಲಿನ "+ ಫೋಟೋ / ವಿಡಿಯೋ ಸೇರಿಸಿ" ಬಟನ್ ಬಳಸಿ.'
                    : 'Click "Upload Photo / Video" to add your first item.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredMedia.map((item) => {
                  const isInHero = item.placement === 'hero' || (Array.isArray(item.placements) && item.placements.includes('hero'));
                  const isIn35mm = item.placement === 'carousel' || (Array.isArray(item.placements) && item.placements.includes('carousel'));
                  const isInGallery = item.placement === 'gallery' || (Array.isArray(item.placements) && item.placements.includes('gallery'));
                  const heroSlideIdx = heroSlideItems.findIndex((s) => s.id === item.id);

                  return (
                    <div
                      key={item.id}
                      className="bg-[#121215] border border-neutral-800/80 rounded-xl overflow-hidden flex flex-col justify-between hover:border-neutral-700 transition-colors"
                    >
                      {/* Media Thumbnail */}
                      <div className="relative aspect-video bg-black overflow-hidden flex items-center justify-center">
                        {item.mediaType === 'video' ? (
                          <video src={item.mediaUrl} className="w-full h-full object-cover" muted playsInline />
                        ) : (
                          <img src={item.mediaUrl} alt={item.titleEn} className="w-full h-full object-cover" />
                        )}

                        {/* Top Badges */}
                        <div className="absolute top-2 left-2 flex flex-wrap items-center gap-1 max-w-[80%]">
                          {/* Category Badge */}
                          {item.category && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-400 text-neutral-950 text-[9px] font-black uppercase flex items-center space-x-0.5 shadow-xs">
                              {item.category === 'aagamana' && <span>🚩 ಆಗಮನ</span>}
                              {item.category === 'saval' && <span>👑 ಸವಾಲ್</span>}
                              {item.category === 'darshan' && <span>🪔 ದರ್ಶನ</span>}
                              {item.category === 'aarti' && <span>🔥 ಆರತಿ</span>}
                              {item.category === 'pandal' && <span>🏛️ ಮಂಟಪ</span>}
                              {(item.category === 'visarjan' || (item.category as string) === 'miravanige') && <span>🥁 ವಿಸರ್ಜನೆ</span>}
                              {item.category === 'cultural' && <span>🎭 ಸಾಂಸ್ಕೃತಿಕ</span>}
                              {item.category === 'seva' && <span>🙏 ಸೇವೆ</span>}
                            </span>
                          )}

                          {/* Placements Badges */}
                          {isInHero && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-400 text-neutral-950 text-[9px] font-black uppercase flex items-center space-x-0.5 shadow-xs">
                              <Sparkles className="w-2.5 h-2.5" />
                              <span>HERO{heroSlideIdx >= 0 ? ` #${heroSlideIdx + 1}` : ''}</span>
                            </span>
                          )}
                          {isIn35mm && (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/90 text-white text-[9px] font-bold uppercase flex items-center space-x-0.5 shadow-xs">
                              <Film className="w-2.5 h-2.5" />
                              <span>35MM</span>
                            </span>
                          )}
                          {isInGallery && (
                            <span className="px-1.5 py-0.5 rounded bg-blue-500/90 text-white text-[9px] font-bold uppercase flex items-center space-x-0.5 shadow-xs">
                              <Camera className="w-2.5 h-2.5" />
                              <span>DARSHAN</span>
                            </span>
                          )}

                          {item.mediaType === 'video' && (
                            <span className="px-1.5 py-0.5 rounded bg-red-600 text-[9px] font-bold text-white flex items-center space-x-0.5">
                              <Film className="w-2.5 h-2.5" />
                              <span>VID</span>
                            </span>
                          )}
                        </div>

                        <div className="absolute top-2 right-2">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${
                            item.isActive ? 'bg-emerald-500/90 text-white' : 'bg-red-500/90 text-white'
                          }`}>
                            {item.isActive ? 'Active' : 'Hidden'}
                          </span>
                        </div>
                      </div>

                      {/* Metadata & Actions */}
                      <div className="p-3 space-y-2.5">
                        <div>
                          <h4 className="text-xs font-semibold text-white truncate">{item.titleKn}</h4>
                          <p className="text-[11px] text-neutral-400 truncate">{item.titleEn}</p>
                        </div>

                        {/* Quick Placement Toggles */}
                        <div className="pt-2 border-t border-neutral-800/80 flex items-center space-x-1.5 flex-wrap gap-y-1">
                          {/* Hero Toggle */}
                          <button
                            type="button"
                            onClick={async () => {
                              const currentPlacements: MediaPlacement[] = item.placements && item.placements.length > 0
                                ? [...item.placements]
                                : [item.placement || 'gallery'];
                              const nextPlacements: MediaPlacement[] = isInHero
                                ? currentPlacements.filter((p) => p !== 'hero')
                                : [...currentPlacements, 'hero'];
                              const finalPlacements: MediaPlacement[] = nextPlacements.length > 0 ? nextPlacements : ['gallery'];
                              await updateMediaItem(item.id, {
                                placements: finalPlacements,
                                placement: finalPlacements[0] || 'gallery',
                                ...(!isInHero ? { order: 1 } : {}),
                              });
                            }}
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer border flex items-center space-x-1 ${
                              isInHero
                                ? 'bg-amber-400 text-neutral-950 border-amber-400 font-bold shadow-xs'
                                : 'bg-neutral-900 text-neutral-400 border-neutral-700 hover:text-white'
                            }`}
                            title="Toggle display in Hero Section"
                          >
                            <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                            <span>{isInHero ? `✓ Hero${heroSlideIdx >= 0 ? ` #${heroSlideIdx + 1}` : ''}` : '+ Hero'}</span>
                          </button>

                          {/* 35mm Toggle */}
                          <button
                            type="button"
                            onClick={async () => {
                              const currentPlacements: MediaPlacement[] = item.placements && item.placements.length > 0
                                ? [...item.placements]
                                : [item.placement || 'gallery'];
                              const nextPlacements: MediaPlacement[] = isIn35mm
                                ? currentPlacements.filter((p) => p !== 'carousel')
                                : [...currentPlacements, 'carousel'];
                              const finalPlacements: MediaPlacement[] = nextPlacements.length > 0 ? nextPlacements : ['gallery'];
                              await updateMediaItem(item.id, {
                                placements: finalPlacements,
                                placement: finalPlacements[0] || 'gallery',
                              });
                            }}
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer border flex items-center space-x-1 ${
                              isIn35mm
                                ? 'bg-emerald-400/20 text-emerald-300 border-emerald-400/50'
                                : 'bg-neutral-900 text-neutral-400 border-neutral-700 hover:text-white'
                            }`}
                            title="Toggle display in 35mm Reel"
                          >
                            <Film className="w-2.5 h-2.5 text-emerald-400" />
                            <span>{isIn35mm ? '✓ 35mm' : '+ 35mm'}</span>
                          </button>

                          {/* Gallery / Darshan Toggle */}
                          <button
                            type="button"
                            onClick={async () => {
                              const currentPlacements: MediaPlacement[] = item.placements && item.placements.length > 0
                                ? [...item.placements]
                                : [item.placement || 'gallery'];
                              const nextPlacements: MediaPlacement[] = isInGallery
                                ? currentPlacements.filter((p) => p !== 'gallery')
                                : [...currentPlacements, 'gallery'];
                              const finalPlacements: MediaPlacement[] = nextPlacements.length > 0 ? nextPlacements : ['carousel'];
                              await updateMediaItem(item.id, {
                                placements: finalPlacements,
                                placement: finalPlacements[0] || 'gallery',
                              });
                            }}
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer border flex items-center space-x-1 ${
                              isInGallery
                                ? 'bg-blue-400/20 text-blue-300 border-blue-400/50'
                                : 'bg-neutral-900 text-neutral-400 border-neutral-700 hover:text-white'
                            }`}
                            title="Toggle display in Darshan Gallery"
                          >
                            <Camera className="w-2.5 h-2.5 text-blue-400" />
                            <span>{isInGallery ? '✓ Darshan' : '+ Darshan'}</span>
                          </button>
                        </div>

                        <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-xs">
                          <button
                            onClick={() => toggleMediaActive(item.id, !item.isActive)}
                            className="inline-flex items-center space-x-1 px-2 py-1 rounded-md bg-neutral-800/70 hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer text-[11px]"
                            title={item.isActive ? 'Hide on website' : 'Show on website'}
                          >
                            {item.isActive ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5 text-neutral-400" />}
                            <span>{item.isActive ? 'Active' : 'Hidden'}</span>
                          </button>

                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() =>
                                setEditingMedia({
                                  ...item,
                                  placements:
                                    item.placements && item.placements.length > 0
                                      ? item.placements
                                      : [item.placement || 'gallery'],
                                })
                              }
                              className="p-1.5 rounded-md bg-neutral-800/70 hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeletingMediaId(item.id)}
                              className="p-1.5 rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 1B: HERO SLIDER PRIORITY & SEQUENCE MANAGER */}
        {/* ========================================================================= */}
        {activeTab === 'hero_order' && (
          <div className="space-y-6">
            {/* Header Card */}
            <div className="bg-[#121215] border border-amber-400/40 rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2.5">
                  <span className="p-2 rounded-xl bg-amber-400/15 text-amber-400 border border-amber-400/30">
                    <Sparkles className="w-5 h-5" />
                  </span>
                  <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                    {language === 'kn'
                      ? 'ಹೀರೋ ಸ್ಲೈಡರ್ ಆದ್ಯತೆ & ಕ್ರಮಾಂಕ ನಿರ್ವಹಣೆ'
                      : 'Hero Slide Priority & Sequence Manager'}
                  </h2>
                </div>
                <p className="text-xs text-neutral-300 max-w-3xl leading-relaxed">
                  {language === 'kn'
                    ? 'ಮುಖ್ಯ ಪುಟದ (Hero Section) ವಿಡಿಯೋ ಮತ್ತು ಫೋಟೋಗಳು ಯಾವ ಕ್ರಮದಲ್ಲಿ (ಸ್ಲೈಡ್ ೧, ೨, ೩...) ಕಾಣಿಸಬೇಕೆಂದು ಇಲ್ಲಿ ಹೊಂದಿಸಿ. ಬಾಣದ ಗುರುತುಗಳಿಂದ ಸ್ಥಾನ ಬದಲಾಯಿಸಿ ಅಥವಾ ನೇರವಾಗಿ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ.'
                    : 'Configure the exact playback sequence (Slide #1, #2, #3...) for photos & videos in the homepage Hero top section. Use arrow controls or type slide ranks directly.'}
                </p>
              </div>

              <div className="flex items-center flex-wrap gap-2.5 shrink-0">
                {isSavingHeroOrder && (
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs font-mono font-bold animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    <span>{language === 'kn' ? 'ಆದ್ಯತೆ ಉಳಿಸಲಾಗುತ್ತಿದೆ...' : 'Saving Priority...'}</span>
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleRenumberAllHeroSlides}
                  disabled={isSavingHeroOrder}
                  className="inline-flex items-center space-x-2 px-3.5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-xs font-bold text-white transition-colors cursor-pointer disabled:opacity-50"
                  title={language === 'kn' ? 'ಎಲ್ಲಾ ಸ್ಲೈಡ್‌ಗಳನ್ನು 1, 2, 3... ಎಂದು ಕ್ರಮಬದ್ಧಗೊಳಿಸಿ' : 'Re-sequence all slides sequentially'}
                >
                  <Sliders className="w-4 h-4 text-amber-400" />
                  <span>{language === 'kn' ? 'ಸ್ಲೈಡ್ ಸಂಖ್ಯೆ ಕ್ರಮಬದ್ಧಗೊಳಿಸಿ (1..N)' : 'Re-index 1 to N'}</span>
                </button>

                <Link
                  to="/"
                  target="_blank"
                  className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs tracking-wide transition-colors cursor-pointer shadow-md"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>{language === 'kn' ? 'ಹೀರೋ ಲೈವ್ ವೀಕ್ಷಿಸಿ' : 'Preview Hero'}</span>
                </Link>
              </div>
            </div>

            {/* Quick Add Media To Hero Bar */}
            <div className="bg-[#121215] border border-neutral-800/80 rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-2 text-xs font-bold text-neutral-300">
                <Plus className="w-4 h-4 text-amber-400" />
                <span>{language === 'kn' ? 'ಮೀಡಿಯಾ ಲೈಬ್ರರಿಯಿಂದ ಹೀರೋಗೆ ಸೇರಿಸಿ:' : 'Add from Media Library to Hero:'}</span>
              </div>
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <select
                  id="add-media-to-hero-select"
                  aria-label={language === 'kn' ? 'ಹೀರೋಗೆ ಸೇರಿಸಲು ಫೋಟೋ/ವಿಡಿಯೋ ಆಯ್ಕೆಮಾಡಿ' : 'Select media item to add to hero'}
                  defaultValue=""
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAddMediaToHero(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="w-full sm:w-80 bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  <option value="" disabled>
                    {language === 'kn' ? '-- ಹೀರೋಗೆ ಸೇರಿಸಲು ಫೋಟೋ/ವಿಡಿಯೋ ಆಯ್ಕೆಮಾಡಿ --' : '-- Choose media to add to hero slider --'}
                  </option>
                  {mediaItems
                    .filter((m) => m.placement !== 'hero' && (!m.placements || !m.placements.includes('hero')))
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.titleKn || m.titleEn} ({m.mediaType.toUpperCase()} - {m.year})
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Slides List */}
            {heroSlideItems.length === 0 ? (
              <div className="bg-[#121215] border border-neutral-800/80 rounded-2xl p-12 text-center text-neutral-400 space-y-3">
                <Sparkles className="w-10 h-10 mx-auto text-amber-400/50" />
                <h3 className="text-base font-bold text-white">
                  {language === 'kn' ? 'ಹೀರೋ ಸ್ಲೈಡರ್‌ನಲ್ಲಿ ಯಾವುದೇ ಐಟಂ ಇಲ್ಲ' : 'No Slides in Hero Slider'}
                </h3>
                <p className="text-xs text-neutral-400 max-w-md mx-auto">
                  {language === 'kn'
                    ? 'ಮೀಡಿಯಾ ಸಂಗ್ರಹ, ಹಬ್ಬದ ಇತಿಹಾಸ ಅಥವಾ ಸೇವಾ ವಿವರಗಳಲ್ಲಿ "ಹೀರೋ ಸ್ಲೈಡರ್‌ನಲ್ಲಿ ತೋರಿಸಿ" ಆಯ್ಕೆಯನ್ನು ಸಕ್ರಿಯಗೊಳಿಸಿ.'
                    : 'Mark media items, festival history milestones, or seva initiatives as "Show in Hero Slider" to sequence them here.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-xs font-semibold text-neutral-400 flex items-center justify-between px-1">
                  <span>
                    {language === 'kn' ? 'ಸಕ್ರಿಯ ಸ್ಲೈಡ್‌ಗಳು:' : 'Active Hero Slides:'}{' '}
                    <strong className="text-amber-400">{heroSlideItems.length}</strong>
                  </span>
                  <span className="text-[11px] text-neutral-500">
                    {language === 'kn'
                      ? 'ಮೊದಲನೆಯದು ಮೊದಲು ಪ್ರದರ್ಶನಗೊಳ್ಳುತ್ತದೆ (ಸ್ಲೈಡ್ #1)'
                      : 'Plays in order: Slide #1 starts first'}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {heroSlideItems.map((item, index) => (
                    <div
                      key={`${item.source}-${item.id}`}
                      className="bg-[#121215] border border-neutral-800/90 hover:border-amber-400/50 rounded-2xl p-3.5 sm:p-4.5 transition-all shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      {/* Left: Sequence Rank Badge + Thumbnail + Details */}
                      <div className="flex items-center space-x-3.5 sm:space-x-4 min-w-0 flex-1">
                        {/* Slide Sequence Number Pill */}
                        <div className="w-12 h-12 rounded-2xl bg-amber-400/15 border-2 border-amber-400 flex flex-col items-center justify-center shrink-0 shadow-md">
                          <span className="text-[9px] uppercase font-bold text-amber-400 leading-none">SLIDE</span>
                          <span className="text-base font-black text-white leading-none mt-0.5">#{index + 1}</span>
                        </div>

                        {/* Thumbnail */}
                        <div className="w-20 h-16 sm:w-24 sm:h-18 rounded-xl bg-neutral-900 border border-neutral-700/80 overflow-hidden shrink-0 relative flex items-center justify-center">
                          {item.mediaType === 'video' ? (
                            <div className="w-full h-full relative">
                              <video
                                src={item.mediaUrl}
                                className="w-full h-full object-cover"
                                muted
                                playsInline
                                preload="metadata"
                              />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <Film className="w-5 h-5 text-amber-400" />
                              </div>
                            </div>
                          ) : item.mediaUrl ? (
                            <img
                              src={item.mediaUrl}
                              alt={item.titleEn}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <Camera className="w-5 h-5 text-neutral-600" />
                          )}
                          <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-black/80 text-white uppercase">
                            {item.mediaType}
                          </span>
                        </div>

                        {/* Text info */}
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                item.source === 'media'
                                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                  : item.source === 'history'
                                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                  : item.source === 'achievement'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              }`}
                            >
                              {item.source === 'media'
                                ? '📷 ಮೀಡಿಯಾ / Media'
                                : item.source === 'history'
                                ? '📜 ಇತಿಹಾಸ / History'
                                : item.source === 'achievement'
                                ? '🙏 ಸೇವೆ / Seva'
                                : '🏆 ಕಾರ್ಯಕ್ರಮ / Activity'}
                            </span>
                            {item.year && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-neutral-800 text-neutral-300">
                                {item.year}
                              </span>
                            )}
                          </div>

                          <h4 className="text-sm font-bold text-white truncate">
                            {language === 'kn' ? (item.titleKn || item.titleEn) : (item.titleEn || item.titleKn)}
                          </h4>
                          {item.extraInfo && (
                            <p className="text-[11px] text-neutral-400 truncate">
                              {item.extraInfo}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: Order Controller & Actions */}
                      <div className="flex items-center justify-between sm:justify-end space-x-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-800/80 shrink-0">
                        {/* Direct Order Input */}
                        <div className="flex items-center space-x-1.5">
                          <label htmlFor={`order-input-${item.id}`} className="text-[11px] font-bold text-neutral-400 uppercase">
                            {language === 'kn' ? 'ಕ್ರಮ:' : 'Rank:'}
                          </label>
                          <input
                            id={`order-input-${item.id}`}
                            type="number"
                            min="1"
                            max={heroSlideItems.length}
                            defaultValue={index + 1}
                            key={`${item.id}-${index + 1}`}
                            disabled={isSavingHeroOrder}
                            onBlur={(e) => {
                              const val = parseInt(e.target.value, 10);
                              if (!isNaN(val) && val !== index + 1) {
                                handleReorderHeroSlide(index, val);
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const val = parseInt((e.target as HTMLInputElement).value, 10);
                                if (!isNaN(val)) {
                                  handleReorderHeroSlide(index, val);
                                  (e.target as HTMLInputElement).blur();
                                }
                              }
                            }}
                            className={`w-14 px-2 py-1.5 rounded-lg bg-neutral-900 border text-center text-xs font-mono font-bold transition-all shadow-inner disabled:opacity-50 ${
                              heroOrderSuccessId === item.id
                                ? 'border-emerald-400 text-emerald-400 ring-2 ring-emerald-400/40 bg-emerald-950/40'
                                : 'border-neutral-700 text-amber-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400'
                            }`}
                          />
                          <button
                            type="button"
                            disabled={isSavingHeroOrder}
                            onClick={() => {
                              const inputEl = document.getElementById(`order-input-${item.id}`) as HTMLInputElement | null;
                              if (inputEl) {
                                const val = parseInt(inputEl.value, 10);
                                if (!isNaN(val)) {
                                  handleReorderHeroSlide(index, val);
                                  inputEl.blur();
                                }
                              }
                            }}
                            title={language === 'kn' ? 'ಆದ್ಯತೆ ಅನ್ವಯಿಸಿ (Enter)' : 'Apply Rank (Click or Enter)'}
                            className="px-2 py-1.5 rounded-lg bg-amber-400/15 hover:bg-amber-400/30 text-amber-300 border border-amber-400/30 text-[10px] font-mono font-bold cursor-pointer transition-colors active:scale-95 disabled:opacity-40"
                          >
                            ↵
                          </button>
                        </div>

                        {/* Move Up */}
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMoveSlideUp(index)}
                          title={language === 'kn' ? 'ಮೇಲಕ್ಕೆ ಸರಿಸಿ' : 'Move Up'}
                          className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white disabled:opacity-30 disabled:hover:bg-neutral-800 cursor-pointer transition-colors"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>

                        {/* Move Down */}
                        <button
                          type="button"
                          disabled={index === heroSlideItems.length - 1}
                          onClick={() => handleMoveSlideDown(index)}
                          title={language === 'kn' ? 'ಕೆಳಕ್ಕೆ ಸರಿಸಿ' : 'Move Down'}
                          className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white disabled:opacity-30 disabled:hover:bg-neutral-800 cursor-pointer transition-colors"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>

                        {/* Remove from Hero */}
                        <button
                          type="button"
                          onClick={() => handleRemoveFromHero(item)}
                          title={language === 'kn' ? 'ಹೀರೋ ಸ್ಲೈಡರ್‌ನಿಂದ ತೆಗೆದುಹಾಕಿ' : 'Remove from Hero Slider'}
                          className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 1C: COMMUNITY & EXTRA-CURRICULAR EVENTS */}
        {/* ========================================================================= */}
        {activeTab === 'events' && (
          <div className="space-y-6">
            {/* Header with Add Button */}
            <div className="bg-[#121215] border border-amber-400/40 rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2.5">
                  <span className="p-2 rounded-xl bg-amber-400/15 text-amber-400 border border-amber-400/30">
                    <Trophy className="w-5 h-5" />
                  </span>
                  <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                    {language === 'kn'
                      ? 'ಇತರ ಕಾರ್ಯಕ್ರಮಗಳು & ಯುವ ಚಟುವಟಿಕೆಗಳು'
                      : 'Extra-Curricular & Community Events'}
                  </h2>
                </div>
                <p className="text-xs text-neutral-300 max-w-2xl leading-relaxed">
                  {language === 'kn'
                    ? 'ಕ್ರಿಕೆಟ್ ಪಂದ್ಯಾವಳಿಗಳು, ಉಚಿತ ರಕ್ತದಾನ & ಆರೋಗ್ಯ ತಪಾಸಣೆ, ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ನೋಟ್‌ಬುಕ್ ವಿತರಣೆ, ಕನ್ನಡ ರಾಜ್ಯೋತ್ಸವ ಮುಂತಾದ ಸಾರ್ವಜನಿಕ ಸೇವಾ ಕಾರ್ಯಕ್ರಮಗಳನ್ನು ಇಲ್ಲಿ ದಾಖಲಿಸಿ.'
                    : 'Manage youth sports tournaments, blood donation camps, student notebook distribution, Rajyotsava celebrations, and social outreach initiatives.'}
                </p>
              </div>

              <div className="flex items-center space-x-3 shrink-0">
                <Link
                  to="/events"
                  target="_blank"
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white border border-neutral-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4 text-amber-400" />
                  <span>{language === 'kn' ? 'ಪುಟ ವೀಕ್ಷಿಸಿ' : 'View Page'}</span>
                </Link>

                <button
                  type="button"
                  onClick={openEventAddModal}
                  className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs tracking-wide transition-colors cursor-pointer shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>{language === 'kn' ? 'ಹೊಸ ಕಾರ್ಯಕ್ರಮ ಸೇರಿಸಿ' : 'Add New Event'}</span>
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-[#121215] border border-neutral-800/80 rounded-2xl p-4 shadow-lg space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* Year dropdown */}
                <div className="space-y-1.5">
                  <label htmlFor="event-filter-year" className="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider flex items-center space-x-1">
                    <Calendar className="w-3 h-3 text-amber-400" />
                    <span>{language === 'kn' ? 'ವರ್ಷ' : 'Year'}</span>
                  </label>
                  <div className="relative">
                    <select
                      id="event-filter-year"
                      value={eventYearFilter}
                      onChange={(e) => setEventYearFilter(e.target.value === 'all' ? 'all' : parseInt(e.target.value, 10))}
                      className="w-full appearance-none bg-neutral-900 border border-neutral-700/80 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-white pr-9 focus:outline-none focus:border-amber-400 cursor-pointer"
                    >
                      <option value="all">{language === 'kn' ? 'ಎಲ್ಲಾ ವರ್ಷಗಳು' : 'All Years'} ({events.length})</option>
                      {[2028, 2027, 2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019].map((yr) => {
                        const count = events.filter((e) => e.year === yr).length;
                        return (
                          <option key={yr} value={yr}>
                            {yr} ({count} {language === 'kn' ? 'ಕಾರ್ಯಕ್ರಮಗಳು' : 'events'})
                          </option>
                        );
                      })}
                    </select>
                    <ChevronDown className="w-4 h-4 text-amber-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Category dropdown */}
                <div className="space-y-1.5">
                  <label htmlFor="event-filter-category" className="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider flex items-center space-x-1">
                    <Layers className="w-3 h-3 text-amber-400" />
                    <span>{language === 'kn' ? 'ವರ್ಗ' : 'Category'}</span>
                  </label>
                  <div className="relative">
                    <select
                      id="event-filter-category"
                      value={eventCategoryFilter}
                      onChange={(e) => setEventCategoryFilter(e.target.value)}
                      className="w-full appearance-none bg-neutral-900 border border-neutral-700/80 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-white pr-9 focus:outline-none focus:border-amber-400 cursor-pointer"
                    >
                      <option value="all">{language === 'kn' ? 'ಎಲ್ಲಾ ವರ್ಗಗಳು' : 'All Categories'} ({events.length})</option>
                      <option value="sports">🏏 {language === 'kn' ? 'ಕ್ರೀಡೆ / Sports' : 'Sports'}</option>
                      <option value="health">🩺 {language === 'kn' ? 'ಆರೋಗ್ಯ & ರಕ್ತದಾನ / Health' : 'Health'}</option>
                      <option value="education">📚 {language === 'kn' ? 'ಶಿಕ್ಷಣ ಸೇವೆ / Education' : 'Education'}</option>
                      <option value="social">🤝 {language === 'kn' ? 'ಸಮಾಜ ಸೇವೆ / Social' : 'Social'}</option>
                      <option value="cultural">🎭 {language === 'kn' ? 'ಸಾಂಸ್ಕೃತಿಕ / Cultural' : 'Cultural'}</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-amber-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Search */}
                <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
                  <label htmlFor="event-search-title" className="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider flex items-center space-x-1">
                    <Search className="w-3 h-3 text-amber-400" />
                    <span>{language === 'kn' ? 'ಕಾರ್ಯಕ್ರಮ ಹುಡುಕಿ' : 'Search Event'}</span>
                  </label>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="event-search-title"
                      type="text"
                      placeholder={language === 'kn' ? 'ಕಾರ್ಯಕ್ರಮದ ಹೆಸರು ಅಥವಾ ಸ್ಥಳ ಹುಡುಕಿ...' : 'Search by event title or location...'}
                      value={eventSearchQuery}
                      onChange={(e) => setEventSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700/80 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 shadow-inner"
                    />
                    {eventSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setEventSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Status and count */}
              <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80 text-xs">
                <span className="text-neutral-300 font-medium">
                  {language === 'kn' ? 'ತೋರಿಸಲಾಗುತ್ತಿದೆ:' : 'Showing:'}{' '}
                  <strong className="text-amber-400">{filteredEvents.length}</strong> / {events.length} {language === 'kn' ? 'ಕಾರ್ಯಕ್ರಮಗಳು' : 'events'}
                </span>
                {(eventCategoryFilter !== 'all' || eventYearFilter !== 'all' || eventSearchQuery) && (
                  <button
                    type="button"
                    onClick={() => {
                      setEventCategoryFilter('all');
                      setEventYearFilter('all');
                      setEventSearchQuery('');
                    }}
                    className="inline-flex items-center space-x-1 text-xs text-amber-400 hover:text-amber-300 cursor-pointer font-semibold"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>{language === 'kn' ? 'ಫಿಲ್ಟರ್ ತೆರವುಗೊಳಿಸಿ' : 'Clear Filters'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Event List Cards */}
            {eventsLoading ? (
              <div className="py-16 text-center text-neutral-400 text-xs">
                {language === 'kn' ? 'ಕಾರ್ಯಕ್ರಮಗಳು ಲೋಡ್ ಆಗುತ್ತಿವೆ...' : 'Loading community events...'}
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="bg-[#121215] border border-neutral-800/80 rounded-2xl p-12 text-center text-neutral-400 space-y-3">
                <Trophy className="w-10 h-10 mx-auto text-amber-400/50" />
                <h3 className="text-base font-bold text-white">
                  {language === 'kn' ? 'ಯಾವುದೇ ಕಾರ್ಯಕ್ರಮಗಳು ಕಂಡುಬಂದಿಲ್ಲ' : 'No Events Found'}
                </h3>
                <p className="text-xs text-neutral-400 max-w-md mx-auto">
                  {language === 'kn'
                    ? 'ಹೊಸ ಕಾರ್ಯಕ್ರಮ ಸೇರಿಸಲು ಮೇಲಿನ "ಹೊಸ ಕಾರ್ಯಕ್ರಮ ಸೇರಿಸಿ" ಬಟನ್ ಒತ್ತಿರಿ.'
                    : 'Click "Add New Event" above to record community outreach activities.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredEvents.map((ev) => {
                  const evHeroMediaCount = ev.galleryMedia && ev.galleryMedia.length > 0
                    ? ev.galleryMedia.filter((m) => m.showInHero).length
                    : (ev.showInHero ? 1 : 0);
                  const isEvInHero = evHeroMediaCount > 0 || Boolean(ev.showInHero);
                  const isEvIn35mm = Boolean(ev.showIn35mm);
                  const isEvInGallery = Boolean(ev.showInGallery);

                  return (
                    <div
                      key={ev.id}
                      className="bg-[#121215] border border-neutral-800/80 hover:border-amber-400/50 rounded-2xl overflow-hidden shadow-lg transition-all flex flex-col justify-between group"
                    >
                      {/* Media / Header banner */}
                      <div className="relative h-44 bg-neutral-900 border-b border-neutral-800 overflow-hidden">
                        {ev.mediaUrl ? (
                          ev.mediaType === 'video' ? (
                            <div className="w-full h-full relative">
                              <video
                                src={ev.mediaUrl}
                                className="w-full h-full object-cover"
                                muted
                                playsInline
                              />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <Film className="w-8 h-8 text-amber-400" />
                              </div>
                            </div>
                          ) : (
                            <img
                              src={ev.mediaUrl}
                              alt={ev.titleEn}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              loading="lazy"
                            />
                          )
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-amber-400/10 to-neutral-900 text-amber-400">
                            <Trophy className="w-10 h-10 mb-1 opacity-80" />
                            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">CYM Seva</span>
                          </div>
                        )}

                        {/* Category & Section Badges */}
                        <div className="absolute top-3 left-3 flex items-center space-x-1.5 flex-wrap gap-y-1">
                          <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-black/80 backdrop-blur-md text-amber-400 border border-amber-400/40">
                            {ev.category}
                          </span>
                          {isEvInHero && (
                            <span className="px-2 py-0.5 rounded bg-amber-400 text-neutral-950 font-black text-[9px] uppercase tracking-wider flex items-center space-x-0.5 shadow-xs">
                              <Sparkles className="w-2.5 h-2.5" />
                              <span>HERO{evHeroMediaCount > 1 ? ` (${evHeroMediaCount})` : ''}</span>
                            </span>
                          )}
                          {isEvIn35mm && (
                            <span className="px-2 py-0.5 rounded bg-emerald-400/30 border border-emerald-400/60 text-emerald-200 font-mono font-bold text-[9px] uppercase flex items-center space-x-0.5">
                              <Film className="w-2.5 h-2.5 text-emerald-300" />
                              <span>35MM</span>
                            </span>
                          )}
                          {isEvInGallery && (
                            <span className="px-2 py-0.5 rounded bg-blue-400/30 border border-blue-400/60 text-blue-200 font-mono font-bold text-[9px] uppercase flex items-center space-x-0.5">
                              <Camera className="w-2.5 h-2.5 text-blue-300" />
                              <span>GALLERY</span>
                            </span>
                          )}
                        </div>

                        {/* Active status pill */}
                        <div className="absolute top-3 right-3 flex items-center space-x-1.5">
                          {ev.galleryMedia && ev.galleryMedia.length > 1 && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 backdrop-blur-md">
                              📷 {ev.galleryMedia.length}
                            </span>
                          )}
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              ev.isActive !== false
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-red-500/20 text-red-300 border border-red-500/30'
                            }`}
                          >
                            {ev.isActive !== false ? 'Active' : 'Hidden'}
                          </span>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                        <div className="space-y-2">
                          {/* Date and Location */}
                          <div className="flex items-center justify-between text-[11px] text-neutral-400 font-medium">
                            <span className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3 text-amber-400" />
                              <span>{ev.eventDate}</span>
                            </span>
                            {(ev.locationKn || ev.locationEn) && (
                              <span className="flex items-center space-x-1 truncate max-w-[140px]">
                                <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                                <span className="truncate">{language === 'kn' ? (ev.locationKn || ev.locationEn) : (ev.locationEn || ev.locationKn)}</span>
                              </span>
                            )}
                          </div>

                          {/* Title */}
                          <h4 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                            {language === 'kn' ? ev.titleKn : ev.titleEn}
                          </h4>
                          <p className="text-xs text-neutral-300 line-clamp-2 leading-relaxed">
                            {language === 'kn' ? ev.descriptionKn : ev.descriptionEn}
                          </p>

                          {/* Highlights snippet */}
                          {((language === 'kn' ? ev.highlightsKn : ev.highlightsEn) || []).length > 0 && (
                            <div className="space-y-1 pt-1 border-t border-neutral-800/80">
                              {((language === 'kn' ? ev.highlightsKn : ev.highlightsEn) || []).slice(0, 2).map((h, i) => (
                                <div key={i} className="text-[11px] text-neutral-400 flex items-start space-x-1.5">
                                  <span className="text-amber-400 mt-0.5">•</span>
                                  <span className="line-clamp-1">{h}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Multi-media preview strip if multiple files with interactive Hero toggle */}
                          {ev.galleryMedia && ev.galleryMedia.length > 1 && (
                            <div className="space-y-1.5 pt-2 border-t border-neutral-800/80">
                              <div className="flex items-center justify-between text-[11px] font-mono text-amber-300">
                                <span>📷 {ev.galleryMedia.length} {language === 'kn' ? 'ಮೀಡಿಯಾ ಫೈಲ್‌ಗಳು' : 'Media Files'}</span>
                                <span className="text-amber-400 font-bold">
                                  {ev.galleryMedia.filter((m) => m.showInHero).length} in Hero
                                </span>
                              </div>
                              <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-0.5">
                                {ev.galleryMedia.map((m, mIdx) => (
                                  <div
                                    key={mIdx}
                                    className={`relative w-12 h-10 rounded-lg overflow-hidden bg-black shrink-0 border ${
                                      m.showInHero ? 'border-amber-400 ring-1 ring-amber-400/50' : 'border-neutral-800'
                                    }`}
                                  >
                                    {m.type === 'video' ? (
                                      <video src={m.url} className="w-full h-full object-cover pointer-events-none" muted />
                                    ) : (
                                      <img src={m.url} alt="" className="w-full h-full object-cover" />
                                    )}
                                    <button
                                      type="button"
                                      onClick={async () => {
                                        if (!ev.galleryMedia) return;
                                        const updated = ev.galleryMedia.map((it, i) =>
                                          i === mIdx ? { ...it, showInHero: !it.showInHero } : it
                                        );
                                        const anyHero = updated.some((it) => it.showInHero);
                                        await updateEvent(ev.id, {
                                          galleryMedia: updated,
                                          showInHero: anyHero,
                                        });
                                      }}
                                      className={`absolute inset-0 flex items-center justify-center text-[10px] font-black transition-all cursor-pointer ${
                                        m.showInHero
                                          ? 'bg-amber-400/85 text-neutral-950 font-bold'
                                          : 'bg-black/60 opacity-60 hover:opacity-100 text-white hover:bg-amber-400 hover:text-neutral-950'
                                      }`}
                                      title={m.showInHero ? 'Featured in Hero (Click to remove)' : 'Click to feature in Hero'}
                                    >
                                      {m.showInHero ? '⭐' : '+⭐'}
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Card Footer Actions */}
                        <div className="mt-3 pt-2.5 border-t border-neutral-800/80 flex items-center justify-between flex-wrap gap-2 text-xs">
                          {/* Order info */}
                          <div className="text-[11px] font-mono text-neutral-500">
                            #{ev.order ?? 1}
                          </div>

                          {/* Cross-Section Toggles */}
                          <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                            {/* Hero Toggle */}
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  if (isEvInHero) {
                                    const updatedGallery = (ev.galleryMedia || []).map((m) => ({ ...m, showInHero: false }));
                                    await updateEvent(ev.id, {
                                      showInHero: false,
                                      ...(ev.galleryMedia && ev.galleryMedia.length > 0 ? { galleryMedia: updatedGallery } : {}),
                                    });
                                  } else {
                                    let updatedGallery = ev.galleryMedia;
                                    if (updatedGallery && updatedGallery.length > 0) {
                                      const hasHero = updatedGallery.some((m) => m.showInHero);
                                      if (!hasHero) {
                                        updatedGallery = updatedGallery.map((m, idx) => (idx === 0 ? { ...m, showInHero: true } : m));
                                      }
                                    }
                                    await updateEvent(ev.id, {
                                      showInHero: true,
                                      ...(updatedGallery && updatedGallery.length > 0 ? { galleryMedia: updatedGallery } : {}),
                                    });
                                  }
                                } catch (err) {
                                  console.error('Failed to toggle event hero:', err);
                                }
                              }}
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer border flex items-center space-x-1 ${
                                isEvInHero
                                  ? 'bg-amber-400 text-neutral-950 border-amber-400 font-bold shadow-xs'
                                  : 'bg-neutral-900 text-neutral-400 border-neutral-700 hover:text-white'
                              }`}
                              title="Toggle display in Hero Section"
                            >
                              <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                              <span>{isEvInHero ? `✓ Hero${evHeroMediaCount > 1 ? ` (${evHeroMediaCount})` : ''}` : '+ Hero'}</span>
                            </button>

                            {/* 35mm Toggle */}
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  await updateEvent(ev.id, { showIn35mm: !ev.showIn35mm });
                                } catch (err) {
                                  console.error('Failed to toggle event 35mm:', err);
                                }
                              }}
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer border flex items-center space-x-1 ${
                                isEvIn35mm
                                  ? 'bg-emerald-400/20 text-emerald-300 border-emerald-400/50'
                                  : 'bg-neutral-900 text-neutral-400 border-neutral-700 hover:text-white'
                              }`}
                              title="Toggle display in 35mm Reel"
                            >
                              <Film className="w-2.5 h-2.5 text-emerald-400" />
                              <span>{isEvIn35mm ? '✓ 35mm' : '+ 35mm'}</span>
                            </button>

                            {/* Gallery Toggle */}
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  await updateEvent(ev.id, { showInGallery: !ev.showInGallery });
                                } catch (err) {
                                  console.error('Failed to toggle event gallery:', err);
                                }
                              }}
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer border flex items-center space-x-1 ${
                                isEvInGallery
                                  ? 'bg-blue-400/20 text-blue-300 border-blue-400/50'
                                  : 'bg-neutral-900 text-neutral-400 border-neutral-700 hover:text-white'
                              }`}
                              title="Toggle display in Darshan Gallery"
                            >
                              <Camera className="w-2.5 h-2.5 text-blue-400" />
                              <span>{isEvInGallery ? '✓ Gallery' : '+ Gallery'}</span>
                            </button>
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={() => updateEvent(ev.id, { isActive: !(ev.isActive !== false) })}
                              title={ev.isActive !== false ? 'Hide from public' : 'Show to public'}
                              className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                            >
                              {ev.isActive !== false ? <Eye className="w-4 h-4 text-emerald-400" /> : <EyeOff className="w-4 h-4 text-neutral-500" />}
                            </button>

                            <button
                              type="button"
                              onClick={() => openEventEditModal(ev)}
                              title={language === 'kn' ? 'ಸಂಪಾದಿಸಿ' : 'Edit'}
                              className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-4 h-4 text-amber-400" />
                            </button>

                            <button
                              type="button"
                              onClick={() => setDeletingEventId(ev.id)}
                              title={language === 'kn' ? 'ಅಳಿಸಿ' : 'Delete'}
                              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: COMMITTEE MEMBERS */}
        {/* ========================================================================= */}
        {activeTab === 'committee' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  {language === 'kn' ? 'ಸಮಿತಿ ಪದಾಧಿಕಾರಿಗಳ ನಿರ್ದೇಶಿಕೆ' : 'Committee Leadership Directory'}
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {language === 'kn'
                    ? 'ಯುವ ನಾಯಕರು, ಪದಾಧಿಕಾರಿಗಳು ಹಾಗೂ ಸ್ವಯಂಸೇವಕರ ಪಟ್ಟಿ ನಿರ್ವಹಿಸಿ (/committee).'
                    : 'Manage leaders, office bearers, and volunteers displayed on /committee.'}
                </p>
              </div>

              <button
                onClick={openMemberAddModal}
                className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs tracking-wide transition-colors cursor-pointer shadow-md self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>{language === 'kn' ? 'ಸದಸ್ಯರನ್ನು ಸೇರಿಸಿ' : 'Add Committee Member'}</span>
              </button>
            </div>

            {committeeLoading ? (
              <div className="py-16 text-center text-neutral-400 text-xs">
                {language === 'kn' ? 'ಸಮಿತಿ ಪಟ್ಟಿ ಲೋಡ್ ಆಗುತ್ತಿದೆ...' : 'Loading committee directory...'}
              </div>
            ) : committeeMembers.length === 0 ? (
              <div className="bg-[#121215] border border-neutral-800/80 rounded-2xl p-10 text-center text-neutral-400">
                <Users className="w-8 h-8 mx-auto text-neutral-400 mb-2" />
                <p className="text-sm font-semibold text-neutral-200">
                  {language === 'kn' ? 'ಸಮಿತಿ ಪಟ್ಟಿ ಖಾಲಿಯಾಗಿದೆ' : 'Committee directory is currently empty'}
                </p>
                <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
                  {language === 'kn'
                    ? 'ಹೊಸ ಸದಸ್ಯರನ್ನು ಸೇರಿಸಲು "ಸದಸ್ಯರನ್ನು ಸೇರಿಸಿ" ಬಟನ್ ಒತ್ತಿರಿ.'
                    : 'Click "Add Committee Member" to add leaders to the directory.'}
                </p>
                <button
                  onClick={openMemberAddModal}
                  className="mt-3.5 inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-amber-400 text-neutral-950 font-bold text-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{language === 'kn' ? 'ಮೊದಲ ಸದಸ್ಯರನ್ನು ಸೇರಿಸಿ' : 'Add First Member'}</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {sortedCommitteeMembers.map((member, index) => (
                  <div
                    key={member.id}
                    className="bg-[#121215] border border-neutral-800/80 rounded-xl p-4 flex flex-col justify-between hover:border-amber-400/50 transition-colors shadow-md"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          {/* Priority Rank Badge */}
                          <div className="w-9 h-9 rounded-xl bg-amber-400/15 border border-amber-400/60 flex flex-col items-center justify-center shrink-0">
                            <span className="text-[8px] font-bold text-amber-400 leading-none">RANK</span>
                            <span className="text-xs font-black text-white leading-none mt-0.5">#{index + 1}</span>
                          </div>

                          {member.photoUrl ? (
                            <img
                              src={member.photoUrl}
                              alt={member.nameEn}
                              className="w-10 h-10 rounded-full object-cover border border-amber-400/50 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400 shrink-0">
                              <Users className="w-5 h-5" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-white truncate">{member.nameKn}</h4>
                            <p className="text-xs text-neutral-400 font-sans truncate">{member.nameEn}</p>
                          </div>
                        </div>

                        {member.isFounding && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-400/10 border border-amber-400/25 text-[10px] font-semibold text-amber-400 shrink-0">
                            Est. 2019
                          </span>
                        )}
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-neutral-800/80 flex items-center justify-between text-xs">
                        <span className="font-semibold text-amber-400 truncate max-w-[200px]">{member.roleKn} ({member.roleEn})</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-neutral-800/80 flex items-center justify-between text-xs gap-2">
                      {/* Priority Controls */}
                      <div className="flex items-center space-x-1">
                        <label htmlFor={`member-order-${member.id}`} className="text-[10px] font-mono font-bold text-neutral-400">
                          {language === 'kn' ? 'ಕ್ರಮ:' : 'Rank:'}
                        </label>
                        <input
                          id={`member-order-${member.id}`}
                          type="number"
                          min="1"
                          max={sortedCommitteeMembers.length}
                          defaultValue={index + 1}
                          key={`${member.id}-${index + 1}`}
                          onBlur={(e) => {
                            const val = parseInt(e.target.value, 10);
                            if (!isNaN(val) && val !== index + 1) {
                              handleReorderCommitteeMember(index, val);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const val = parseInt((e.target as HTMLInputElement).value, 10);
                              if (!isNaN(val)) {
                                handleReorderCommitteeMember(index, val);
                                (e.target as HTMLInputElement).blur();
                              }
                            }
                          }}
                          className="w-12 px-1.5 py-1 rounded-lg bg-neutral-900 border border-neutral-700 text-center text-xs font-mono font-bold text-amber-400 focus:outline-none focus:border-amber-400 shadow-inner"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const inputEl = document.getElementById(`member-order-${member.id}`) as HTMLInputElement | null;
                            if (inputEl) {
                              const val = parseInt(inputEl.value, 10);
                              if (!isNaN(val)) {
                                handleReorderCommitteeMember(index, val);
                                inputEl.blur();
                              }
                            }
                          }}
                          title={language === 'kn' ? 'ಆದ್ಯತೆ ಅನ್ವಯಿಸಿ (Enter)' : 'Apply Rank (Enter)'}
                          className="px-1.5 py-1 rounded-lg bg-amber-400/15 hover:bg-amber-400/30 text-amber-300 border border-amber-400/30 text-[9px] font-mono font-bold cursor-pointer transition-colors"
                        >
                          ↵
                        </button>
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMoveMemberUp(index)}
                          title={language === 'kn' ? 'ಮೇಲಕ್ಕೆ ಸರಿಸಿ' : 'Move Up'}
                          className="p-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white disabled:opacity-20 cursor-pointer transition-colors"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={index === sortedCommitteeMembers.length - 1}
                          onClick={() => handleMoveMemberDown(index)}
                          title={language === 'kn' ? 'ಕೆಳಕ್ಕೆ ಸರಿಸಿ' : 'Move Down'}
                          className="p-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white disabled:opacity-20 cursor-pointer transition-colors"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Edit / Delete Buttons */}
                      <div className="flex items-center space-x-1 shrink-0">
                        <button
                          onClick={() => openMemberEditModal(member)}
                          className="p-1.5 rounded-md bg-neutral-800/70 hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingMemberId(member.id)}
                          className="p-1.5 rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: FESTIVAL HISTORY */}
        {/* ========================================================================= */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  {language === 'kn' ? 'ಹಬ್ಬದ ಇತಿಹಾಸ & ಮೈಲಿಗಲ್ಲುಗಳು' : 'Festival History & Milestones'}
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {language === 'kn'
                    ? 'ವರ್ಷವಾರು ಗಣೇಶೋತ್ಸವದ ವಿಶೇಷತೆ, ಮಂಟಪ ವಿಷಯ ಮತ್ತು ಸಾಧನೆಗಳ ನಿರ್ವಹಣೆ (/history).'
                    : 'Manage annual pandal themes, historical chronicles, and festival highlights (/history).'}
                </p>
              </div>

              <button
                onClick={() => openHistoryAddModal(typeof historyYearFilter === 'number' ? historyYearFilter : undefined)}
                className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs tracking-wide transition-colors cursor-pointer shadow-md self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>
                  {language === 'kn'
                    ? (historyYearFilter !== 'all' ? `${historyYearFilter} ಮೈಲಿಗಲ್ಲು ಸೇರಿಸಿ` : 'ಮೈಲಿಗಲ್ಲು ಸೇರಿಸಿ')
                    : (historyYearFilter !== 'all' ? `Add ${historyYearFilter} Milestone` : 'Add Festival Milestone')}
                </span>
              </button>
            </div>

            {/* Year Filter Dropdown Card (No Horizontal Scroll) */}
            <div className="bg-[#121215] border border-neutral-800/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 flex-1">
                <label htmlFor="history-year-filter" className="text-xs font-bold text-neutral-300 flex items-center space-x-1.5 shrink-0">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>{language === 'kn' ? 'ವರ್ಷವಾರು ಫಿಲ್ಟರ್:' : 'Filter by Year:'}</span>
                </label>
                <div className="relative max-w-xs w-full">
                  <select
                    id="history-year-filter"
                    value={historyYearFilter}
                    onChange={(e) => {
                      const val = e.target.value;
                      setHistoryYearFilter(val === 'all' ? 'all' : Number(val));
                    }}
                    className="w-full appearance-none bg-neutral-900 border border-neutral-700/80 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-white pr-9 focus:outline-none focus:border-amber-400 shadow-inner cursor-pointer"
                  >
                    <option value="all">
                      {language === 'kn' ? 'ಎಲ್ಲಾ ವರ್ಷಗಳು' : 'All Festival Years'} ({historyItems.length})
                    </option>
                    {availableHistoryYears.map((yr) => {
                      const hasMilestone = historyItems.some((h) => h.year === yr);
                      return (
                        <option key={yr} value={yr} className="bg-neutral-900 text-neutral-100">
                          {yr} {hasMilestone ? `✓ (${language === 'kn' ? 'ದಾಖಲೆ ಇದೆ' : 'Recorded'})` : `(${language === 'kn' ? 'ಖಾಲಿ' : 'Empty'})`}
                        </option>
                      );
                    })}
                  </select>
                  <ChevronDown className="w-4 h-4 text-amber-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {historyYearFilter !== 'all' && (
                <button
                  type="button"
                  onClick={() => setHistoryYearFilter('all')}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-neutral-300 hover:text-white transition-colors self-start sm:self-auto cursor-pointer"
                >
                  <X className="w-3.5 h-3.5 text-red-400" />
                  <span>{language === 'kn' ? 'ಎಲ್ಲಾ ವರ್ಷಗಳನ್ನು ತೋರಿಸಿ' : 'Reset Year Filter'}</span>
                </button>
              )}
            </div>

            {historyLoading ? (
              <div className="py-16 text-center text-neutral-400 text-xs">
                {language === 'kn' ? 'ಇತಿಹಾಸ ದಾಖಲೆಗಳು ಲೋಡ್ ಆಗುತ್ತಿವೆ...' : 'Loading history records...'}
              </div>
            ) : displayedHistoryItems.length === 0 ? (
              historyYearFilter !== 'all' ? (
                <div className="bg-[#121215] border border-dashed border-amber-400/40 rounded-2xl p-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 mx-auto">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      {language === 'kn'
                        ? `${historyYearFilter}ನೇ ವರ್ಷಕ್ಕೆ ಇನ್ನೂ ಯಾವುದೇ ದಾಖಲೆ ಇಲ್ಲ`
                        : `Year ${historyYearFilter} (${Number(historyYearFilter) - 2019 + 1}th Annual Edition) has no milestone yet`}
                    </h4>
                    <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
                      {language === 'kn'
                        ? `${historyYearFilter} ರ ಮಂಟಪದ ವಿಷಯ, ಇತಿಹಾಸ ಹಾಗೂ ಫೋಟೋಗಳನ್ನು ಸೇರಿಸಿ.`
                        : `Add the pandal theme, history chronicle, Murti photo, and festival highlights for ${historyYearFilter}.`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openHistoryAddModal(Number(historyYearFilter))}
                    className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs cursor-pointer shadow-md transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{language === 'kn' ? `+ ${historyYearFilter} ಮೈಲಿಗಲ್ಲು ರಚಿಸಿ` : `Create ${historyYearFilter} Milestone`}</span>
                  </button>
                </div>
              ) : (
                <div className="bg-[#121215] border border-neutral-800/80 rounded-xl p-10 text-center text-neutral-400">
                  <Calendar className="w-8 h-8 mx-auto text-neutral-400 mb-2" />
                  <p className="text-sm font-medium text-neutral-200">
                    {language === 'kn' ? 'ಇತಿಹಾಸ ದಾಖಲೆಗಳು ಖಾಲಿಯಾಗಿದೆ' : 'History page is currently empty'}
                  </p>
                  <p className="text-xs text-neutral-400 mt-0.5 max-w-sm mx-auto">
                    {language === 'kn'
                      ? '2026, 2025, 2024 ಮತ್ತು ಹೊಸ ಉತ್ಸವಗಳನ್ನು ದಾಖಲಿಸಲು "+ ಮೈಲಿಗಲ್ಲು ಸೇರಿಸಿ" ಒತ್ತಿರಿ.'
                      : 'Click "Add Festival Milestone" to document annual utsavs.'}
                  </p>
                  <button
                    onClick={() => openHistoryAddModal()}
                    className="mt-3.5 inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-amber-400 text-neutral-950 font-semibold text-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{language === 'kn' ? 'ಮೊದಲ ಮೈಲಿಗಲ್ಲು ಸೇರಿಸಿ' : 'Add First Milestone'}</span>
                  </button>
                </div>
              )
            ) : (
              <div className="space-y-3">
                {displayedHistoryItems.map((h) => {
                  const heroSlideIdx = heroSlideItems.findIndex((s) => s.id === h.id);

                  return (
                    <div
                      key={h.id}
                      className="bg-[#121215] border border-neutral-800/80 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-neutral-700 transition-colors"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                          <span className="px-2 py-0.5 rounded-md bg-amber-400 text-neutral-950 font-bold text-xs">
                            {h.year} UTSAV
                          </span>
                          {h.showInHero && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-400 text-neutral-950 font-mono text-[10px] font-black uppercase flex items-center space-x-1 shadow-xs">
                              <Sparkles className="w-2.5 h-2.5" />
                              <span>HERO{heroSlideIdx >= 0 ? ` #${heroSlideIdx + 1}` : ''}</span>
                            </span>
                          )}
                          {(h.showIn35mm ?? true) && (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-400/20 border border-emerald-400/50 text-emerald-300 font-mono text-[10px] font-bold uppercase flex items-center space-x-1">
                              <Film className="w-2.5 h-2.5 text-emerald-400" />
                              <span>35MM</span>
                            </span>
                          )}
                          {(h.showInGallery ?? true) && (
                            <span className="px-2 py-0.5 rounded-md bg-blue-400/20 border border-blue-400/50 text-blue-300 font-mono text-[10px] font-bold uppercase flex items-center space-x-1">
                              <Camera className="w-2.5 h-2.5 text-blue-400" />
                              <span>GALLERY</span>
                            </span>
                          )}
                          {h.samvatsaraKn && (
                            <span className="text-xs text-neutral-400 font-sans">
                              {h.samvatsaraKn} • {h.samvatsaraEn}
                            </span>
                          )}
                        </div>

                        <h3 className="text-sm font-bold text-white">{h.titleKn} / {h.titleEn}</h3>

                        {h.pandalThemeKn && (
                          <p className="text-xs text-amber-300 font-sans">
                            🏛️ Theme: {h.pandalThemeKn}
                          </p>
                        )}

                        {h.summaryKn && (
                          <p className="text-xs text-neutral-400 font-sans line-clamp-2 max-w-2xl">
                            {h.summaryKn}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center space-x-1.5 shrink-0 flex-wrap gap-y-1.5">
                        {/* Hero Toggle */}
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await updateHistoryMilestone(h.id, { showInHero: !h.showInHero });
                            } catch (err) {
                              console.error('Failed to toggle hero display:', err);
                            }
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer border flex items-center space-x-1 ${
                            h.showInHero
                              ? 'bg-amber-400 text-neutral-950 border-amber-400 hover:bg-amber-300 shadow-xs'
                              : 'bg-neutral-900 text-neutral-400 border-neutral-700 hover:text-white'
                          }`}
                          title="Toggle display in Hero Section"
                        >
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          <span>{h.showInHero ? `✓ Hero${heroSlideIdx >= 0 ? ` #${heroSlideIdx + 1}` : ''}` : '+ Hero'}</span>
                        </button>

                      {/* 35mm Reel Toggle */}
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await updateHistoryMilestone(h.id, { showIn35mm: !(h.showIn35mm ?? true) });
                          } catch (err) {
                            console.error('Failed to toggle 35mm reel display:', err);
                          }
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer border flex items-center space-x-1 ${
                          h.showIn35mm ?? true
                            ? 'bg-emerald-400/20 text-emerald-300 border-emerald-400/50 hover:bg-emerald-400/30'
                            : 'bg-neutral-900 text-neutral-400 border-neutral-700 hover:text-white'
                        }`}
                        title="Toggle display in 35mm Reel"
                      >
                        <Film className="w-3 h-3 text-emerald-400" />
                        <span>{(h.showIn35mm ?? true) ? '✓ 35mm' : '+ 35mm'}</span>
                      </button>

                      {/* Gallery Toggle */}
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await updateHistoryMilestone(h.id, { showInGallery: !(h.showInGallery ?? true) });
                          } catch (err) {
                            console.error('Failed to toggle gallery display:', err);
                          }
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer border flex items-center space-x-1 ${
                          h.showInGallery ?? true
                            ? 'bg-blue-400/20 text-blue-300 border-blue-400/50 hover:bg-blue-400/30'
                            : 'bg-neutral-900 text-neutral-400 border-neutral-700 hover:text-white'
                        }`}
                        title="Toggle display in Gallery"
                      >
                        <Camera className="w-3 h-3 text-blue-400" />
                        <span>{(h.showInGallery ?? true) ? '✓ Gallery' : '+ Gallery'}</span>
                      </button>

                      <button
                        onClick={() => openHistoryEditModal(h)}
                        className="px-2.5 py-1 rounded-lg bg-neutral-800/70 hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs font-medium transition-colors cursor-pointer flex items-center space-x-1"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => setDeletingHistoryId(h.id)}
                        className="px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium transition-colors cursor-pointer flex items-center space-x-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: SEVA & ACHIEVEMENTS */}
        {/* ========================================================================= */}
        {activeTab === 'achievements' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  {language === 'kn' ? 'ಸೇವೆ & ಸಾಧನೆಗಳ ದಾಖಲೆ' : 'Seva & Impact Initiatives'}
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {language === 'kn'
                    ? 'ಮಹಾ ಅನ್ನಸಂತರ್ಪಣೆ, ಭವ್ಯ ಮಂಟಪ, ಮೆರವಣಿಗೆ ಮತ್ತು ಯುವಜನ ಸೇವಾ ಯೋಜನೆಗಳು (/achievements).'
                    : 'Manage community seva, pandal architecture, and social impact records (/achievements).'}
                </p>
              </div>

              <button
                onClick={openAchievementAddModal}
                className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs tracking-wide transition-colors cursor-pointer shadow-md self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>{language === 'kn' ? 'ಹೊಸ ಸೇವಾ ವಿವರ ಸೇರಿಸಿ' : 'Add Seva Initiative'}</span>
              </button>
            </div>

            {achievementsLoading ? (
              <div className="py-16 text-center text-neutral-400 text-xs">
                {language === 'kn' ? 'ಸೇವಾ ದಾಖಲೆಗಳು ಲೋಡ್ ಆಗುತ್ತಿವೆ...' : 'Loading seva records...'}
              </div>
            ) : achievements.length === 0 ? (
              <div className="bg-[#121215] border border-neutral-800/80 rounded-2xl p-10 text-center text-neutral-400">
                <Award className="w-8 h-8 mx-auto text-neutral-400 mb-2" />
                <p className="text-sm font-semibold text-neutral-200">
                  {language === 'kn' ? 'ಯಾವುದೇ ಸೇವಾ ವಿವರಗಳಿಲ್ಲ' : 'No seva initiatives recorded yet'}
                </p>
                <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
                  {language === 'kn'
                    ? 'ಮಹಾ ಅನ್ನಸಂತರ್ಪಣೆ, ಮಂಟಪ ನಿರ್ಮಾಣ ಹಾಗೂ ಸೇವಾ ಕಾರ್ಯಗಳನ್ನು ದಾಖಲಿಸಲು "ಹೊಸ ಸೇವಾ ವಿವರ ಸೇರಿಸಿ" ಬಟನ್ ಒತ್ತಿರಿ.'
                    : 'Click "Add Seva Initiative" to document seva records.'}
                </p>
                <button
                  onClick={openAchievementAddModal}
                  className="mt-3.5 inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-amber-400 text-neutral-950 font-bold text-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{language === 'kn' ? 'ಮೊದಲ ಸೇವಾ ವಿವರ ಸೇರಿಸಿ' : 'Add First Initiative'}</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {sortedAchievements.map((ach, index) => {
                  const mediaSrc = ach.mediaUrl || ach.imageUrl;
                  const isVideo = ach.mediaType === 'video' || (mediaSrc ? (
                    mediaSrc.toLowerCase().includes('.mp4') ||
                    mediaSrc.toLowerCase().includes('.webm') ||
                    mediaSrc.toLowerCase().includes('.mov') ||
                    mediaSrc.toLowerCase().includes('/video/upload/')
                  ) : false);

                  const heroMediaCount = ach.galleryMedia && ach.galleryMedia.length > 0
                    ? ach.galleryMedia.filter((m) => m.showInHero).length
                    : (ach.showInHero ? 1 : 0);
                  const isAchInHero = heroMediaCount > 0 || Boolean(ach.showInHero);

                  return (
                    <div
                      key={ach.id}
                      className="bg-[#121215] border border-neutral-800/80 rounded-xl p-4 flex flex-col justify-between hover:border-neutral-700 transition-colors"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2 flex-wrap gap-1.5">
                          <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                            <span className="px-2 py-0.5 rounded-md bg-neutral-800 text-amber-300 text-[10px] font-mono uppercase">
                              {ach.category === 'feast'
                                ? (language === 'kn' ? 'ಅನ್ನಸಂತರ್ಪಣೆ' : 'Annasantarpane')
                                : ach.category === 'pooja'
                                ? (language === 'kn' ? 'ಕಂಬ ಪೂಜೆ & ಪ್ರವಚನ' : 'Pooja & Pravachana')
                                : ach.category === 'miravanige'
                                ? (language === 'kn' ? 'ಮೆರವಣಿಗೆ' : 'Miravanige')
                                : (language === 'kn' ? 'ಇತರ ಸೇವೆ' : 'Other Seva')}
                            </span>

                            {/* Active Placement Badges */}
                            {isAchInHero && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-400 text-neutral-950 font-black text-[9px] uppercase tracking-wider flex items-center space-x-0.5 shadow-xs">
                                <Sparkles className="w-2.5 h-2.5" />
                                <span>HERO{heroMediaCount > 1 ? ` (${heroMediaCount})` : ''}</span>
                              </span>
                            )}
                            {ach.showIn35mm && (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-400/20 border border-emerald-400/50 text-emerald-300 font-mono font-bold text-[9px] uppercase flex items-center space-x-0.5">
                                <Film className="w-2.5 h-2.5 text-emerald-400" />
                                <span>35MM</span>
                              </span>
                            )}
                            {ach.showInGallery && (
                              <span className="px-1.5 py-0.5 rounded bg-blue-400/20 border border-blue-400/50 text-blue-300 font-mono font-bold text-[9px] uppercase flex items-center space-x-0.5">
                                <Camera className="w-2.5 h-2.5 text-blue-400" />
                                <span>GALLERY</span>
                              </span>
                            )}
                          </div>

                          <div className="flex items-center space-x-2 text-[11px] text-neutral-400 font-sans">
                            {ach.eventDate && (
                              <span className="text-amber-400 font-mono">📅 {ach.eventDate}</span>
                            )}
                            {ach.yearKn && !ach.eventDate?.includes(ach.yearKn) && !ach.eventDate?.includes(String(ach.year || '')) && (
                              <span>{ach.yearKn}</span>
                            )}
                          </div>
                        </div>

                        {mediaSrc && (
                          <div className="mb-3 relative rounded-lg overflow-hidden h-28 bg-black/60 border border-neutral-800">
                            {isVideo ? (
                              <div className="w-full h-full flex items-center justify-center bg-neutral-900 text-amber-400 relative">
                                <video src={mediaSrc} className="w-full h-full object-cover opacity-60" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <span className="px-2 py-1 rounded bg-black/80 text-[11px] font-mono text-amber-300 border border-amber-400/30">
                                    ▶ VIDEO
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <img src={mediaSrc} alt={ach.titleEn} className="w-full h-full object-cover" />
                            )}
                          </div>
                        )}

                        {/* Multi-Media Gallery Indicator & Individual Hero Picker */}
                        {ach.galleryMedia && ach.galleryMedia.length > 1 && (
                          <div className="mb-3 p-2 rounded-xl bg-black/50 border border-neutral-800">
                            <div className="flex items-center justify-between text-[10px] text-neutral-400 mb-1.5 font-mono">
                              <span>📷 {ach.galleryMedia.length} {language === 'kn' ? 'ಮೀಡಿಯಾ ಫೈಲ್‌ಗಳು' : 'Media Files'}</span>
                              <span className="text-amber-400 font-bold">
                                {ach.galleryMedia.filter((m) => m.showInHero).length} in Hero
                              </span>
                            </div>
                            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-amber-400/20">
                              {ach.galleryMedia.map((m, mIdx) => (
                                <div
                                  key={mIdx}
                                  className={`relative shrink-0 rounded-lg overflow-hidden border w-12 h-10 bg-neutral-900 ${
                                    m.showInHero ? 'border-amber-400 ring-1 ring-amber-400/50' : 'border-neutral-700/70'
                                  }`}
                                >
                                  {m.type === 'video' ? (
                                    <video src={m.url} className="w-full h-full object-cover pointer-events-none" muted />
                                  ) : (
                                    <img src={m.url} alt={`Media ${mIdx}`} className="w-full h-full object-cover" />
                                  )}
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      if (!ach.galleryMedia) return;
                                      const updated = ach.galleryMedia.map((it, i) =>
                                        i === mIdx ? { ...it, showInHero: !it.showInHero } : it
                                      );
                                      const anyHero = updated.some((it) => it.showInHero);
                                      await updateAchievement(ach.id, {
                                        galleryMedia: updated,
                                        showInHero: anyHero,
                                      });
                                    }}
                                    className={`absolute inset-0 flex items-center justify-center text-[10px] font-black transition-all cursor-pointer ${
                                      m.showInHero
                                        ? 'bg-amber-400/85 text-neutral-950 font-bold'
                                        : 'bg-black/60 opacity-60 hover:opacity-100 text-white hover:bg-amber-400 hover:text-neutral-950'
                                    }`}
                                    title={m.showInHero ? 'Featured in Hero (Click to remove)' : 'Click to feature in Hero'}
                                  >
                                    {m.showInHero ? '⭐' : '+⭐'}
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <h3 className="text-sm font-bold text-white">{ach.titleKn}</h3>
                        <p className="text-xs text-neutral-400 font-sans mt-0.5">{ach.titleEn}</p>

                        {(ach.sponsorNameKn || ach.sponsorNameEn) && (
                          <div className="mt-2 px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-400/20 text-amber-300 text-xs">
                            <span className="font-semibold text-amber-400">🙏 {language === 'kn' ? 'ದಾನಿಗಳು/ಸೇವಾಕರ್ತರು:' : 'Sponsor:'} </span>
                            <span className="text-white font-medium">{language === 'kn' ? (ach.sponsorNameKn || ach.sponsorNameEn) : (ach.sponsorNameEn || ach.sponsorNameKn)}</span>
                          </div>
                        )}

                        {ach.impactMetricKn && (
                          <div className="mt-2 p-2 rounded-lg bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-semibold">
                            ✨ {ach.impactMetricKn}
                          </div>
                        )}

                        {ach.descriptionKn && (
                          <p className="mt-2 text-xs text-neutral-300 font-sans line-clamp-2">
                            {ach.descriptionKn}
                          </p>
                        )}
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-neutral-800/80 flex items-center justify-between flex-wrap gap-2">
                        {/* Priority Rank Controls */}
                        <div className="flex items-center space-x-1">
                          <label htmlFor={`ach-order-${ach.id}`} className="text-[10px] font-mono font-bold text-neutral-400">
                            {language === 'kn' ? 'ಕ್ರಮ:' : 'Rank:'}
                          </label>
                          <input
                            id={`ach-order-${ach.id}`}
                            type="number"
                            min="1"
                            max={sortedAchievements.length}
                            defaultValue={index + 1}
                            key={`${ach.id}-${index + 1}`}
                            onBlur={(e) => {
                              const val = parseInt(e.target.value, 10);
                              if (!isNaN(val) && val !== index + 1) {
                                handleReorderAchievement(index, val);
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const val = parseInt((e.target as HTMLInputElement).value, 10);
                                if (!isNaN(val)) {
                                  handleReorderAchievement(index, val);
                                  (e.target as HTMLInputElement).blur();
                                }
                              }
                            }}
                            className="w-12 px-1.5 py-1 rounded-lg bg-neutral-900 border border-neutral-700 text-center text-xs font-mono font-bold text-amber-400 focus:outline-none focus:border-amber-400 shadow-inner"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const inputEl = document.getElementById(`ach-order-${ach.id}`) as HTMLInputElement | null;
                              if (inputEl) {
                                const val = parseInt(inputEl.value, 10);
                                if (!isNaN(val)) {
                                  handleReorderAchievement(index, val);
                                  inputEl.blur();
                                }
                              }
                            }}
                            title={language === 'kn' ? 'ಆದ್ಯತೆ ಅನ್ವಯಿಸಿ (Enter)' : 'Apply Rank (Click or Enter)'}
                            className="px-2 py-1 rounded-lg bg-amber-400/15 hover:bg-amber-400/30 text-amber-300 border border-amber-400/30 text-[10px] font-mono font-bold cursor-pointer transition-colors active:scale-95"
                          >
                            ↵
                          </button>
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => handleMoveAchievementUp(index)}
                            title={language === 'kn' ? 'ಮೇಲಕ್ಕೆ ಸರಿಸಿ' : 'Move Up'}
                            className="p-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white disabled:opacity-20 cursor-pointer transition-colors"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={index === sortedAchievements.length - 1}
                            onClick={() => handleMoveAchievementDown(index)}
                            title={language === 'kn' ? 'ಕೆಳಕ್ಕೆ ಸರಿಸಿ' : 'Move Down'}
                            className="p-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white disabled:opacity-20 cursor-pointer transition-colors"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Quick Cross-Section Toggles */}
                        <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                          {/* Hero Toggle */}
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                if (isAchInHero) {
                                  const updatedGallery = (ach.galleryMedia || []).map((m) => ({ ...m, showInHero: false }));
                                  await updateAchievement(ach.id, {
                                    showInHero: false,
                                    ...(ach.galleryMedia && ach.galleryMedia.length > 0 ? { galleryMedia: updatedGallery } : {}),
                                  });
                                } else {
                                  let updatedGallery = ach.galleryMedia;
                                  if (updatedGallery && updatedGallery.length > 0) {
                                    const hasHero = updatedGallery.some((m) => m.showInHero);
                                    if (!hasHero) {
                                      updatedGallery = updatedGallery.map((m, idx) => (idx === 0 ? { ...m, showInHero: true } : m));
                                    }
                                  }
                                  await updateAchievement(ach.id, {
                                    showInHero: true,
                                    ...(updatedGallery && updatedGallery.length > 0 ? { galleryMedia: updatedGallery } : {}),
                                  });
                                }
                              } catch (err) {
                                console.error('Failed to toggle seva hero:', err);
                              }
                            }}
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer border flex items-center space-x-1 ${
                              isAchInHero
                                ? 'bg-amber-400 text-neutral-950 border-amber-400 font-bold shadow-xs'
                                : 'bg-neutral-900 text-neutral-400 border-neutral-700 hover:text-white'
                            }`}
                            title="Toggle display in Hero Section"
                          >
                            <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                            <span>{isAchInHero ? `✓ Hero${heroMediaCount > 1 ? ` (${heroMediaCount})` : ''}` : '+ Hero'}</span>
                          </button>

                          {/* 35mm Reel Toggle */}
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                await updateAchievement(ach.id, { showIn35mm: !ach.showIn35mm });
                              } catch (err) {
                                console.error('Failed to toggle seva 35mm:', err);
                              }
                            }}
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer border flex items-center space-x-1 ${
                              ach.showIn35mm
                                ? 'bg-emerald-400/20 text-emerald-300 border-emerald-400/50'
                                : 'bg-neutral-900 text-neutral-400 border-neutral-700 hover:text-white'
                            }`}
                            title="Toggle display in 35mm Reel"
                          >
                            <Film className="w-2.5 h-2.5 text-emerald-400" />
                            <span>{ach.showIn35mm ? '✓ 35mm' : '+ 35mm'}</span>
                          </button>

                          {/* Gallery Toggle */}
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                await updateAchievement(ach.id, { showInGallery: !(ach.showInGallery ?? true) });
                              } catch (err) {
                                console.error('Failed to toggle seva gallery:', err);
                              }
                            }}
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer border flex items-center space-x-1 ${
                              ach.showInGallery ?? true
                                ? 'bg-blue-400/20 text-blue-300 border-blue-400/50'
                                : 'bg-neutral-900 text-neutral-400 border-neutral-700 hover:text-white'
                            }`}
                            title="Toggle display in Gallery"
                          >
                            <Camera className="w-2.5 h-2.5 text-blue-400" />
                            <span>{(ach.showInGallery ?? true) ? '✓ Gallery' : '+ Gallery'}</span>
                          </button>
                        </div>

                        <div className="flex items-center space-x-1.5 ml-auto">
                          <button
                            onClick={() => openAchievementEditModal(ach)}
                            className="px-2.5 py-1 rounded-md bg-neutral-800/70 hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs font-medium transition-colors cursor-pointer flex items-center space-x-1"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => setDeletingAchievementId(ach.id)}
                            className="px-2.5 py-1 rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium transition-colors cursor-pointer flex items-center space-x-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: YOUTUBE LIVE STREAM & SITE SETTINGS */}
        {/* ========================================================================= */}
        {activeTab === 'site' && (
          <div className="max-w-3xl space-y-6">
            <form onSubmit={handleSiteSettingsSave} className="space-y-6">
              
              {/* CARD 1: YOUTUBE LIVE STREAM SETUP */}
              <div className="bg-[#121215] border border-neutral-800/80 rounded-2xl p-5 sm:p-6 space-y-5 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-600 via-amber-400 to-red-600" />
                
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h2 className="text-lg font-bold text-white tracking-tight flex items-center space-x-2">
                      <Youtube className="w-5 h-5 text-red-500" />
                      <span>{language === 'kn' ? 'ಯೂಟ್ಯೂಬ್ ಲೈವ್ ದರ್ಶನ ನೇರ ಪ್ರಸಾರ' : 'YouTube Live Stream Setup'}</span>
                    </h2>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {language === 'kn'
                        ? 'ವೆಬ್‌ಸೈಟ್ ಮುಖ್ಯ ಪುಟದಲ್ಲಿ ಶ್ರೀ ಗಣೇಶ ದರ್ಶನ, ಮಹಾಮಂಗಳಾರತಿ ಮತ್ತು ಮೆರವಣಿಗೆಯನ್ನು ನೇರ ಪ್ರಸಾರ ಮಾಡಿ.'
                        : 'Stream real-time festival darshan, Maha Aarti, and Visarjan procession directly on the public homepage.'}
                    </p>
                  </div>

                  {siteSettings.liveStreamActive && extractYoutubeVideoId(siteSettings.liveStreamYoutubeUrl) && (
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-red-600/20 border border-red-500/50 text-red-400 font-mono text-[11px] font-bold uppercase animate-pulse">
                      <Radio className="w-3.5 h-3.5" />
                      <span>{language === 'kn' ? 'ನೇರ ಪ್ರಸಾರ ಸಕ್ರಿಯವಾಗಿದೆ' : 'STREAMING ACTIVE'}</span>
                    </span>
                  )}
                </div>

                <div className="space-y-4 pt-1">
                  {/* Master Live Switch */}
                  <div className="flex items-center space-x-3 p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-red-500/40 transition-colors">
                    <input
                      type="checkbox"
                      id="liveStreamActive"
                      checked={siteSettings.liveStreamActive ?? false}
                      onChange={(e) => setSiteSettings({ ...siteSettings, liveStreamActive: e.target.checked })}
                      className="w-5 h-5 accent-red-600 cursor-pointer"
                    />
                    <div>
                      <label htmlFor="liveStreamActive" className="text-xs font-bold text-white cursor-pointer select-none flex items-center space-x-2">
                        <span>{language === 'kn' ? 'ವೆಬ್‌ಸೈಟ್‌ನಲ್ಲಿ ಲೈವ್ ದರ್ಶನ ಪ್ರಾರಂಭಿಸಿ' : 'Enable Live Darshan Stream on Public Website'}</span>
                      </label>
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        {language === 'kn'
                          ? 'ಇದನ್ನು ಆನ್ ಮಾಡಿದಾಗ, ಸಾರ್ವಜನಿಕ ವೆಬ್‌ಸೈಟ್‌ನ ಮುಖಪುಟದಲ್ಲಿ ಯೂಟ್ಯೂಬ್ ಪ್ಲೇಯರ್ ಹಾಗೂ ಲೈವ್ ಬ್ಯಾಡ್ಜ್ ಕಾಣಿಸುತ್ತದೆ.'
                          : 'When checked, a cinema-grade YouTube player and live broadcast banner automatically appear on the homepage.'}
                      </p>
                    </div>
                  </div>

                  {/* YouTube Link / ID Input */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 uppercase mb-1">
                      {language === 'kn' ? 'ಯೂಟ್ಯೂಬ್ ಲೈವ್ ಲಿಂಕ್ ಅಥವಾ ವಿಡಿಯೋ ಐಡಿ *' : 'YouTube Live Video Link or Video ID *'}
                    </label>
                    <input
                      type="text"
                      value={siteSettings.liveStreamYoutubeUrl ?? ''}
                      onChange={(e) => setSiteSettings({ ...siteSettings, liveStreamYoutubeUrl: e.target.value })}
                      placeholder="e.g. https://www.youtube.com/watch?v=... or https://youtu.be/... or Video ID"
                      className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-red-500 font-mono"
                    />
                    <p className="text-[11px] text-neutral-500 mt-1 font-sans">
                      {language === 'kn'
                        ? 'ಪೂರ್ಣ ಯೂಟ್ಯೂಬ್ URL, ಲೈವ್ URL ಅಥವಾ 11-ಅಕ್ಷರಗಳ ವೀಡಿಯೊ ID ಯನ್ನು ಇಲ್ಲಿ ಪೇಸ್ಟ್ ಮಾಡಿ.'
                        : 'Paste full YouTube URL, Live URL, Share link, or the 11-digit video ID.'}
                    </p>
                  </div>

                  {/* Real-time Video ID Detection & Live Player Preview */}
                  {(() => {
                    const extractedId = extractYoutubeVideoId(siteSettings.liveStreamYoutubeUrl);
                    if (extractedId) {
                      return (
                        <div className="p-3.5 rounded-xl bg-black border border-emerald-500/40 space-y-3">
                          <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold">
                            <span className="flex items-center space-x-1.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              <span>Valid YouTube Stream Detected (ID: {extractedId})</span>
                            </span>
                            <a
                              href={`https://www.youtube.com/watch?v=${extractedId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center space-x-1 text-emerald-300 hover:text-white underline"
                            >
                              <span>Test Link</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>

                          {/* Embed Preview */}
                          <div className="relative w-full pb-[56.25%] rounded-lg overflow-hidden border border-neutral-800 bg-neutral-950">
                            <iframe
                              src={getYoutubeEmbedUrl(extractedId, false)}
                              title="Live Stream Admin Preview"
                              className="absolute inset-0 w-full h-full border-0"
                              allowFullScreen
                            />
                          </div>
                        </div>
                      );
                    }
                    if (siteSettings.liveStreamYoutubeUrl?.trim()) {
                      return (
                        <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300">
                          Could not detect a valid 11-character YouTube ID. Please verify your link.
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {/* Bilingual Live Titles */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 uppercase mb-1">
                        Live Title (Kannada)
                      </label>
                      <input
                        type="text"
                        value={siteSettings.liveStreamTitleKn ?? ''}
                        onChange={(e) => setSiteSettings({ ...siteSettings, liveStreamTitleKn: e.target.value })}
                        placeholder="ಶ್ರೀ ಗಣೇಶ ಮಹೋತ್ಸವ | ನೇರ ದರ್ಶನ"
                        className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 uppercase mb-1">
                        Live Title (English)
                      </label>
                      <input
                        type="text"
                        value={siteSettings.liveStreamTitleEn ?? ''}
                        onChange={(e) => setSiteSettings({ ...siteSettings, liveStreamTitleEn: e.target.value })}
                        placeholder="Shri Ganesh Mahotsav | Live Darshan Streaming"
                        className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>

                  {/* Bilingual Live Descriptions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 uppercase mb-1">
                        Subtitle / Location (Kannada)
                      </label>
                      <input
                        type="text"
                        value={siteSettings.liveStreamDescriptionKn ?? ''}
                        onChange={(e) => setSiteSettings({ ...siteSettings, liveStreamDescriptionKn: e.target.value })}
                        placeholder="ಕಡಲಗಿ ಖೂಟ, ಯಮಕನಮರಡಿ • ನಿತ್ಯ ದರ್ಶನ ಹಾಗೂ ಮಹಾಮಂಗಳಾರತಿ"
                        className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 uppercase mb-1">
                        Subtitle / Location (English)
                      </label>
                      <input
                        type="text"
                        value={siteSettings.liveStreamDescriptionEn ?? ''}
                        onChange={(e) => setSiteSettings({ ...siteSettings, liveStreamDescriptionEn: e.target.value })}
                        placeholder="Kadalagi Khoot, Yamakanmardi • Daily Darshan & Mahamangalaarti"
                        className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* CARD 2: LIVE ANNOUNCEMENT BANNER */}
              <div className="bg-[#121215] border border-neutral-800/80 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight flex items-center space-x-2">
                    <Megaphone className="w-4 h-4 text-amber-400" />
                    <span>{language === 'kn' ? 'ವೆಬ್‌ಸೈಟ್ ಪ್ರಕಟಣೆ ಪಟ್ಟಿ' : 'Top Announcement Banner'}</span>
                  </h2>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {language === 'kn'
                      ? 'ವೆಬ್‌ಸೈಟ್‌ನ ಮೇಲ್ಭಾಗದಲ್ಲಿ ತುರ್ತು ಸಂದೇಶ ಅಥವಾ ಹಬ್ಬದ ಪ್ರಕಟಣೆ ಪಟ್ಟಿಯನ್ನು ಪ್ರದರ್ಶಿಸಿ.'
                      : 'Display an emergency alert or festive announcement ticker across the top of the entire website.'}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-neutral-900 border border-neutral-800">
                    <input
                      type="checkbox"
                      id="announcementActive"
                      checked={siteSettings.announcementActive ?? false}
                      onChange={(e) => setSiteSettings({ ...siteSettings, announcementActive: e.target.checked })}
                      className="w-4 h-4 accent-amber-400 cursor-pointer"
                    />
                    <label htmlFor="announcementActive" className="text-xs font-semibold text-white cursor-pointer select-none">
                      {language === 'kn' ? 'ಪ್ರಕಟಣೆ ಪಟ್ಟಿ ಸಕ್ರಿಯಗೊಳಿಸಿ' : 'Enable Top Announcement Banner'}
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 uppercase mb-1">
                      {language === 'kn' ? 'ಕನ್ನಡ ಸಂದೇಶ' : 'Kannada Text'}
                    </label>
                    <textarea
                      rows={2}
                      value={siteSettings.announcementKn ?? ''}
                      onChange={(e) => setSiteSettings({ ...siteSettings, announcementKn: e.target.value })}
                      placeholder="ಉದಾಹರಣೆಗೆ: 2026ನೇ ಸಾಲಿನ ಶ್ರೀ ಗಣೇಶ ಮಹೋತ್ಸವದ ಭವ್ಯ ಸಿದ್ಧತೆಗಳು ಪ್ರಾರಂಭಗೊಂಡಿವೆ..."
                      className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-400 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 uppercase mb-1">
                      {language === 'kn' ? 'ಇಂಗ್ಲಿಷ್ ಸಂದೇಶ' : 'English Text'}
                    </label>
                    <textarea
                      rows={2}
                      value={siteSettings.announcementEn ?? ''}
                      onChange={(e) => setSiteSettings({ ...siteSettings, announcementEn: e.target.value })}
                      placeholder="e.g. Preparations for the 8th Annual Royal Ganesh Mahotsav 2026 have commenced..."
                      className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-400 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 uppercase mb-1">
                      {language === 'kn' ? 'ಲಿಂಕ್ URL (ಐಚ್ಛಿಕ)' : 'Action Link URL (Optional)'}
                    </label>
                    <input
                      type="url"
                      value={siteSettings.announcementLink ?? ''}
                      onChange={(e) => setSiteSettings({ ...siteSettings, announcementLink: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-400 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* SAVE ACTION BAR */}
              <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 flex items-center justify-between sticky bottom-4 shadow-2xl z-20 backdrop-blur-md">
                <div>
                  {siteSettingsSaved ? (
                    <span className="text-xs text-emerald-400 flex items-center space-x-1.5 font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{language === 'kn' ? 'ಯಶಸ್ವಿಯಾಗಿ ಉಳಿಸಲಾಗಿದೆ!' : 'Settings Saved Successfully!'}</span>
                    </span>
                  ) : (
                    <span className="text-xs text-neutral-400">
                      {language === 'kn' ? 'ಉಳಿಸಿದ ತಕ್ಷಣ ವೆಬ್‌ಸೈಟ್‌ನಲ್ಲಿ ಬದಲಾವಣೆಗಳು ಅನ್ವಯಿಸುತ್ತವೆ.' : 'Changes will apply to the public website immediately.'}
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={siteSettingsSaving}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs tracking-wide cursor-pointer transition-colors shadow-md"
                >
                  <Save className="w-4 h-4" />
                  <span>
                    {siteSettingsSaving
                      ? (language === 'kn' ? 'ಉಳಿಸಲಾಗುತ್ತಿದೆ...' : 'Saving...')
                      : (language === 'kn' ? 'ಬದಲಾವಣೆಗಳನ್ನು ಉಳಿಸಿ' : 'Save Settings')}
                  </span>
                </button>
              </div>

            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: SYSTEM & STORAGE HEALTH MONITOR */}
        {/* ========================================================================= */}
        {activeTab === 'health' && (
          <SystemHealthMonitor
            mediaItems={mediaItems}
            committeeMembers={committeeMembers}
            historyItems={historyItems}
            achievements={achievements}
            siteSettings={siteSettings}
          />
        )}
      </main>

      {/* ========================================================================= */}
      {/* MODAL 1: MEDIA UPLOAD */}
      {/* ========================================================================= */}
      {isMediaUploadOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-[#101015] border border-amber-400/40 rounded-3xl max-w-3xl lg:max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[92vh] overflow-y-auto scrollbar-thin scrollbar-thumb-amber-400/30 my-auto">
            <div className="flex items-start justify-between pb-4 border-b border-neutral-800">
              <div className="flex items-center space-x-3.5">
                <div className="w-11 h-11 rounded-2xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-sm shrink-0">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                    {language === 'kn' ? 'ಹೊಸ ಮಾಧ್ಯಮ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ' : 'Upload New Media'}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
                    {language === 'kn'
                      ? 'ಉತ್ತಮ ಗುಣಮಟ್ಟದ ಫೋಟೋ ಅಥವಾ ವಿಡಿಯೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ, ಪ್ರದರ್ಶಿಸುವ ಪುಟಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ'
                      : 'Upload HD photo or video and choose all destination pages across the website'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsMediaUploadOpen(false)}
                className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleMediaCreateSubmit} className="space-y-5">
              {/* Upload Mode Switcher Tabs */}
              <div className="flex border-b border-neutral-800 gap-2 pb-2">
                <button
                  type="button"
                  onClick={() => setMediaUploadTab('file')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                    mediaUploadTab === 'file'
                      ? 'bg-amber-400 text-neutral-950 shadow-md'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
                  }`}
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>
                    {language === 'kn' ? 'ಫೋಟೋ & ವೀಡಿಯೊ ಅಪ್‌ಲೋಡ್ (100MB ವರೆಗೆ)' : 'Upload Files (Up to 100MB)'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setMediaUploadTab('youtube')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                    mediaUploadTab === 'youtube'
                      ? 'bg-red-600 text-white shadow-md'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
                  }`}
                >
                  <Youtube className="w-4 h-4" />
                  <span>
                    {language === 'kn' ? 'YouTube ಲಿಂಕ್ (100MB+, 4K, ಅನಿಯಮಿತ)' : 'YouTube Link (100MB+, 4K, Unlimited)'}
                  </span>
                </button>
              </div>

              {/* Tab 1: YouTube Link Mode */}
              {mediaUploadTab === 'youtube' && (
                <div className="space-y-4 p-5 rounded-2xl bg-red-950/20 border border-red-500/30">
                  <div className="flex items-start space-x-3">
                    <Youtube className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        {language === 'kn' ? 'YouTube ವೀಡಿಯೊ ಲಿಂಕ್ (ಯಾವುದೇ ಗಾತ್ರದ ಮಿತಿ ಇಲ್ಲ - 100MB+, 4K, ಅನಿಯಮಿತ)' : 'Direct YouTube Video Link (Zero File Size Limit - 100MB+, 4K, 1GB+)'}
                      </h4>
                      <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                        {language === 'kn'
                          ? 'ಉದ್ದವಾದ ವೀಡಿಯೊಗಳು, ಮಹಾ ಆಗಮನ, ವಿಸರ್ಜನೆ ಇತ್ಯಾದಿಗಳನ್ನು YouTube ಗೆ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ ಆ ಲಿಂಕ್ ಅನ್ನು ಇಲ್ಲಿ ನಮೂದಿಸಿ. ಇದು ಕ್ಲೌಡ್ ಕೋಟಾವನ್ನು ಉಳಿಸುತ್ತದೆ ಹಾಗೂ ಸೈಟ್‌ನಲ್ಲಿ ಅತ್ಯಂತ ವೇಗವಾಗಿ ಬಫರಿಂಗ್ ಇಲ್ಲದೆ ಪ್ಲೇ ಆಗುತ್ತದೆ!'
                          : 'For long celebration videos, aagamana, or visarjana, upload to YouTube and paste the link here. 100% quota-free, zero lag, full 1080p/4K streaming!'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-amber-300 mb-1.5">
                      {language === 'kn' ? 'YouTube URL / ಲಿಂಕ್ ನಮೂದಿಸಿ *' : 'Paste YouTube Video Link *'}
                    </label>
                    <input
                      type="url"
                      value={youtubeMediaUrl}
                      onChange={(e) => setYoutubeMediaUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                      className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-red-500 transition-all font-sans"
                    />
                  </div>

                  {extractYoutubeVideoId(youtubeMediaUrl) && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                        {language === 'kn' ? 'ವೀಡಿಯೊ ಮುನ್ನೋಟ (Preview)' : 'Video Preview'}
                      </p>
                      <div className="rounded-xl overflow-hidden border border-neutral-800 aspect-video max-w-md bg-black">
                        <iframe
                          src={getYoutubeEmbedUrl(extractYoutubeVideoId(youtubeMediaUrl)!, false)}
                          title="YouTube Video Preview"
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: File Dropzone & Batch Previews */}
              {mediaUploadTab === 'file' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-300">
                      {language === 'kn'
                        ? 'ಫೋಟೋ & ವಿಡಿಯೋ ಆಯ್ಕೆಮಾಡಿ (ಏಕಕಾಲದಲ್ಲಿ ಅನೇಕ ಫೈಲ್‌ಗಳು) *'
                        : 'Select Photos & Videos (Multiple Files Supported) *'}
                    </label>
                    {batchMediaFiles.length > 0 && (
                      <span className="text-xs text-amber-400 font-mono font-bold bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/30">
                        {batchMediaFiles.length} {language === 'kn' ? 'ಫೈಲ್‌ಗಳು ಆಯ್ದುಕೊಳ್ಳಲಾಗಿದೆ' : 'Files Selected'}
                      </span>
                    )}
                  </div>

                  {/* Warning banner if any selected file exceeds 100 MB */}
                  {batchMediaFiles.some((f) => f.file.size > MAX_CLOUDINARY_BYTES) && (
                    <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-start space-x-3 text-xs text-amber-200">
                      <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="font-bold text-amber-300">
                          {language === 'kn'
                            ? 'ಗಮನಿಸಿ: ಕೆಲವು ವೀಡಿಯೊಗಳು 100MB ಗಿಂತ ಹೆಚ್ಚಿವೆ!'
                            : 'Notice: Some videos exceed the 100 MB Cloudinary limit!'}
                        </p>
                        <p className="text-neutral-300 leading-relaxed">
                          {language === 'kn'
                            ? 'ಕ್ಲೌಡಿನರಿ ಉಚಿತ ಯೋಜನೆಯಲ್ಲಿ 100MB ವರೆಗೆ ಮಾತ್ರ ಅಪ್‌ಲೋಡ್ ಸಾಧ್ಯ. ಕೆಳಗಿನ ಆ ವೀಡಿಯೊದಲ್ಲಿ "⚡ ಕುಗ್ಗಿಸಿ (<100MB)" ಬಟನ್ ಒತ್ತಿ, ಅಥವಾ ಮೇಲೆ ಇರುವ "YouTube ಲಿಂಕ್" ಆಯ್ಕೆ ಬಳಸಿ.'
                            : 'Cloudinary Free Plan caps single video uploads at 100 MB. Click "⚡ Compress (<100MB)" on the marked video below, or use the "YouTube Link" tab above for unlimited video size.'}
                        </p>
                      </div>
                    </div>
                  )}

                  {batchMediaFiles.length === 0 ? (
                    <div className="relative border-2 border-dashed border-neutral-700 hover:border-amber-400 rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-colors bg-neutral-900/60 group">
                      <input
                        type="file"
                        multiple
                        accept="image/*,video/*"
                        onChange={(e) => handleBatchFileSelect(e.target.files)}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      />
                      <div className="py-6 sm:py-8 space-y-2">
                        <div className="w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 mx-auto group-hover:scale-105 transition-transform">
                          <UploadCloud className="w-7 h-7" />
                        </div>
                        <p className="text-sm sm:text-base font-bold text-white">
                          {language === 'kn'
                            ? 'ಒಂದೇ ಬಾರಿಗೆ ಅನೇಕ ಫೋಟೋ ಅಥವಾ ವಿಡಿಯೋಗಳನ್ನು ಆಯ್ಕೆಮಾಡಲು ಕ್ಲಿಕ್ ಮಾಡಿ'
                            : 'Click or drag & drop multiple photos and videos here'}
                        </p>
                        <p className="text-xs text-neutral-400">
                          {language === 'kn'
                            ? 'HD / 4K ನೇರ ಅಪ್‌ಲೋಡ್ (JPEG, PNG, WEBP, MP4, WebM) • 1, 5, 20+ ಫೈಲ್‌ಗಳು ಬೆಂಬಲಿತವಾಗಿದೆ'
                            : 'HD / 4K Direct Batch Upload (JPEG, PNG, WEBP, MP4, WebM) • 1, 5, 20+ files at once'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Action Bar for Selected Batch */}
                      <div className="flex items-center justify-between bg-neutral-900/90 border border-neutral-800 p-2.5 sm:p-3 rounded-xl flex-wrap gap-2">
                        <div className="flex items-center space-x-2 text-xs text-neutral-300">
                          <span className="font-mono font-bold text-amber-400">{batchMediaFiles.length} items</span>
                          <span>•</span>
                          <span>
                            {batchMediaFiles.filter((f) => f.mediaType === 'image').length} {language === 'kn' ? 'ಚಿತ್ರಗಳು' : 'Photos'},
                          </span>
                          <span>
                            {batchMediaFiles.filter((f) => f.mediaType === 'video').length} {language === 'kn' ? 'ವಿಡಿಯೋಗಳು' : 'Videos'}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <label className="cursor-pointer inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white text-xs font-bold transition-all border border-neutral-700">
                            <Plus className="w-3.5 h-3.5 text-amber-400" />
                            <span>{language === 'kn' ? 'ಇನ್ನಷ್ಟು ಸೇರಿಸಿ' : 'Add More'}</span>
                            <input
                              type="file"
                              multiple
                              accept="image/*,video/*"
                              onChange={(e) => handleBatchFileSelect(e.target.files)}
                              className="hidden"
                            />
                          </label>

                          <button
                            type="button"
                            onClick={handleClearAllBatchFiles}
                            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-300 text-xs font-bold transition-all border border-red-500/30 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>{language === 'kn' ? 'ಎಲ್ಲವನ್ನೂ ತೆರವುಗೊಳಿಸಿ' : 'Clear All'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Thumbnail Preview Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-60 sm:max-h-72 overflow-y-auto p-2 bg-neutral-950/80 rounded-2xl border border-neutral-800/80 scrollbar-thin scrollbar-thumb-amber-400/30">
                        {batchMediaFiles.map((item, idx) => {
                          const isOver100MB = item.file.size > MAX_CLOUDINARY_BYTES;
                          const isCompressing = compressingBatchId === item.id;

                          return (
                            <div
                              key={item.id}
                              className={`relative group rounded-xl overflow-hidden bg-neutral-900 border transition-all flex flex-col ${
                                isOver100MB ? 'border-amber-500/80' : 'border-neutral-800 hover:border-amber-400/80'
                              }`}
                            >
                              {/* Item Index Badge */}
                              <div className="absolute top-1.5 left-1.5 z-10 bg-black/80 text-amber-300 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border border-amber-400/40">
                                #{idx + 1}
                              </div>

                              {/* Over Limit Badge */}
                              {isOver100MB && (
                                <div className="absolute top-1.5 left-9 z-10 bg-amber-500 text-black text-[9px] font-mono font-black px-1.5 py-0.5 rounded flex items-center space-x-0.5 shadow">
                                  <AlertTriangle className="w-2.5 h-2.5" />
                                  <span>&gt;100MB</span>
                                </div>
                              )}

                              {/* Media Type Badge */}
                              {item.mediaType === 'video' ? (
                                <div className="absolute bottom-9 left-1.5 z-10 bg-red-600/90 text-white text-[9px] font-mono font-black px-1.5 py-0.5 rounded flex items-center space-x-1 shadow-sm">
                                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                  <span>VID</span>
                                </div>
                              ) : (
                                <div className="absolute bottom-9 left-1.5 z-10 bg-neutral-900/80 text-neutral-300 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded">
                                  IMG
                                </div>
                              )}

                              {/* Delete Item Button */}
                              <button
                                type="button"
                                onClick={() => handleRemoveBatchFile(item.id)}
                                className="absolute top-1.5 right-1.5 z-10 p-1 rounded-md bg-black/80 hover:bg-red-600 text-neutral-400 hover:text-white transition-colors cursor-pointer border border-neutral-700 hover:border-red-500"
                                title="Remove file"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>

                              {/* Thumbnail */}
                              <div className="h-28 w-full bg-black flex items-center justify-center overflow-hidden">
                                {item.mediaType === 'video' ? (
                                  <video
                                    src={item.previewUrl}
                                    className="w-full h-full object-cover"
                                    muted
                                    playsInline
                                  />
                                ) : (
                                  <img
                                    src={item.previewUrl}
                                    alt={item.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                )}
                              </div>

                              {/* File info & In-Browser Compress Button */}
                              <div className="p-1.5 bg-neutral-900 text-left border-t border-neutral-800">
                                <p className="text-[11px] font-mono text-neutral-200 truncate" title={item.name}>
                                  {item.name}
                                </p>
                                <p className={`text-[9px] font-mono ${isOver100MB ? 'text-amber-400 font-bold' : 'text-neutral-400'}`}>
                                  {item.sizeText}
                                </p>

                                {item.mediaType === 'video' && isOver100MB && (
                                  <button
                                    type="button"
                                    disabled={isCompressing}
                                    onClick={() => handleCompressBatchItem(item.id)}
                                    className="w-full mt-1.5 px-2 py-1 bg-amber-400 hover:bg-amber-300 disabled:bg-neutral-800 disabled:text-neutral-500 text-neutral-950 font-bold text-[10px] rounded flex items-center justify-center space-x-1 cursor-pointer transition-colors shadow-sm"
                                  >
                                    {isCompressing ? (
                                      <span>⏳ {language === 'kn' ? 'ಕುಗ್ಗಿಸಲಾಗುತ್ತಿದೆ' : 'Compressing'} {compressingBatchProgress}%</span>
                                    ) : (
                                      <>
                                        <Sparkles className="w-2.5 h-2.5 text-neutral-950" />
                                        <span>{language === 'kn' ? '⚡ ಕುಗ್ಗಿಸಿ (<100MB)' : '⚡ Compress (<100MB)'}</span>
                                      </>
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Batch Upload Progress Indicator */}
              {batchUploadStatus && (
                <div className="space-y-2.5 p-4 rounded-2xl bg-amber-400/10 border border-amber-400/40 shadow-lg">
                  <div className="flex items-center justify-between text-xs sm:text-sm font-mono font-bold text-amber-300">
                    <span className="flex items-center space-x-2 truncate pr-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping shrink-0" />
                      <span>
                        {language === 'kn'
                          ? `ಅಪ್‌ಲೋಡ್ ಆಗುತ್ತಿದೆ (${batchUploadStatus.current} / ${batchUploadStatus.total}):`
                          : `Uploading (${batchUploadStatus.current} / ${batchUploadStatus.total}):`}
                      </span>
                      <span className="text-white truncate font-sans">{batchUploadStatus.currentFileName}</span>
                    </span>
                    <span className="shrink-0">{batchUploadStatus.overallPercent}%</span>
                  </div>

                  {/* Overall Progress Bar */}
                  <div className="w-full h-2.5 rounded-full bg-neutral-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 rounded-full transition-all duration-200"
                      style={{ width: `${batchUploadStatus.overallPercent}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[11px] font-mono text-neutral-400">
                    <span>
                      {language === 'kn'
                        ? `ಪ್ರಸ್ತುತ ಫೈಲ್: ${batchUploadStatus.itemPercent}%`
                        : `Current file: ${batchUploadStatus.itemPercent}%`}
                    </span>
                    <span className="text-amber-400 font-bold">
                      {batchUploadStatus.current - 1} / {batchUploadStatus.total} {language === 'kn' ? 'ಪೂರ್ಣಗೊಂಡಿದೆ' : 'saved'}
                    </span>
                  </div>
                </div>
              )}

              {uploadError && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs sm:text-sm text-red-300 flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-300 mb-1.5">
                    {language === 'kn' ? 'ಶೀರ್ಷಿಕೆ (ಕನ್ನಡ)' : 'Kannada Title'}
                  </label>
                  <input
                    type="text"
                    value={formTitleKn}
                    onChange={(e) => setFormTitleKn(e.target.value)}
                    placeholder="ಚಾಣಕ್ಯ ಯುವಕ ಮಂಡಳ"
                    className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-neutral-900 border border-neutral-700/80 text-sm sm:text-base text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-300 mb-1.5">
                    {language === 'kn' ? 'ಶೀರ್ಷಿಕೆ (English)' : 'English Title'}
                  </label>
                  <input
                    type="text"
                    value={formTitleEn}
                    onChange={(e) => setFormTitleEn(e.target.value)}
                    placeholder="Chanakya Yuvak Mandal"
                    className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-neutral-900 border border-neutral-700/80 text-sm sm:text-base text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-300 mb-1.5">
                    {language === 'kn' ? 'ವರ್ಗ (Category)' : 'Category'}
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as MediaCategory)}
                    className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-neutral-900 border border-neutral-700/80 text-sm sm:text-base text-white focus:outline-none focus:border-amber-400 transition-all cursor-pointer"
                  >
                    <option value="aagamana">🚩 {language === 'kn' ? 'ಗಣಪತಿ ಆಗಮನ & ಪ್ರಾರಂಭ (Ganesh Aagamana)' : 'Ganesh Aagamana & Opening'}</option>
                    <option value="saval">👑 {language === 'kn' ? 'ಪವಿತ್ರ ಸವಾಲ್ & ಲೇಲಾವ್ (Prasad/Garland Saval)' : 'Sacred Saval & Auction'}</option>
                    <option value="darshan">🪔 {language === 'kn' ? 'ಮಹಾ ಗಣಪತಿ ದರ್ಶನ (Maha Darshan)' : 'Royal Ganesh Darshan'}</option>
                    <option value="aarti">🔥 {language === 'kn' ? 'ಮಹಾ ಮಂಗಳಾರತಿ (Maha Aarti)' : 'Maha Aarti'}</option>
                    <option value="pandal">🏛️ {language === 'kn' ? 'ಭವ್ಯ ಮಂಟಪ & ದೀಪಾಲಂಕಾರ (Pandal & Decor)' : 'Pandal & Decor'}</option>
                    <option value="visarjan">🥁 {language === 'kn' ? 'ವಿಸರ್ಜನಾ ಮೆರವಣಿಗೆ (Visarjan Miravanige)' : 'Visarjan Procession'}</option>
                    <option value="cultural">🎭 {language === 'kn' ? 'ಪ್ರವಚನ & ಸಾಂಸ್ಕೃತಿಕ (Cultural Events)' : 'Cultural & Stage Events'}</option>
                    <option value="seva">🙏 {language === 'kn' ? 'ಮಹಾ ಅನ್ನದಾಸೋಹ ಸೇವೆ (Anna Prasad Seva)' : 'Maha Prasad Seva'}</option>
                  </select>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-300">
                      {language === 'kn' ? 'ವರ್ಷ (Festival Year) *' : 'Festival Year *'}
                    </label>
                    <span className="text-xs text-amber-400 font-mono font-bold bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/30">
                      {formYear}
                    </span>
                  </div>
                  <input
                    type="number"
                    value={formYear}
                    onChange={(e) => setFormYear(Number(e.target.value))}
                    min={2019}
                    max={2050}
                    className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-neutral-900 border border-neutral-700/80 text-sm sm:text-base text-white focus:outline-none focus:border-amber-400 font-mono font-bold transition-all"
                  />
                  {/* Quick Shortcut Year Pills */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {[2028, 2027, 2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019].map((yr) => (
                      <button
                        type="button"
                        key={yr}
                        onClick={() => setFormYear(yr)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer border ${
                          formYear === yr
                            ? 'bg-amber-400 text-neutral-950 border-amber-400 font-black shadow-xs'
                            : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-neutral-700'
                        }`}
                      >
                        {yr}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Where to Display - Multi-Select Checkboxes */}
              <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-400">
                    {language === 'kn' ? 'ಎಲ್ಲೆಲ್ಲಿ ತೋರಿಸಬೇಕು? (Display On Pages)' : 'Display On Pages - Multi-Select *'}
                  </label>
                  <span className="text-xs text-amber-400 font-mono font-bold bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/30">
                    {formPlacements.length} {language === 'kn' ? 'ಪುಟಗಳು ಆಯ್ದುಕೊಳ್ಳಲಾಗಿದೆ' : 'Pages Selected'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {PLACEMENT_OPTIONS.map((opt) => {
                    const isChecked = formPlacements.includes(opt.id);
                    return (
                      <button
                        type="button"
                        key={opt.id}
                        onClick={() => {
                          if (isChecked) {
                            if (formPlacements.length > 1) {
                              setFormPlacements(formPlacements.filter((p) => p !== opt.id));
                            }
                          } else {
                            setFormPlacements([...formPlacements, opt.id]);
                          }
                        }}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                          isChecked
                            ? 'bg-amber-400/15 border-amber-400/80 text-white shadow-md'
                            : 'bg-black/60 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                          <span className="text-lg">{opt.icon}</span>
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-bold text-white leading-tight truncate">
                              {opt.labelKn}
                            </p>
                            <p className="text-[10px] sm:text-xs text-neutral-400 truncate mt-0.5">
                              {opt.labelEn}
                            </p>
                          </div>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center text-xs shrink-0 border transition-colors ${
                            isChecked
                              ? 'bg-amber-400 text-neutral-950 border-amber-400 font-black'
                              : 'border-neutral-700 bg-neutral-800'
                          }`}
                        >
                          {isChecked ? '✓' : ''}
                        </div>
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-emerald-400 font-sans">
                  ⚡ 1 ಬಾರಿ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ: ಯಾವುದೇ ಹೆಚ್ಚುವರಿ ಸ್ಟೋರೇಜ್ ಇಲ್ಲದೆ ಆಯ್ಕೆಮಾಡಿದ ಎಲ್ಲಾ ಪುಟಗಳಲ್ಲಿ ಕಾಣಿಸುತ್ತದೆ (Cloudinary Quota Saved).
                </p>
              </div>

              <div className="flex items-center space-x-3 pt-1">
                <input
                  type="checkbox"
                  id="formIsActive"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="w-5 h-5 rounded accent-amber-400 cursor-pointer"
                />
                <label htmlFor="formIsActive" className="text-sm font-semibold text-neutral-300 cursor-pointer select-none">
                  {language === 'kn' ? 'ವೆಬ್‌ಸೈಟ್‌ನಲ್ಲಿ ತಕ್ಷಣವೇ ಸಕ್ರಿಯಗೊಳಿಸಿ (Active Immediately)' : 'Make active immediately on public website'}
                </label>
              </div>

              <div className="pt-4 border-t border-neutral-800 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => setIsMediaUploadOpen(false)}
                  className="px-5 py-2.5 sm:py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs sm:text-sm font-bold text-neutral-300 hover:text-white transition-colors cursor-pointer disabled:opacity-40"
                >
                  {language === 'kn' ? 'ರದ್ದುಮಾಡಿ' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={
                    isUploading ||
                    (mediaUploadTab === 'file'
                      ? batchMediaFiles.length === 0 || batchMediaFiles.some((f) => f.file.size > MAX_CLOUDINARY_BYTES)
                      : !extractYoutubeVideoId(youtubeMediaUrl))
                  }
                  className="px-7 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 font-black text-xs sm:text-sm cursor-pointer shadow-lg shadow-amber-400/20 disabled:opacity-40 transition-all flex items-center space-x-2"
                >
                  {isUploading ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                      <span>
                        {language === 'kn'
                          ? mediaUploadTab === 'youtube'
                            ? 'ಉಳಿಸಲಾಗುತ್ತಿದೆ...'
                            : `ಅಪ್‌ಲೋಡ್ ಆಗುತ್ತಿದೆ (${batchUploadStatus?.current || 1}/${batchUploadStatus?.total || batchMediaFiles.length})...`
                          : mediaUploadTab === 'youtube'
                          ? 'Saving YouTube Video...'
                          : `Uploading (${batchUploadStatus?.current || 1}/${batchUploadStatus?.total || batchMediaFiles.length})...`}
                      </span>
                    </>
                  ) : (
                    <span>
                      {language === 'kn'
                        ? mediaUploadTab === 'youtube'
                          ? 'YouTube ವೀಡಿಯೊ ಸೇರಿಸಿ & ಉಳಿಸಿ'
                          : batchMediaFiles.length > 0
                          ? `ಎಲ್ಲವನ್ನೂ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ (${batchMediaFiles.length} ಐಟಂಗಳು)`
                          : 'ಅಪ್‌ಲೋಡ್ ಮಾಡಿ & ಉಳಿಸಿ'
                        : mediaUploadTab === 'youtube'
                        ? 'Add & Save YouTube Video'
                        : batchMediaFiles.length > 0
                        ? `Upload All (${batchMediaFiles.length} Items)`
                        : 'Upload & Save'}
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1B: MEDIA EDIT */}
      {/* ========================================================================= */}
      {editingMedia && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-[#101015] border border-amber-400/40 rounded-3xl max-w-3xl lg:max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[92vh] overflow-y-auto scrollbar-thin scrollbar-thumb-amber-400/30 my-auto">
            <div className="flex items-start justify-between pb-4 border-b border-neutral-800">
              <div className="flex items-center space-x-3.5">
                <div className="w-11 h-11 rounded-2xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-sm shrink-0">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                    {language === 'kn' ? 'ಮಾಧ್ಯಮ ವಿವರ ಸಂಪಾದಿಸಿ' : 'Edit Media Details'}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
                    {language === 'kn'
                      ? 'ಶೀರ್ಷಿಕೆ, ವರ್ಗ, ವರ್ಷ ಮತ್ತು ಪ್ರದರ್ಶನದ ಪುಟಗಳನ್ನು ಬದಲಾಯಿಸಿ'
                      : 'Update title, category, year and display placements'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingMedia(null)}
                className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleMediaEditSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-300 mb-1.5">
                    {language === 'kn' ? 'ಶೀರ್ಷಿಕೆ (ಕನ್ನಡ)' : 'Kannada Title'}
                  </label>
                  <input
                    type="text"
                    value={editingMedia.titleKn}
                    onChange={(e) => setEditingMedia({ ...editingMedia, titleKn: e.target.value })}
                    className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-neutral-900 border border-neutral-700/80 text-sm sm:text-base text-white focus:outline-none focus:border-amber-400 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-300 mb-1.5">
                    {language === 'kn' ? 'ಶೀರ್ಷಿಕೆ (English)' : 'English Title'}
                  </label>
                  <input
                    type="text"
                    value={editingMedia.titleEn}
                    onChange={(e) => setEditingMedia({ ...editingMedia, titleEn: e.target.value })}
                    className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-neutral-900 border border-neutral-700/80 text-sm sm:text-base text-white focus:outline-none focus:border-amber-400 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-300 mb-1.5">
                    {language === 'kn' ? 'ವರ್ಗ (Category)' : 'Category'}
                  </label>
                  <select
                    value={editingMedia.category}
                    onChange={(e) => setEditingMedia({ ...editingMedia, category: e.target.value as MediaCategory })}
                    className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-neutral-900 border border-neutral-700/80 text-sm sm:text-base text-white focus:outline-none focus:border-amber-400 transition-all cursor-pointer"
                  >
                    <option value="aagamana">🚩 {language === 'kn' ? 'ಗಣಪತಿ ಆಗಮನ & ಪ್ರಾರಂಭ (Ganesh Aagamana)' : 'Ganesh Aagamana & Opening'}</option>
                    <option value="saval">👑 {language === 'kn' ? 'ಪವಿತ್ರ ಸವಾಲ್ & ಲೇಲಾವ್ (Prasad/Garland Saval)' : 'Sacred Saval & Auction'}</option>
                    <option value="darshan">🪔 {language === 'kn' ? 'ಮಹಾ ಗಣಪತಿ ದರ್ಶನ (Maha Darshan)' : 'Royal Ganesh Darshan'}</option>
                    <option value="aarti">🔥 {language === 'kn' ? 'ಮಹಾ ಮಂಗಳಾರತಿ (Maha Aarti)' : 'Maha Aarti'}</option>
                    <option value="pandal">🏛️ {language === 'kn' ? 'ಭವ್ಯ ಮಂಟಪ & ದೀಪಾಲಂಕಾರ (Pandal & Decor)' : 'Pandal & Decor'}</option>
                    <option value="visarjan">🥁 {language === 'kn' ? 'ವಿಸರ್ಜನಾ ಮೆರವಣಿಗೆ (Visarjan Miravanige)' : 'Visarjan Procession'}</option>
                    <option value="cultural">🎭 {language === 'kn' ? 'ಪ್ರವಚನ & ಸಾಂಸ್ಕೃತಿಕ (Cultural Events)' : 'Cultural & Stage Events'}</option>
                    <option value="seva">🙏 {language === 'kn' ? 'ಮಹಾ ಅನ್ನದಾಸೋಹ ಸೇವೆ (Anna Prasad Seva)' : 'Maha Prasad Seva'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-300 mb-1.5">
                    {language === 'kn' ? 'ವರ್ಷ (Year)' : 'Year'}
                  </label>
                  <input
                    type="number"
                    value={editingMedia.year}
                    onChange={(e) => setEditingMedia({ ...editingMedia, year: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-neutral-900 border border-neutral-700/80 text-sm sm:text-base text-white focus:outline-none focus:border-amber-400 font-mono font-bold transition-all"
                  />
                </div>
              </div>

              {/* Edit Display Pages - Multi-Select Checkboxes */}
              <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-400">
                    {language === 'kn' ? 'ಎಲ್ಲೆಲ್ಲಿ ತೋರಿಸಬೇಕು? (Display On Pages)' : 'Display On Pages - Multi-Select *'}
                  </label>
                  <span className="text-xs text-amber-400 font-mono font-bold bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/30">
                    {((editingMedia.placements && editingMedia.placements.length > 0)
                      ? editingMedia.placements
                      : [editingMedia.placement || 'gallery']
                    ).length} {language === 'kn' ? 'ಪುಟಗಳು ಆಯ್ದುಕೊಳ್ಳಲಾಗಿದೆ' : 'Pages Selected'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {PLACEMENT_OPTIONS.map((opt) => {
                    const currentPlacements: MediaPlacement[] =
                      editingMedia.placements && editingMedia.placements.length > 0
                        ? editingMedia.placements
                        : [editingMedia.placement || 'gallery'];
                    const isChecked = currentPlacements.includes(opt.id);

                    return (
                      <button
                        type="button"
                        key={opt.id}
                        onClick={() => {
                          let nextPlacements: MediaPlacement[];
                          if (isChecked) {
                            if (currentPlacements.length > 1) {
                              nextPlacements = currentPlacements.filter((p) => p !== opt.id);
                            } else {
                              nextPlacements = currentPlacements;
                            }
                          } else {
                            nextPlacements = [...currentPlacements, opt.id];
                          }
                          setEditingMedia({
                            ...editingMedia,
                            placements: nextPlacements,
                            placement: nextPlacements[0] || 'gallery',
                          });
                        }}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                          isChecked
                            ? 'bg-amber-400/15 border-amber-400/80 text-white shadow-md'
                            : 'bg-black/60 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                          <span className="text-lg">{opt.icon}</span>
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-bold text-white leading-tight truncate">
                              {opt.labelKn}
                            </p>
                            <p className="text-[10px] sm:text-xs text-neutral-400 truncate mt-0.5">
                              {opt.labelEn}
                            </p>
                          </div>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center text-xs shrink-0 border transition-colors ${
                            isChecked
                              ? 'bg-amber-400 text-neutral-950 border-amber-400 font-black'
                              : 'border-neutral-700 bg-neutral-800'
                          }`}
                        >
                          {isChecked ? '✓' : ''}
                        </div>
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-emerald-400 font-sans">
                  ⚡ 1 ಬಾರಿ ಅಪ್‌ಲೋಡ್ ಮಾಡಿದ ಫೋಟೋ: ಯಾವುದೇ ಮರು-ಅಪ್‌ಲೋಡ್ ಇಲ್ಲದೆ ಕ್ಷಣಾರ್ಧದಲ್ಲಿ ಆಯ್ದ ಪುಟಗಳಲ್ಲಿ ಬದಲಾಗುತ್ತದೆ.
                </p>
              </div>

              <div className="flex items-center space-x-3 pt-1">
                <input
                  type="checkbox"
                  id="editMediaActive"
                  checked={editingMedia.isActive}
                  onChange={(e) => setEditingMedia({ ...editingMedia, isActive: e.target.checked })}
                  className="w-5 h-5 rounded accent-amber-400 cursor-pointer"
                />
                <label htmlFor="editMediaActive" className="text-sm font-semibold text-neutral-300 cursor-pointer select-none">
                  {language === 'kn' ? 'ವೆಬ್‌ಸೈಟ್‌ನಲ್ಲಿ ಸಕ್ರಿಯಗೊಳಿಸಿ (Active on website)' : 'Active (visible on website)'}
                </label>
              </div>

              <div className="pt-4 border-t border-neutral-800 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingMedia(null)}
                  className="px-5 py-2.5 sm:py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs sm:text-sm font-bold text-neutral-300 hover:text-white transition-colors cursor-pointer"
                >
                  {language === 'kn' ? 'ರದ್ದುಮಾಡಿ' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-7 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 font-black text-xs sm:text-sm cursor-pointer shadow-lg shadow-amber-400/20 transition-all"
                >
                  {language === 'kn' ? 'ನವೀಕರಿಸಿ' : 'Update Media'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: COMMITTEE MEMBER ADD/EDIT */}
      {/* ========================================================================= */}
      {isMemberModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-[#101015] border border-amber-400/40 rounded-3xl max-w-3xl lg:max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[92vh] overflow-y-auto scrollbar-thin scrollbar-thumb-amber-400/30 my-auto">
            <div className="flex items-start justify-between pb-4 border-b border-neutral-800">
              <div className="flex items-center space-x-3.5">
                <div className="w-11 h-11 rounded-2xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-sm shrink-0">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                    {editingMember
                      ? (language === 'kn' ? 'ಸಮಿತಿ ಸದಸ್ಯರ ವಿವರ ಸಂಪಾದಿಸಿ' : 'Edit Committee Member')
                      : (language === 'kn' ? 'ಹೊಸ ಸಮಿತಿ ಸದಸ್ಯರನ್ನು ಸೇರಿಸಿ' : 'Add Committee Member')}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
                    {language === 'kn'
                      ? 'ಸದಸ್ಯರ ಹೆಸರು, ಹುದ್ದೆ, ವಿಭಾಗ, ಭಾವಚಿತ್ರ ಮತ್ತು ಅಧಿಕಾರಾವಧಿ ವಿವರಗಳನ್ನು ದಾಖಲಿಸಿ'
                      : 'Record member name, role, wing, portrait photo, and leadership period'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsMemberModalOpen(false)}
                className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleMemberSubmit} className="space-y-5">
              {memberError && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs sm:text-sm text-red-300">
                  {memberError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-300 mb-1.5">
                    {language === 'kn' ? 'ಹೆಸರು (ಕನ್ನಡ) *' : 'Kannada Name *'}
                  </label>
                  <input
                    type="text"
                    value={memberNameKn}
                    onChange={(e) => setMemberNameKn(e.target.value)}
                    placeholder="ಸಂತೋಷ ಪಾಟೀಲ"
                    className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-neutral-900 border border-neutral-700/80 text-sm sm:text-base text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-300 mb-1.5">
                    {language === 'kn' ? 'ಹೆಸರು (English) *' : 'English Name *'}
                  </label>
                  <input
                    type="text"
                    value={memberNameEn}
                    onChange={(e) => setMemberNameEn(e.target.value)}
                    placeholder="Santosh Patil"
                    className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-neutral-900 border border-neutral-700/80 text-sm sm:text-base text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Designation Selector (Dropdown + Quick-Select Buttons) */}
              <div className="space-y-3 p-4 sm:p-5 rounded-2xl bg-neutral-900/90 border border-neutral-800">
                <div className="flex items-center justify-between">
                  <label className="block text-xs sm:text-sm font-bold text-amber-400 uppercase tracking-wider">
                    {language === 'kn' ? 'ಹುದ್ದೆ ಆಯ್ಕೆಮಾಡಿ (Select Designation) *' : 'Select Designation *'}
                  </label>
                  <span className="text-xs text-neutral-400 font-mono font-bold bg-neutral-800 px-2 py-0.5 rounded-md">
                    {selectedRolePreset !== 'custom' ? 'Preset Active' : 'Custom'}
                  </span>
                </div>

                {/* Primary Role Dropdown */}
                <select
                  value={selectedRolePreset}
                  onChange={(e) => handleRolePresetChange(e.target.value)}
                  className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-black border border-amber-400/60 text-sm sm:text-base text-amber-300 font-semibold focus:outline-none focus:border-amber-400 cursor-pointer shadow-inner transition-all"
                >
                  <option value="" disabled>-- ಹುದ್ದೆ ಆಯ್ಕೆಮಾಡಿ (Select Role) --</option>
                  {PRESET_COMMITTEE_ROLES.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.labelKn} / {r.labelEn}
                    </option>
                  ))}
                </select>

                {/* Quick-Tap Shortcut Buttons */}
                <div className="pt-1">
                  <span className="text-xs text-neutral-400 uppercase font-semibold block mb-2">
                    {language === 'kn' ? 'ತ್ವರಿತ ಹುದ್ದೆ ಆಯ್ಕೆ:' : 'Quick Select Role:'}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'president', label: 'ಅಧ್ಯಕ್ಷರು' },
                      { id: 'vice_president', label: 'ಉಪಾಧ್ಯಕ್ಷರು' },
                      { id: 'treasurer', label: 'ಖಜಾಂಚಿ' },
                      { id: 'advisor', label: 'ಗೌರವ ಸಲಹೆಗಾರರು' },
                      { id: 'secretary', label: 'ಕಾರ್ಯದರ್ಶಿ' },
                      { id: 'committee_member', label: 'ಕಮಿಟಿ ಸದಸ್ಯರು' },
                    ].map((pill) => (
                      <button
                        type="button"
                        key={pill.id}
                        onClick={() => handleRolePresetChange(pill.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer border ${
                          selectedRolePreset === pill.id
                            ? 'bg-amber-400 text-neutral-950 border-amber-400 font-black shadow-xs'
                            : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-neutral-700'
                        }`}
                      >
                        {pill.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Auto-populated Kannada & English Title fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                      {language === 'kn' ? 'ಕನ್ನಡ ಹುದ್ದೆ ಶೀರ್ಷಿಕೆ (ಸ್ವಯಂ ಭರ್ತಿ)' : 'Kannada Role (Auto-filled)'}
                    </label>
                    <input
                      type="text"
                      value={memberRoleKn}
                      onChange={(e) => {
                        setMemberRoleKn(e.target.value);
                        setSelectedRolePreset('custom');
                      }}
                      placeholder="ಅಧ್ಯಕ್ಷರು"
                      className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-black border border-neutral-700 text-sm sm:text-base text-white focus:outline-none focus:border-amber-400 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                      {language === 'kn' ? 'ಇಂಗ್ಲಿಷ್ ಹುದ್ದೆ ಶೀರ್ಷಿಕೆ (ಸ್ವಯಂ ಭರ್ತಿ)' : 'English Role (Auto-filled)'}
                    </label>
                    <input
                      type="text"
                      value={memberRoleEn}
                      onChange={(e) => {
                        setMemberRoleEn(e.target.value);
                        setSelectedRolePreset('custom');
                      }}
                      placeholder="President"
                      className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-black border border-neutral-700 text-sm sm:text-base text-white focus:outline-none focus:border-amber-400 transition-all"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-300 mb-1.5">
                    {language === 'kn' ? 'ವಿಭಾಗ / ಘಟಕ (Category / Wing)' : 'Category / Wing'}
                  </label>
                  <select
                    value={memberCategory}
                    onChange={(e) => setMemberCategory(e.target.value as any)}
                    className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-neutral-900 border border-neutral-700/80 text-sm sm:text-base text-white focus:outline-none focus:border-amber-400 transition-all"
                  >
                    <option value="office">Office Bearer (ಪದಾಧಿಕಾರಿಗಳು)</option>
                    <option value="core">Core Committee (ಮುಖ್ಯ ಸಮಿತಿ)</option>
                    <option value="youth">Youth Volunteer (ಯುವ ಘಟಕ)</option>
                    <option value="advisory">Advisory Board (ಸಲಹಾ ಮಂಡಳಿ)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-300 mb-1.5">
                    {language === 'kn' ? 'ಕ್ರಮ ಸಂಖ್ಯೆ (Display Order)' : 'Display Order #'}
                  </label>
                  <input
                    type="number"
                    value={memberOrder}
                    onChange={(e) => setMemberOrder(Number(e.target.value))}
                    className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-neutral-900 border border-neutral-700/80 text-sm sm:text-base text-white focus:outline-none focus:border-amber-400 font-mono font-bold transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-300 mb-1.5">
                    {language === 'kn' ? 'ಅವಧಿ (ಕನ್ನಡ)' : 'Period (Kannada)'}
                  </label>
                  <input
                    type="text"
                    value={memberPeriodKn}
                    onChange={(e) => setMemberPeriodKn(e.target.value)}
                    placeholder="ಸ್ಥಾಪಕ ಸದಸ್ಯರು (2019 ರಿಂದ ನಿರಂತರ)"
                    className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-neutral-900 border border-neutral-700/80 text-sm sm:text-base text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-300 mb-1.5">
                    {language === 'kn' ? 'ಅವಧಿ (English)' : 'Period (English)'}
                  </label>
                  <input
                    type="text"
                    value={memberPeriodEn}
                    onChange={(e) => setMemberPeriodEn(e.target.value)}
                    placeholder="Founding Member (2019 – Present)"
                    className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-neutral-900 border border-neutral-700/80 text-sm sm:text-base text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-1">
                <input
                  type="checkbox"
                  id="memberFounding"
                  checked={memberIsFounding}
                  onChange={(e) => setMemberIsFounding(e.target.checked)}
                  className="w-5 h-5 rounded accent-amber-400 cursor-pointer"
                />
                <label htmlFor="memberFounding" className="text-sm font-semibold text-neutral-300 cursor-pointer select-none">
                  {language === 'kn'
                    ? 'ಸ್ಥಾಪಕ ಸದಸ್ಯರು (Shows "Est. 2019" founding badge)'
                    : "Founding Member (Shows 'Est. 2019' badge)"}
                </label>
              </div>

              {/* Member Portrait Photo (With Crop & Adjust Tool) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs sm:text-sm font-bold text-amber-400 uppercase tracking-wider">
                    {language === 'kn' ? 'ಸದಸ್ಯರ ಭಾವಚಿತ್ರ (Member Portrait Photo)' : 'Member Portrait Photo'}
                  </label>
                  {(memberPhotoPreview || memberPhotoUrl) && (
                    <span className="text-xs text-emerald-400 font-semibold flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Photo Ready</span>
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Photo Avatar Preview */}
                  <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-amber-400/80 bg-neutral-950 flex items-center justify-center shrink-0 shadow-lg">
                    {memberPhotoPreview || memberPhotoUrl ? (
                      <img
                        src={memberPhotoPreview || memberPhotoUrl}
                        alt="Member Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Users className="w-8 h-8 text-neutral-600" />
                    )}
                  </div>

                  {/* Actions: Choose File, Crop & Adjust, and URL Option */}
                  <div className="flex-1 space-y-2.5">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <label className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs sm:text-sm font-bold cursor-pointer transition-colors shadow-sm">
                        <Camera className="w-4 h-4 text-neutral-950" />
                        <span>{memberPhotoPreview || memberPhotoUrl ? (language === 'kn' ? 'ಫೋಟೋ ಬದಲಿಸಿ' : 'Change Photo') : (language === 'kn' ? 'ಫೋಟೋ ಆಯ್ಕೆಮಾಡಿ' : 'Choose Photo')}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              const file = e.target.files[0];
                              const preview = URL.createObjectURL(file);
                              setMemberPhotoFile(file);
                              setMemberPhotoPreview(preview);
                              setRawCropImageSrc(preview);
                              e.target.value = '';
                            }
                          }}
                        />
                      </label>

                      {(memberPhotoPreview || rawCropImageSrc) && (
                        <button
                          type="button"
                          onClick={() => {
                            const src = rawCropImageSrc || memberPhotoPreview || memberPhotoUrl;
                            if (src) {
                              setRawCropImageSrc(src);
                              setIsCropModalOpen(true);
                            }
                          }}
                          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 text-xs sm:text-sm font-bold transition-colors border border-amber-400/30 cursor-pointer"
                          title="Zoom, rotate and center member photo perfectly"
                        >
                          <Crop className="w-4 h-4" />
                          <span>{language === 'kn' ? 'ಹೊಂದಿಸಿ & ಕ್ರಾಪ್ (Crop & Adjust)' : 'Crop & Adjust'}</span>
                        </button>
                      )}

                      {(memberPhotoPreview || memberPhotoUrl) && (
                        <button
                          type="button"
                          onClick={() => {
                            setMemberPhotoFile(null);
                            setMemberPhotoPreview(null);
                            setMemberPhotoUrl('');
                            setRawCropImageSrc(null);
                          }}
                          className="p-2 rounded-xl text-neutral-400 hover:text-red-400 hover:bg-neutral-800 transition-colors cursor-pointer"
                          title="Remove photo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-neutral-400 font-sans">
                      {language === 'kn'
                        ? 'ಸದಸ್ಯರ ಮುಖದ ಭಾವಚಿತ್ರ ಆಯ್ಕೆಮಾಡಿ. ನಂತರ "Crop & Adjust" ಬಳಸಿ ಮುಖವನ್ನು ಸರಿಯಾಗಿ ವೃತ್ತಾಕಾರದಲ್ಲಿ ಜೋಡಿಸಬಹುದು.'
                        : 'Select portrait photo to upload. Click "Crop & Adjust" to zoom and center face perfectly.'}
                    </p>

                    {/* Direct Image URL input option */}
                    <div className="pt-1">
                      <input
                        type="url"
                        value={memberPhotoUrl}
                        onChange={(e) => {
                          const val = e.target.value;
                          setMemberPhotoUrl(val);
                          if (!memberPhotoFile) {
                            setMemberPhotoPreview(val || null);
                          }
                        }}
                        placeholder={language === 'kn' ? 'ಅಥವಾ ಫೋಟೋ ಲಿಂಕ್ (Paste Direct Image URL)' : 'Or paste photo URL'}
                        className="w-full px-4 py-2.5 rounded-xl bg-black border border-neutral-800 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Upload Progress Bar if uploading */}
                {memberUploadProgress !== null && (
                  <div className="space-y-1.5 p-3 rounded-xl bg-amber-400/10 border border-amber-400/30">
                    <div className="flex items-center justify-between text-xs sm:text-sm font-mono font-bold text-amber-300">
                      <span>{language === 'kn' ? 'ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಆಗುತ್ತಿದೆ...' : 'Uploading Photo...'}</span>
                      <span>{memberUploadProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all duration-200"
                        style={{ width: `${memberUploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-neutral-800 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsMemberModalOpen(false)}
                  className="px-5 py-2.5 sm:py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs sm:text-sm font-bold text-neutral-300 hover:text-white transition-colors cursor-pointer"
                >
                  {language === 'kn' ? 'ರದ್ದುಮಾಡಿ' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={memberSaving}
                  className="px-7 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 font-black text-xs sm:text-sm cursor-pointer shadow-lg shadow-amber-400/20 disabled:opacity-50 flex items-center space-x-2 transition-all"
                >
                  {memberSaving ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                      <span>{memberUploadProgress ? `Uploading ${memberUploadProgress}%` : (language === 'kn' ? 'ಉಳಿಸಲಾಗುತ್ತಿದೆ...' : 'Saving...')}</span>
                    </>
                  ) : (
                    <span>{editingMember ? (language === 'kn' ? 'ನವೀಕರಿಸಿ' : 'Update Member') : (language === 'kn' ? 'ಸದಸ್ಯರನ್ನು ಸೇರಿಸಿ' : 'Add Member')}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2.1: COMMITTEE PHOTO CROP & ADJUST */}
      {/* ========================================================================= */}
      <PhotoCropAdjustModal
        isOpen={isCropModalOpen}
        imageSrc={rawCropImageSrc}
        onClose={() => setIsCropModalOpen(false)}
        initialMemberName={memberNameEn || memberNameKn || 'member'}
        onApplyCrop={(croppedFile, previewUrl) => {
          setMemberPhotoFile(croppedFile);
          setMemberPhotoPreview(previewUrl);
        }}
      />

      {/* ========================================================================= */}
      {/* MODAL 3: HISTORY MILESTONE ADD/EDIT */}
      {/* ========================================================================= */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-[#101015] border border-amber-400/40 rounded-3xl max-w-4xl lg:max-w-5xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[92vh] overflow-y-auto scrollbar-thin scrollbar-thumb-amber-400/30 my-auto">
            <div className="flex items-start justify-between pb-4 border-b border-neutral-800">
              <div className="flex items-center space-x-3.5">
                <div className="w-11 h-11 rounded-2xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-sm shrink-0">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                    {editingHistory
                      ? (language === 'kn' ? 'ವರ್ಷದ ಇತಿಹಾಸ ಸಂಪಾದಿಸಿ' : 'Edit Festival Milestone')
                      : (language === 'kn' ? 'ಹೊಸ ವರ್ಷದ ಇತಿಹಾಸ ಸೇರಿಸಿ' : 'Add Festival Milestone')}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
                    {language === 'kn'
                      ? 'ವರ್ಷ, ಶೀರ್ಷಿಕೆ, ಸಂವತ್ಸರ, ಮಂಟಪ ಥೀಮ್ ಮತ್ತು ಮುಖಪುಟ ಮಾಧ್ಯಮ ವಿವರಗಳನ್ನು ದಾಖಲಿಸಿ'
                      : 'Record festival year, samvatsara, pandal theme, story and cover media'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsHistoryModalOpen(false)}
                className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleHistorySubmit} className="space-y-5">
              {historyError && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs sm:text-sm text-red-300">
                  {historyError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1 p-3.5 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-300">
                      {language === 'kn' ? 'ವರ್ಷ (Year) *' : 'Year *'}
                    </label>
                    <span className="text-xs text-amber-400 font-mono font-bold bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/30">
                      {historyYear}
                    </span>
                  </div>
                  <input
                    type="number"
                    value={historyYear}
                    onChange={(e) => setHistoryYear(Number(e.target.value))}
                    min={2019}
                    max={2050}
                    className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-neutral-950 border border-neutral-700 text-sm sm:text-base text-white focus:outline-none focus:border-amber-400 font-mono font-bold shadow-inner"
                    required
                  />
                  {/* Quick Shortcut Year Pills */}
                  <div className="pt-1">
                    <span className="text-[11px] text-neutral-400 block mb-1.5 font-medium">
                      {language === 'kn' ? 'ತ್ವರಿತ ವರ್ಷ ಆಯ್ಕೆ:' : 'Quick Select Year:'}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {[2028, 2027, 2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019].map((yr) => (
                        <button
                          type="button"
                          key={yr}
                          onClick={() => {
                            setHistoryYear(yr);
                            if (!historyTitleKn) setHistoryTitleKn(`${yr} ಶ್ರೀ ಗಣೇಶ ಮಹೋತ್ಸವ`);
                            if (!historyTitleEn) setHistoryTitleEn(`${yr} Royal Ganesh Mahotsav`);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer border ${
                            historyYear === yr
                              ? 'bg-amber-400 text-neutral-950 border-amber-400 font-black shadow-xs'
                              : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-neutral-700'
                          }`}
                        >
                          {yr}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="md:col-span-1">
                  <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-300 mb-1.5">
                    {language === 'kn' ? 'ಸಂವತ್ಸರ (ಕನ್ನಡ)' : 'Samvatsara (Kn)'}
                  </label>
                  <input
                    type="text"
                    value={historySamvatsaraKn}
                    onChange={(e) => setHistorySamvatsaraKn(e.target.value)}
                    placeholder="ಉದಾ: ಪರಾಭವ ಸಂವತ್ಸರ"
                    className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-neutral-900 border border-neutral-700/80 text-sm sm:text-base text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-all"
                  />
                  <p className="text-[11px] text-neutral-500 mt-1">ಹಿಂದೂ ಪಂಚಾಂಗದ ವರ್ಷದ ಹೆಸರು</p>
                </div>

                <div className="md:col-span-1">
                  <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-300 mb-1.5">
                    {language === 'kn' ? 'ಸಂವತ್ಸರ (English)' : 'Samvatsara (En)'}
                  </label>
                  <input
                    type="text"
                    value={historySamvatsaraEn}
                    onChange={(e) => setHistorySamvatsaraEn(e.target.value)}
                    placeholder="e.g. Parabhava Samvatsara"
                    className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-neutral-900 border border-neutral-700/80 text-sm sm:text-base text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-all"
                  />
                  <p className="text-[11px] text-neutral-500 mt-1">Hindu Panchanga Samvatsara</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-300 mb-1.5">
                    {language === 'kn' ? 'ಶೀರ್ಷಿಕೆ (ಕನ್ನಡ) *' : 'Kannada Title *'}
                  </label>
                  <input
                    type="text"
                    value={historyTitleKn}
                    onChange={(e) => setHistoryTitleKn(e.target.value)}
                    placeholder="8ನೇ ವಾರ್ಷಿಕ ಭವ್ಯ ಗಣೇಶ ಮಹೋತ್ಸವ"
                    className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-neutral-900 border border-neutral-700/80 text-sm sm:text-base text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-300 mb-1.5">
                    {language === 'kn' ? 'ಶೀರ್ಷಿಕೆ (English) *' : 'English Title *'}
                  </label>
                  <input
                    type="text"
                    value={historyTitleEn}
                    onChange={(e) => setHistoryTitleEn(e.target.value)}
                    placeholder="8th Annual Royal Ganesh Mahotsav"
                    className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-neutral-900 border border-neutral-700/80 text-sm sm:text-base text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-300 mb-1.5">
                    {language === 'kn' ? 'ಮಂಟಪ / ಅಲಂಕಾರ ಥೀಮ್ (ಕನ್ನಡ)' : 'Pandal Theme (Kn)'}
                  </label>
                  <input
                    type="text"
                    value={historyThemeKn}
                    onChange={(e) => setHistoryThemeKn(e.target.value)}
                    placeholder="ಹೊಯ್ಸಳ ಬೇಲೂರು-ಹಳೇಬೀಡು ಶೈಲಿ"
                    className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-neutral-900 border border-neutral-700/80 text-sm sm:text-base text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-300 mb-1.5">
                    {language === 'kn' ? 'ಮಂಟಪ / ಅಲಂಕಾರ ಥೀಮ್ (English)' : 'Pandal Theme (En)'}
                  </label>
                  <input
                    type="text"
                    value={historyThemeEn}
                    onChange={(e) => setHistoryThemeEn(e.target.value)}
                    placeholder="Hoysala Heritage Replica"
                    className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-neutral-900 border border-neutral-700/80 text-sm sm:text-base text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-300 mb-1.5">
                    {language === 'kn' ? 'ಸಂಕ್ಷಿಪ್ತ ವಿವರಣೆ (ಕನ್ನಡ)' : 'Summary (Kn)'}
                  </label>
                  <textarea
                    rows={3}
                    value={historySummaryKn}
                    onChange={(e) => setHistorySummaryKn(e.target.value)}
                    placeholder="ಆ ವರ್ಷದ ವಿಶೇಷತೆಗಳು, ಉತ್ಸವದ ವಾತಾವರಣ, ಗ್ರಾಮಸ್ಥರ ಸಹಯೋಗದ ಸಂಕ್ಷಿಪ್ತ ವಿವರ..."
                    className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700/80 text-sm sm:text-base text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 leading-relaxed transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-300 mb-1.5">
                    {language === 'kn' ? 'ಸಂಕ್ಷಿಪ್ತ ವಿವರಣೆ (English)' : 'Summary (En)'}
                  </label>
                  <textarea
                    rows={3}
                    value={historySummaryEn}
                    onChange={(e) => setHistorySummaryEn(e.target.value)}
                    placeholder="Overview of the celebrations, pandal design, and village participation..."
                    className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700/80 text-sm sm:text-base text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 leading-relaxed transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-300 mb-1.5">
                    {language === 'kn' ? 'ಪ್ರಮುಖ ಮುಖ್ಯಾಂಶಗಳು (ಸಾಲಿಗೆ ಒಂದರಂತೆ)' : 'Highlights (Kn, 1 per line)'}
                  </label>
                  <textarea
                    rows={4}
                    value={historyHighlightsKnText}
                    onChange={(e) => setHistoryHighlightsKnText(e.target.value)}
                    placeholder="12 ಅಡಿ ಭವ್ಯ ಮೂರ್ತಿ&#10;ಮಹಾ ಅನ್ನಸಂತರ್ಪಣೆ ಸೇವೆ&#10;ಆಕರ್ಷಕ ವಿದ್ಯುತ್ ದೀಪಾಲಂಕಾರ&#10;ಡೊಳ್ಳು ಕುಣಿತ ಮೆರವಣಿಗೆ"
                    className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700/80 text-sm sm:text-base text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 leading-relaxed font-sans transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-300 mb-1.5">
                    {language === 'kn' ? 'ಪ್ರಮುಖ ಮುಖ್ಯಾಂಶಗಳು (English, 1 per line)' : 'Highlights (En, 1 per line)'}
                  </label>
                  <textarea
                    rows={4}
                    value={historyHighlightsEnText}
                    onChange={(e) => setHistoryHighlightsEnText(e.target.value)}
                    placeholder="12-foot Sacred Murti&#10;Grand Annasantarpane Feast&#10;Dhol-Tasha Procession&#10;Illuminated Pandal Architecture"
                    className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700/80 text-sm sm:text-base text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 leading-relaxed font-sans transition-all"
                  />
                </div>
              </div>

              {/* Media File (Photo OR Video) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs sm:text-sm font-bold text-amber-300 uppercase tracking-wider">
                    {language === 'kn' ? 'ಮುಖಪುಟ ಚಿತ್ರ ಅಥವಾ ವಿಡಿಯೋ (ಐಚ್ಛಿಕ)' : 'Cover Photo or Video (Optional)'}
                  </label>
                  <span className="text-xs text-neutral-400 font-mono">
                    {historyMediaType === 'video' ? 'VIDEO FILE' : 'PHOTO/IMAGE'}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {historyCoverPreview ? (
                    <div className="relative w-36 h-24 sm:w-44 sm:h-28 rounded-xl overflow-hidden border-2 border-amber-400 bg-black shrink-0 shadow-lg">
                      {historyMediaType === 'video' || (historyCoverPreview.match(/\.(mp4|webm|mov)$/i) || historyCoverPreview.includes('/video/upload/')) ? (
                        <video src={historyCoverPreview} className="w-full h-full object-cover" controls />
                      ) : (
                        <img src={historyCoverPreview} alt="Preview" className="w-full h-full object-cover" />
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setHistoryCoverFile(null);
                          setHistoryCoverPreview(null);
                          setHistoryCoverUrl('');
                        }}
                        className="absolute top-1.5 right-1.5 p-1 bg-black/80 rounded-lg text-red-400 hover:text-white hover:bg-red-600 transition-colors cursor-pointer shadow"
                        title="Remove"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-36 h-24 sm:w-44 sm:h-28 rounded-xl bg-neutral-950 border border-dashed border-neutral-700 flex flex-col items-center justify-center text-neutral-400 shrink-0 shadow-inner">
                      <Camera className="w-6 h-6 text-neutral-400 mb-1" />
                      <span className="text-[11px] font-mono text-neutral-400 font-bold">MEDIA PREVIEW</span>
                    </div>
                  )}

                  <div className="flex-1 space-y-2">
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          setHistoryCoverFile(file);
                          setHistoryMediaType(file.type.startsWith('video/') ? 'video' : 'image');
                          setHistoryCoverPreview(URL.createObjectURL(file));
                        }
                      }}
                      className="text-xs sm:text-sm text-neutral-300 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-amber-400 file:text-neutral-950 file:font-bold hover:file:bg-amber-300 cursor-pointer"
                    />
                    <p className="text-xs text-neutral-400">
                      {language === 'kn'
                        ? 'ಫೋಟೋ (JPG/PNG/WEBP) ಅಥವಾ ವಿಡಿಯೋ (MP4/WEBM/MOV) ಎರಡನ್ನೂ ಅಪ್‌ಲೋಡ್ ಮಾಡಬಹುದು.'
                        : 'Supports high-definition Photos (JPG, PNG, WEBP) and Videos (MP4, WEBM, MOV).'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Multi-Section Cross Placements */}
              <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-2">
                    <span>⚡ {language === 'kn' ? 'ಸಹವರ್ತಿ ವಿಭಾಗಗಳಲ್ಲಿ ಪ್ರದರ್ಶಿಸಿ (Cross-Placements)' : 'Showcase Across Website Sections'}</span>
                  </span>
                  <span className="text-xs text-neutral-400 font-mono font-bold bg-neutral-800 px-2 py-0.5 rounded-md">
                    {historyYear} UTSAV
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Hero Checkbox */}
                  <label className={`flex items-start space-x-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                    historyShowInHero
                      ? 'bg-amber-400/10 border-amber-400/80 shadow-md'
                      : 'bg-black/60 border-neutral-800 hover:border-neutral-700'
                  }`}>
                    <input
                      type="checkbox"
                      checked={historyShowInHero}
                      onChange={(e) => setHistoryShowInHero(e.target.checked)}
                      className="w-5 h-5 mt-0.5 rounded border-neutral-700 text-amber-400 focus:ring-amber-400 bg-neutral-900 cursor-pointer accent-amber-400 shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="text-sm font-bold text-white block">
                        {language === 'kn' ? 'ಹೀರೋ ಮುಖಪುಟ' : 'Hero Banner'}
                      </span>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        {language === 'kn' ? 'ಮುಖಪುಟದ ಮೊದಲ ಸ್ಲೈಡ್‌ನಲ್ಲಿ ಪ್ರದರ್ಶನ' : 'Feature in top homepage slider'}
                      </p>
                    </div>
                  </label>

                  {/* 35mm Reel Checkbox */}
                  <label className={`flex items-start space-x-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                    historyShowIn35mm
                      ? 'bg-emerald-400/10 border-emerald-400/80 shadow-md'
                      : 'bg-black/60 border-neutral-800 hover:border-neutral-700'
                  }`}>
                    <input
                      type="checkbox"
                      checked={historyShowIn35mm}
                      onChange={(e) => setHistoryShowIn35mm(e.target.checked)}
                      className="w-5 h-5 mt-0.5 rounded border-neutral-700 text-emerald-400 focus:ring-emerald-400 bg-neutral-900 cursor-pointer accent-emerald-400 shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="text-sm font-bold text-white block">
                        {language === 'kn' ? '35mm ಫಿಲ್ಮ್ ರೀಲ್' : '35mm Film Reel'}
                      </span>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        {language === 'kn' ? 'ವರ್ಷಗಳ ಇತಿಹಾಸ ರೀಲ್‌ನಲ್ಲಿ ಪ್ರದರ್ಶನ' : 'Feature in historical retro rail'}
                      </p>
                    </div>
                  </label>

                  {/* Gallery Checkbox */}
                  <label className={`flex items-start space-x-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                    historyShowInGallery
                      ? 'bg-blue-400/10 border-blue-400/80 shadow-md'
                      : 'bg-black/60 border-neutral-800 hover:border-neutral-700'
                  }`}>
                    <input
                      type="checkbox"
                      checked={historyShowInGallery}
                      onChange={(e) => setHistoryShowInGallery(e.target.checked)}
                      className="w-5 h-5 mt-0.5 rounded border-neutral-700 text-blue-400 focus:ring-blue-400 bg-neutral-900 cursor-pointer accent-blue-400 shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="text-sm font-bold text-white block">
                        {language === 'kn' ? 'ದರ್ಶನ ಗ್ಯಾಲರಿ' : 'Darshan Gallery'}
                      </span>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        {language === 'kn' ? 'ಫೋಟೋ & ವಿಡಿಯೋ ಗ್ಯಾಲರಿಯಲ್ಲಿ ಪ್ರದರ್ಶನ' : 'Show in public Darshan gallery'}
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-800 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsHistoryModalOpen(false)}
                  className="px-5 py-2.5 sm:py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs sm:text-sm font-bold text-neutral-300 hover:text-white transition-colors cursor-pointer"
                >
                  {language === 'kn' ? 'ರದ್ದುಮಾಡಿ' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={historySaving}
                  className="px-7 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 font-black text-xs sm:text-sm cursor-pointer shadow-lg shadow-amber-400/20 disabled:opacity-50 transition-all flex items-center space-x-2"
                >
                  {historySaving ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                      <span>{language === 'kn' ? 'ಉಳಿಸಲಾಗುತ್ತಿದೆ...' : 'Saving...'}</span>
                    </>
                  ) : (
                    <span>
                      {editingHistory
                        ? (language === 'kn' ? 'ಇತಿಹಾಸ ನವೀಕರಿಸಿ' : 'Update Milestone')
                        : (language === 'kn' ? 'ಇತಿಹಾಸ ಸೇರಿಸಿ' : 'Add Milestone')}
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: ACHIEVEMENT ADD/EDIT */}
      {/* ========================================================================= */}
      {isAchievementModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-[#101015] border border-amber-400/40 rounded-3xl max-w-4xl lg:max-w-5xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[92vh] overflow-y-auto scrollbar-thin scrollbar-thumb-amber-400/30 my-auto">
            <div className="flex items-start justify-between pb-4 border-b border-neutral-800">
              <div className="flex items-center space-x-3.5">
                <div className="w-11 h-11 rounded-2xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-sm shrink-0">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                    {editingAchievement
                      ? (language === 'kn' ? 'ಸೇವಾ ವಿವರ ಸಂಪಾದಿಸಿ' : 'Edit Seva Initiative')
                      : (language === 'kn' ? 'ಹೊಸ ಸೇವಾ ವಿವರ ಸೇರಿಸಿ' : 'Add Seva Initiative')}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
                    {language === 'kn'
                      ? 'ಮಹಾ ಅನ್ನಸಂತರ್ಪಣೆ, ಕಂಬ ಪೂಜೆ, ಪ್ರವಚನ, ಮೆರವಣಿಗೆ ಮತ್ತು ದಾನಿಗಳ ವಿವರಗಳನ್ನು ದಾಖಲಿಸಿ'
                      : 'Record maha annasantarpane feast, ritual pooja, sponsor details and seva highlights'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAchievementModalOpen(false)}
                className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAchievementSubmit} className="space-y-5">
              {achError && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs sm:text-sm text-red-300">
                  {achError}
                </div>
              )}

              {/* Title Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-300 mb-1.5">
                    {language === 'kn' ? 'ಶೀರ್ಷಿಕೆ (ಕನ್ನಡ) *' : 'Kannada Title *'}
                  </label>
                  <input
                    type="text"
                    value={achTitleKn}
                    onChange={(e) => setAchTitleKn(e.target.value)}
                    placeholder="ಮಹಾ ಅನ್ನಸಂತರ್ಪಣೆ ಅಥವಾ ಪೂಜೆ"
                    className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-neutral-900 border border-neutral-700/80 text-sm sm:text-base text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-300 mb-1.5">
                    {language === 'kn' ? 'ಶೀರ್ಷಿಕೆ (English) *' : 'English Title *'}
                  </label>
                  <input
                    type="text"
                    value={achTitleEn}
                    onChange={(e) => setAchTitleEn(e.target.value)}
                    placeholder="Maha Annasantarpane or Pooja"
                    className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-neutral-900 border border-neutral-700/80 text-sm sm:text-base text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Category & Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-300 mb-1.5">
                    {language === 'kn' ? 'ವಿಭಾಗ (Category)' : 'Category'}
                  </label>
                  <select
                    value={achCategory}
                    onChange={(e) => setAchCategory(e.target.value as any)}
                    className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-neutral-900 border border-neutral-700/80 text-sm sm:text-base text-white focus:outline-none focus:border-amber-400 transition-all"
                  >
                    <option value="feast">
                      {language === 'kn' ? 'ಮಹಾ ಅನ್ನಸಂತರ್ಪಣೆ ದಾಸೋಹ (Annasantarpane)' : 'Maha Annasantarpane (Feast)'}
                    </option>
                    <option value="pooja">
                      {language === 'kn' ? 'ಕಂಬ ಪೂಜೆ & ಪ್ರವಚನ ಸತ್ಸಂಗ (Kambha Pooja & Pravachana)' : 'Kambha Pooja & Spiritual Pravachana'}
                    </option>
                    <option value="miravanige">
                      {language === 'kn' ? 'ಭವ್ಯ ವಿಸರ್ಜನಾ ಮೆರವಣಿಗೆ (Procession)' : 'Grand Visarjan Miravanige (Procession)'}
                    </option>
                    <option value="other">
                      {language === 'kn' ? 'ಇತರ ಸೇವಾ ಕೈಂಕರ್ಯ (Other Seva)' : 'Other Seva Initiative'}
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-300 mb-1.5">
                    {language === 'kn' ? 'ಕ್ರಮ ಸಂಖ್ಯೆ (Display Order)' : 'Display Order #'}
                  </label>
                  <input
                    type="number"
                    value={achOrder}
                    onChange={(e) => setAchOrder(Number(e.target.value))}
                    className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-neutral-900 border border-neutral-700/80 text-sm sm:text-base text-white focus:outline-none focus:border-amber-400 transition-all font-mono font-bold"
                  />
                </div>
              </div>

              {/* Sponsor / Donor Name (Optional) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900/90 border border-amber-400/40 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs sm:text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-2">
                    <span>🙏 {language === 'kn' ? 'ಸೇವಾಕರ್ತರು / ದಾನಿಗಳ ಹೆಸರು (ಐಚ್ಛಿಕ)' : 'Sponsor / Donor Name (Optional)'}</span>
                  </label>
                  <span className="text-xs text-neutral-400">
                    {language === 'kn' ? 'ಅನ್ನಪ್ರಸಾದ ಅಥವಾ ಪೂಜಾ ಸೇವಾದಾರರು' : 'Feast / Ritual Donor'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={achSponsorKn}
                    onChange={(e) => setAchSponsorKn(e.target.value)}
                    placeholder={language === 'kn' ? 'ಉದಾ: ಶ್ರೀ ಬಸವರಾಜ ಪಾಟೀಲ ಮತ್ತು ಕುಟುಂಬ' : 'Kannada Sponsor Name'}
                    className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-black border border-neutral-700 text-sm sm:text-base text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-all"
                  />
                  <input
                    type="text"
                    value={achSponsorEn}
                    onChange={(e) => setAchSponsorEn(e.target.value)}
                    placeholder={language === 'kn' ? 'English Sponsor Name' : 'e.g. Shri Basavaraj Patil & Family'}
                    className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-black border border-neutral-700 text-sm sm:text-base text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-all"
                  />
                </div>
              </div>

              {/* Event Date & Year (Optional) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-300 mb-1.5">
                    {language === 'kn' ? 'ಸೇವಾ ದಿನಾಂಕ (ಐಚ್ಛಿಕ)' : 'Event / Seva Date (Optional)'}
                  </label>
                  <input
                    type="text"
                    value={achEventDate}
                    onChange={(e) => setAchEventDate(e.target.value)}
                    placeholder={language === 'kn' ? 'ಉದಾ: 15-09-2026 ಅಥವಾ ದಿನ 5' : 'e.g. 15 Sep 2026 or Day 5'}
                    className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-neutral-900 border border-neutral-700/80 text-sm sm:text-base text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-300 mb-1.5">
                    {language === 'kn' ? 'ವರ್ಷ / ಅವಧಿ (ಐಚ್ಛಿಕ)' : 'Year / Timeline (Optional)'}
                  </label>
                  <input
                    type="text"
                    value={achYearKn}
                    onChange={(e) => {
                      setAchYearKn(e.target.value);
                      if (!achYearEn) setAchYearEn(e.target.value);
                    }}
                    placeholder={language === 'kn' ? 'ಉದಾ: 2026 ಅಥವಾ ವಾರ್ಷಿಕ ಸೇವೆ' : 'e.g. 2026 or Annual Seva'}
                    className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-neutral-900 border border-neutral-700/80 text-sm sm:text-base text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-all"
                  />
                </div>
              </div>

              {/* Impact Metric (Optional) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-300 mb-1.5">
                    {language === 'kn' ? 'ಸಾಧನೆ / ಪ್ರಭಾವ ಅಂಕಿಅಂಶ (ಕನ್ನಡ, ಐಚ್ಛಿಕ)' : 'Impact Metric (Kn, Optional)'}
                  </label>
                  <input
                    type="text"
                    value={achMetricKn}
                    onChange={(e) => setAchMetricKn(e.target.value)}
                    placeholder="ಉದಾ: 5,000ಕ್ಕೂ ಹೆಚ್ಚು ಭಕ್ತರಿಗೆ ಪ್ರಸಾದ"
                    className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-neutral-900 border border-neutral-700/80 text-sm sm:text-base text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-300 mb-1.5">
                    {language === 'kn' ? 'ಸಾಧನೆ / ಪ್ರಭಾವ ಅಂಕಿಅಂಶ (English, ಐಚ್ಛಿಕ)' : 'Impact Metric (En, Optional)'}
                  </label>
                  <input
                    type="text"
                    value={achMetricEn}
                    onChange={(e) => setAchMetricEn(e.target.value)}
                    placeholder="e.g. Over 5,000+ Devotees Served"
                    className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-neutral-900 border border-neutral-700/80 text-sm sm:text-base text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-all"
                  />
                </div>
              </div>

              {/* Description (Optional) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-300 mb-1.5">
                    {language === 'kn' ? 'ವಿವರಣೆ (ಕನ್ನಡ, ಐಚ್ಛಿಕ)' : 'Description (Kn, Optional)'}
                  </label>
                  <textarea
                    rows={3}
                    value={achDescKn}
                    onChange={(e) => setAchDescKn(e.target.value)}
                    placeholder="ಸೇವೆಯ ವಿವರ, ಮೆನು ಅಥವಾ ಧಾರ್ಮಿಕ ಮಾಹಿತಿ..."
                    className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700/80 text-sm sm:text-base text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 leading-relaxed transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-300 mb-1.5">
                    {language === 'kn' ? 'ವಿವರಣೆ (English, ಐಚ್ಛಿಕ)' : 'Description (En, Optional)'}
                  </label>
                  <textarea
                    rows={3}
                    value={achDescEn}
                    onChange={(e) => setAchDescEn(e.target.value)}
                    placeholder="Details about seva, menu, or devotional notes..."
                    className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700/80 text-sm sm:text-base text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 leading-relaxed transition-all"
                  />
                </div>
              </div>

              {/* Highlights (Optional) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-300 mb-1.5">
                    {language === 'kn' ? 'ವಿಶೇಷತೆಗಳು (ಕನ್ನಡ, ಸಾಲಿಗೆ ಒಂದರಂತೆ, ಐಚ್ಛಿಕ)' : 'Highlights (Kn, 1 per line, Optional)'}
                  </label>
                  <textarea
                    rows={3}
                    value={achHighlightsKnText}
                    onChange={(e) => setAchHighlightsKnText(e.target.value)}
                    placeholder="ಮೋದಕ & ಹೋಳಿಗೆ ಪ್ರಸಾದ&#10;ಶುದ್ಧ ಸಾತ್ವಿಕ ಅಡುಗೆ ಸೇವೆ"
                    className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700/80 text-sm sm:text-base text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 leading-relaxed font-sans transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-300 mb-1.5">
                    {language === 'kn' ? 'ವಿಶೇಷತೆಗಳು (English, ಸಾಲಿಗೆ ಒಂದರಂತೆ, ಐಚ್ಛಿಕ)' : 'Highlights (En, 1 per line, Optional)'}
                  </label>
                  <textarea
                    rows={3}
                    value={achHighlightsEnText}
                    onChange={(e) => setAchHighlightsEnText(e.target.value)}
                    placeholder="Traditional satvik sweets&#10;Hygienic kitchen managed by CYM"
                    className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700/80 text-sm sm:text-base text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 leading-relaxed font-sans transition-all"
                  />
                </div>
              </div>

              {/* Media Upload (Photos & Videos - Multiple Media Supported) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-amber-300 uppercase tracking-wider">
                      {language === 'kn'
                        ? 'ಫೋಟೋ & ವಿಡಿಯೋ ಮಾಧ್ಯಮಗಳು (ಬಹು ಫೈಲ್‌ಗಳ ಬೆಂಬಲ)'
                        : 'Photos & Videos (Multiple Media Supported)'}
                    </label>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      {language === 'kn'
                        ? 'ಹಲವು ಫೋಟೋಗಳು ಮತ್ತು ವಿಡಿಯೋಗಳನ್ನು ಒಟ್ಟಿಗೆ ಆಯ್ಕೆ ಮಾಡಿ ಅಥವಾ ಒಂದೊಂದಾಗಿ ಸೇರಿಸಿ'
                        : 'Select multiple photos & videos or add them one by one'}
                    </p>
                  </div>
                  <span className="text-xs text-amber-400 font-mono font-bold bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/30">
                    {achExistingMedia.length + achBatchFiles.length} {language === 'kn' ? 'ಮಾಧ್ಯಮಗಳು' : 'Media Items'}
                  </span>
                </div>

                {/* Upload Button & Action Controls */}
                <div className="flex flex-wrap items-center gap-2">
                  <label className="cursor-pointer inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs sm:text-sm transition-all shadow-md">
                    <Plus className="w-4 h-4 text-neutral-950" />
                    <span>{language === 'kn' ? 'ಫೋಟೋ/ವಿಡಿಯೋ ಸೇರಿಸಿ' : 'Add Photos & Videos'}</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      onChange={(e) => handleAchBatchFileSelect(e.target.files)}
                      className="hidden"
                    />
                  </label>

                  {(achExistingMedia.length > 0 || achBatchFiles.length > 0) && (
                    <button
                      type="button"
                      onClick={() => {
                        setAchExistingMedia([]);
                        setAchBatchFiles([]);
                      }}
                      className="inline-flex items-center space-x-1 px-3 py-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-300 text-xs font-bold transition-all border border-red-500/30 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{language === 'kn' ? 'ಎಲ್ಲವನ್ನೂ ತೆರವುಗೊಳಿಸಿ' : 'Clear All'}</span>
                    </button>
                  )}
                </div>

                {/* Warning banner if any selected Seva file exceeds 100 MB */}
                {achBatchFiles.some((f) => f.file.size > MAX_CLOUDINARY_BYTES) && (
                  <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-start space-x-3 text-xs text-amber-200">
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-bold text-amber-300">
                        {language === 'kn'
                          ? 'ಗಮನಿಸಿ: ಕೆಲವು ವೀಡಿಯೊಗಳು 100MB ಗಿಂತ ಹೆಚ್ಚಿವೆ!'
                          : 'Notice: Some videos exceed the 100 MB Cloudinary limit!'}
                      </p>
                      <p className="text-neutral-300 leading-relaxed">
                        {language === 'kn'
                          ? 'ಕ್ಲೌಡಿನರಿ ಉಚಿತ ಯೋಜನೆಯಲ್ಲಿ 100MB ವರೆಗೆ ಮಾತ್ರ ಅಪ್‌ಲೋಡ್ ಸಾಧ್ಯ. ಕೆಳಗಿನ ఆ ವೀಡಿಯೊದಲ್ಲಿ "⚡ ಕುಗ್ಗಿಸಿ (<100MB)" ಬಟನ್ ಕ್ಲಿಕ್ ಮಾಡಿ ನಂತರ ಸೇವ್ ಮಾಡಿ.'
                          : 'Cloudinary Free Plan caps single video uploads at 100 MB. Click "⚡ Compress (<100MB)" on the marked video below before saving.'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Thumbnail Preview Grid */}
                {(achExistingMedia.length > 0 || achBatchFiles.length > 0) ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-64 sm:max-h-72 overflow-y-auto p-2.5 bg-neutral-950/80 rounded-2xl border border-neutral-800/80 scrollbar-thin scrollbar-thumb-amber-400/30">
                    {/* Existing Saved Media */}
                    {achExistingMedia.map((item, idx) => (
                      <div
                        key={`existing-${idx}`}
                        className="relative group rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800 hover:border-amber-400/80 transition-all flex flex-col"
                      >
                        <div className="absolute top-1.5 left-1.5 z-10 bg-emerald-600/90 text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shadow">
                          SAVED #{idx + 1}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleToggleAchExistingHero(idx)}
                          className={`absolute top-1.5 right-8 z-10 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold transition-all cursor-pointer border flex items-center space-x-0.5 ${
                            item.showInHero
                              ? 'bg-amber-400 text-neutral-950 border-amber-400 shadow-md'
                              : 'bg-black/80 text-neutral-300 border-neutral-700 hover:border-amber-400/80 hover:text-white'
                          }`}
                          title="Toggle this media in Hero Section"
                        >
                          <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                          <span>{item.showInHero ? '✓ HERO' : '+ HERO'}</span>
                        </button>
                        <div className="absolute bottom-1.5 left-1.5 z-10 bg-neutral-900/90 text-neutral-300 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border border-neutral-700">
                          {item.type === 'video' ? 'VIDEO' : 'IMAGE'}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveAchExistingMedia(idx)}
                          className="absolute top-1.5 right-1.5 z-10 p-1 rounded-md bg-black/80 hover:bg-red-600 text-neutral-400 hover:text-white transition-colors cursor-pointer border border-neutral-700 hover:border-red-500"
                          title="Remove"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        <div className="h-24 w-full bg-black flex items-center justify-center overflow-hidden">
                          {item.type === 'video' ? (
                            <video src={item.url} className="w-full h-full object-cover" muted />
                          ) : (
                            <img src={item.url} alt="Saved" className="w-full h-full object-cover" />
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Pending Batch Uploads */}
                    {achBatchFiles.map((bFile) => {
                      const isOver100MB = bFile.file.size > MAX_CLOUDINARY_BYTES;
                      const isCompressing = compressingAchId === bFile.id;

                      return (
                        <div
                          key={bFile.id}
                          className={`relative group rounded-xl overflow-hidden bg-neutral-900 border transition-all flex flex-col ${
                            isOver100MB ? 'border-amber-500/80' : 'border-amber-400/60 hover:border-amber-400'
                          }`}
                        >
                          <div className="absolute top-1.5 left-1.5 z-10 bg-amber-400 text-neutral-950 text-[9px] font-mono font-black px-1.5 py-0.5 rounded shadow">
                            NEW
                          </div>

                          {isOver100MB && (
                            <div className="absolute top-1.5 left-10 z-10 bg-amber-500 text-black text-[9px] font-mono font-black px-1.5 py-0.5 rounded flex items-center space-x-0.5 shadow">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              <span>&gt;100MB</span>
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={() => handleToggleAchBatchHero(bFile.id)}
                            className={`absolute top-1.5 right-8 z-10 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold transition-all cursor-pointer border flex items-center space-x-0.5 ${
                              bFile.showInHero
                                ? 'bg-amber-400 text-neutral-950 border-amber-400 shadow-md'
                                : 'bg-black/80 text-neutral-300 border-neutral-700 hover:border-amber-400/80 hover:text-white'
                            }`}
                            title="Toggle this media in Hero Section"
                          >
                            <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                            <span>{bFile.showInHero ? '✓ HERO' : '+ HERO'}</span>
                          </button>

                          <div className="absolute bottom-1.5 left-1.5 z-10 bg-neutral-900/90 text-neutral-300 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border border-neutral-700">
                            {bFile.mediaType === 'video' ? 'VID' : 'IMG'} • {bFile.sizeText}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveAchBatchFile(bFile.id)}
                            className="absolute top-1.5 right-1.5 z-10 p-1 rounded-md bg-black/80 hover:bg-red-600 text-neutral-400 hover:text-white transition-colors cursor-pointer border border-neutral-700 hover:border-red-500"
                            title="Remove"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>

                          <div className="h-24 w-full bg-black flex items-center justify-center overflow-hidden">
                            {bFile.mediaType === 'video' ? (
                              <video src={bFile.previewUrl} className="w-full h-full object-cover" muted />
                            ) : (
                              <img src={bFile.previewUrl} alt={bFile.name} className="w-full h-full object-cover" />
                            )}
                          </div>

                          {bFile.mediaType === 'video' && isOver100MB && (
                            <div className="p-1.5 bg-neutral-900 border-t border-neutral-800">
                              <button
                                type="button"
                                disabled={isCompressing}
                                onClick={() => handleCompressAchItem(bFile.id)}
                                className="w-full px-2 py-1 bg-amber-400 hover:bg-amber-300 disabled:bg-neutral-800 disabled:text-neutral-500 text-neutral-950 font-bold text-[10px] rounded flex items-center justify-center space-x-1 cursor-pointer transition-colors shadow-sm"
                              >
                                {isCompressing ? (
                                  <span>⏳ {language === 'kn' ? 'ಕುಗ್ಗಿಸಲಾಗುತ್ತಿದೆ' : 'Compressing'} {compressingAchProgress}%</span>
                                ) : (
                                  <>
                                    <Sparkles className="w-2.5 h-2.5 text-neutral-950" />
                                    <span>{language === 'kn' ? '⚡ ಕುಗ್ಗಿಸಿ (<100MB)' : '⚡ Compress (<100MB)'}</span>
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl bg-neutral-950/60 border border-dashed border-neutral-800 text-center">
                    <Camera className="w-8 h-8 text-neutral-500 mx-auto mb-1.5" />
                    <p className="text-xs text-neutral-400">
                      {language === 'kn'
                        ? 'ಯಾವುದೇ ಫೋಟೋ ಅಥವಾ ವಿಡಿಯೋ ಆಯ್ಕೆ ಮಾಡಿಲ್ಲ (ಐಚ್ಛಿಕ)'
                        : 'No photos or videos selected yet (Optional)'}
                    </p>
                  </div>
                )}

                {/* Batch Upload Progress Indicator */}
                {achBatchUploadStatus && (
                  <div className="p-3 rounded-xl bg-amber-400/10 border border-amber-400/40 text-xs font-mono font-bold text-amber-300 flex items-center justify-between">
                    <span className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                      <span>
                        {language === 'kn' ? 'ಕ್ಲೌಡ್‌ಗೆ ಅಪ್‌ಲೋಡ್ ಆಗುತ್ತಿದೆ...' : 'Uploading to Cloudinary...'}
                      </span>
                    </span>
                    <span>
                      {achBatchUploadStatus.current} / {achBatchUploadStatus.total}
                    </span>
                  </div>
                )}

                {/* Cross-section Multi-Placement Checkboxes */}
                <div className="pt-3 border-t border-neutral-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-2">
                      <span>⚡ {language === 'kn' ? 'ಸಹವರ್ತಿ ವಿಭಾಗಗಳಲ್ಲಿ ಪ್ರದರ್ಶಿಸಿ (Cross-Placements)' : 'Showcase Across Website Sections'}</span>
                    </span>
                    <span className="text-xs text-neutral-400 font-mono font-bold bg-neutral-800 px-2 py-0.5 rounded-md">
                      SEVA MEDIA
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Hero Checkbox */}
                    <label className={`flex items-start space-x-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                      achShowInHero
                        ? 'bg-amber-400/10 border-amber-400/80 shadow-md'
                        : 'bg-black/60 border-neutral-800 hover:border-neutral-700'
                    }`}>
                      <input
                        type="checkbox"
                        checked={achShowInHero}
                        onChange={(e) => setAchShowInHero(e.target.checked)}
                        className="w-5 h-5 mt-0.5 rounded border-neutral-700 text-amber-400 focus:ring-amber-400 bg-neutral-900 cursor-pointer accent-amber-400 shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="text-sm font-bold text-white block">
                          {language === 'kn' ? 'ಹೀರೋ ಮುಖಪುಟ' : 'Hero Banner'}
                        </span>
                        <p className="text-xs text-neutral-400 mt-0.5">
                          {language === 'kn' ? 'ಮುಖಪುಟದ ಮೊದಲ ಸ್ಲೈಡ್‌ನಲ್ಲಿ ಪ್ರದರ್ಶನ' : 'Feature in top homepage slider'}
                        </p>
                      </div>
                    </label>

                    {/* 35mm Reel Checkbox */}
                    <label className={`flex items-start space-x-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                      achShowIn35mm
                        ? 'bg-emerald-400/10 border-emerald-400/80 shadow-md'
                        : 'bg-black/60 border-neutral-800 hover:border-neutral-700'
                    }`}>
                      <input
                        type="checkbox"
                        checked={achShowIn35mm}
                        onChange={(e) => setAchShowIn35mm(e.target.checked)}
                        className="w-5 h-5 mt-0.5 rounded border-neutral-700 text-emerald-400 focus:ring-emerald-400 bg-neutral-900 cursor-pointer accent-emerald-400 shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="text-sm font-bold text-white block">
                          {language === 'kn' ? '35mm ಫಿಲ್ಮ್ ರೀಲ್' : '35mm Film Reel'}
                        </span>
                        <p className="text-xs text-neutral-400 mt-0.5">
                          {language === 'kn' ? 'ವರ್ಷಗಳ ಇತಿಹಾಸ ರೀಲ್‌ನಲ್ಲಿ ಪ್ರದರ್ಶನ' : 'Feature in historical retro rail'}
                        </p>
                      </div>
                    </label>

                    {/* Gallery Checkbox */}
                    <label className={`flex items-start space-x-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                      achShowInGallery
                        ? 'bg-blue-400/10 border-blue-400/80 shadow-md'
                        : 'bg-black/60 border-neutral-800 hover:border-neutral-700'
                    }`}>
                      <input
                        type="checkbox"
                        checked={achShowInGallery}
                        onChange={(e) => {
                          setAchShowInGallery(e.target.checked);
                          setAchAlsoAddToGallery(e.target.checked);
                        }}
                        className="w-5 h-5 mt-0.5 rounded border-neutral-700 text-blue-400 focus:ring-blue-400 bg-neutral-900 cursor-pointer accent-blue-400 shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="text-sm font-bold text-white block">
                          {language === 'kn' ? 'ದರ್ಶನ ಗ್ಯಾಲರಿ' : 'Darshan Gallery'}
                        </span>
                        <p className="text-xs text-neutral-400 mt-0.5">
                          {language === 'kn' ? 'ಫೋಟೋ & ವಿಡಿಯೋ ಗ್ಯಾಲರಿಯಲ್ಲಿ ಪ್ರದರ್ಶನ' : 'Show in public Darshan gallery'}
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="pt-4 border-t border-neutral-800 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAchievementModalOpen(false)}
                  className="px-5 py-2.5 sm:py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs sm:text-sm font-bold text-neutral-300 hover:text-white transition-colors cursor-pointer"
                >
                  {language === 'kn' ? 'ರದ್ದುಮಾಡಿ' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={achSaving || achBatchFiles.some((f) => f.file.size > MAX_CLOUDINARY_BYTES)}
                  className="px-7 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 font-black text-xs sm:text-sm cursor-pointer shadow-lg shadow-amber-400/20 disabled:opacity-50 transition-all flex items-center space-x-2"
                >
                  {achSaving ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                      <span>
                        {achBatchUploadStatus
                          ? (language === 'kn'
                              ? `ಅಪ್‌ಲೋಡ್ ಆಗುತ್ತಿದೆ (${achBatchUploadStatus.current}/${achBatchUploadStatus.total})...`
                              : `Uploading (${achBatchUploadStatus.current}/${achBatchUploadStatus.total})...`)
                          : (language === 'kn' ? 'ಉಳಿಸಲಾಗುತ್ತಿದೆ...' : 'Saving...')}
                      </span>
                    </>
                  ) : editingAchievement ? (
                    <span>{language === 'kn' ? 'ನವೀಕರಿಸಿ' : 'Update Seva'}</span>
                  ) : (
                    <span>
                      {language === 'kn'
                        ? (achBatchFiles.length + achExistingMedia.length > 1
                            ? `ಸೇವಾ ದಾಖಲೆ ಉಳಿಸಿ (${achBatchFiles.length + achExistingMedia.length} ಮಾಧ್ಯಮ)`
                            : 'ಸೇವಾ ದಾಖಲೆ ಉಳಿಸಿ')
                        : (achBatchFiles.length + achExistingMedia.length > 1
                            ? `Save Seva (${achBatchFiles.length + achExistingMedia.length} Media)`
                            : 'Save Seva Record')}
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: COMMUNITY EVENT ADD/EDIT */}
      {/* ========================================================================= */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-[#101015] border border-amber-400/40 rounded-3xl max-w-4xl lg:max-w-5xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[92vh] overflow-y-auto scrollbar-thin scrollbar-thumb-amber-400/30 my-auto">
            <div className="flex items-start justify-between pb-4 border-b border-neutral-800">
              <div className="flex items-center space-x-3.5">
                <div className="w-11 h-11 rounded-2xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-sm shrink-0">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                    {editingEvent
                      ? (language === 'kn' ? 'ಕಾರ್ಯಕ್ರಮ ವಿವರ ಸಂಪಾದಿಸಿ' : 'Edit Event Details')
                      : (language === 'kn' ? 'ಹೊಸ ಕಾರ್ಯಕ್ರಮ ಸೇರಿಸಿ' : 'Add New Community Event')}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
                    {language === 'kn'
                      ? 'ಕ್ರಿಕೆಟ್, ರಕ್ತದಾನ, ಶಿಕ್ಷಣ ಮತ್ತು ಸಮಾಜಮುಖಿ ಸೇವೆಗಳ ವಿವರಗಳನ್ನು ದಾಖಲಿಸಿ'
                      : 'Record sports, health, education and youth community service initiatives'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEventModalOpen(false)}
                className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEventFormSubmit} className="space-y-5">
              {eventError && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs sm:text-sm text-red-300">
                  {eventError}
                </div>
              )}

              {/* Title Fields (Bilingual) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-neutral-300">
                    {language === 'kn' ? 'ಕಾರ್ಯಕ್ರಮದ ಶೀರ್ಷಿಕೆ (ಕನ್ನಡ) *' : 'Event Title (Kannada) *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={eventTitleKn}
                    onChange={(e) => setEventTitleKn(e.target.value)}
                    placeholder="ಉದಾ: ಚಾಣಕ್ಯ ಕಪ್ - ಅಂತರ ಗ್ರಾಮ ಕ್ರಿಕೆಟ್ ಟೂರ್ನಮೆಂಟ್"
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-neutral-300">
                    {language === 'kn' ? 'ಕಾರ್ಯಕ್ರಮದ ಶೀರ್ಷಿಕೆ (English) *' : 'Event Title (English) *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={eventTitleEn}
                    onChange={(e) => setEventTitleEn(e.target.value)}
                    placeholder="e.g., Chanakya Cup Inter-Village Cricket Tournament"
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Category, Date & Year */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-neutral-300">
                    {language === 'kn' ? 'ಕಾರ್ಯಕ್ರಮ ವರ್ಗ / Category' : 'Event Category'}
                  </label>
                  <select
                    value={eventCategory}
                    onChange={(e) => setEventCategory(e.target.value as EventCategory)}
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-sm text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    <option value="sports">🏏 ಕ್ರೀಡೆ / Sports</option>
                    <option value="health">🩺 ಆರೋಗ್ಯ & ರಕ್ತದಾನ / Health Camp</option>
                    <option value="education">📚 ಶಿಕ್ಷಣ ಸೇವೆ / Education</option>
                    <option value="social">🤝 ಸಮಾಜ ಕಲ್ಯಾಣ / Social Welfare</option>
                    <option value="cultural">🎭 ಸಾಂಸ್ಕೃತಿಕ / Cultural</option>
                    <option value="other">⭐ ಇತರೆ / Other</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-neutral-300">
                    {language === 'kn' ? 'ದಿನಾಂಕ / Event Date' : 'Event Date'}
                  </label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-neutral-300">
                    {language === 'kn' ? 'ವರ್ಷ / Year' : 'Year'}
                  </label>
                  <input
                    type="number"
                    min="2010"
                    max="2035"
                    value={eventYear}
                    onChange={(e) => setEventYear(parseInt(e.target.value, 10) || 2026)}
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Location (Bilingual) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-neutral-300">
                    {language === 'kn' ? 'ಸ್ಥಳ (ಕನ್ನಡ)' : 'Location (Kannada)'}
                  </label>
                  <input
                    type="text"
                    value={eventLocationKn}
                    onChange={(e) => setEventLocationKn(e.target.value)}
                    placeholder="ಯಮಕನಮರಡಿ ಆಟದ ಮೈದಾನ"
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-neutral-300">
                    {language === 'kn' ? 'ಸ್ಥಳ (English)' : 'Location (English)'}
                  </label>
                  <input
                    type="text"
                    value={eventLocationEn}
                    onChange={(e) => setEventLocationEn(e.target.value)}
                    placeholder="Yamakanmardi Ground"
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Description (Bilingual) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-neutral-300">
                    {language === 'kn' ? 'ವಿವರಣೆ (ಕನ್ನಡ)' : 'Description (Kannada)'}
                  </label>
                  <textarea
                    rows={3}
                    value={eventDescKn}
                    onChange={(e) => setEventDescKn(e.target.value)}
                    placeholder="ಕಾರ್ಯಕ್ರಮದ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ..."
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-neutral-300">
                    {language === 'kn' ? 'ವಿವರಣೆ (English)' : 'Description (English)'}
                  </label>
                  <textarea
                    rows={3}
                    value={eventDescEn}
                    onChange={(e) => setEventDescEn(e.target.value)}
                    placeholder="Enter details of this activity..."
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Highlights (One per line) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-neutral-300">
                    {language === 'kn' ? 'ಪ್ರಮುಖ ಮುಖ್ಯಾಂಶಗಳು (ಪ್ರತಿ ಸಾಲಿಗೆ ಒಂದೊಂದು)' : 'Key Highlights (One per line - Kannada)'}
                  </label>
                  <textarea
                    rows={3}
                    value={eventHighlightsKnText}
                    onChange={(e) => setEventHighlightsKnText(e.target.value)}
                    placeholder="ಪ್ರತಿ ಸಾಲಿಗೆ ಒಂದೊಂದು ಮುಖ್ಯಾಂಶ..."
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-neutral-300">
                    {language === 'kn' ? 'ಮುಖ್ಯಾಂಶಗಳು (English - One per line)' : 'Key Highlights (One per line - English)'}
                  </label>
                  <textarea
                    rows={3}
                    value={eventHighlightsEnText}
                    onChange={(e) => setEventHighlightsEnText(e.target.value)}
                    placeholder="One highlight per line..."
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Chief Guests / Special Dignitaries */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-neutral-300">
                    {language === 'kn' ? 'ಮುಖ್ಯ ಅತಿಥಿಗಳು / ಗಣ್ಯರು (ಕನ್ನಡ)' : 'Chief Guests / Dignitaries (Kannada)'}
                  </label>
                  <input
                    type="text"
                    value={eventChiefGuestsKn}
                    onChange={(e) => setEventChiefGuestsKn(e.target.value)}
                    placeholder="ಗ್ರಾಮ ಮುಖಂಡರು, ವೈದ್ಯರು ಮತ್ತು ಹಿರಿಯರು"
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-neutral-300">
                    {language === 'kn' ? 'ಮುಖ್ಯ ಅತಿಥಿಗಳು (English)' : 'Chief Guests / Dignitaries (English)'}
                  </label>
                  <input
                    type="text"
                    value={eventChiefGuestsEn}
                    onChange={(e) => setEventChiefGuestsEn(e.target.value)}
                    placeholder="Village leaders, Doctors and CYM Elders"
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Media Upload & Batch Photos / Videos Management */}
              <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800/80 pb-3">
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-amber-300 uppercase tracking-wider">
                      {language === 'kn'
                        ? 'ಫೋಟೋ & ವಿಡಿಯೋ ಮಾಧ್ಯಮಗಳು (ಬಹು ಫೈಲ್‌ಗಳ ಬೆಂಬಲ)'
                        : 'Photos & Videos (Multiple Media Supported)'}
                    </label>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      {language === 'kn'
                        ? 'ಹಲವು ಫೋಟೋಗಳು ಮತ್ತು ವಿಡಿಯೋಗಳನ್ನು ಒಟ್ಟಿಗೆ ಬ್ಯಾಚ್ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ ಅಥವಾ ಒಂದೊಂದಾಗಿ ಸೇರಿಸಿ'
                        : 'Batch upload multiple photos & videos or add them one by one for this event'}
                    </p>
                  </div>
                  <span className="text-xs text-amber-400 font-mono font-bold bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/30 self-start sm:self-auto">
                    {eventExistingMedia.length + eventBatchFiles.length} {language === 'kn' ? 'ಮಾಧ್ಯಮಗಳು' : 'Media Items'}
                  </span>
                </div>

                {/* Upload Button, Direct URL & Action Controls */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <label className="cursor-pointer inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs sm:text-sm transition-all shadow-md">
                    <Plus className="w-4 h-4 text-neutral-950" />
                    <span>{language === 'kn' ? 'ಫೋಟೋ/ವಿಡಿಯೋ ಸೇರಿಸಿ (ಬ್ಯಾಚ್)' : 'Add Photos & Videos (Batch)'}</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      onChange={(e) => handleEventBatchFileSelect(e.target.files)}
                      className="hidden"
                    />
                  </label>

                  {(eventExistingMedia.length > 0 || eventBatchFiles.length > 0) && (
                    <button
                      type="button"
                      onClick={() => {
                        setEventExistingMedia([]);
                        setEventBatchFiles([]);
                      }}
                      className="inline-flex items-center space-x-1 px-3 py-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-300 text-xs font-bold transition-all border border-red-500/30 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{language === 'kn' ? 'ಎಲ್ಲವನ್ನೂ ತೆರವುಗೊಳಿಸಿ' : 'Clear All'}</span>
                    </button>
                  )}
                </div>

                {/* Direct URL input row */}
                <div className="flex items-center gap-2 pt-1">
                  <div className="relative flex-1">
                    <input
                      type="url"
                      value={eventDirectUrlInput}
                      onChange={(e) => setEventDirectUrlInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddEventDirectUrl();
                        }
                      }}
                      placeholder={language === 'kn' ? 'ಅಥವಾ ನೇರ ಲಿಂಕ್ (Direct URL) ನಮೂದಿಸಿ...' : 'Or enter direct photo / video URL (https://...)'}
                      className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-700/80 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddEventDirectUrl}
                    disabled={!eventDirectUrlInput.trim()}
                    className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-amber-400 font-bold text-xs border border-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    {language === 'kn' ? 'ಲಿಂಕ್ ಸೇರಿಸಿ' : 'Add URL'}
                  </button>
                </div>

                {/* Warning banner if any selected file exceeds 100 MB */}
                {eventBatchFiles.some((f) => f.file.size > MAX_CLOUDINARY_BYTES) && (
                  <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-start space-x-3 text-xs text-amber-200">
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-bold text-amber-300">
                        {language === 'kn'
                          ? 'ಗಮನಿಸಿ: ಕೆಲವು ವೀಡಿಯೊಗಳು 100MB ಗಿಂತ ಹೆಚ್ಚಿವೆ!'
                          : 'Notice: Some videos exceed the 100 MB Cloudinary limit!'}
                      </p>
                      <p className="text-neutral-300 leading-relaxed">
                        {language === 'kn'
                          ? 'ಕ್ಲೌಡಿನರಿ ಉಚಿತ ಯೋಜನೆಯಲ್ಲಿ 100MB ವರೆಗೆ ಮಾತ್ರ ಅಪ್‌ಲೋಡ್ ಸಾಧ್ಯ. ಕೆಳಗಿನ ಆ ವೀಡಿಯೊದಲ್ಲಿ "⚡ ಕುಗ್ಗಿಸಿ (<100MB)" ಬಟನ್ ಕ್ಲಿಕ್ ಮಾಡಿ ನಂತರ ಸೇವ್ ಮಾಡಿ.'
                          : 'Cloudinary Free Plan caps single video uploads at 100 MB. Click "⚡ Compress (<100MB)" on the marked video below before saving.'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Thumbnail Preview Grid for Events */}
                {(eventExistingMedia.length > 0 || eventBatchFiles.length > 0) ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-64 sm:max-h-72 overflow-y-auto p-2.5 bg-neutral-950/80 rounded-2xl border border-neutral-800/80 scrollbar-thin scrollbar-thumb-amber-400/30">
                    {/* Existing Saved Media for this event */}
                    {eventExistingMedia.map((item, idx) => (
                      <div
                        key={`evt-existing-${idx}`}
                        className="relative group rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800 hover:border-amber-400/80 transition-all flex flex-col"
                      >
                        <div className="absolute top-1.5 left-1.5 z-10 bg-emerald-600/90 text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shadow">
                          SAVED #{idx + 1}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleToggleEventExistingHero(idx)}
                          className={`absolute top-1.5 right-8 z-10 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold transition-all cursor-pointer border flex items-center space-x-0.5 ${
                            item.showInHero
                              ? 'bg-amber-400 text-neutral-950 border-amber-400 shadow-md'
                              : 'bg-black/80 text-neutral-300 border-neutral-700 hover:border-amber-400/80 hover:text-white'
                          }`}
                          title="Toggle this media in Hero Section"
                        >
                          <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                          <span>{item.showInHero ? '✓ HERO' : '+ HERO'}</span>
                        </button>
                        <div className="absolute bottom-1.5 left-1.5 z-10 bg-neutral-900/90 text-neutral-300 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border border-neutral-700">
                          {item.type === 'video' ? 'VIDEO' : 'IMAGE'}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveEventExistingMedia(idx)}
                          className="absolute top-1.5 right-1.5 z-10 p-1 rounded-md bg-black/80 hover:bg-red-600 text-neutral-400 hover:text-white transition-colors cursor-pointer border border-neutral-700 hover:border-red-500"
                          title="Remove"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        <div className="h-24 w-full bg-black flex items-center justify-center overflow-hidden">
                          {item.type === 'video' ? (
                            <video src={item.url} className="w-full h-full object-cover" muted />
                          ) : (
                            <img src={item.url} alt="Saved" className="w-full h-full object-cover" />
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Pending Batch Uploads for this event */}
                    {eventBatchFiles.map((bFile) => {
                      const isOver100MB = bFile.file.size > MAX_CLOUDINARY_BYTES;
                      const isCompressing = compressingEventId === bFile.id;

                      return (
                        <div
                          key={bFile.id}
                          className={`relative group rounded-xl overflow-hidden bg-neutral-900 border transition-all flex flex-col ${
                            isOver100MB ? 'border-amber-500/80' : 'border-amber-400/60 hover:border-amber-400'
                          }`}
                        >
                          <div className="absolute top-1.5 left-1.5 z-10 bg-amber-400 text-neutral-950 text-[9px] font-mono font-black px-1.5 py-0.5 rounded shadow">
                            NEW
                          </div>

                          {isOver100MB && (
                            <div className="absolute top-1.5 left-10 z-10 bg-amber-500 text-black text-[9px] font-mono font-black px-1.5 py-0.5 rounded flex items-center space-x-0.5 shadow">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              <span>&gt;100MB</span>
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={() => handleToggleEventBatchHero(bFile.id)}
                            className={`absolute top-1.5 right-8 z-10 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold transition-all cursor-pointer border flex items-center space-x-0.5 ${
                              bFile.showInHero
                                ? 'bg-amber-400 text-neutral-950 border-amber-400 shadow-md'
                                : 'bg-black/80 text-neutral-300 border-neutral-700 hover:border-amber-400/80 hover:text-white'
                            }`}
                            title="Toggle this media in Hero Section"
                          >
                            <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                            <span>{bFile.showInHero ? '✓ HERO' : '+ HERO'}</span>
                          </button>

                          <div className="absolute bottom-1.5 left-1.5 z-10 bg-neutral-900/90 text-neutral-300 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border border-neutral-700">
                            {bFile.mediaType === 'video' ? 'VID' : 'IMG'} • {bFile.sizeText}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveEventBatchFile(bFile.id)}
                            className="absolute top-1.5 right-1.5 z-10 p-1 rounded-md bg-black/80 hover:bg-red-600 text-neutral-400 hover:text-white transition-colors cursor-pointer border border-neutral-700 hover:border-red-500"
                            title="Remove"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>

                          <div className="h-24 w-full bg-black flex items-center justify-center overflow-hidden">
                            {bFile.mediaType === 'video' ? (
                              <video src={bFile.previewUrl} className="w-full h-full object-cover" muted />
                            ) : (
                              <img src={bFile.previewUrl} alt={bFile.name} className="w-full h-full object-cover" />
                            )}
                          </div>

                          {bFile.mediaType === 'video' && isOver100MB && (
                            <div className="p-1.5 bg-neutral-900 border-t border-neutral-800">
                              <button
                                type="button"
                                disabled={isCompressing}
                                onClick={() => handleCompressEventVideo(bFile.id)}
                                className="w-full py-1 px-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 text-[10px] font-bold flex items-center justify-center space-x-1 cursor-pointer disabled:opacity-50"
                              >
                                {isCompressing ? (
                                  <>
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    <span>{language === 'kn' ? 'ಕುಗ್ಗಿಸಲಾಗುತ್ತಿದೆ...' : 'Compressing...'}</span>
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="w-3 h-3" />
                                    <span>{language === 'kn' ? '⚡ ಕುಗ್ಗಿಸಿ (<100MB)' : '⚡ Compress (<100MB)'}</span>
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-6 rounded-xl border border-dashed border-neutral-800 bg-neutral-950/40 text-center text-xs text-neutral-400">
                    {language === 'kn'
                      ? 'ಈ ಕಾರ್ಯಕ್ರಮಕ್ಕೆ ಯಾವುದೇ ಫೋಟೋ ಅಥವಾ ವೀಡಿಯೋ ಸೇರಿಸಲಾಗಿಲ್ಲ. ಮೇಲೆ ಕ್ಲಿಕ್ ಮಾಡಿ ಸೇರಿಸಿ.'
                      : 'No media added for this event yet. Click "Add Photos & Videos (Batch)" above.'}
                  </div>
                )}

                {/* Upload Status Bar */}
                {eventBatchUploadStatus && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center space-x-3 text-xs text-amber-300">
                    <Loader2 className="w-4 h-4 animate-spin text-amber-400 shrink-0" />
                    <span>
                      {language === 'kn'
                        ? `ಕ್ಲೌಡ್‌ಗೆ ಅಪ್‌ಲೋಡ್ ಆಗುತ್ತಿದೆ: ${eventBatchUploadStatus.current} / ${eventBatchUploadStatus.total}...`
                        : `Uploading media to Cloudinary: ${eventBatchUploadStatus.current} of ${eventBatchUploadStatus.total}...`}
                    </span>
                  </div>
                )}
              </div>

              {/* Placements Selection */}
              <div className="space-y-2 pt-2 border-t border-neutral-800">
                <label className="block text-xs font-bold text-neutral-300">
                  {language === 'kn' ? 'ವೆಬ್‌ಸೈಟ್ ವಿಭಾಗಗಳ ಪ್ರದರ್ಶನ (Placements)' : 'Website Display Placements'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Hero checkbox */}
                  <label className="flex items-center space-x-2.5 p-3 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-amber-400/50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={eventShowInHero}
                      onChange={(e) => setEventShowInHero(e.target.checked)}
                      className="w-4 h-4 accent-amber-400 rounded cursor-pointer"
                    />
                    <div className="text-xs">
                      <div className="font-bold text-white flex items-center space-x-1">
                        <span>🌟</span>
                        <span>{language === 'kn' ? 'ಹೀರೋ ಸ್ಲೈಡರ್' : 'Hero Slider'}</span>
                      </div>
                      <div className="text-[10px] text-neutral-400">
                        {language === 'kn' ? 'ಮುಖ್ಯ ಟಾಪ್ ಬ್ಯಾನರ್' : 'Homepage Top Banner'}
                      </div>
                    </div>
                  </label>

                  {/* 35mm Reel checkbox */}
                  <label className="flex items-center space-x-2.5 p-3 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-amber-400/50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={eventShowIn35mm}
                      onChange={(e) => setEventShowIn35mm(e.target.checked)}
                      className="w-4 h-4 accent-amber-400 rounded cursor-pointer"
                    />
                    <div className="text-xs">
                      <div className="font-bold text-white flex items-center space-x-1">
                        <span>🎞️</span>
                        <span>{language === 'kn' ? '೩೫ಮಿಮಿ ರೀಲ್' : '35mm Film Reel'}</span>
                      </div>
                      <div className="text-[10px] text-neutral-400">
                        {language === 'kn' ? 'ವಿಂಟೇಜ್ ಸಿನಿಮಾ ರೀಲ್' : 'Vintage Film Carousel'}
                      </div>
                    </div>
                  </label>

                  {/* Darshan Gallery checkbox */}
                  <label className="flex items-center space-x-2.5 p-3 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-amber-400/50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={eventShowInGallery}
                      onChange={(e) => setEventShowInGallery(e.target.checked)}
                      className="w-4 h-4 accent-amber-400 rounded cursor-pointer"
                    />
                    <div className="text-xs">
                      <div className="font-bold text-white flex items-center space-x-1">
                        <span>🖼️</span>
                        <span>{language === 'kn' ? 'ದರ್ಶನ ಗ್ಯಾಲರಿ' : 'Darshan Gallery'}</span>
                      </div>
                      <div className="text-[10px] text-neutral-400">
                        {language === 'kn' ? 'ಆರ್ಕೈವ್ ಫೋಟೋ ಸಂಗ್ರಹ' : 'Full Photo Archive'}
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Order and Active status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-neutral-800">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-neutral-300">
                    {language === 'kn' ? 'ಪ್ರದರ್ಶನ ಕ್ರಮ / Priority Order' : 'Display Order'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={eventOrder}
                    onChange={(e) => setEventOrder(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex items-center space-x-3 pt-6">
                  <input
                    type="checkbox"
                    id="event-is-active"
                    checked={eventIsActive}
                    onChange={(e) => setEventIsActive(e.target.checked)}
                    className="w-4 h-4 accent-amber-400 rounded cursor-pointer"
                  />
                  <label htmlFor="event-is-active" className="text-xs font-bold text-neutral-200 cursor-pointer">
                    {language === 'kn' ? 'ವೆಬ್‌ಸೈಟ್‌ನಲ್ಲಿ ಸಕ್ರಿಯವಾಗಿ ತೋರಿಸಿ' : 'Visible on website'}
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsEventModalOpen(false)}
                  className="px-5 py-2.5 sm:py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs sm:text-sm font-bold text-neutral-300 hover:text-white transition-colors cursor-pointer"
                >
                  {language === 'kn' ? 'ರದ್ದುಮಾಡಿ' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={eventSaving}
                  className="px-7 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 font-black text-xs sm:text-sm cursor-pointer shadow-lg shadow-amber-400/20 disabled:opacity-50 transition-all flex items-center space-x-2"
                >
                  {eventSaving ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                      <span>{language === 'kn' ? 'ಉಳಿಸಲಾಗುತ್ತಿದೆ...' : 'Saving...'}</span>
                    </>
                  ) : editingEvent ? (
                    <span>{language === 'kn' ? 'ನವೀಕರಿಸಿ' : 'Update Event'}</span>
                  ) : (
                    <span>{language === 'kn' ? 'ಸೇರಿಸಿ' : 'Add Event'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE CONFIRMATION DIALOG */}
      {/* ========================================================================= */}
      {(deletingMediaId || deletingMemberId || deletingHistoryId || deletingAchievementId || deletingEventId) && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#101015] border border-red-500/40 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-400 mx-auto flex items-center justify-center shadow-lg">
              <Trash2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg sm:text-xl font-black text-white">
                {language === 'kn' ? 'ಖಚಿತಪಡಿಸಿ • ಶಾಶ್ವತ ಅಳಿಸುವಿಕೆ' : 'Confirm Permanent Deletion'}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                {language === 'kn'
                  ? 'ಈ ಐಟಂ ಅನ್ನು ವೆಬ್‌ಸೈಟ್‌ನಿಂದ ಖಾಯಂ ಆಗಿ ಅಳಿಸಲು ನೀವು ಖಚಿತವಾಗಿದ್ದೀರಾ? ಈ ಕ್ರಿಯೆಯನ್ನು ಹಿಂಪಡೆಯಲು ಸಾಧ್ಯವಿಲ್ಲ.'
                  : 'Are you sure you want to permanently delete this item? This action cannot be undone.'}
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center space-x-3">
              <button
                onClick={() => {
                  setDeletingMediaId(null);
                  setDeletingMemberId(null);
                  setDeletingHistoryId(null);
                  setDeletingAchievementId(null);
                  setDeletingEventId(null);
                }}
                className="px-5 py-2.5 sm:py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs sm:text-sm font-bold text-neutral-300 hover:text-white transition-colors cursor-pointer"
              >
                {language === 'kn' ? 'ರದ್ದುಮಾಡಿ' : 'Cancel'}
              </button>
              <button
                onClick={() => {
                  if (deletingMediaId) handleMediaDeleteConfirm();
                  if (deletingMemberId) handleMemberDeleteConfirm();
                  if (deletingHistoryId) handleHistoryDeleteConfirm();
                  if (deletingAchievementId) handleAchievementDeleteConfirm();
                  if (deletingEventId) handleEventDeleteConfirm();
                }}
                className="px-6 py-2.5 sm:py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs sm:text-sm font-black transition-colors cursor-pointer shadow-lg shadow-red-600/30"
              >
                {language === 'kn' ? 'ಶಾಶ್ವತವಾಗಿ ಅಳಿಸಿ' : 'Permanently Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ========================================================================= */}
      {/* PIN LOCK SCREEN */}
      {/* ========================================================================= */}
      <AdminPinLockModal
        isLocked={isPinLocked}
        correctPin={MASTER_ADMIN_CREDENTIALS.pin}
        onUnlock={handleUnlock}
        onLogout={() => {
          logout();
          navigate('/admin/login');
        }}
      />
    </div>
  );
};
