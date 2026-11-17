import React, { useState } from 'react';
import { MapPin, Mail, Clock, ExternalLink, Copy, Check, Instagram, Youtube, Layers, Eye, Navigation } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { siteConfig } from '../data/site';
import { SectionTitle } from '../components/common/SectionTitle';

type MapViewMode = 'satellite' | 'roadmap' | 'streetview';

export const ContactPage: React.FC = () => {
  const { language, t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<MapViewMode>('satellite');

  // Exact coordinates for Chanakya Yuvak Mandal, Kadalagi Khoot, Yamakanmardi
  const lat = '16.129842';
  const lng = '74.5290432';

  // Embed URLs for different view modes
  const roadmapEmbedUrl = siteConfig.googleMapsEmbedUrl;
  const satelliteEmbedUrl = `https://maps.google.com/maps?q=${lat},${lng}+(Chanakya+Yuvak+Mandal+Kadalagi+Khoot)&t=k&z=19&ie=UTF8&iwloc=B&output=embed`;
  const streetViewEmbedUrl = `https://maps.google.com/maps?q=&layer=c&cbll=${lat},${lng}&cbp=12,90,,0,5&output=svembed`;

  // External direct links
  const directSatelliteUrl = `https://www.google.com/maps/place/Chanakya+Yuvak+Mandal,+Kadalagi+Khoot,+Yamakanmardi/@${lat},${lng},20z/data=!3m1!1e3`;
  const directStreetViewUrl = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`;

  const currentEmbedUrl =
    viewMode === 'satellite'
      ? satelliteEmbedUrl
      : viewMode === 'streetview'
      ? streetViewEmbedUrl
      : roadmapEmbedUrl;

  const copyEmail = () => {
    navigator.clipboard.writeText(siteConfig.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="pt-4 sm:pt-6 pb-12 md:pb-16 bg-[#F8F8F7] min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle
          badge={language === 'kn' ? 'ನೇರ ಸಂಪರ್ಕ' : 'CONNECT WITH US'}
          title={t.contact.title}
          subtitle={language === 'kn' ? 'ಕಡಲಗಿ ಖೂಟ, ಯಮಕನಮರಡಿ — ಅಧಿಕೃತ ಸಂಪರ್ಕ ಮತ್ತು ಸಾಮಾಜಿಕ ಜಾಲತಾಣಗಳು' : 'Kadalagi Khoot, Yamakanmardi — Official Inquiries, Location & Social Handles'}
        />

        {/* 3 Clear, Well-Spaced Cards (Instagram, YouTube, Email) - No WhatsApp */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          {/* Card 1: Instagram */}
          <a
            href={siteConfig.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/90 shadow-2xs hover:shadow-xl hover:border-[#E1306C]/50 transition-all duration-300 flex flex-col justify-between group cursor-pointer"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FFDC80] via-[#FD1D1D] to-[#833AB4] flex items-center justify-center text-white mb-4 shadow-sm group-hover:scale-105 transition-transform">
                <Instagram className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-[#E1306C] block">
                Instagram
              </span>
              <h3 className="text-base sm:text-lg font-sans font-bold text-gray-900 mt-1 group-hover:text-[#E1306C] transition-colors truncate">
                @chanakya_yuvakmandal
              </h3>
              <p className="text-xs text-gray-500 font-sans mt-2 leading-relaxed">
                {language === 'kn' ? 'ಉತ್ಸವದ ರೀಲ್ಸ್, ಲೈವ್ ದರ್ಶನ ಮತ್ತು ಫೋಟೋಗಳಿಗಾಗಿ ಫಾಲೋ ಮಾಡಿ.' : 'Follow for festival reels, darshan photos & live updates.'}
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-sans font-bold uppercase text-[#E1306C]">
              <span>{language === 'kn' ? 'ಫಾಲೋ ಮಾಡಿ' : 'Follow Page'}</span>
              <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </a>

          {/* Card 2: YouTube */}
          <a
            href={siteConfig.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/90 shadow-2xs hover:shadow-xl hover:border-[#FF0000]/50 transition-all duration-300 flex flex-col justify-between group cursor-pointer"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#FF0000] flex items-center justify-center text-white mb-4 shadow-sm group-hover:scale-105 transition-transform">
                <Youtube className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-[#FF0000] block">
                YouTube Channel
              </span>
              <h3 className="text-base sm:text-lg font-sans font-bold text-gray-900 mt-1 group-hover:text-[#FF0000] transition-colors truncate">
                @ChanakyaYuvakMandal
              </h3>
              <p className="text-xs text-gray-500 font-sans mt-2 leading-relaxed">
                {language === 'kn' ? 'ಭವ್ಯ ವಿಸರ್ಜನಾ ಮಿರವಣಿಗೆ ಮತ್ತು ಮಹಾಮಂಗಳಾರತಿ ವಿಡಿಯೋಗಳು.' : 'Watch historic Visarjan miravanige & Maha Aarti videos.'}
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-sans font-bold uppercase text-[#FF0000]">
              <span>{language === 'kn' ? 'ವಿಡಿಯೋ ವೀಕ್ಷಿಸಿ' : 'Watch Videos'}</span>
              <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </a>

          {/* Card 3: Email */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/90 shadow-2xs hover:shadow-xl hover:border-[#E5A812]/50 transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 flex items-center justify-center text-[#E5A812] mb-4 shadow-xs group-hover:scale-105 transition-transform">
                <Mail className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-[#C88A00] block">
                Official Email
              </span>
              <a
                href={`mailto:${siteConfig.email}`}
                className="text-xs sm:text-sm font-sans font-bold text-gray-900 mt-1 block break-all hover:text-[#E5A812] transition-colors"
              >
                {siteConfig.email}
              </a>
              <p className="text-xs text-gray-500 font-sans mt-2 leading-relaxed">
                {language === 'kn' ? 'ಉತ್ಸವ ಹಾಗೂ ಸೇವಾ ವಿಚಾರಣೆಗಾಗಿ ನೇರವಾಗಿ ಈಮೇಲ್ ಕಳುಹಿಸಿ.' : 'Reach out directly for festival inquiries and voluntary seva.'}
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
              <a
                href={`mailto:${siteConfig.email}`}
                className="px-4 py-1.5 rounded-full bg-black text-white hover:bg-[#E5A812] hover:text-black font-sans text-xs font-bold uppercase transition-colors"
              >
                {language === 'kn' ? 'ಮೇಲ್ ಕಳುಹಿಸಿ' : 'Send Mail'}
              </a>
              <button
                onClick={copyEmail}
                className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-black transition-colors cursor-pointer flex items-center space-x-1"
                title="Copy Email"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-[10px] text-green-700 font-bold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span className="text-[10px] text-gray-500">Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Pandal Address & Visiting Details Box */}
        <div className="mt-10 bg-white rounded-3xl border border-gray-200/90 p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100">
            <div className="space-y-1.5">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#E5A812]/15 text-[#9E6D00] text-xs font-sans font-bold uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5 text-[#E5A812]" />
                <span>{language === 'kn' ? 'ಮಂಟಪದ ಅಧಿಕೃತ ವಿಳಾಸ' : 'Official Pandal Location'}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-display font-black uppercase text-gray-950">
                {language === 'kn' ? siteConfig.nameKn : siteConfig.nameEn}
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 font-sans">
                {language === 'kn'
                  ? 'ಕಡಲಗಿ ಖೂಟ, ಯಮಕನಮರಡಿ, ಹುಕ್ಕೇರಿ ತಾಲ್ಲೂಕು, ಬೆಳಗಾವಿ ಜಿಲ್ಲೆ, ಕರ್ನಾಟಕ – 591246'
                  : 'Kadalagi Khoot, Yamakanmardi, Taluk: Hukkeri, District: Belagavi, Karnataka – 591246'}
              </p>
            </div>

            <div className="shrink-0 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/50 flex items-start space-x-3">
              <Clock className="w-4 h-4 text-[#C88A00] shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-sans font-bold uppercase tracking-wide text-gray-900 block">
                  {language === 'kn' ? 'ದರ್ಶನ ಸಮಯ' : 'Visiting Hours'}
                </span>
                <span className="text-gray-600 font-sans mt-0.5 block">
                  6:00 AM – 11:30 PM ({language === 'kn' ? 'ಗಣೇಶ ಮಹೋತ್ಸವದ ದಿನಗಳಲ್ಲಿ' : 'During Ganesh Utsav'})
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Map Controls: Satellite 3D, Roadmap, 360° Street View */}
          <div className="pt-6">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
              <div className="flex items-center bg-gray-100 p-1 rounded-xl">
                <button
                  onClick={() => setViewMode('satellite')}
                  className={`inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-sans font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    viewMode === 'satellite'
                      ? 'bg-white text-black shadow-xs font-black'
                      : 'text-gray-500 hover:text-black'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-amber-600" />
                  <span>{language === 'kn' ? 'ಉಪಗ್ರಹ ನೋಟ (Satellite 3D)' : 'Satellite 3D'}</span>
                </button>

                <button
                  onClick={() => setViewMode('roadmap')}
                  className={`inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-sans font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    viewMode === 'roadmap'
                      ? 'bg-white text-black shadow-xs font-black'
                      : 'text-gray-500 hover:text-black'
                  }`}
                >
                  <Navigation className="w-3.5 h-3.5 text-blue-600" />
                  <span>{language === 'kn' ? 'ರಸ್ತೆ ನಕ್ಷೆ (Roadmap)' : 'Roadmap'}</span>
                </button>

                <button
                  onClick={() => setViewMode('streetview')}
                  className={`inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-sans font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    viewMode === 'streetview'
                      ? 'bg-white text-black shadow-xs font-black'
                      : 'text-gray-500 hover:text-black'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5 text-purple-600" />
                  <span>{language === 'kn' ? '360° ರಸ್ತೆ ನೋಟ (Street View)' : '360° Street View'}</span>
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <a
                  href={viewMode === 'satellite' ? directSatelliteUrl : viewMode === 'streetview' ? directStreetViewUrl : siteConfig.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-xl bg-black text-white hover:bg-[#E5A812] hover:text-black text-xs font-sans font-bold uppercase transition-all shadow-xs"
                >
                  <span>{language === 'kn' ? 'ಗೂಗಲ್ ಮ್ಯಾಪ್ಸ್‌ನಲ್ಲಿ ವೀಕ್ಷಿಸಿ' : 'Open in Google Maps'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Embedded Live Map Viewport */}
            <div className="relative rounded-2xl overflow-hidden border border-gray-200/90 shadow-inner h-80 sm:h-96 w-full bg-gray-100">
              <iframe
                title="Chanakya Yuvak Mandal Map"
                src={currentEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
