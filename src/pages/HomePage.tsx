import React from 'react';
import { HeroSection } from '../components/home/HeroSection';
import { LiveDarshanSection } from '../components/home/LiveDarshanSection';
import { DarshanCarousel } from '../components/home/DarshanCarousel';
import { CommitteeMessage } from '../components/home/CommitteeMessage';
import { QuickTimeline } from '../components/home/QuickTimeline';
import { HighlightsStats } from '../components/home/HighlightsStats';
import { ExtraCurricularSection } from '../components/home/ExtraCurricularSection';
import { InteractiveMap } from '../components/home/InteractiveMap';

export const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* 1. Hero Section (Dark) */}
      <div data-theme="dark">
        <HeroSection />
      </div>

      {/* 1.5. Live Darshan Broadcast (Dynamic Admin Controlled - displays only when active) */}
      <div data-theme="dark">
        <LiveDarshanSection />
      </div>

      {/* 2. Explore Our Work / Festival Strip (Dark Section with 35mm Reel) */}
      <div id="explore-section" data-theme="dark">
        <DarshanCarousel />
      </div>

      {/* 3. About CYM Section (Light) */}
      <div data-theme="light">
        <CommitteeMessage />
      </div>

      {/* 4. Latest Festival Stories (Light) */}
      <div data-theme="light">
        <QuickTimeline />
      </div>

      {/* 5. Community Journey Strip (Light) */}
      <div data-theme="light">
        <HighlightsStats />
      </div>

      {/* 5.5. Extra-Curricular & Community Events Section (Light) */}
      <div data-theme="light">
        <ExtraCurricularSection />
      </div>

      {/* 6. Stay Connected / Location Map (Light) */}
      <div data-theme="light">
        <InteractiveMap />
      </div>
    </div>
  );
};
