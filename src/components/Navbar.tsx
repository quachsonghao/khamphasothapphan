import React from 'react';
import { Volume2, VolumeX, BookOpen, Star, Sparkles, Layers, Grid, Edit3, Gamepad2 } from 'lucide-react';
import { MathMode } from '../types/math';
import { sounds } from '../utils/audio';

interface NavbarProps {
  currentMode: MathMode;
  onSelectMode: (mode: MathMode) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenReference: () => void;
  totalStars: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMode,
  onSelectMode,
  soundEnabled,
  onToggleSound,
  onOpenReference,
  totalStars,
}) => {
  const navTabs: { id: MathMode; label: string; shortLabel: string; icon: React.ReactNode }[] = [
    {
      id: 'place-value',
      label: 'Bảng Các Hàng & Giá Trị',
      shortLabel: 'Bảng Các Hàng',
      icon: <Layers className="w-4 h-4" />
    },
    {
      id: 'place-match-game',
      label: 'Trò Chơi Ghép Hàng & Giá Trị',
      shortLabel: 'Ghép Hàng & Giá Trị',
      icon: <Sparkles className="w-4 h-4" />
    },
    {
      id: 'read-write',
      label: 'Luyện Đọc & Viết Số',
      shortLabel: 'Đọc & Viết Số',
      icon: <Edit3 className="w-4 h-4" />
    },
    {
      id: 'game-arena',
      label: 'Đấu Trường Trò Chơi',
      shortLabel: 'Đấu Trường Game',
      icon: <Gamepad2 className="w-4 h-4" />
    }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name - Lively, Colorful, Animated */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            {/* Lively Logo Badge */}
            <div className="relative shrink-0 group cursor-pointer">
              {/* Outer vibrant rainbow gradient ring */}
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-600 p-0.5 shadow-md shadow-indigo-500/20 transition-transform group-hover:scale-105 active:scale-95">
                {/* Inner badge container */}
                <div className="w-full h-full bg-gradient-to-br from-indigo-700 via-indigo-600 to-purple-800 rounded-[14px] flex items-center justify-center text-white relative overflow-hidden">
                  {/* Subtle decorative glow orb */}
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400/50 rounded-full blur-xs pointer-events-none" />
                  
                  {/* Animated decimal numbers */}
                  <div className="flex items-center font-mono font-black text-sm sm:text-base tracking-tight select-none">
                    <span className="text-white drop-shadow-xs">0</span>
                    <span className="text-amber-300 text-lg font-black leading-none -mx-0.5 animate-bounce drop-shadow-xs">,</span>
                    <span className="text-emerald-300 drop-shadow-xs">5</span>
                  </div>
                </div>
              </div>

              {/* Lively floating star badge */}
              <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gradient-to-tr from-amber-300 to-yellow-400 rounded-full border-2 border-white flex items-center justify-center text-amber-900 shadow-xs">
                <Sparkles className="w-2.5 h-2.5 text-amber-900 fill-amber-400" />
              </div>
            </div>

            <div className="min-w-0">
              <span className="font-extrabold text-slate-900 text-sm sm:text-base md:text-lg tracking-tight block leading-tight truncate">
                Khám Phá Số Thập Phân
              </span>
              <span className="text-xs text-slate-500 font-semibold hidden sm:block truncate">
                Toán Học Tương Tác Lớp 5 · GDPT Mới
              </span>
            </div>
          </div>

          {/* Navigation Tabs (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/60">
            {navTabs.map((tab) => {
              const isActive = currentMode === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    sounds.playClick();
                    onSelectMode(tab.id);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Icons: Stars, Sổ tay, Sound */}
          <div className="flex items-center gap-2">
            {/* Star Counter */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold">
              <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span className="font-mono">{totalStars}</span>
              <span className="hidden sm:inline text-amber-700 font-normal">sao</span>
            </div>

            {/* Sổ tay bí kíp button */}
            <button
              onClick={() => {
                sounds.playClick();
                onOpenReference();
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              title="Mở sổ tay quy tắc sách giáo khoa"
            >
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span className="hidden sm:inline">Sổ tay bí kíp</span>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={() => {
                onToggleSound();
              }}
              className={`p-2 rounded-xl border transition-colors ${
                soundEnabled
                  ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  : 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
              }`}
              title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
              aria-label="Chuyển đổi âm thanh"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="lg:hidden py-2 border-t border-slate-100 overflow-x-auto no-scrollbar touch-scroll flex items-center gap-1.5 px-0.5">
          {navTabs.map((tab) => {
            const isActive = currentMode === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  sounds.playClick();
                  onSelectMode(tab.id);
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 active:bg-slate-200'
                }`}
              >
                {tab.icon}
                <span className="font-bold">{tab.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
