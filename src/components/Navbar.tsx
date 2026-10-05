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
  const navTabs: { id: MathMode; label: string; icon: React.ReactNode }[] = [
    {
      id: 'visual-lab',
      label: 'Mô hình 100 Ô & Trục Số',
      icon: <Grid className="w-4 h-4" />
    },
    {
      id: 'place-value',
      label: 'Bảng Các Hàng & Giá Trị',
      icon: <Layers className="w-4 h-4" />
    },
    {
      id: 'place-match-game',
      label: 'Trò Chơi Ghép Hàng & Giá Trị',
      icon: <Sparkles className="w-4 h-4" />
    },
    {
      id: 'read-write',
      label: 'Luyện Đọc & Viết Số',
      icon: <Edit3 className="w-4 h-4" />
    },
    {
      id: 'game-arena',
      label: 'Đấu Trường Trò Chơi',
      icon: <Gamepad2 className="w-4 h-4" />
    }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-xs">
              <span className="font-mono font-black text-lg">0,1</span>
            </div>
            <div>
              <span className="font-bold text-slate-900 text-base sm:text-lg tracking-tight block leading-tight">
                Khám Phá Số Thập Phân
              </span>
              <span className="text-[11px] text-slate-500 font-medium hidden sm:block">
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
        <div className="lg:hidden flex items-center justify-between gap-1 py-2 border-t border-slate-100 overflow-x-auto no-scrollbar">
          {navTabs.map((tab) => {
            const isActive = currentMode === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  sounds.playClick();
                  onSelectMode(tab.id);
                }}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
