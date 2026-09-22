import React, { useState } from 'react';
import { PupilProfile } from '../types';
import {
  Sparkles,
  Trophy,
  Check,
  ShieldCheck,
  Palette,
  Coins,
  Smile,
  Award,
} from 'lucide-react';
import { playClickSound, playCoinSound } from '../utils/audio';

interface AvatarCustomizerProps {
  profile: PupilProfile;
  onUpdateProfile: (updated: Partial<PupilProfile>) => void;
}

export const AvatarCustomizer: React.FC<AvatarCustomizerProps> = ({
  profile,
  onUpdateProfile,
}) => {
  const [name, setName] = useState(profile.name);
  const [gradeClass, setGradeClass] = useState(profile.gradeClass);
  const [selectedOutfit, setSelectedOutfit] = useState(profile.avatarOutfit);
  const [selectedTitle, setSelectedTitle] = useState(profile.activeTitle);

  const outfits = [
    {
      id: 'toghu',
      name: 'North-West Royal Toghu',
      region: 'North West & Grassfields',
      description: 'Intricately embroidered velvet attire worn during celebrations.',
      icon: '👑',
      price: 0,
      unlocked: true,
    },
    {
      id: 'kaba',
      name: 'Coastal Kaba Ngondo',
      region: 'Littoral & South West',
      description: 'Elegant flowing coastal garment celebrating the Sawa water festivals.',
      icon: '🌊',
      price: 150,
      unlocked: true,
    },
    {
      id: 'gandoura',
      name: 'Sahelian Gandoura',
      region: 'North & Far North',
      description: 'Airy, beautifully embroidered tunic for the bright Sahel sun.',
      icon: '☀️',
      price: 200,
      unlocked: true,
    },
    {
      id: 'khaki_uniform',
      name: 'Primary School Khaki',
      region: 'Cameroon Public School',
      description: 'The iconic neat khaki uniform with shoulder epaulettes.',
      icon: '🎒',
      price: 0,
      unlocked: true,
    },
    {
      id: 'navy_uniform',
      name: 'Navy Blue & White Scholar',
      region: 'Mission & College Preparatory',
      description: 'Prestige uniform worn by top academic examination candidates.',
      icon: '📘',
      price: 100,
      unlocked: true,
    },
  ];

  const titles = [
    {
      id: 'Master of Mount Cameroon',
      title: 'Master of Mount Cameroon',
      unlocked: profile.completedMissionIds.includes('buea_fako'),
      requirement: 'Conquer the Buea Mount Fako Mission',
    },
    {
      id: 'Buea Market Champion',
      title: 'Buea Market Champion',
      unlocked: profile.completedMissionIds.includes('buea_market'),
      requirement: 'Calculate change in Buea Market',
    },
    {
      id: 'Sanaga River Mathematician',
      title: 'Sanaga River Mathematician',
      unlocked: true,
      requirement: 'Solve 10 arithmetic fraction challenges',
    },
    {
      id: 'Forest Biologist of the South',
      title: 'Forest Biologist of the South',
      unlocked: profile.completedMissionIds.includes('ebolowa_cocoa'),
      requirement: 'Complete Cocoa Agro-Forestry Science Mission',
    },
    {
      id: 'Chieftain of Douala Ports',
      title: 'Chieftain of Douala Ports',
      unlocked: profile.completedMissionIds.includes('douala_port'),
      requirement: 'Master Maritime Container Logistics',
    },
  ];

  const tools = [
    { name: 'Traditional Grassfield Abacus', icon: '🧮', desc: 'Adds +10% bonus coins on arithmetic missions' },
    { name: 'Mount Fako Volcanic Magnifier', icon: '🔍', desc: 'Reveals science hints on tricky environmental questions' },
    { name: 'Limbe Maritime Compass', icon: '🧭', desc: 'Guides spatial geometry & directional map questions' },
    { name: 'Bilingual Word Dictionary', icon: '📖', desc: 'Translates French vocabulary terms into English' },
  ];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    playClickSound();
    onUpdateProfile({
      name,
      gradeClass,
      avatarOutfit: selectedOutfit,
      activeTitle: selectedTitle,
    });
  };

  return (
    <div className="max-w-4xl xl:max-w-5xl mx-auto space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
            Pupil Locker & Identity
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-display mt-1">
            Avatar Customizer & Cultural Outfits
          </h1>
          <p className="text-xs text-slate-500">
            Personalize your scholar profile with Cameroonian attire, badges, and academic titles.
          </p>
        </div>

        <div className="flex items-center gap-2 font-bold text-xs px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
          <Coins className="w-4 h-4 text-amber-500" />
          <span>Wallet: {profile.coins.toLocaleString()} FCFA</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 items-start">
        {/* Avatar Visual Preview Box */}
        <div className="md:col-span-4 lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs text-center space-y-4">
          <div className="relative w-32 h-32 mx-auto rounded-3xl bg-gradient-to-tr from-emerald-600 via-teal-700 to-emerald-900 flex items-center justify-center text-white shadow-md ring-4 ring-emerald-100">
            <span className="text-5xl font-black">
              {outfits.find((o) => o.id === selectedOutfit)?.icon || '🎓'}
            </span>
            <span className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-yellow-400 text-slate-900 text-xs font-black flex items-center justify-center shadow-xs">
              {profile.level}
            </span>
          </div>

          <div>
            <h2 className="text-lg font-black text-slate-900 font-display">{name}</h2>
            <p className="text-xs font-bold text-emerald-700">{selectedTitle}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {gradeClass} • {profile.schoolName}
            </p>
          </div>

          {/* Cultural badges list */}
          <div className="pt-3 border-t border-slate-100">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              Unlocked Regional Badges ({profile.unlockedBadges.length})
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {profile.unlockedBadges.map((badge, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-1"
                >
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  <span>{badge}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Customization Controls */}
        <div className="md:col-span-8 lg:col-span-9 bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-6">
          <form onSubmit={handleSaveProfile} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Pupil Name:
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs font-semibold p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Class / Grade Level:
                </label>
                <select
                  value={gradeClass}
                  onChange={(e) => setGradeClass(e.target.value)}
                  className="w-full text-xs font-semibold p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:outline-emerald-600"
                >
                  <option value="Primary 6 / Class 7 (Common Entrance Year)">
                    Primary 6 / Class 7 (Common Entrance Year)
                  </option>
                  <option value="Primary 5 / Class 6">Primary 5 / Class 6</option>
                  <option value="Primary 4 / Class 5">Primary 4 / Class 5</option>
                </select>
              </div>
            </div>

            {/* Outfits selection */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-emerald-600" />
                <span>Select Cultural & School Outfits</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {outfits.map((outfit) => {
                  const isSelected = selectedOutfit === outfit.id;
                  return (
                    <button
                      key={outfit.id}
                      type="button"
                      onClick={() => {
                        playClickSound();
                        setSelectedOutfit(outfit.id);
                      }}
                      className={`text-left p-3 rounded-xl border text-xs transition-all flex items-start gap-3 cursor-pointer ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-500/20'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800'
                      }`}
                    >
                      <span className="text-2xl">{outfit.icon}</span>
                      <div className="space-y-0.5">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-slate-900">{outfit.name}</span>
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500">{outfit.region}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Academic Titles selection */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>Earned Academic Titles</span>
              </h3>

              <div className="space-y-2">
                {titles.map((t) => {
                  const isSelected = selectedTitle === t.title;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      disabled={!t.unlocked}
                      onClick={() => {
                        playClickSound();
                        setSelectedTitle(t.title);
                      }}
                      className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all flex items-center justify-between gap-2 ${
                        !t.unlocked
                          ? 'opacity-40 bg-slate-100 border-slate-200 cursor-not-allowed'
                          : isSelected
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-500/20 cursor-pointer'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer'
                      }`}
                    >
                      <div>
                        <span className="font-bold text-slate-900">{t.title}</span>
                        <p className="text-[10px] text-slate-500">{t.requirement}</p>
                      </div>
                      {t.unlocked ? (
                        isSelected ? (
                          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <span className="text-[10px] text-emerald-700 font-bold">Equip</span>
                        )
                      ) : (
                        <span className="text-[10px] text-slate-400 font-semibold">Locked</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cultural Learning Tools Locker */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Pupil Learning Tools Locker</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {tools.map((tl, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-start gap-2.5 text-xs"
                  >
                    <span className="text-xl">{tl.icon}</span>
                    <div>
                      <p className="font-bold text-slate-900 text-[11px]">{tl.name}</p>
                      <p className="text-[10px] text-slate-500 leading-tight">{tl.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-xs transition-colors cursor-pointer"
            >
              Save Scholar Profile & Outfits
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
