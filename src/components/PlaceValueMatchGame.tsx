import React, { useState, useEffect } from 'react';
import { Volume2, Trophy, Star, Sparkles, CheckCircle2, XCircle, RotateCcw, ArrowRight, Lightbulb, HelpCircle, Layers, Link2, Shuffle, GraduationCap, PlusCircle, Check } from 'lucide-react';
import { sounds } from '../utils/audio';
import { speakVietnamese, readDecimalNumber } from '../utils/vietnameseNumberReader';
import { Fraction } from './Fraction';
import { PlaceKey, PLACE_CONFIG } from '../types/math';
import confetti from 'canvas-confetti';

interface PlaceValueMatchGameProps {
  onEarnStar?: (count?: number) => void;
  totalStars?: number;
}

interface MatchChallenge {
  id: string | number;
  whole: number;
  decStr: string;
  displayNumber: string; // e.g. "375,482"
  title: string;
  isCustom?: boolean;
  hundreds: number;
  tens: number;
  ones: number;
  tenths: number;
  hundredths: number;
  thousandths: number;
}

const PRESET_CHALLENGES: MatchChallenge[] = [
  {
    id: 1,
    whole: 375,
    decStr: '482',
    displayNumber: '375,482',
    title: 'Số 375,482 (3 chữ số phần nguyên, 3 chữ số phần thập phân)',
    hundreds: 3,
    tens: 7,
    ones: 5,
    tenths: 4,
    hundredths: 8,
    thousandths: 2,
  },
  {
    id: 2,
    whole: 68,
    decStr: '054',
    displayNumber: '68,054',
    title: 'Số 68,054 (chú ý số 0 ở hàng phần mười)',
    hundreds: 0,
    tens: 6,
    ones: 8,
    tenths: 0,
    hundredths: 5,
    thousandths: 4,
  },
  {
    id: 3,
    whole: 9,
    decStr: '403',
    displayNumber: '9,403',
    title: 'Số 9,403 (chú ý số 0 ở hàng phần trăm)',
    hundreds: 0,
    tens: 0,
    ones: 9,
    tenths: 4,
    hundredths: 0,
    thousandths: 3,
  },
  {
    id: 4,
    whole: 142,
    decStr: '75',
    displayNumber: '142,75',
    title: 'Số 142,75 (hàng phần nghìn bằng 0)',
    hundreds: 1,
    tens: 4,
    ones: 2,
    tenths: 7,
    hundredths: 5,
    thousandths: 0,
  },
  {
    id: 5,
    whole: 0,
    decStr: '865',
    displayNumber: '0,865',
    title: 'Số 0,865 (phần nguyên bằng 0)',
    hundreds: 0,
    tens: 0,
    ones: 0,
    tenths: 8,
    hundredths: 6,
    thousandths: 5,
  },
  {
    id: 6,
    whole: 504,
    decStr: '007',
    displayNumber: '504,007',
    title: 'Số 504,007 (chữ số 7 ở hàng phần nghìn)',
    hundreds: 5,
    tens: 0,
    ones: 4,
    tenths: 0,
    hundredths: 0,
    thousandths: 7,
  },
  {
    id: 7,
    whole: 82,
    decStr: '39',
    displayNumber: '82,39',
    title: 'Số 82,39 (8 chục, 2 đơn vị, 3 phần mười, 9 phần trăm)',
    hundreds: 0,
    tens: 8,
    ones: 2,
    tenths: 3,
    hundredths: 9,
    thousandths: 0,
  },
  {
    id: 8,
    whole: 120,
    decStr: '04',
    displayNumber: '120,04',
    title: 'Số 120,04 (1 trăm, 2 chục, 4 phần trăm)',
    hundreds: 1,
    tens: 2,
    ones: 0,
    tenths: 0,
    hundredths: 4,
    thousandths: 0,
  },
  {
    id: 9,
    whole: 7,
    decStr: '915',
    displayNumber: '7,915',
    title: 'Số 7,915 (7 đơn vị, 9 phần mười, 1 phần trăm, 5 phần nghìn)',
    hundreds: 0,
    tens: 0,
    ones: 7,
    tenths: 9,
    hundredths: 1,
    thousandths: 5,
  },
  {
    id: 10,
    whole: 250,
    decStr: '8',
    displayNumber: '250,8',
    title: 'Số 250,8 (2 trăm, 5 chục, 8 phần mười)',
    hundreds: 2,
    tens: 5,
    ones: 0,
    tenths: 8,
    hundredths: 0,
    thousandths: 0,
  },
  {
    id: 11,
    whole: 0,
    decStr: '028',
    displayNumber: '0,028',
    title: 'Số 0,028 (2 phần trăm, 8 phần nghìn)',
    hundreds: 0,
    tens: 0,
    ones: 0,
    tenths: 0,
    hundredths: 2,
    thousandths: 8,
  },
  {
    id: 12,
    whole: 409,
    decStr: '6',
    displayNumber: '409,6',
    title: 'Số 409,6 (4 trăm, 9 đơn vị, 6 phần mười)',
    hundreds: 4,
    tens: 0,
    ones: 9,
    tenths: 6,
    hundredths: 0,
    thousandths: 0,
  }
];

export interface ValueCardOption {
  id: string;
  correctPlaceKey: PlaceKey;
  digit: number;
  valLabel: string;
  isFraction: boolean;
  num?: number;
  den?: number;
  multiplier: number;
}

