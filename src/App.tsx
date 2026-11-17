import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { LanguageProvider } from './i18n/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { AnnouncementBanner } from './components/common/AnnouncementBanner';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { BackToTop } from './components/common/BackToTop';
import { ScrollToTop } from './components/common/ScrollToTop';
import { AnimatedSideRails } from './components/common/AnimatedSideRails';
import { InitialLoader } from './components/common/InitialLoader';

import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { HistoryPage } from './pages/HistoryPage';
import { YearDetailPage } from './pages/YearDetailPage';
import { GalleryPage } from './pages/GalleryPage';
import { CommitteePage } from './pages/CommitteePage';
import { AchievementsPage } from './pages/AchievementsPage';
import { EventsPage } from './pages/EventsPage';
import { ContactPage } from './pages/ContactPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { useTitleMarquee } from './hooks/useTitleMarquee';

const AppContent: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';
  const isAdmin = location.pathname.startsWith('/admin');

  // Smooth rolling tab title ticker (leftwards marquee with Kannada grapheme support)
  useTitleMarquee();

  // Secret Admin Door (Desktop): Ctrl + Shift + A (or Cmd + Shift + A on Mac)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        navigate('/admin/login');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  if (isAdmin) {
    return (
      <Routes>
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#111111] font-sans selection:bg-[#E5A812] selection:text-black">
      {/* Auspicious Ganapati Loading Screen at start of website */}
      <InitialLoader />

      {/* Live Admin Top Announcement (if active) */}
      <AnnouncementBanner />

      {/* Floating Dark Glass Capsule Navbar */}
      <Navbar />

      {/* Main Application Routes: Homepage sits flush under the floating navbar; subpages padded cleanly */}
      <main className={`flex-1 ${isHome ? '' : 'pt-20 sm:pt-24'}`}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/history/:year" element={<YearDetailPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/committee" element={<CommitteePage />} />
          <Route path="/achievements" element={<AchievementsPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/extra-curricular" element={<EventsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {/* Royal Footer */}
      <Footer />

      {/* Back to top scroll button */}
      <BackToTop />

      {/* Symmetrical Animated Side Rails (Left flows Up, Right flows Down) */}
      <AnimatedSideRails />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <AppContent />
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;
