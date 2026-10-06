/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { MathMode } from './types/math';
import { Navbar } from './components/Navbar';
import { PlaceValueTable } from './components/PlaceValueTable';
import { ReadingWritingStudio } from './components/ReadingWritingStudio';
import { GameArena } from './components/GameArena';
import { PlaceValueMatchGame } from './components/PlaceValueMatchGame';
import { ReferenceModal } from './components/ReferenceModal';
import { sounds } from './utils/audio';
import { Layers, Edit3, Gamepad2, Sparkles, CheckCircle2, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  const [currentMode, setCurrentMode] = useState<MathMode>('place-value');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isReferenceOpen, setIsReferenceOpen] = useState<boolean>(false);
  const [totalStars, setTotalStars] = useState<number>(0);

  // Sync sound controller
  useEffect(() => {
    sounds.enabled = soundEnabled;
  }, [soundEnabled]);

  const handleEarnStar = (count: number = 1) => {
    sounds.playStar();
    setTotalStars(prev => prev + count);
  };

  const handleToggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    sounds.enabled = nextState;
    if (nextState) {
      sounds.playClick();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased">
      {/* Top Navigation */}
      <Navbar
        currentMode={currentMode}
        onSelectMode={(mode) => setCurrentMode(mode)}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onOpenReference={() => setIsReferenceOpen(true)}
        totalStars={totalStars}
      />

      {/* Main Educational Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-6">
        {/* Active Module Viewport */}
        {currentMode === 'place-value' && (
          <PlaceValueTable onEarnStar={() => handleEarnStar(1)} />
        )}

        {currentMode === 'place-match-game' && (
          <PlaceValueMatchGame
            onEarnStar={(cnt = 1) => handleEarnStar(cnt)}
            totalStars={totalStars}
          />
        )}

        {currentMode === 'read-write' && (
          <ReadingWritingStudio onEarnStar={() => handleEarnStar(1)} />
        )}

        {currentMode === 'game-arena' && (
          <GameArena
            onEarnStar={(cnt = 1) => handleEarnStar(cnt)}
            totalStars={totalStars}
            onNavigateToPlaceMatch={() => setCurrentMode('place-match-game')}
          />
        )}
      </main>

      {/* Sổ Tay Reference Modal */}
      <ReferenceModal
        isOpen={isReferenceOpen}
        onClose={() => setIsReferenceOpen(false)}
      />

      {/* Clean Domain Educational Footer */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">Toán 5 · Khám Phá Số Thập Phân</span>
            <span aria-hidden="true">·</span>
            <span>Chương trình Giáo Dục Phổ Thông Mới</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                sounds.playClick();
                setIsReferenceOpen(true);
              }}
              className="hover:text-indigo-600 transition-colors"
            >
              Xem sổ tay quy tắc
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => {
                sounds.playClick();
                setCurrentMode('game-arena');
              }}
              className="hover:text-amber-600 transition-colors font-medium"
            >
              Chơi thử thách game
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
