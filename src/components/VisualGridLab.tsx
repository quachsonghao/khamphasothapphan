import React, { useState } from 'react';
import { Volume2, Sparkles, RefreshCw, ZoomIn, ZoomOut, CheckCircle2, Award, ArrowRight, Target } from 'lucide-react';
import { readDecimalNumber, speakVietnamese } from '../utils/vietnameseNumberReader';
import { sounds } from '../utils/audio';
import { Fraction } from './Fraction';
import confetti from 'canvas-confetti';

interface VisualGridLabProps {
  onEarnStar?: () => void;
}

interface PracticeMission {
  id: number;
  title: string;
  targetWhole: number;
  targetHundredths: number;
  num: number;
  den: number;
  whole?: number;
  decimalStr: string;
  hint: string;
}

const MISSIONS: PracticeMission[] = [
  {
    id: 1,
    title: 'Biểu diễn 3 phần mười',
    targetWhole: 0,
    targetHundredths: 30,
    num: 3,
    den: 10,
    decimalStr: '0,3',
    hint: '3 phần mười tương ứng với 3 cột hoặc 30 ô vuông nhỏ trong tổng số 100 ô.'
  },
  {
    id: 2,
    title: 'Biểu diễn 45 phần trăm',
    targetWhole: 0,
    targetHundredths: 45,
    num: 45,
    den: 100,
    decimalStr: '0,45',
    hint: 'Tô đúng 45 ô vuông nhỏ (4 cột đầy đủ và thêm 5 ô của cột thứ năm).'
  },
  {
    id: 3,
    title: 'Biểu diễn 7 phần trăm',
    targetWhole: 0,
    targetHundredths: 7,
    num: 7,
    den: 100,
    decimalStr: '0,07',
    hint: 'Chỉ tô 7 ô vuông nhỏ. Chú ý: 7 phần trăm viết là 0,07 (chữ số 0 ở hàng phần mười).'
  },
  {
    id: 4,
    title: 'Biểu diễn 1 đơn vị và 5 phần mười',
    targetWhole: 1,
    targetHundredths: 50,
    num: 5,
    den: 10,
    whole: 1,
    decimalStr: '1,5',
    hint: 'Chọn số đơn vị nguyên là 1, và tô thêm 50 ô (hoặc 5 cột) ở lưới thứ hai.'
  },
  {
    id: 5,
    title: 'Biểu diễn 1 đơn vị và 75 phần trăm',
    targetWhole: 1,
    targetHundredths: 75,
    num: 75,
    den: 100,
    whole: 1,
    decimalStr: '1,75',
    hint: 'Chọn 1 đơn vị nguyên, sau đó tô 75 ô nhỏ (3 phần tư tấm lưới).'
  },
  {
    id: 6,
    title: 'Biểu diễn 80 phần trăm (8 phần mười)',
    targetWhole: 0,
    targetHundredths: 80,
    num: 80,
    den: 100,
    decimalStr: '0,8',
    hint: 'Tô 8 cột đầy đủ (80 ô). 80 phần trăm cũng chính là 8 phần mười.'
  },
  {
    id: 7,
    title: 'Biểu diễn 9 phần mười',
    targetWhole: 0,
    targetHundredths: 90,
    num: 9,
    den: 10,
    decimalStr: '0,9',
    hint: 'Tô gần kín tấm lưới (9 cột đầy đủ hay 90 ô vuông nhỏ).'
  },
  {
    id: 8,
    title: 'Biểu diễn 2 đơn vị và 25 phần trăm',
    targetWhole: 2,
    targetHundredths: 25,
    num: 25,
    den: 100,
    whole: 2,
    decimalStr: '2,25',
    hint: 'Chọn 2 đơn vị nguyên, sau đó tô 25 ô vuông nhỏ ở tấm lưới thập phân.'
  }
];

