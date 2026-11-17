import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Search,
  X,
  Star,
  Crown,
  Award,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import {
  subscribeToCommittee,
  CommitteeMemberDoc,
  sortCommitteeMembers,
  getCommitteeRoleRank,
} from '../services/committeeService';
import { getHdMediaUrl } from '../utils/mediaUtils';

export const CommitteePage: React.FC = () => {
  const { language } = useLanguage();
  const [members, setMembers] = useState<CommitteeMemberDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<'all' | 'office' | 'core' | 'youth' | 'advisory'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<CommitteeMemberDoc | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToCommittee(
      (data) => {
        const sorted = sortCommitteeMembers(data.filter((m) => m.isActive !== false));
        setMembers(sorted);
        setLoading(false);
      },
      () => {
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Keyboard close for Lightbox Modal
  useEffect(() => {
    if (!selectedMember) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedMember(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedMember]);

  // Filtered members by category and search
  const filteredMembers = useMemo(() => {
    return sortCommitteeMembers(
      members.filter((m) => {
        const matchesCategory = activeCategory === 'all' || m.category === activeCategory;
        const q = searchQuery.toLowerCase().trim();
        if (!q) return matchesCategory;

        const matchesSearch =
          (m.nameKn && m.nameKn.toLowerCase().includes(q)) ||
          (m.nameEn && m.nameEn.toLowerCase().includes(q)) ||
          (m.roleKn && m.roleKn.toLowerCase().includes(q)) ||
          (m.roleEn && m.roleEn.toLowerCase().includes(q)) ||
          (m.servicePeriodKn && m.servicePeriodKn.toLowerCase().includes(q)) ||
          (m.servicePeriodEn && m.servicePeriodEn.toLowerCase().includes(q));

        return matchesCategory && matchesSearch;
      })
    );
  }, [members, activeCategory, searchQuery]);

  return (
    <div className="pt-20 sm:pt-24 pb-12 bg-[#FDFBF7] min-h-screen">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">

        {/* Minimal Compact Header */}
        <div className="text-center max-w-xl mx-auto mb-5 sm:mb-6">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-100/70 border border-amber-300 text-[10px] font-mono font-bold uppercase tracking-wider text-amber-900 mb-2">
            <Sparkles className="w-3 h-3 text-amber-600" />
            <span>{language === 'kn' ? 'ಸ್ಥಾಪನೆ 2019 • ಕಡಲಗಿ ಖೂಟ' : 'ESTD 2019 • KADALAGI KHOOT'}</span>
          </div>

          <h1
            className={`text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight leading-tight ${
              language === 'kn' ? 'font-kannada' : 'font-sans'
            }`}
          >
            {language === 'kn' ? 'ಕಮಿಟಿ ಸದಸ್ಯರು' : 'Committee Members'}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            {language === 'kn'
              ? 'ಚಾಣಕ್ಯ ಯುವಕ ಮಂಡಳದ ಪದಾಧಿಕಾರಿಗಳು ಹಾಗೂ ಸಮರ್ಪಿತ ಯುವ ತಂಡ'
              : 'Leadership & volunteers of Chanakya Yuvak Mandal'}
          </p>
        </div>

        {/* Compact Controls: Search & Category Pills */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-amber-200/80 p-2 sm:p-2.5 shadow-2xs mb-5 sm:mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
          {/* Quick Search */}
          <div className="relative flex-1 max-w-sm">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                language === 'kn'
                  ? 'ಸದಸ್ಯರ ಹೆಸರು ಅಥವಾ ಪದವಿ ಹುಡುಕಿ...'
                  : 'Search by name or role...'
              }
              className="w-full pl-8 pr-7 py-1.5 sm:py-2 rounded-lg bg-amber-50/40 border border-amber-200 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-amber-400 transition-all"
            />
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Minimal Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-0.5">
            {[
              { id: 'all' as const, labelKn: 'ಎಲ್ಲರೂ', labelEn: 'All' },
              { id: 'office' as const, labelKn: 'ಪದಾಧಿಕಾರಿಗಳು', labelEn: 'Office Bearers' },
              { id: 'core' as const, labelKn: 'ಪ್ರಮುಖ ಸಮಿತಿ', labelEn: 'Core' },
              { id: 'youth' as const, labelKn: 'ಯುವ ಪಡೆ', labelEn: 'Youth' },
              { id: 'advisory' as const, labelKn: 'ಸಲಹಾ ಮಂಡಳಿ', labelEn: 'Advisors' },
            ].map((tab) => {
              const isActive = activeCategory === tab.id;
              const count = tab.id === 'all' ? members.length : members.filter((m) => m.category === tab.id).length;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center space-x-1 ${
                    isActive
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : 'bg-neutral-50 text-neutral-600 hover:bg-amber-50 border border-neutral-200/70 hover:border-amber-300'
                  }`}
                >
                  <span>{language === 'kn' ? tab.labelKn : tab.labelEn}</span>
                  <span
                    className={`text-[9px] font-mono px-1 rounded ${
                      isActive ? 'bg-amber-800 text-white' : 'bg-neutral-200/80 text-neutral-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-3.5">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-neutral-200 p-2.5 animate-pulse space-y-2"
              >
                <div className="w-full aspect-square bg-neutral-200 rounded-lg" />
                <div className="h-3 bg-neutral-200 rounded w-3/4 mx-auto" />
                <div className="h-2 bg-neutral-200 rounded w-1/2 mx-auto" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredMembers.length === 0 && (
          <div className="bg-white rounded-2xl border border-amber-200/80 p-8 text-center max-w-sm mx-auto shadow-2xs my-8">
            <div className="w-10 h-10 mx-auto rounded-full bg-amber-50 flex items-center justify-center text-amber-600 mb-2.5 border border-amber-200">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-neutral-900">
              {language === 'kn' ? 'ಸದಸ್ಯರು ಕಂಡುಬಂದಿಲ್ಲ' : 'No Members Found'}
            </h3>
            <p className="text-xs text-neutral-500 mt-1">
              {language === 'kn' ? 'ಬೇರೆ ಹುಡುಕಾಟ ಬಳಸಿ ನೋಡಿ.' : 'Try adjusting your search or category filter.'}
            </p>
          </div>
        )}

        {/* Compact, Unified Minimalist Member Grid */}
        {!loading && filteredMembers.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-3.5">
            {filteredMembers.map((member) => {
              const rank = getCommitteeRoleRank(member);
              const isTopLeader = rank <= 3;
              const initial = (member.nameEn || member.nameKn || 'C').charAt(0).toUpperCase();

              return (
                <div
                  key={member.id}
                  onClick={() => setSelectedMember(member)}
                  className="group bg-white rounded-xl border border-amber-200/70 hover:border-amber-400 p-2 sm:p-2.5 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer"
                >
                  <div>
                    {/* Portrait Photo Container */}
                    <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-neutral-100 flex items-center justify-center border border-amber-100">
                      {member.photoUrl ? (
                        <img
                          src={getHdMediaUrl(member.photoUrl, 'image')}
                          alt={member.nameEn}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/assets/images/grand_ganesha_logo_opt.png';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-tr from-amber-100 to-amber-50 flex items-center justify-center font-bold text-neutral-400 text-2xl group-hover:scale-105 transition-transform duration-300">
                          {initial}
                        </div>
                      )}

                      {/* Subtle Top Badge: Founding Pillar */}
                      {member.isFounding && (
                        <div
                          className="absolute top-1.5 right-1.5 p-1 rounded-md bg-black/70 backdrop-blur-xs text-amber-300 shadow-xs"
                          title={language === 'kn' ? 'ಸಂಸ್ಥಾಪಕ ಸ್ತಂಭ' : 'Founding Pillar'}
                        >
                          <Star className="w-2.5 h-2.5 fill-amber-300" />
                        </div>
                      )}

                      {/* Leader Crown Badge for Rank 1 */}
                      {rank === 1 && (
                        <div
                          className="absolute top-1.5 left-1.5 p-1 rounded-md bg-amber-500 text-white shadow-xs"
                          title="President"
                        >
                          <Crown className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>

                    {/* Member Info */}
                    <div className="mt-2 text-center">
                      <h3
                        className={`text-xs sm:text-sm font-bold text-neutral-900 group-hover:text-amber-800 transition-colors truncate ${
                          language === 'kn' ? 'font-kannada' : 'font-sans'
                        }`}
                        title={language === 'kn' ? member.nameKn : member.nameEn}
                      >
                        {language === 'kn' ? member.nameKn : member.nameEn}
                      </h3>

                      {/* Bilingual Sub-name (compact) */}
                      {language !== 'kn' && member.nameKn && (
                        <p className="text-[10px] text-neutral-400 font-kannada truncate leading-tight">
                          {member.nameKn}
                        </p>
                      )}
                      {language === 'kn' && member.nameEn && (
                        <p className="text-[10px] text-neutral-400 font-sans truncate leading-tight">
                          {member.nameEn}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Role Tag & Tenure */}
                  <div className="mt-2 pt-1.5 border-t border-neutral-100 text-center">
                    <span
                      className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded truncate max-w-full ${
                        isTopLeader
                          ? 'bg-amber-100 text-amber-950 border border-amber-300'
                          : 'bg-neutral-50 text-neutral-700 border border-neutral-200'
                      }`}
                      title={language === 'kn' ? member.roleKn : member.roleEn}
                    >
                      {language === 'kn' ? member.roleKn : member.roleEn}
                    </span>

                    {(member.servicePeriodKn || member.servicePeriodEn) && (
                      <p className="text-[9px] font-mono text-neutral-400 mt-0.5 truncate">
                        {language === 'kn' ? member.servicePeriodKn : member.servicePeriodEn}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Fullscreen HD Member Lightbox Modal */}
      {selectedMember && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
          onClick={() => setSelectedMember(null)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-2xl overflow-hidden shadow-2xl border border-neutral-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header Bar */}
            <div className="px-3.5 py-2.5 border-b border-neutral-100 flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-800">
                {language === 'kn' ? 'ಸದಸ್ಯರ ವಿವರ' : 'Member Profile'}
              </span>
              <button
                type="button"
                onClick={() => setSelectedMember(null)}
                className="p-1 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Photo Viewport */}
            <div className="relative aspect-square bg-neutral-900 flex items-center justify-center overflow-hidden">
              {selectedMember.photoUrl ? (
                <img
                  src={getHdMediaUrl(selectedMember.photoUrl, 'image')}
                  alt={selectedMember.nameEn}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-4xl font-bold text-amber-800">
                  {(selectedMember.nameEn || selectedMember.nameKn || 'C').charAt(0).toUpperCase()}
                </div>
              )}

              {selectedMember.isFounding && (
                <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-xs border border-amber-400 text-amber-300 text-[10px] font-mono font-bold flex items-center space-x-1">
                  <Star className="w-3 h-3 fill-amber-300" />
                  <span>{language === 'kn' ? 'ಸಂಸ್ಥಾಪಕ ಸ್ತಂಭ' : 'Founding Pillar'}</span>
                </div>
              )}
            </div>

            {/* Info Section */}
            <div className="p-3.5 text-center space-y-1.5">
              <h3
                className={`text-base font-black text-neutral-900 ${
                  language === 'kn' ? 'font-kannada' : 'font-sans'
                }`}
              >
                {language === 'kn' ? selectedMember.nameKn : selectedMember.nameEn}
              </h3>
              <p className="text-xs text-neutral-500">
                {language === 'kn' ? selectedMember.nameEn : selectedMember.nameKn}
              </p>

              <div className="pt-2 border-t border-neutral-100 flex items-center justify-center gap-2 flex-wrap">
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-300 text-amber-900 font-bold text-xs">
                  <Award className="w-3 h-3 text-amber-600" />
                  <span>{language === 'kn' ? selectedMember.roleKn : selectedMember.roleEn}</span>
                </span>

                {(selectedMember.servicePeriodKn || selectedMember.servicePeriodEn) && (
                  <span className="inline-flex items-center space-x-1 text-[11px] font-mono text-neutral-500">
                    <Calendar className="w-3 h-3 text-neutral-400" />
                    <span>{language === 'kn' ? selectedMember.servicePeriodKn : selectedMember.servicePeriodEn}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};