import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Volume2, CheckCircle2, X, Fuel, ArrowDownRight } from 'lucide-react';
import { Transaction, DriverSettings } from '../types';
import { ProviderBadge } from './ProviderBadge';
import { announcePayment, announceExpense } from '../utils/audio';

interface Props {
  transaction: Transaction | null;
  settings: DriverSettings;
  onClose: () => void;
}

export const SoundboxAlertModal: React.FC<Props> = ({ transaction, settings, onClose }) => {
  const isExpense = transaction?.type === 'expense';

  useEffect(() => {
    if (!transaction) return;

    // Fire confetti only for income/payments celebration, NOT for operating expenses
    if (transaction.type === 'income') {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#10b981', '#06b6d4', '#f59e0b', '#3b82f6'],
        });
      } catch {
        // ignore
      }
    }

    // Auto close alert after 7 seconds if driver doesn't dismiss
    const timer = setTimeout(() => {
      onClose();
    }, 7000);

    return () => clearTimeout(timer);
  }, [transaction, onClose]);

  if (!transaction) return null;

  const handleReplay = () => {
    if (transaction.type === 'expense') {
      announceExpense({
        amount: transaction.amount,
        category: transaction.expenseCategory || 'other',
        note: transaction.customerNote,
        lang: settings.soundboxVoiceLang,
        volume: settings.soundboxVolume,
        rate: settings.speechSpeed,
        playChime: settings.enableChime,
      });
    } else {
      announcePayment({
        amount: transaction.amount,
        method: transaction.method,
        senderName: transaction.senderName,
        lang: settings.soundboxVoiceLang,
        volume: settings.soundboxVolume,
        rate: settings.speechSpeed,
        playChime: settings.enableChime,
      });
    }
  };

  const getExpenseLabel = () => {
    switch (transaction.expenseCategory) {
      case 'fuel_cng':
        return 'CNG & Fuel Cost (गाड़ी का ईंधन)';
      case 'toll_parking':
        return 'Toll / Fastag / Parking';
      case 'commission':
        return 'Platform Commission Cut';
      case 'food_chai':
        return 'Chai & Food Expense';
      case 'maintenance':
        return 'Maintenance & Repair';
      default:
        return 'Operating Expense (खर्चा)';
    }
  };

  return (
    <div
      id="soundbox-alert-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        id="soundbox-alert-card"
        className={`relative w-full max-w-md bg-slate-900 border-2 rounded-3xl p-6 sm:p-8 shadow-2xl text-center overflow-hidden transition-all ${
          isExpense
            ? 'border-rose-500/60 shadow-rose-500/30'
            : 'border-emerald-500/60 shadow-emerald-500/30'
        }`}
      >
        {/* Decorative sound wave pulse */}
        <div
          className={`absolute -top-16 -left-16 w-32 h-32 rounded-full blur-2xl pointer-events-none ${
            isExpense ? 'bg-rose-500/20' : 'bg-emerald-500/20'
          }`}
        />
        <div
          className={`absolute -bottom-16 -right-16 w-32 h-32 rounded-full blur-2xl pointer-events-none ${
            isExpense ? 'bg-amber-500/20' : 'bg-cyan-500/20'
          }`}
        />

        {/* Close Button */}
        <button
          id="btn-close-soundbox-alert"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Soundbox Speaker Header */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase border ${
              isExpense
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5 animate-pulse" />
            <span>{isExpense ? 'COST DEDUCTION ANNOUNCED ⛽' : 'SOUNDBOX ANNOUNCEMENT 🔊'}</span>
          </div>
        </div>

        {/* Provider Tag or Expense Category Tag */}
        <div className="mb-4">
          {isExpense ? (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-950/80 border border-rose-800 text-rose-300 font-medium text-xs">
              <Fuel className="w-4 h-4 text-rose-400" />
              <span>{getExpenseLabel()}</span>
            </div>
          ) : (
            <ProviderBadge method={transaction.method} size="lg" />
          )}
        </div>

        {/* Large Amount */}
        <div className="my-3">
          <span className="text-xs text-slate-400 font-medium tracking-wide uppercase block mb-1">
            {isExpense ? 'Operating Cost (Deducted from Profit)' : 'Payment Received'}
          </span>
          <div className="text-5xl sm:text-6xl font-extrabold text-white tracking-tight font-mono flex items-center justify-center gap-1">
            <span className={isExpense ? 'text-rose-400' : 'text-emerald-400'}>
              {isExpense ? '-' : '+'}₹
            </span>
            <span>{transaction.amount.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Cost Deduction Clarification Banner */}
        {isExpense && (
          <div className="mt-2 py-1.5 px-3 bg-rose-950/40 border border-rose-800/40 rounded-xl text-xs text-rose-300 flex items-center justify-center gap-1.5">
            <ArrowDownRight className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Subtracted as an expense. Your net earnings decrease by ₹{transaction.amount}.</span>
          </div>
        )}

        {/* Customer / Note details */}
        {(transaction.senderName || transaction.customerNote) && (
          <div className="mt-4 p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-sm">
            {transaction.senderName && (
              <p className="font-semibold text-slate-200">
                From: <span className="text-emerald-300">{transaction.senderName}</span>
              </p>
            )}
            {transaction.customerNote && (
              <p className="text-xs text-slate-400 mt-1">{transaction.customerNote}</p>
            )}
            {transaction.refNumber && (
              <p className="text-[11px] text-slate-500 font-mono mt-1">
                Ref: {transaction.refNumber}
              </p>
            )}
          </div>
        )}

        {/* Spoken voice feedback banner */}
        <div
          className={`mt-4 py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-2 border ${
            isExpense
              ? 'bg-rose-950/40 border-rose-800/40 text-rose-300'
              : 'bg-emerald-950/40 border-emerald-800/40 text-emerald-300'
          }`}
        >
          <CheckCircle2
            className={`w-4 h-4 shrink-0 ${isExpense ? 'text-rose-400' : 'text-emerald-400'}`}
          />
          <span>
            {isExpense
              ? 'Spoken aloud: "Cost deducted from earnings"'
              : 'Announced loud on phone speaker & Bluetooth!'}
          </span>
        </div>

        {/* Action buttons */}
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            id="btn-soundbox-replay"
            onClick={handleReplay}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-sm border border-slate-700 flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-md"
          >
            <Volume2 className={`w-4 h-4 ${isExpense ? 'text-rose-400' : 'text-emerald-400'}`} />
            <span>Say Again 🔁</span>
          </button>
          <button
            id="btn-soundbox-done"
            onClick={onClose}
            className={`flex-1 py-3 px-4 rounded-xl text-white font-bold text-sm shadow-lg flex items-center justify-center transition-transform active:scale-95 ${
              isExpense
                ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
                : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
            }`}
          >
            {isExpense ? 'Done (Cost Deducted)' : 'Done (Ride Added)'}
          </button>
        </div>
      </div>
    </div>
  );
};