export const VisualGridLab: React.FC<VisualGridLabProps> = ({ onEarnStar }) => {
  // Value from 0 to 100 (represents 0.00 to 1.00)
  const [filledHundredths, setFilledHundredths] = useState<number>(37);
  const [wholeUnits, setWholeUnits] = useState<number>(0); // 0 or 1 or 2
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'hundredths' | 'tenths'>('hundredths');
  const [zoomLevel, setZoomLevel] = useState<'normal' | 'zoomed'>('normal');

  // Mission System State
  const [activeMissionIdx, setActiveMissionIdx] = useState<number | null>(null);
  const [missionFeedback, setMissionFeedback] = useState<{ isCorrect: boolean; msg: string } | null>(null);

  // Compute values
  const decimalVal = wholeUnits + filledHundredths / 100;
  const decStr = filledHundredths.toString().padStart(2, '0');
  const tenthsCount = Math.floor(filledHundredths / 10);
  const hundredthsCount = filledHundredths % 10;

  const readingText = readDecimalNumber(wholeUnits, decStr);

  const handleCellClick = (index: number) => {
    sounds.playClick();
    if (filledHundredths === index + 1) {
      setFilledHundredths(index);
    } else {
      setFilledHundredths(index + 1);
    }
  };

  const handleTenthColumnClick = (colIdx: number) => {
    sounds.playClick();
    const newTenths = (colIdx + 1) * 10;
    if (filledHundredths === newTenths) {
      setFilledHundredths(colIdx * 10);
    } else {
      setFilledHundredths(newTenths);
    }
  };

  const handleSpeak = () => {
    sounds.playClick();
    setIsSpeaking(true);
    speakVietnamese(readingText, () => setIsSpeaking(false));
  };

  const handlePreset = (val: number, whole: number = 0) => {
    sounds.playClick();
    setFilledHundredths(val);
    setWholeUnits(whole);
    setActiveMissionIdx(null);
    setMissionFeedback(null);
  };

  const startMission = (idx: number) => {
    sounds.playClick();
    setActiveMissionIdx(idx);
    setMissionFeedback(null);
    // Reset canvas to challenge student
    setFilledHundredths(0);
    setWholeUnits(0);
  };

  const verifyMission = () => {
    if (activeMissionIdx === null) return;
    const mission = MISSIONS[activeMissionIdx];

    const isCorrect =
      wholeUnits === mission.targetWhole && filledHundredths === mission.targetHundredths;

    if (isCorrect) {
      sounds.playSuccess();
      try {
        confetti({ particleCount: 45, spread: 65, origin: { y: 0.6 } });
      } catch {}
      setMissionFeedback({
        isCorrect: true,
        msg: `Xuất sắc! Bạn đã biểu diễn chính xác số thập phân ${mission.decimalStr}.`
      });
      if (onEarnStar) onEarnStar();
    } else {
      sounds.playError();
      setMissionFeedback({
        isCorrect: false,
        msg: `Chưa đúng rồi. Bạn đang biểu diễn ${decimalVal.toFixed(2).replace('.', ',')}. Gợi ý: ${mission.hint}`
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold tracking-wider text-indigo-600 uppercase mb-1">
              Khái Niệm Trực Quan Chuẩn Giáo Trình
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Mô Hình Tấm Lưới & Trục Số Thập Phân
            </h2>
            <div className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed flex flex-wrap items-center gap-x-1 gap-y-1">
              <span>Một hình vuông biểu thị <strong>1 đơn vị</strong>. Khi chia đều làm 10 dải bằng nhau, mỗi dải là phân số</span>
              <Fraction num={1} den={10} size="sm" className="text-indigo-700" />
              <span>(tức <strong>0,1</strong>). Khi chia tiếp thành 100 ô vuông nhỏ, mỗi ô là phân số</span>
              <Fraction num={1} den={100} size="sm" className="text-indigo-700" />
              <span>(tức <strong>0,01</strong>).</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setViewMode('hundredths');
                sounds.playClick();
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                viewMode === 'hundredths'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Lưới 100 ô (0,01)
            </button>
            <button
              onClick={() => {
                setViewMode('tenths');
                sounds.playClick();
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                viewMode === 'tenths'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              10 Cột (0,1)
            </button>
          </div>
        </div>

        {/* Quick Presets Bar */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-500">Số mẫu để thử nghiệm:</span>
          {[
            { label: '0,1', fracNum: 1, fracDen: 10, val: 10, w: 0 },
            { label: '0,5', fracNum: 5, fracDen: 10, val: 50, w: 0 },
            { label: '0,25', fracNum: 25, fracDen: 100, val: 25, w: 0 },
            { label: '0,75', fracNum: 75, fracDen: 100, val: 75, w: 0 },
            { label: '0,08', fracNum: 8, fracDen: 100, val: 8, w: 0 },
            { label: '1,45', fracNum: 45, fracDen: 100, whole: 1, val: 45, w: 1 },
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => handlePreset(item.val, item.w)}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 border border-slate-200 transition-colors inline-flex items-center gap-1.5"
            >
              <span className="font-bold font-mono">{item.label}</span>
              <span className="text-slate-400">(=</span>
              <Fraction num={item.fracNum} den={item.fracDen} whole={item.whole} size="xs" />
              <span className="text-slate-400">)</span>
            </button>
          ))}
          <button
            onClick={() => handlePreset(0, 0)}
            className="text-xs px-2 py-1 ml-auto text-slate-400 hover:text-slate-600 flex items-center gap-1"
            title="Làm mới về 0"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Xóa tô
          </button>
        </div>
      </div>

      {/* Practice Missions Carousel (Thực hành nhiệm vụ) */}
      <div className="bg-gradient-to-r from-indigo-50/60 via-purple-50/40 to-slate-50 border border-indigo-100 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
              Nhiệm Vụ Thực Hành Vẽ Hình (8 Bài Tập)
            </span>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Chọn một nhiệm vụ, tô màu trên lưới rồi bấm Kiểm Tra
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {MISSIONS.map((m, idx) => {
            const isActive = activeMissionIdx === idx;
            return (
              <button
                key={m.id}
                onClick={() => startMission(idx)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-300'
                    : 'bg-white hover:bg-indigo-50/50 text-slate-800 border-slate-200 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-indigo-200' : 'text-indigo-600'}`}>
                    Bài {m.id}
                  </span>
                  <span className={`font-mono font-bold text-xs ${isActive ? 'text-white' : 'text-slate-900'}`}>
                    {m.decimalStr}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className={`text-xs ${isActive ? 'text-indigo-100' : 'text-slate-600'}`}>Tô phân số:</span>
                  <Fraction
                    num={m.num}
                    den={m.den}
                    whole={m.whole}
                    size="xs"
                    className={isActive ? 'text-white' : 'text-indigo-700'}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {activeMissionIdx !== null && (
          <div className="mt-4 pt-3 border-t border-indigo-200/50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-indigo-900 flex items-center gap-1.5">
              <span className="font-bold">Đang làm Bài {MISSIONS[activeMissionIdx].id}:</span>
              <span>{MISSIONS[activeMissionIdx].title} — Hãy tô</span>
              <Fraction
                num={MISSIONS[activeMissionIdx].num}
                den={MISSIONS[activeMissionIdx].den}
                whole={MISSIONS[activeMissionIdx].whole}
                size="sm"
                className="text-indigo-900"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={verifyMission}
                className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-colors"
              >
                Kiểm Tra Nhiệm Vụ
              </button>
              <button
                onClick={() => {
                  setActiveMissionIdx(null);
                  setMissionFeedback(null);
                }}
                className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700"
              >
                Hủy nhiệm vụ
              </button>
            </div>
          </div>
        )}

        {missionFeedback && (
          <div
            className={`mt-3 p-3.5 rounded-xl border text-xs leading-relaxed flex items-start gap-2 ${
              missionFeedback.isCorrect
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${missionFeedback.isCorrect ? 'text-emerald-600' : 'text-rose-600'}`} />
            <div>{missionFeedback.msg}</div>
          </div>
        )}
      </div>

      {/* Main Grid & Analysis Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Visual Interactive Grid */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-4">
            <div className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <span>Bấm hoặc kéo trượt để tô màu mô hình</span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">Số đơn vị nguyên:</span>
              <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
                {[0, 1, 2].map(w => (
                  <button
                    key={w}
                    onClick={() => {
                      sounds.playClick();
                      setWholeUnits(w);
                    }}
                    className={`px-2 py-0.5 rounded text-xs font-semibold transition-colors ${
                      wholeUnits === w ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Grids Container */}
          <div className="flex flex-wrap items-center justify-center gap-6 py-2">
            {/* If wholeUnits >= 1, show complete filled whole grids */}
            {wholeUnits >= 1 && (
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-48 h-48 sm:w-56 sm:h-56 bg-emerald-500/20 border-2 border-emerald-500 rounded-xl grid grid-cols-10 grid-rows-10 p-1 gap-0.5">
                  {Array.from({ length: 100 }).map((_, i) => (
                    <div key={i} className="bg-emerald-500 rounded-xs" />
                  ))}
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  1 đơn vị nguyên (1,0)
                </span>
              </div>
            )}

            {wholeUnits === 2 && (
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-48 h-48 sm:w-56 sm:h-56 bg-emerald-500/20 border-2 border-emerald-500 rounded-xl grid grid-cols-10 grid-rows-10 p-1 gap-0.5">
                  {Array.from({ length: 100 }).map((_, i) => (
                    <div key={i} className="bg-emerald-500 rounded-xs" />
                  ))}
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Thêm 1 đơn vị nguyên
                </span>
              </div>
            )}

            {/* Partial Decimal Grid */}
            <div className="flex flex-col items-center gap-1.5">
              {viewMode === 'hundredths' ? (
                <div 
                  className="w-56 h-56 sm:w-64 sm:h-64 bg-slate-50 border-2 border-indigo-400 rounded-xl grid grid-cols-10 grid-rows-10 p-1.5 gap-0.5 select-none shadow-inner"
                  title="Bấm vào từng ô để tô màu"
                >
                  {Array.from({ length: 100 }).map((_, idx) => {
                    const isFilled = idx < filledHundredths;
                    const isTenthBoundary = (idx + 1) % 10 === 0;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleCellClick(idx)}
                        className={`rounded-xs transition-colors duration-100 flex items-center justify-center text-[8px] font-mono ${
                          isFilled
                            ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                            : 'bg-white hover:bg-indigo-100 border border-slate-200'
                        } ${isTenthBoundary ? 'border-r-slate-400' : ''}`}
                        aria-label={`Ô số ${idx + 1}`}
                      />
                    );
                  })}
                </div>
              ) : (
                /* 10 Columns View */
                <div className="w-56 h-56 sm:w-64 sm:h-64 bg-slate-50 border-2 border-indigo-400 rounded-xl grid grid-cols-10 p-1.5 gap-1 select-none shadow-inner">
                  {Array.from({ length: 10 }).map((_, colIdx) => {
                    const filledInCol = Math.max(0, Math.min(10, filledHundredths - colIdx * 10));
                    const isFullyFilled = filledInCol === 10;
                    return (
                      <button
                        key={colIdx}
                        onClick={() => handleTenthColumnClick(colIdx)}
                        className="flex flex-col-reverse h-full bg-white border border-slate-200 rounded overflow-hidden hover:ring-2 hover:ring-indigo-300 transition-all"
                        title={`Cột ${colIdx + 1}: ${filledInCol}/10 phần`}
                      >
                        <div
                          className={`w-full transition-all duration-150 ${
                            isFullyFilled ? 'bg-indigo-600' : 'bg-indigo-400'
                          }`}
                          style={{ height: `${filledInCol * 10}%` }}
                        />
                      </button>
                    );
                  })}
                </div>
              )}
              <div className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded inline-flex items-center gap-1.5">
                <span>Tô</span>
                <Fraction num={filledHundredths} den={100} size="xs" className="text-indigo-700" />
                <span>ô = {decimalVal.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>
          </div>

          {/* Interactive Range Slider */}
          <div className="w-full mt-6 px-4">
            <div className="flex justify-between items-center text-xs text-slate-500 mb-1">
              <span>0 ô (0,00)</span>
              <span className="font-semibold text-indigo-600">Thanh kéo nhanh</span>
              <span>100 ô (1,00)</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={filledHundredths}
              onChange={(e) => {
                setFilledHundredths(parseInt(e.target.value, 10));
                sounds.playClick();
              }}
              className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>
        </div>

        {/* Right Side: Math Insight & Pedagogical Synthesis */}
        <div className="lg:col-span-5 space-y-4">
          {/* Main Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Kết Quả Biểu Diễn
              </span>
              <button
                onClick={handleSpeak}
                disabled={isSpeaking}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  isSpeaking
                    ? 'bg-amber-100 text-amber-800 animate-pulse'
                    : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'
                }`}
                title="Bấm để nghe đọc bằng tiếng Việt"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{isSpeaking ? 'Đang đọc...' : 'Nghe đọc mẫu'}</span>
              </button>
            </div>

            {/* Big Decimal Display */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
              <div className="text-xs text-slate-500 mb-1">Số thập phân viết là:</div>
              <div className="text-4xl sm:text-5xl font-extrabold tracking-tight font-mono text-slate-900 flex items-center justify-center gap-1">
                <span className="text-emerald-700" title="Phần nguyên">{wholeUnits}</span>
                <span className="text-rose-600 font-bold" title="Dấu phẩy">,</span>
                <span className="text-indigo-700" title="Phần thập phân">{decStr}</span>
              </div>
              <div className="mt-2 text-base font-semibold text-slate-800">
                &ldquo;{readingText}&rdquo;
              </div>
            </div>

            {/* Fraction & Composition Breakdown with Standard Elementary Typography */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center justify-between p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl text-xs sm:text-sm">
                <span className="text-slate-600 font-medium">Phân số thập phân:</span>
                <div className="text-indigo-800 inline-flex items-center gap-2">
                  {wholeUnits > 0 ? (
                    <div className="inline-flex items-center gap-2">
                      <Fraction num={filledHundredths} den={100} whole={wholeUnits} size="md" className="text-indigo-900" />
                      <span>=</span>
                      <Fraction num={wholeUnits * 100 + filledHundredths} den={100} size="md" className="text-indigo-900" />
                    </div>
                  ) : (
                    <Fraction num={filledHundredths} den={100} size="md" className="text-indigo-900" />
                  )}
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                <div className="font-semibold text-slate-800">Phân tích cấu tạo hàng:</div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">Phần nguyên:</span>
                    <strong className="text-emerald-700 text-sm">{wholeUnits} đơn vị</strong>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">Phần thập phân:</span>
                    <strong className="text-indigo-700 text-sm">
                      {tenthsCount} phần mười, {hundredthsCount} phần trăm
                    </strong>
                  </div>
                </div>

                <div className="text-slate-600 text-[11px] pt-1 leading-relaxed">
                  💡 <strong>Ghi nhớ:</strong> 10 ô phần trăm gộp lại thành 1 que phần mười (
                  <span className="font-mono font-semibold">10 × 0,01 = 0,1</span>). 
                  10 que phần mười gộp lại thành 1 đơn vị nguyên (
                  <span className="font-mono font-semibold">10 × 0,1 = 1</span>).
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Number Line Visualizer (Trục số tương tác) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Trục Số Thập Phân Tương Tác
            </h3>
            <p className="text-xs text-slate-500">
              Quan sát vị trí của số thập phân trên tia số từ 0 đến 1 (hoặc phóng to chi tiết)
            </p>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              setZoomLevel(zoomLevel === 'normal' ? 'zoomed' : 'normal');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            {zoomLevel === 'normal' ? (
              <>
                <ZoomIn className="w-3.5 h-3.5 text-indigo-600" />
                <span>Phóng to đoạn [0,3 - 0,4]</span>
              </>
            ) : (
              <>
                <ZoomOut className="w-3.5 h-3.5 text-indigo-600" />
                <span>Thu nhỏ toàn trục [0 - 1]</span>
              </>
            )}
          </button>
        </div>

        {/* Number Line Graphic */}
        <div className="pt-8 pb-4 px-4 overflow-x-auto">
          {zoomLevel === 'normal' ? (
            <div className="relative min-w-[500px] h-20 flex items-center">
              {/* Horizontal Line */}
              <div className="absolute left-0 right-0 h-1 bg-slate-300 rounded" />
              {/* Ticks 0.0 to 1.0 */}
              {Array.from({ length: 11 }).map((_, i) => {
                const tickVal = i / 10;
                const percent = (i / 10) * 100;
                return (
                  <div
                    key={i}
                    className="absolute flex flex-col items-center -translate-x-1/2"
                    style={{ left: `${percent}%` }}
                  >
                    <div className="w-0.5 h-4 bg-slate-600" />
                    <span className="text-xs font-mono font-medium text-slate-600 mt-2">
                      {tickVal === 0 ? '0' : tickVal === 1 ? '1' : `0,${i}`}
                    </span>
                  </div>
                );
              })}

              {/* Smaller hundredths sub-ticks */}
              {Array.from({ length: 100 }).map((_, i) => {
                if (i % 10 === 0) return null;
                const percent = i;
                return (
                  <div
                    key={`sub-${i}`}
                    className="absolute w-px h-2 bg-slate-300 -translate-x-1/2"
                    style={{ left: `${percent}%` }}
                  />
                );
              })}

              {/* Active Marker */}
              {wholeUnits === 0 && (
                <div
                  className="absolute flex flex-col items-center -translate-x-1/2 transition-all duration-200 z-10"
                  style={{ left: `${filledHundredths}%`, top: '-10px' }}
                >
                  <span className="px-2 py-0.5 bg-indigo-600 text-white font-mono text-xs font-bold rounded shadow-md whitespace-nowrap">
                    {(filledHundredths / 100).toFixed(2).replace('.', ',')}
                  </span>
                  <div className="w-0 h-0 border-x-4 border-x-transparent border-t-6 border-t-indigo-600" />
                </div>
              )}
            </div>
          ) : (
            /* Zoomed View between 0.30 and 0.40 */
            <div className="relative min-w-[500px] h-20 flex items-center">
              <div className="absolute left-0 right-0 h-1 bg-indigo-300 rounded" />
              {Array.from({ length: 11 }).map((_, i) => {
                const val = 30 + i;
                const percent = i * 10;
                return (
                  <div
                    key={i}
                    className="absolute flex flex-col items-center -translate-x-1/2"
                    style={{ left: `${percent}%` }}
                  >
                    <div className="w-0.5 h-5 bg-indigo-700" />
                    <span className="text-xs font-mono font-bold text-indigo-900 mt-2">
                      0,{val}
                    </span>
                  </div>
                );
              })}
              <div className="absolute -top-4 left-2 text-[11px] font-semibold text-indigo-600">
                Kính lúp: 1 khoảng phần mười (0,1) được phóng đại thành 10 khoảng phần trăm (0,01)
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