export const PlaceValueMatchGame: React.FC<PlaceValueMatchGameProps> = ({ onEarnStar, totalStars = 0 }) => {
  const [gameSubMode, setGameSubMode] = useState<'slotting' | 'trio-connect'>('slotting');
  const [challenges, setChallenges] = useState<MatchChallenge[]>(PRESET_CHALLENGES);
  const [challengeIdx, setChallengeIdx] = useState<number>(0);

  // Teacher custom input states
  const [teacherInput, setTeacherInput] = useState<string>('');
  const [teacherInputError, setTeacherInputError] = useState<string | null>(null);
  const [teacherSuccessMsg, setTeacherSuccessMsg] = useState<string | null>(null);

  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const currentChallenge = challenges[challengeIdx % challenges.length] || PRESET_CHALLENGES[0];

  // =================== SUB-MODE 1: SLOTTING GAME STATE ===================
  // Slots for digits: key -> digit (or null)
  const [slottedDigits, setSlottedDigits] = useState<Record<PlaceKey, number | null>>({
    hundreds: null,
    tens: null,
    ones: null,
    tenths: null,
    hundredths: null,
    thousandths: null,
  });

  // Slots for value cards: key -> ValueCardOption (or null)
  const [slottedValues, setSlottedValues] = useState<Record<PlaceKey, ValueCardOption | null>>({
    hundreds: null,
    tens: null,
    ones: null,
    tenths: null,
    hundredths: null,
    thousandths: null,
  });

  // Selected items from banks waiting to be placed
  const [selectedDigitFromBank, setSelectedDigitFromBank] = useState<{ id: string; digit: number } | null>(null);
  const [selectedValueFromBank, setSelectedValueFromBank] = useState<ValueCardOption | null>(null);

  // Available pools
  const [availableDigitPool, setAvailableDigitPool] = useState<{ id: string; digit: number }[]>([]);
  const [availableValuePool, setAvailableValuePool] = useState<ValueCardOption[]>([]);

  // Submission feedback
  const [slottingSubmitted, setSlottingSubmitted] = useState<boolean>(false);
  const [slottingFeedback, setSlottingFeedback] = useState<{ isCorrect: boolean; msg: string } | null>(null);

  // =================== SUB-MODE 2: TRIO CONNECT GAME STATE ===================
  interface TrioItem {
    id: string;
    placeKey: PlaceKey;
    placeName: string;
    digit: number;
    partName: string;
    valNum?: number;
    valDen?: number;
    wholeVal?: number;
    valDecText: string;
  }

  const [trioItems, setTrioItems] = useState<TrioItem[]>([]);
  const [selectedTrioDigit, setSelectedTrioDigit] = useState<string | null>(null);
  const [selectedTrioPlace, setSelectedTrioPlace] = useState<string | null>(null);
  const [selectedTrioValue, setSelectedTrioValue] = useState<string | null>(null);
  const [matchedTrioKeys, setMatchedTrioKeys] = useState<PlaceKey[]>([]);

  // Setup challenge pools
  const initChallenge = (c: MatchChallenge) => {
    // Digits pool (Scrambled)
    const dPool = [
      { id: 'd-h', digit: c.hundreds },
      { id: 'd-t', digit: c.tens },
      { id: 'd-o', digit: c.ones },
      { id: 'd-te', digit: c.tenths },
      { id: 'd-hu', digit: c.hundredths },
      { id: 'd-th', digit: c.thousandths },
    ].sort(() => Math.random() - 0.5);

    setAvailableDigitPool(dPool);
    setSlottedDigits({
      hundreds: null,
      tens: null,
      ones: null,
      tenths: null,
      hundredths: null,
      thousandths: null,
    });

    // Values pool (Scrambled - NO ANSWER LABELS GIVEN AWAY)
    const vPool: ValueCardOption[] = [
      {
        id: 'v-h',
        correctPlaceKey: 'hundreds' as PlaceKey,
        digit: c.hundreds,
        valLabel: `${c.hundreds * 100}`,
        isFraction: false,
        multiplier: 100,
      },
      {
        id: 'v-t',
        correctPlaceKey: 'tens' as PlaceKey,
        digit: c.tens,
        valLabel: `${c.tens * 10}`,
        isFraction: false,
        multiplier: 10,
      },
      {
        id: 'v-o',
        correctPlaceKey: 'ones' as PlaceKey,
        digit: c.ones,
        valLabel: `${c.ones}`,
        isFraction: false,
        multiplier: 1,
      },
      {
        id: 'v-te',
        correctPlaceKey: 'tenths' as PlaceKey,
        digit: c.tenths,
        valLabel: `${(c.tenths * 0.1).toFixed(1).replace('.', ',')}`,
        isFraction: true,
        num: c.tenths,
        den: 10,
        multiplier: 0.1,
      },
      {
        id: 'v-hu',
        correctPlaceKey: 'hundredths' as PlaceKey,
        digit: c.hundredths,
        valLabel: `${(c.hundredths * 0.01).toFixed(2).replace('.', ',')}`,
        isFraction: true,
        num: c.hundredths,
        den: 100,
        multiplier: 0.01,
      },
      {
        id: 'v-th',
        correctPlaceKey: 'thousandths' as PlaceKey,
        digit: c.thousandths,
        valLabel: `${(c.thousandths * 0.001).toFixed(3).replace('.', ',')}`,
        isFraction: true,
        num: c.thousandths,
        den: 1000,
        multiplier: 0.001,
      }
    ].sort(() => Math.random() - 0.5);

    setAvailableValuePool(vPool);
    setSlottedValues({
      hundreds: null,
      tens: null,
      ones: null,
      tenths: null,
      hundredths: null,
      thousandths: null,
    });

    setSelectedDigitFromBank(null);
    setSelectedValueFromBank(null);
    setSlottingSubmitted(false);
    setSlottingFeedback(null);

    // Setup Trio Items
    const activeKeys: PlaceKey[] = [];
    if (c.hundreds > 0) activeKeys.push('hundreds');
    if (c.tens > 0 || c.hundreds > 0) activeKeys.push('tens');
    activeKeys.push('ones');
    activeKeys.push('tenths');
    if (c.hundredths > 0 || c.thousandths > 0) activeKeys.push('hundredths');
    if (c.thousandths > 0) activeKeys.push('thousandths');

    const tList: TrioItem[] = activeKeys.map((k) => {
      const cfg = PLACE_CONFIG[k];
      const digit = c[k];
      return {
        id: `trio-${k}`,
        placeKey: k,
        placeName: cfg.name,
        digit,
        partName: cfg.partName,
        valNum: cfg.part === 'decimal' ? digit : undefined,
        valDen: cfg.part === 'decimal' ? cfg.fractionDenominator : undefined,
        wholeVal: cfg.part === 'whole' ? digit * cfg.multiplier : undefined,
        valDecText:
          cfg.part === 'whole'
            ? `${digit * cfg.multiplier}`
            : (digit * cfg.multiplier).toFixed(k === 'tenths' ? 1 : k === 'hundredths' ? 2 : 3).replace('.', ','),
      };
    });

    setTrioItems(tList);
    setMatchedTrioKeys([]);
    setSelectedTrioDigit(null);
    setSelectedTrioPlace(null);
    setSelectedTrioValue(null);
  };

  useEffect(() => {
    initChallenge(currentChallenge);
  }, [challengeIdx, gameSubMode]);

  // Handle Teacher Custom Number submission
  const handleTeacherSubmitNumber = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playClick();
    setTeacherInputError(null);
    setTeacherSuccessMsg(null);

    const raw = teacherInput.trim().replace('.', ',');
    if (!raw) {
      setTeacherInputError('Vui lòng nhập một số thập phân (Ví dụ: 45,67 hoặc 128,305 hoặc 0,85).');
      return;
    }

    // Validate format: [0-9]{1,3}(,[0-9]{1,3})?
    const parts = raw.split(',');
    if (parts.length > 2) {
      setTeacherInputError('Số thập phân chỉ chứa tối đa 1 dấu phẩy phân cách.');
      return;
    }

    const wholeStr = parts[0] || '0';
    const decPartStr = parts[1] || '0';

    if (!/^\d+$/.test(wholeStr) || !/^\d+$/.test(decPartStr)) {
      setTeacherInputError('Số chỉ được bao gồm các chữ số và dấu phẩy.');
      return;
    }

    const wholeNum = parseInt(wholeStr, 10);
    if (wholeNum > 999) {
      setTeacherInputError('Phần nguyên tối đa 3 chữ số (từ 0 đến 999) để vừa với bảng các hàng tiểu học.');
      return;
    }

    const cleanDecStr = decPartStr.slice(0, 3); // Max 3 decimal digits
    const paddedDec = cleanDecStr.padEnd(3, '0');

    const h = Math.floor((wholeNum % 1000) / 100);
    const t = Math.floor((wholeNum % 100) / 10);
    const o = wholeNum % 10;

    const te = parseInt(paddedDec[0] || '0', 10);
    const hu = parseInt(paddedDec[1] || '0', 10);
    const th = parseInt(paddedDec[2] || '0', 10);

    const fullFormatted = `${wholeNum},${cleanDecStr}`;

    const newCustomChallenge: MatchChallenge = {
      id: `custom-${Date.now()}`,
      whole: wholeNum,
      decStr: cleanDecStr,
      displayNumber: fullFormatted,
      title: `Đề bài của giáo viên: ${fullFormatted}`,
      isCustom: true,
      hundreds: h,
      tens: t,
      ones: o,
      tenths: te,
      hundredths: hu,
      thousandths: th,
    };

    setChallenges(prev => [newCustomChallenge, ...prev]);
    setChallengeIdx(0);
    initChallenge(newCustomChallenge);
    setTeacherSuccessMsg(`Đã tạo đề bài thành công số ${fullFormatted}! Học sinh có thể bắt đầu làm bài ngay.`);
    setTeacherInput('');
  };

  // Slotting Digit
  const handleSlotDigit = (placeKey: PlaceKey) => {
    sounds.playClick();
    if (slottingSubmitted) return;

    if (selectedDigitFromBank) {
      const prevInSlot = slottedDigits[placeKey];
      setSlottedDigits(prev => ({ ...prev, [placeKey]: selectedDigitFromBank.digit }));

      setAvailableDigitPool(prev => {
        const next = prev.filter(item => item.id !== selectedDigitFromBank.id);
        if (prevInSlot !== null) {
          next.push({ id: `d-ret-${Date.now()}`, digit: prevInSlot });
        }
        return next;
      });
      setSelectedDigitFromBank(null);
    } else if (slottedDigits[placeKey] !== null) {
      // Remove from slot back to pool
      const val = slottedDigits[placeKey]!;
      setSlottedDigits(prev => ({ ...prev, [placeKey]: null }));
      setAvailableDigitPool(prev => [...prev, { id: `d-ret-${Date.now()}`, digit: val }]);
    }
  };

  // Slotting Value Card
  const handleSlotValue = (placeKey: PlaceKey) => {
    sounds.playClick();
    if (slottingSubmitted) return;

    if (selectedValueFromBank) {
      const prevCard = slottedValues[placeKey];
      setSlottedValues(prev => ({ ...prev, [placeKey]: selectedValueFromBank }));

      setAvailableValuePool(prev => {
        const next = prev.filter(item => item.id !== selectedValueFromBank.id);
        if (prevCard !== null) {
          next.push(prevCard);
        }
        return next;
      });
      setSelectedValueFromBank(null);
    } else if (slottedValues[placeKey] !== null) {
      // Unslot value card back to pool
      const card = slottedValues[placeKey]!;
      setSlottedValues(prev => ({ ...prev, [placeKey]: null }));
      setAvailableValuePool(prev => [...prev, card]);
    }
  };

  // Check Slotting Solution
  const handleVerifySlotting = () => {
    sounds.playClick();
    setSlottingSubmitted(true);

    const c = currentChallenge;

    // Check digits
    const isDigitsCorrect =
      slottedDigits.hundreds === c.hundreds &&
      slottedDigits.tens === c.tens &&
      slottedDigits.ones === c.ones &&
      slottedDigits.tenths === c.tenths &&
      slottedDigits.hundredths === c.hundredths &&
      slottedDigits.thousandths === c.thousandths;

    // Check values
    const isValuesCorrect =
      slottedValues.hundreds?.correctPlaceKey === 'hundreds' &&
      slottedValues.tens?.correctPlaceKey === 'tens' &&
      slottedValues.ones?.correctPlaceKey === 'ones' &&
      slottedValues.tenths?.correctPlaceKey === 'tenths' &&
      slottedValues.hundredths?.correctPlaceKey === 'hundredths' &&
      slottedValues.thousandths?.correctPlaceKey === 'thousandths';

    if (isDigitsCorrect && isValuesCorrect) {
      sounds.playSuccess();
      try {
        confetti({ particleCount: 55, spread: 75, origin: { y: 0.6 } });
      } catch {}
      setScore(prev => prev + 200);
      setStreak(prev => prev + 1);
      if (onEarnStar) onEarnStar(1);

      setSlottingFeedback({
        isCorrect: true,
        msg: `Tuyệt vời! Bạn đã xếp đúng vị trí các chữ số và gán chuẩn xác giá trị toán học của từng hàng trong số ${c.displayNumber}!`
      });
    } else {
      sounds.playError();
      setStreak(0);
      let errorTip = '';
      if (!isDigitsCorrect && !isValuesCorrect) {
        errorTip = 'Chưa đúng cả vị trí chữ số lẫn giá trị tương ứng. Hãy kiểm tra lại hàng phần nguyên (bên trái) và hàng phần thập phân (bên phải).';
      } else if (!isDigitsCorrect) {
        errorTip = 'Bạn xếp chữ số vào các hàng chưa hoàn toàn chính xác.';
      } else {
        errorTip = 'Bạn đã xếp đúng chữ số, nhưng thẻ giá trị ở một số hàng chưa chính xác.';
      }
      setSlottingFeedback({
        isCorrect: false,
        msg: errorTip
      });
    }
  };

  // Trio Connect Handlers
  const handleTrioDigitClick = (id: string) => {
    sounds.playClick();
    setSelectedTrioDigit(selectedTrioDigit === id ? null : id);
  };

  const handleTrioPlaceClick = (id: string) => {
    sounds.playClick();
    setSelectedTrioPlace(selectedTrioPlace === id ? null : id);
  };

  const handleTrioValueClick = (id: string) => {
    sounds.playClick();
    setSelectedTrioValue(selectedTrioValue === id ? null : id);
  };

  // Verify trio selection
  useEffect(() => {
    if (selectedTrioDigit && selectedTrioPlace && selectedTrioValue) {
      const dKey = selectedTrioDigit.replace('trio-', '') as PlaceKey;
      const pKey = selectedTrioPlace.replace('trio-', '') as PlaceKey;
      const vKey = selectedTrioValue.replace('trio-', '') as PlaceKey;

      if (dKey === pKey && pKey === vKey) {
        sounds.playSuccess();
        const nextMatched = [...matchedTrioKeys, dKey];
        setMatchedTrioKeys(nextMatched);
        setScore(prev => prev + 100);
        setStreak(prev => prev + 1);

        if (nextMatched.length === trioItems.length) {
          sounds.playFanfare();
          try {
            confetti({ particleCount: 60, spread: 80 });
          } catch {}
          if (onEarnStar) onEarnStar(1);
        }

        setSelectedTrioDigit(null);
        setSelectedTrioPlace(null);
        setSelectedTrioValue(null);
      } else {
        sounds.playError();
        setTimeout(() => {
          setSelectedTrioDigit(null);
          setSelectedTrioPlace(null);
          setSelectedTrioValue(null);
        }, 500);
      }
    }
  }, [selectedTrioDigit, selectedTrioPlace, selectedTrioValue]);

  const handlePlayTTS = () => {
    sounds.playClick();
    setIsSpeaking(true);
    speakVietnamese(readDecimalNumber(currentChallenge.whole, currentChallenge.decStr), () => setIsSpeaking(false));
  };

  const nextChallenge = () => {
    sounds.playClick();
    setChallengeIdx(prev => (prev + 1) % challenges.length);
  };

  const resetCurrentChallenge = () => {
    sounds.playClick();
    initChallenge(currentChallenge);
  };

  const wholeKeys: PlaceKey[] = ['hundreds', 'tens', 'ones'];
  const decimalKeys: PlaceKey[] = ['tenths', 'hundredths', 'thousandths'];

  return (
    <div className="space-y-6">
      {/* Teacher Number Input Section */}
      <div className="bg-gradient-to-r from-rose-50 via-white to-amber-50 rounded-2xl p-5 border border-rose-200/90 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center shadow-xs">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Góc Giáo Viên & Phụ Huynh: Đặt Đề Bài Tùy Ý
              </h3>
              <p className="text-[11px] text-slate-500">
                Nhập bất kỳ số thập phân nào để tạo bài tập thực hành ngay cho học sinh
              </p>
            </div>
          </div>

          <span className="text-[11px] font-semibold text-rose-700 bg-rose-100/70 px-2.5 py-1 rounded-md self-start sm:self-auto">
            Không hiện gợi ý đáp án trước khi làm
          </span>
        </div>

        <form onSubmit={handleTeacherSubmitNumber} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <input
            type="text"
            placeholder="Ví dụ: 84,295 hoặc 305,08 hoặc 0,74"
            value={teacherInput}
            onChange={(e) => {
              setTeacherInput(e.target.value);
              setTeacherInputError(null);
            }}
            className="flex-1 px-3.5 py-2 text-xs font-mono font-bold bg-white border border-rose-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
          />
          <button
            type="submit"
            className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Giao Đề Bài Này</span>
          </button>
        </form>

        {teacherInputError && (
          <div className="text-xs text-rose-600 font-medium flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{teacherInputError}</span>
          </div>
        )}

        {teacherSuccessMsg && (
          <div className="text-xs text-emerald-700 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>{teacherSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* Main Game Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
        {/* Header & Modes */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="text-xs font-semibold tracking-wider text-rose-600 uppercase mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Đấu Trường Ghép Hàng & Giá Trị</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Xác Định Đúng Vị Trí Hàng & Giá Trị Của Số
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Học sinh tự tư duy để ghép chữ số và giá trị tương ứng vào đúng các hàng của phần nguyên và phần thập phân.
            </p>
          </div>

          {/* Sub-mode switchers */}
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200">
              <button
                onClick={() => {
                  sounds.playClick();
                  setGameSubMode('slotting');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  gameSubMode === 'slotting' ? 'bg-white text-rose-600 shadow-xs' : 'text-slate-600'
                }`}
              >
                1. Xếp Chữ Số & Giá Trị Vào Bảng
              </button>
              <button
                onClick={() => {
                  sounds.playClick();
                  setGameSubMode('trio-connect');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  gameSubMode === 'trio-connect' ? 'bg-white text-rose-600 shadow-xs' : 'text-slate-600'
                }`}
              >
                2. Nối 3 Cột Nhanh
              </button>
            </div>
          </div>
        </div>

        {/* Challenge selection pills */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full py-1">
            <span className="text-xs text-slate-400 font-medium mr-1">Đề có sẵn:</span>
            {challenges.slice(0, 10).map((c, i) => (
              <button
                key={c.id}
                onClick={() => {
                  sounds.playClick();
                  setChallengeIdx(i);
                }}
                className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg transition-all ${
                  challengeIdx === i
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-rose-50 text-slate-700'
                }`}
              >
                {c.displayNumber}
                {c.isCustom && <span className="ml-1 text-[9px] text-amber-300">★</span>}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={resetCurrentChallenge}
              className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Xóa làm lại từ đầu"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Làm lại</span>
            </button>
            <button
              onClick={nextChallenge}
              className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-colors"
            >
              <span>Đề tiếp theo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Current Target Number Box */}
        <div className="bg-gradient-to-r from-rose-50 via-amber-50 to-indigo-50 border border-rose-200 rounded-2xl p-4 text-center shadow-xs space-y-1">
          <span className="text-xs font-bold text-rose-700 uppercase tracking-wider block">
            Đề bài số thập phân:
          </span>
          <div className="flex items-center justify-center gap-3">
            <div className="text-4xl sm:text-5xl font-black font-mono text-slate-900 tracking-wider">
              {currentChallenge.displayNumber}
            </div>
            <button
              onClick={handlePlayTTS}
              disabled={isSpeaking}
              className="p-2.5 rounded-xl bg-white text-rose-600 hover:bg-rose-100 border border-rose-200 shadow-xs transition-colors"
              title="Nghe phát âm chuẩn"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-slate-600 font-medium">
            {currentChallenge.title}
          </p>
        </div>

        {/* ======================= SUB-MODE 1: SLOTTING ======================= */}
        {gameSubMode === 'slotting' ? (
          <div className="space-y-5">
            {/* Place Slots Table (NO SPOILERS AT THE BOTTOM) */}
            <div className="overflow-x-auto">
              <div className="min-w-[680px]">
                {/* Headers */}
                <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold">
                  <div className="col-span-3 bg-emerald-50 text-emerald-800 border border-emerald-200 p-2 rounded-xl">
                    PHẦN NGUYÊN (Bên trái dấu phẩy)
                  </div>
                  <div className="col-span-1 bg-rose-50 text-rose-600 border border-rose-200 p-2 rounded-xl">
                    DẤU PHẨY
                  </div>
                  <div className="col-span-3 bg-indigo-50 text-indigo-800 border border-indigo-200 p-2 rounded-xl">
                    PHẦN THẬP PHÂN (Bên phải dấu phẩy)
                  </div>
                </div>

                {/* Column Place Names */}
                <div className="grid grid-cols-7 gap-2 mb-2 text-center">
                  {wholeKeys.map(k => (
                    <div key={k} className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700">
                      {PLACE_CONFIG[k].name}
                    </div>
                  ))}
                  <div className="flex items-center justify-center text-2xl font-black text-rose-600">
                    ,
                  </div>
                  {decimalKeys.map(k => (
                    <div key={k} className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700">
                      {PLACE_CONFIG[k].name}
                    </div>
                  ))}
                </div>

                {/* ROW 1: Droppable Digit Slots */}
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  1. Chữ số ở từng hàng:
                </div>
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {wholeKeys.map(k => {
                    const val = slottedDigits[k];
                    const isCorrect = slottingSubmitted && val === currentChallenge[k];
                    const isWrong = slottingSubmitted && val !== currentChallenge[k];

                    return (
                      <button
                        key={k}
                        onClick={() => handleSlotDigit(k)}
                        className={`h-18 rounded-2xl border-2 flex flex-col items-center justify-center transition-all ${
                          isCorrect
                            ? 'bg-emerald-500 text-white border-emerald-500 shadow-md scale-102'
                            : isWrong
                            ? 'bg-rose-50 border-rose-400 text-rose-700'
                            : val !== null
                            ? 'bg-emerald-50 border-emerald-400 text-emerald-900 shadow-xs'
                            : selectedDigitFromBank
                            ? 'bg-amber-50/70 border-dashed border-amber-400 hover:bg-amber-100/80 animate-pulse'
                            : 'bg-slate-50 border-dashed border-slate-300 hover:border-slate-400 text-slate-400'
                        }`}
                      >
                        {val !== null ? (
                          <span className="text-3xl font-mono font-extrabold">{val}</span>
                        ) : (
                          <span className="text-[10px] font-sans">Đặt chữ số</span>
                        )}
                        {isCorrect && <CheckCircle2 className="w-3.5 h-3.5 text-white mt-0.5" />}
                        {isWrong && <XCircle className="w-3.5 h-3.5 text-rose-600 mt-0.5" />}
                      </button>
                    );
                  })}

                  <div className="flex items-center justify-center">
                    <span className="text-4xl font-black text-rose-600 font-mono select-none">,</span>
                  </div>

                  {decimalKeys.map(k => {
                    const val = slottedDigits[k];
                    const isCorrect = slottingSubmitted && val === currentChallenge[k];
                    const isWrong = slottingSubmitted && val !== currentChallenge[k];

                    return (
                      <button
                        key={k}
                        onClick={() => handleSlotDigit(k)}
                        className={`h-18 rounded-2xl border-2 flex flex-col items-center justify-center transition-all ${
                          isCorrect
                            ? 'bg-emerald-500 text-white border-emerald-500 shadow-md scale-102'
                            : isWrong
                            ? 'bg-rose-50 border-rose-400 text-rose-700'
                            : val !== null
                            ? 'bg-indigo-50 border-indigo-400 text-indigo-900 shadow-xs'
                            : selectedDigitFromBank
                            ? 'bg-amber-50/70 border-dashed border-amber-400 hover:bg-amber-100/80 animate-pulse'
                            : 'bg-slate-50 border-dashed border-slate-300 hover:border-slate-400 text-slate-400'
                        }`}
                      >
                        {val !== null ? (
                          <span className="text-3xl font-mono font-extrabold">{val}</span>
                        ) : (
                          <span className="text-[10px] font-sans">Đặt chữ số</span>
                        )}
                        {isCorrect && <CheckCircle2 className="w-3.5 h-3.5 text-white mt-0.5" />}
                        {isWrong && <XCircle className="w-3.5 h-3.5 text-rose-600 mt-0.5" />}
                      </button>
                    );
                  })}
                </div>

                {/* ROW 2: Droppable Mathematical Value Card Slots (NO SPOILERS - Student must place cards!) */}
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  2. Thẻ giá trị toán học của từng hàng (Học sinh tự gắp thẻ từ kho bên dưới):
                </div>
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {wholeKeys.map(k => {
                    const card = slottedValues[k];
                    const isCorrect = slottingSubmitted && card?.correctPlaceKey === k;
                    const isWrong = slottingSubmitted && card !== null && card.correctPlaceKey !== k;

                    return (
                      <button
                        key={k}
                        onClick={() => handleSlotValue(k)}
                        className={`h-16 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${
                          isCorrect
                            ? 'bg-emerald-500 text-white border-emerald-500 shadow-xs'
                            : isWrong
                            ? 'bg-rose-50 border-rose-400 text-rose-700'
                            : card !== null
                            ? 'bg-emerald-50 border-emerald-400 text-emerald-900 shadow-xs'
                            : selectedValueFromBank
                            ? 'bg-amber-50/70 border-dashed border-amber-400 hover:bg-amber-100/80 animate-pulse'
                            : 'bg-slate-50 border-dashed border-slate-300 hover:border-slate-400 text-slate-400'
                        }`}
                      >
                        {card !== null ? (
                          <span className="text-sm font-mono font-bold">{card.valLabel}</span>
                        ) : (
                          <span className="text-[10px] font-sans">Đặt thẻ giá trị</span>
                        )}
                        {isCorrect && <CheckCircle2 className="w-3 h-3 text-white mt-0.5" />}
                        {isWrong && <XCircle className="w-3 h-3 text-rose-600 mt-0.5" />}
                      </button>
                    );
                  })}

                  <div className="flex items-center justify-center text-xs text-slate-400 font-medium">
                    ---
                  </div>

                  {decimalKeys.map(k => {
                    const card = slottedValues[k];
                    const isCorrect = slottingSubmitted && card?.correctPlaceKey === k;
                    const isWrong = slottingSubmitted && card !== null && card.correctPlaceKey !== k;

                    return (
                      <button
                        key={k}
                        onClick={() => handleSlotValue(k)}
                        className={`h-16 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${
                          isCorrect
                            ? 'bg-emerald-500 text-white border-emerald-500 shadow-xs'
                            : isWrong
                            ? 'bg-rose-50 border-rose-400 text-rose-700'
                            : card !== null
                            ? 'bg-indigo-50 border-indigo-400 text-indigo-900 shadow-xs'
                            : selectedValueFromBank
                            ? 'bg-amber-50/70 border-dashed border-amber-400 hover:bg-amber-100/80 animate-pulse'
                            : 'bg-slate-50 border-dashed border-slate-300 hover:border-slate-400 text-slate-400'
                        }`}
                      >
                        {card !== null ? (
                          card.isFraction && card.num !== undefined && card.den ? (
                            <Fraction num={card.num} den={card.den} size="xs" className={isCorrect ? 'text-white' : 'text-indigo-900'} />
                          ) : (
                            <span className="text-xs font-mono font-bold">{card.valLabel}</span>
                          )
                        ) : (
                          <span className="text-[10px] font-sans">Đặt thẻ giá trị</span>
                        )}
                        {isCorrect && <CheckCircle2 className="w-3 h-3 text-white mt-0.5" />}
                        {isWrong && <XCircle className="w-3 h-3 text-rose-600 mt-0.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* TWO SCRAMBLED BANKS (Kho chữ số & Kho giá trị) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Bank 1: Scrambled Digits */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    Kho Chữ Số ({availableDigitPool.length} chữ số còn lại):
                  </span>
                  <span className="text-[10px] text-slate-500">Bấm chọn ➔ thả vào hàng 1</span>
                </div>

                <div className="flex flex-wrap items-center gap-2 min-h-[48px]">
                  {availableDigitPool.length === 0 ? (
                    <span className="text-xs text-emerald-700 font-medium italic">
                      ✓ Đã xếp hết chữ số lên bảng.
                    </span>
                  ) : (
                    availableDigitPool.map(item => {
                      const isSelected = selectedDigitFromBank?.id === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            sounds.playClick();
                            setSelectedDigitFromBank(isSelected ? null : item);
                            setSelectedValueFromBank(null);
                          }}
                          className={`w-11 h-11 rounded-xl text-xl font-mono font-extrabold border-2 transition-all flex items-center justify-center ${
                            isSelected
                              ? 'bg-rose-600 text-white border-rose-600 shadow-md scale-110 ring-2 ring-rose-300'
                              : 'bg-white hover:bg-rose-50 text-slate-800 border-slate-200 shadow-xs'
                          }`}
                        >
                          {item.digit}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Bank 2: Scrambled Value Cards (NO ANSWER LABELS) */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    Kho Thẻ Giá Trị ({availableValuePool.length} thẻ còn lại):
                  </span>
                  <span className="text-[10px] text-slate-500">Bấm chọn ➔ thả vào hàng 2</span>
                </div>

                <div className="flex flex-wrap items-center gap-2 min-h-[48px]">
                  {availableValuePool.length === 0 ? (
                    <span className="text-xs text-emerald-700 font-medium italic">
                      ✓ Đã xếp hết thẻ giá trị lên bảng.
                    </span>
                  ) : (
                    availableValuePool.map(card => {
                      const isSelected = selectedValueFromBank?.id === card.id;
                      return (
                        <button
                          key={card.id}
                          onClick={() => {
                            sounds.playClick();
                            setSelectedValueFromBank(isSelected ? null : card);
                            setSelectedDigitFromBank(null);
                          }}
                          className={`px-3 py-2 rounded-xl border-2 transition-all flex items-center justify-center ${
                            isSelected
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-md scale-105 ring-2 ring-indigo-300'
                              : 'bg-white hover:bg-indigo-50 text-slate-800 border-slate-200 shadow-xs'
                          }`}
                        >
                          {card.isFraction && card.num !== undefined && card.den ? (
                            <Fraction num={card.num} den={card.den} size="xs" className={isSelected ? 'text-white' : 'text-indigo-900'} />
                          ) : (
                            <span className="text-xs font-mono font-bold">{card.valLabel}</span>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Check button & Feedback */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleVerifySlotting}
                disabled={
                  Object.values(slottedDigits).some(v => v === null) ||
                  Object.values(slottedValues).some(v => v === null)
                }
                className="px-6 py-2.5 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white shadow-xs transition-colors"
              >
                Kiểm Tra Kết Quả
              </button>

              <button
                onClick={resetCurrentChallenge}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Làm lại từ đầu
              </button>
            </div>

            {slottingFeedback && (
              <div
                className={`p-4 rounded-xl border text-xs leading-relaxed flex items-start gap-2.5 ${
                  slottingFeedback.isCorrect
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                {slottingFeedback.isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-bold mb-0.5">
                    {slottingFeedback.isCorrect ? 'Chính xác xuất sắc!' : 'Chưa đúng, hãy suy nghĩ thêm:'}
                  </div>
                  <div>{slottingFeedback.msg}</div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ======================= SUB-MODE 2: 3-COLUMN SPEED TRIO ======================= */
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-rose-600" />
                  <span>Nối Nhanh 3 Cột: Chữ Số ↔ Tên Hàng ↔ Giá Trị Toán Học</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Bấm chọn 1 thẻ ở Cột 1 (Chữ số) ➔ 1 thẻ ở Cột 2 (Tên hàng) ➔ 1 thẻ ở Cột 3 (Giá trị) để ghép bộ 3 hoàn chỉnh.
                </p>
              </div>

              <div className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                Đã ghép: {matchedTrioKeys.length} / {trioItems.length} bộ
              </div>
            </div>

            {/* 3 Columns Display */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Column 1: Chữ số trong số */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block bg-slate-100 p-2 rounded-lg text-center">
                  1. Chữ Số
                </span>
                <div className="space-y-2">
                  {trioItems.map(item => {
                    const isMatched = matchedTrioKeys.includes(item.placeKey);
                    const isSelected = selectedTrioDigit === item.id;
                    return (
                      <button
                        key={item.id}
                        disabled={isMatched}
                        onClick={() => handleTrioDigitClick(item.id)}
                        className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                          isMatched
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800 opacity-60'
                            : isSelected
                            ? 'bg-rose-600 text-white border-rose-600 shadow-md scale-102 ring-2 ring-rose-300'
                            : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-xs'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500">Chữ số:</span>
                          <strong className="text-2xl font-mono">{item.digit}</strong>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded ${isSelected ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
                          {item.partName}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Column 2: Tên hàng tương ứng */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block bg-slate-100 p-2 rounded-lg text-center">
                  2. Tên Hàng
                </span>
                <div className="space-y-2">
                  {[...trioItems].reverse().map(item => {
                    const isMatched = matchedTrioKeys.includes(item.placeKey);
                    const isSelected = selectedTrioPlace === item.id;
                    return (
                      <button
                        key={item.id}
                        disabled={isMatched}
                        onClick={() => handleTrioPlaceClick(item.id)}
                        className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                          isMatched
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800 opacity-60'
                            : isSelected
                            ? 'bg-amber-500 text-white border-amber-500 shadow-md scale-102 ring-2 ring-amber-300'
                            : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-xs'
                        }`}
                      >
                        <span className="text-sm font-bold">{item.placeName}</span>
                        {isMatched && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Column 3: Giá trị toán học */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block bg-slate-100 p-2 rounded-lg text-center">
                  3. Giá Trị Toán Học
                </span>
                <div className="space-y-2">
                  {[...trioItems].sort((a, b) => b.digit - a.digit).map(item => {
                    const isMatched = matchedTrioKeys.includes(item.placeKey);
                    const isSelected = selectedTrioValue === item.id;
                    return (
                      <button
                        key={item.id}
                        disabled={isMatched}
                        onClick={() => handleTrioValueClick(item.id)}
                        className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between min-h-[56px] ${
                          isMatched
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800 opacity-60'
                            : isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md scale-102 ring-2 ring-indigo-300'
                            : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-xs'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {item.valNum !== undefined && item.valDen ? (
                            <div className="inline-flex items-center gap-1.5 font-bold font-mono">
                              <Fraction num={item.valNum} den={item.valDen} size="sm" className={isSelected ? 'text-white' : 'text-indigo-900'} />
                              <span className="text-xs text-slate-400">(= {item.valDecText})</span>
                            </div>
                          ) : (
                            <span className="text-base font-bold font-mono">{item.valDecText}</span>
                          )}
                        </div>
                        {isMatched && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {matchedTrioKeys.length === trioItems.length && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2">
                <Sparkles className="w-7 h-7 text-emerald-600 mx-auto" />
                <div className="font-bold text-emerald-900 text-base">
                  🎉 Xuất sắc! Bạn đã nối chính xác tất cả các chữ số với hàng và giá trị!
                </div>
                <p className="text-xs text-emerald-700">
                  Kỹ năng xác định hàng của phần nguyên và phần thập phân của bạn rất vững vàng.
                </p>
                <button
                  onClick={nextChallenge}
                  className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5 mt-2"
                >
                  <span>Chinh phục bài tiếp theo</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
