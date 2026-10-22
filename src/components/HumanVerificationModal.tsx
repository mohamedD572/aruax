import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, AlertCircle, RefreshCw, X } from 'lucide-react';
import { TelegramService } from '../services/telegram';

interface HumanVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  rewardText?: string;
}

export const HumanVerificationModal: React.FC<HumanVerificationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title = 'Human Verification',
  rewardText,
}) => {
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [operator, setOperator] = useState<'+' | '-'>('+');
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [options, setOptions] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);

  const generateProblem = () => {
    setSelectedAnswer(null);
    setErrorMsg(null);
    setVerified(false);

    const isAdd = Math.random() > 0.3;
    let a = Math.floor(Math.random() * 12) + 3;
    let b = Math.floor(Math.random() * 10) + 2;

    if (!isAdd) {
      if (a < b) [a, b] = [b, a];
      setNum1(a);
      setNum2(b);
      setOperator('-');
      const ans = a - b;
      setCorrectAnswer(ans);
      generateChoices(ans);
    } else {
      setNum1(a);
      setNum2(b);
      setOperator('+');
      const ans = a + b;
      setCorrectAnswer(ans);
      generateChoices(ans);
    }
  };

  const generateChoices = (ans: number) => {
    const choicesSet = new Set<number>();
    choicesSet.add(ans);

    while (choicesSet.size < 4) {
      const delta = (Math.floor(Math.random() * 5) + 1) * (Math.random() > 0.5 ? 1 : -1);
      const wrong = ans + delta;
      if (wrong >= 0 && wrong !== ans) {
        choicesSet.add(wrong);
      }
    }

    const shuffled = Array.from(choicesSet).sort(() => Math.random() - 0.5);
    setOptions(shuffled);
  };

  useEffect(() => {
    if (isOpen) {
      generateProblem();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectOption = (opt: number) => {
    setSelectedAnswer(opt);
    setErrorMsg(null);

    if (opt === correctAnswer) {
      setVerified(true);
      TelegramService.hapticNotification('success');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 600);
    } else {
      TelegramService.hapticNotification('warning');
      setErrorMsg('Incorrect answer! Please try again.');
      setTimeout(() => {
        generateProblem();
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-3xl bg-slate-900 border border-emerald-500/40 p-6 shadow-2xl space-y-5 text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <ShieldCheck className="w-7 h-7 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-lg font-black tracking-tight text-slate-100 flex items-center justify-center gap-1.5">
              <span>✔ {title}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Anti-cheat security check. Solve the math equation to verify you are human.
            </p>
          </div>
          {rewardText && (
            <div className="inline-block px-3 py-1 rounded-xl bg-amber-500/15 text-amber-400 text-xs font-black font-mono border border-amber-500/30">
              {rewardText}
            </div>
          )}
        </div>

        {/* Challenge Box */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-3 font-mono">
          <div className="text-xs text-slate-400 uppercase font-bold tracking-widest flex items-center justify-center gap-2">
            <span>Solve Question</span>
            <button
              onClick={generateProblem}
              className="text-emerald-400 hover:rotate-180 transition-transform p-1 cursor-pointer"
              title="Refresh question"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="text-3xl font-black tracking-wider text-slate-100 py-2">
            {num1} {operator} {num2} = ?
          </div>
        </div>

        {errorMsg && (
          <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs text-center font-bold flex items-center justify-center gap-1.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {verified && (
          <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs text-center font-bold flex items-center justify-center gap-1.5 animate-pulse">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Verification Passed! Granting Reward...</span>
          </div>
        )}

        {/* Answer Options Grid */}
        <div className="grid grid-cols-2 gap-2.5 font-mono">
          {options.map((opt) => {
            const isSelected = selectedAnswer === opt;
            const isRight = isSelected && opt === correctAnswer;
            const isWrong = isSelected && opt !== correctAnswer;

            return (
              <button
                key={opt}
                onClick={() => handleSelectOption(opt)}
                disabled={verified}
                className={`py-3.5 px-4 rounded-2xl font-black text-base transition-all border cursor-pointer active:scale-95 ${
                  isRight
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                    : isWrong
                    ? 'bg-rose-500 text-white border-rose-400'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-100 border-slate-700 hover:border-emerald-500/40'
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
