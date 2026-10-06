import React, { useState, useEffect } from 'react';
import { Volume2, Trophy, Star, Sparkles, CheckCircle2, XCircle, RotateCcw, ArrowRight, Layers, Link2, PlusCircle, Check, Eye, HelpCircle } from 'lucide-react';
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
    title: 'Số 375,482',
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
    title: 'Số 68,054',
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
    title: 'Số 9,403',
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
    title: 'Số 142,75',
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
    title: 'Số 0,865',
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
    title: 'Số 504,007',
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
    title: 'Số 82,39',
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
    title: 'Số 120,04',
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
    title: 'Số 7,915',
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
    title: 'Số 250,8',
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
    title: 'Số 0,028',
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
    title: 'Số 409,6',
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
  const [mobileLayoutMode, setMobileLayoutMode] = useState<'two-blocks' | 'wide-table'>('two-blocks');
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
    placeShortName: string;
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
  const [mobileTrioTab, setMobileTrioTab] = useState<'digit' | 'place' | 'value'>('digit');

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
        placeShortName: cfg.shortName,
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
    setMobileTrioTab('digit');
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
      setTeacherInputError('Phần nguyên tối đa 3 chữ số (từ 0 đến 999).');
      return;
    }

    const cleanDecStr = decPartStr.slice(0, 3);
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
      title: `Số ${fullFormatted}`,
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
    setTeacherSuccessMsg(`Đã tạo bài tập số ${fullFormatted}!`);
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
        confetti({ particleCount: 65, spread: 80, origin: { y: 0.6 } });
      } catch {}
      setScore(prev => prev + 200);
      setStreak(prev => prev + 1);
      if (onEarnStar) onEarnStar(1);

      setSlottingFeedback({
        isCorrect: true,
        msg: `Chính xác! Bạn đã xếp đúng vị trí chữ số và gán chuẩn xác giá trị của từng hàng trong số ${c.displayNumber}!`
      });
    } else {
      sounds.playError();
      setStreak(0);
      let errorTip = '';
      if (!isDigitsCorrect && !isValuesCorrect) {
        errorTip = 'Chưa đúng vị trí chữ số và giá trị. Hãy kiểm tra lại phần nguyên và phần thập phân.';
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
    const nextVal = selectedTrioDigit === id ? null : id;
    setSelectedTrioDigit(nextVal);
    if (nextVal) setMobileTrioTab('place');
  };

  const handleTrioPlaceClick = (id: string) => {
    sounds.playClick();
    const nextVal = selectedTrioPlace === id ? null : id;
    setSelectedTrioPlace(nextVal);
    if (nextVal) setMobileTrioTab('value');
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
            confetti({ particleCount: 65, spread: 80 });
          } catch {}
          if (onEarnStar) onEarnStar(1);
        }

        setSelectedTrioDigit(null);
        setSelectedTrioPlace(null);
        setSelectedTrioValue(null);
        setMobileTrioTab('digit');
      } else {
        sounds.playError();
        setTimeout(() => {
          setSelectedTrioDigit(null);
          setSelectedTrioPlace(null);
          setSelectedTrioValue(null);
          setMobileTrioTab('digit');
        }, 550);
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

  // Helper render a single Place Column (used in both desktop table and mobile blocks)
  const renderPlaceColumn = (k: PlaceKey, isDecimal: boolean) => {
    const cfg = PLACE_CONFIG[k];
    const digitVal = slottedDigits[k];
    const isDigitCorrect = slottingSubmitted && digitVal === currentChallenge[k];
    const isDigitWrong = slottingSubmitted && digitVal !== currentChallenge[k];

    const card = slottedValues[k];
    const isValCorrect = slottingSubmitted && card?.correctPlaceKey === k;
    const isValWrong = slottingSubmitted && card !== null && card.correctPlaceKey !== k;

    return (
      <div
        key={k}
        className={`flex flex-col rounded-2xl border-2 p-2.5 transition-all ${
          isDecimal
            ? 'bg-indigo-50/50 border-indigo-200'
            : 'bg-emerald-50/50 border-emerald-200'
        }`}
      >
        {/* Place Header */}
        <div className="text-center pb-2 border-b border-slate-200/60 mb-2">
          <span className="text-xs sm:text-sm font-bold text-slate-800 block truncate">
            {cfg.name}
          </span>
          <span className="text-[11px] font-mono font-medium text-slate-500 mt-0.5 inline-block">
            {isDecimal ? (
              <span className="inline-flex items-center gap-0.5">
                × <Fraction num={cfg.fractionNumerator || 1} den={cfg.fractionDenominator || 10} size="xs" />
              </span>
            ) : (
              `× ${cfg.multiplier}`
            )}
          </span>
        </div>

        {/* Slot 1: Chữ số */}
        <div className="space-y-1 mb-2.5">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block text-center">
            Chữ số
          </span>
          <button
            onClick={() => handleSlotDigit(k)}
            className={`w-full h-15 sm:h-16 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${
              isDigitCorrect
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md scale-102'
                : isDigitWrong
                ? 'bg-rose-50 border-rose-400 text-rose-700'
                : digitVal !== null
                ? isDecimal
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : selectedDigitFromBank
                ? 'bg-amber-100/80 border-dashed border-amber-500 text-amber-800 animate-pulse font-bold'
                : 'bg-white border-dashed border-slate-300 hover:border-slate-400 text-slate-400'
            }`}
          >
            {digitVal !== null ? (
              <span className="text-3xl font-mono font-black">{digitVal}</span>
            ) : (
              <span className="text-xs font-semibold text-slate-400">
                {selectedDigitFromBank ? 'Đặt vào đây' : 'Trống'}
              </span>
            )}
            {isDigitCorrect && <CheckCircle2 className="w-4 h-4 text-white mt-0.5" />}
            {isDigitWrong && <XCircle className="w-4 h-4 text-rose-600 mt-0.5" />}
          </button>
        </div>

        {/* Slot 2: Thẻ giá trị */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block text-center">
            Giá trị
          </span>
          <button
            onClick={() => handleSlotValue(k)}
            className={`w-full h-14 sm:h-15 rounded-xl border-2 flex flex-col items-center justify-center transition-all p-1 ${
              isValCorrect
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : isValWrong
                ? 'bg-rose-50 border-rose-400 text-rose-700'
                : card !== null
                ? isDecimal
                  ? 'bg-indigo-50 border-indigo-400 text-indigo-900 shadow-xs'
                  : 'bg-emerald-50 border-emerald-400 text-emerald-900 shadow-xs'
                : selectedValueFromBank
                ? 'bg-amber-100/80 border-dashed border-amber-500 text-amber-800 animate-pulse font-bold'
                : 'bg-white border-dashed border-slate-300 hover:border-slate-400 text-slate-400'
            }`}
          >
            {card !== null ? (
              card.isFraction && card.num !== undefined && card.den ? (
                <Fraction num={card.num} den={card.den} size="sm" className={isValCorrect ? 'text-white' : 'text-indigo-900'} />
              ) : (
                <span className="text-sm font-mono font-bold truncate max-w-full">{card.valLabel}</span>
              )
            ) : (
              <span className="text-xs font-semibold text-slate-400">
                {selectedValueFromBank ? 'Đặt vào đây' : 'Trống'}
              </span>
            )}
            {isValCorrect && <CheckCircle2 className="w-3.5 h-3.5 text-white mt-0.5" />}
            {isValWrong && <XCircle className="w-3.5 h-3.5 text-rose-600 mt-0.5" />}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5 max-w-full">
      {/* Teacher Number Input Section - Clean, High-Contrast */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border-2 border-rose-200 shadow-xs">
        <form onSubmit={handleTeacherSubmitNumber} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex items-center gap-2 shrink-0">
            <span className="px-2.5 py-1 rounded-lg bg-rose-600 text-white text-xs font-bold uppercase tracking-wider">
              Giáo viên
            </span>
            <span className="text-sm font-bold text-slate-900">
              Nhập số bất kỳ:
            </span>
          </div>

          <div className="flex-1 flex items-center gap-2 min-w-0">
            <input
              type="text"
              placeholder="Nhập số thập phân (Ví dụ: 84,295 hoặc 305,08 hoặc 0,74)"
              value={teacherInput}
              onChange={(e) => {
                setTeacherInput(e.target.value);
                setTeacherInputError(null);
              }}
              className="flex-1 min-w-0 px-3.5 py-2 text-sm sm:text-base font-mono font-bold bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
            <button
              type="submit"
              className="px-4 py-2 text-sm font-bold bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-xl shadow-xs transition-all inline-flex items-center justify-center gap-1.5 shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Giao bài</span>
            </button>
          </div>
        </form>

        {teacherInputError && (
          <div className="mt-2.5 text-xs text-rose-600 font-bold flex items-center gap-1.5">
            <XCircle className="w-4 h-4 shrink-0" />
            <span>{teacherInputError}</span>
          </div>
        )}

        {teacherSuccessMsg && (
          <div className="mt-2.5 text-xs text-emerald-700 font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{teacherSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* Main Game Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm space-y-5 sm:space-y-6">
        {/* Header & Modes */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div>
            <div className="text-xs font-bold tracking-wider text-rose-600 uppercase mb-0.5 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>Đấu Trường Toán Học</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Ghép Đúng Vị Trí Hàng & Giá Trị
            </h2>
          </div>

          {/* Sub-mode switchers */}
          <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200 shrink-0 self-start sm:self-auto">
            <button
              onClick={() => {
                sounds.playClick();
                setGameSubMode('slotting');
              }}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                gameSubMode === 'slotting' ? 'bg-white text-rose-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              1. Xếp Vào Bảng
            </button>
            <button
              onClick={() => {
                sounds.playClick();
                setGameSubMode('trio-connect');
              }}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                gameSubMode === 'trio-connect' ? 'bg-white text-rose-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              2. Nối 3 Cột
            </button>
          </div>
        </div>

        {/* Challenge selection pills */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar touch-scroll py-1 max-w-full">
            <span className="text-xs text-slate-500 font-bold shrink-0 mr-1">Đề có sẵn:</span>
            {challenges.slice(0, 10).map((c, i) => (
              <button
                key={c.id}
                onClick={() => {
                  sounds.playClick();
                  setChallengeIdx(i);
                }}
                className={`px-3 py-1.5 text-xs sm:text-sm font-mono font-bold rounded-lg shrink-0 transition-all ${
                  challengeIdx === i
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-rose-50 text-slate-700'
                }`}
              >
                {c.displayNumber}
                {c.isCustom && <span className="ml-1 text-[10px] text-amber-300">★</span>}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              onClick={resetCurrentChallenge}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Làm lại đề này"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Làm lại</span>
            </button>
            <button
              onClick={nextChallenge}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-colors"
            >
              <span>Đề kế tiếp</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Current Target Number Box - Clean Decimal Number */}
        <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 sm:p-5 text-center shadow-xs">
          <div className="flex items-center justify-center gap-3 sm:gap-4">
            <div className="text-4xl sm:text-6xl font-mono font-black text-slate-900 tracking-wider select-all">
              {currentChallenge.displayNumber}
            </div>

            {/* Sound Pronunciation Button */}
            <button
              onClick={handlePlayTTS}
              disabled={isSpeaking}
              className="p-2.5 sm:p-3 rounded-2xl bg-white text-rose-600 hover:bg-rose-50 border-2 border-rose-200 shadow-xs transition-colors shrink-0 active:scale-95 cursor-pointer"
              title="Nghe phát âm chuẩn tiếng Việt"
            >
              <Volume2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* ======================= SUB-MODE 1: SLOTTING ======================= */}
        {gameSubMode === 'slotting' ? (
          <div className="space-y-5">
            {/* Mobile Layout Switcher (< 768px only) */}
            <div className="flex md:hidden items-center justify-between bg-slate-100 p-1.5 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-700 ml-1.5">Bố cục bảng:</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setMobileLayoutMode('two-blocks')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                    mobileLayoutMode === 'two-blocks' ? 'bg-white text-rose-600 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  📱 2 Khối Rõ Ràng
                </button>
                <button
                  onClick={() => setMobileLayoutMode('wide-table')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                    mobileLayoutMode === 'wide-table' ? 'bg-white text-rose-600 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  ↔ Bảng Ngang (Cuộn)
                </button>
              </div>
            </div>

            {/* DESKTOP VIEW & MOBILE WIDE-TABLE VIEW: Single Spacious Table */}
            <div className={`${mobileLayoutMode === 'two-blocks' ? 'hidden md:block' : 'block'}`}>
              <div className="overflow-x-auto touch-scroll no-scrollbar -mx-2 px-2 sm:mx-0 sm:px-0">
                <div className="min-w-[680px]">
                  {/* Top classification banner */}
                  <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs sm:text-sm font-bold">
                    <div className="col-span-3 bg-emerald-100/80 text-emerald-900 border-2 border-emerald-300 py-2 rounded-xl">
                      PHẦN NGUYÊN (Bên trái dấu phẩy)
                    </div>
                    <div className="col-span-1 bg-rose-100/80 text-rose-800 border-2 border-rose-300 py-2 rounded-xl flex items-center justify-center font-black">
                      PHẨY (,)
                    </div>
                    <div className="col-span-3 bg-indigo-100/80 text-indigo-900 border-2 border-indigo-300 py-2 rounded-xl">
                      PHẦN THẬP PHÂN (Bên phải dấu phẩy)
                    </div>
                  </div>

                  {/* 7 Columns Grid */}
                  <div className="grid grid-cols-7 gap-2">
                    {wholeKeys.map(k => renderPlaceColumn(k, false))}

                    {/* Comma Divider Column */}
                    <div className="flex flex-col items-center justify-center p-2 rounded-2xl bg-rose-50 border-2 border-rose-200">
                      <span className="text-4xl font-mono font-black text-rose-600">,</span>
                      <span className="text-[11px] font-bold text-rose-700 mt-2">Dấu phẩy</span>
                    </div>

                    {decimalKeys.map(k => renderPlaceColumn(k, true))}
                  </div>
                </div>
              </div>
            </div>

            {/* MOBILE TWO-BLOCKS VIEW (< 768px): Super spacious, clear, 3-columns per block, no micro text */}
            <div className={`space-y-4 ${mobileLayoutMode === 'two-blocks' ? 'block md:hidden' : 'hidden'}`}>
              {/* BLOCK 1: Phần Nguyên */}
              <div className="bg-emerald-50/40 rounded-2xl p-3 border-2 border-emerald-300 space-y-2">
                <div className="flex items-center justify-between pb-1.5 border-b border-emerald-200">
                  <span className="text-xs font-black text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                    PHẦN NGUYÊN
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                    {currentChallenge.whole}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {wholeKeys.map(k => renderPlaceColumn(k, false))}
                </div>
              </div>

              {/* Big Comma Divider Badge */}
              <div className="flex items-center justify-center gap-2 py-1">
                <div className="h-0.5 flex-1 bg-rose-200" />
                <div className="px-4 py-1 rounded-full bg-rose-600 text-white font-mono font-black text-lg flex items-center gap-1 shadow-xs">
                  <span>Dấu phẩy</span>
                  <span className="text-xl">,</span>
                </div>
                <div className="h-0.5 flex-1 bg-rose-200" />
              </div>

              {/* BLOCK 2: Phần Thập Phân */}
              <div className="bg-indigo-50/40 rounded-2xl p-3 border-2 border-indigo-300 space-y-2">
                <div className="flex items-center justify-between pb-1.5 border-b border-indigo-200">
                  <span className="text-xs font-black text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" />
                    PHẦN THẬP PHÂN
                  </span>
                  <span className="text-xs font-mono font-bold text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded-md">
                    {currentChallenge.decStr}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {decimalKeys.map(k => renderPlaceColumn(k, true))}
                </div>
              </div>
            </div>

            {/* TWO SCRAMBLED BANKS - Big tactile cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Bank 1: Scrambled Digits */}
              <div className="p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900">
                    Kho Chữ Số ({availableDigitPool.length} thẻ)
                  </span>
                  {selectedDigitFromBank && (
                    <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-md animate-pulse">
                      Đang chọn: {selectedDigitFromBank.digit}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2.5 min-h-[52px]">
                  {availableDigitPool.length === 0 ? (
                    <span className="text-sm text-emerald-700 font-bold italic">
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
                          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl text-2xl font-mono font-black border-2 transition-all flex items-center justify-center active:scale-95 shadow-sm ${
                            isSelected
                              ? 'bg-rose-600 text-white border-rose-600 shadow-lg scale-110 ring-4 ring-rose-200'
                              : 'bg-white hover:bg-rose-50 text-slate-900 border-slate-300'
                          }`}
                        >
                          {item.digit}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Bank 2: Scrambled Value Cards */}
              <div className="p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900">
                    Kho Thẻ Giá Trị ({availableValuePool.length} thẻ)
                  </span>
                  {selectedValueFromBank && (
                    <span className="text-xs font-bold text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-md animate-pulse">
                      Đang chọn thẻ giá trị
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2.5 min-h-[52px]">
                  {availableValuePool.length === 0 ? (
                    <span className="text-sm text-emerald-700 font-bold italic">
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
                          className={`px-3.5 py-2.5 min-h-[48px] rounded-2xl border-2 transition-all flex items-center justify-center active:scale-95 shadow-sm ${
                            isSelected
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg scale-105 ring-4 ring-indigo-200'
                              : 'bg-white hover:bg-indigo-50 text-slate-900 border-slate-300'
                          }`}
                        >
                          {card.isFraction && card.num !== undefined && card.den ? (
                            <Fraction num={card.num} den={card.den} size="sm" className={isSelected ? 'text-white' : 'text-indigo-900'} />
                          ) : (
                            <span className="text-sm sm:text-base font-mono font-black">{card.valLabel}</span>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Check button & Feedback */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handleVerifySlotting}
                disabled={
                  Object.values(slottedDigits).some(v => v === null) ||
                  Object.values(slottedValues).some(v => v === null)
                }
                className="px-6 py-3 rounded-xl font-black text-sm bg-rose-600 hover:bg-rose-700 active:scale-95 disabled:opacity-50 text-white shadow-md transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                Kiểm Tra Kết Quả
              </button>

              <button
                onClick={resetCurrentChallenge}
                className="px-4 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Làm lại từ đầu
              </button>
            </div>

            {slottingFeedback && (
              <div
                className={`p-4 rounded-2xl border-2 text-sm leading-relaxed flex items-start gap-3 shadow-xs ${
                  slottingFeedback.isCorrect
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : 'bg-rose-50 border-rose-300 text-rose-950'
                }`}
              >
                {slottingFeedback.isCorrect ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-black text-base mb-0.5">
                    {slottingFeedback.isCorrect ? 'Chính xác xuất sắc!' : 'Chưa đúng, hãy suy nghĩ thêm:'}
                  </div>
                  <div>{slottingFeedback.msg}</div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ======================= SUB-MODE 2: 3-COLUMN SPEED TRIO ======================= */
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                <Link2 className="w-5 h-5 text-rose-600 shrink-0" />
                <span>Nối 3 Cột: Chữ Số ↔ Tên Hàng ↔ Giá Trị</span>
              </h3>

              <div className="text-xs sm:text-sm font-black text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-xl shrink-0">
                Đã ghép: {matchedTrioKeys.length} / {trioItems.length}
              </div>
            </div>

            {/* Mobile Tab Selector (< 768px) for effortless tapping on phones */}
            <div className="flex md:hidden items-center justify-between bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setMobileTrioTab('digit')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  mobileTrioTab === 'digit' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-700'
                }`}
              >
                1. Chữ Số {selectedTrioDigit ? '✓' : ''}
              </button>
              <button
                onClick={() => setMobileTrioTab('place')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  mobileTrioTab === 'place' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-700'
                }`}
              >
                2. Tên Hàng {selectedTrioPlace ? '✓' : ''}
              </button>
              <button
                onClick={() => setMobileTrioTab('value')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  mobileTrioTab === 'value' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-700'
                }`}
              >
                3. Giá Trị {selectedTrioValue ? '✓' : ''}
              </button>
            </div>

            {/* 3 Columns Display - Spacious, high contrast */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
              {/* Column 1: Chữ số trong số */}
              <div className={`space-y-2 ${mobileTrioTab === 'digit' ? 'block' : 'hidden md:block'}`}>
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider block bg-slate-100 p-2.5 rounded-xl text-center border border-slate-200">
                  1. Chữ Số Trong Số
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
                        className={`w-full p-3.5 rounded-2xl border-2 text-left transition-all flex items-center justify-between active:scale-95 shadow-xs ${
                          isMatched
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800 opacity-50'
                            : isSelected
                            ? 'bg-rose-600 text-white border-rose-600 shadow-md ring-4 ring-rose-200 scale-102'
                            : 'bg-white hover:bg-slate-50 text-slate-900 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 font-bold">Chữ số:</span>
                          <strong className="text-2xl sm:text-3xl font-mono font-black">{item.digit}</strong>
                        </div>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${isSelected ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-700'}`}>
                          {item.partName}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Column 2: Tên hàng tương ứng */}
              <div className={`space-y-2 ${mobileTrioTab === 'place' ? 'block' : 'hidden md:block'}`}>
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider block bg-slate-100 p-2.5 rounded-xl text-center border border-slate-200">
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
                        className={`w-full p-3.5 rounded-2xl border-2 text-left transition-all flex items-center justify-between min-h-[58px] active:scale-95 shadow-xs ${
                          isMatched
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800 opacity-50'
                            : isSelected
                            ? 'bg-amber-500 text-white border-amber-500 shadow-md ring-4 ring-amber-200 scale-102'
                            : 'bg-white hover:bg-slate-50 text-slate-900 border-slate-200'
                        }`}
                      >
                        <span className="text-sm sm:text-base font-black truncate">{item.placeName}</span>
                        {isMatched && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Column 3: Giá trị toán học */}
              <div className={`space-y-2 ${mobileTrioTab === 'value' ? 'block' : 'hidden md:block'}`}>
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider block bg-slate-100 p-2.5 rounded-xl text-center border border-slate-200">
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
                        className={`w-full p-3 rounded-2xl border-2 text-left transition-all flex items-center justify-between min-h-[58px] active:scale-95 shadow-xs ${
                          isMatched
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800 opacity-50'
                            : isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-4 ring-indigo-200 scale-102'
                            : 'bg-white hover:bg-slate-50 text-slate-900 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {item.valNum !== undefined && item.valDen ? (
                            <div className="inline-flex items-center gap-1.5 font-bold font-mono">
                              <Fraction num={item.valNum} den={item.valDen} size="sm" className={isSelected ? 'text-white' : 'text-indigo-900'} />
                              <span className={`text-xs ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>(= {item.valDecText})</span>
                            </div>
                          ) : (
                            <span className="text-base sm:text-lg font-black font-mono">{item.valDecText}</span>
                          )}
                        </div>
                        {isMatched && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {matchedTrioKeys.length === trioItems.length && (
              <div className="p-5 bg-emerald-50 border-2 border-emerald-300 rounded-2xl text-center space-y-2 shadow-xs">
                <Sparkles className="w-7 h-7 text-emerald-600 mx-auto" />
                <div className="font-black text-emerald-950 text-base sm:text-lg">
                  🎉 Hoàn thành xuất sắc! Bạn đã nối đúng toàn bộ các hàng!
                </div>
                <button
                  onClick={nextChallenge}
                  className="px-5 py-2.5 text-sm font-black bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5 mt-1 cursor-pointer"
                >
                  <span>Chinh phục đề tiếp theo</span>
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
