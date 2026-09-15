import React, { useState } from 'react';
import { X, Banknote, Check, Volume2, Sparkles } from 'lucide-react';
import { DriverSettings, Transaction } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (txn: Omit<Transaction, 'id' | 'timestamp'>, shouldAnnounce: boolean) => void;
  settings: DriverSettings;
}

const QUICK_AMOUNTS = [50, 100, 150, 200, 250, 300, 400, 500, 750, 1000];

const TRIP_TAGS = [
  'Street Hail',
  'Uber Cash Trip',
  'Ola Cash Trip',
  'Airport Run',
  'Railway Station',
  'Outstation',
];

export const ManualCashModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onAddTransaction,
}) => {
  const [amount, setAmount] = useState<string>('200');
  const [selectedTag, setSelectedTag] = useState<string>('Street Hail');
  const [tipAmount, setTipAmount] = useState<string>('0');
  const [shouldAnnounce, setShouldAnnounce] = useState<boolean>(true);

  if (!isOpen) return null;

  const handleQuickSelect = (val: number) => {
    setAmount(val.toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const baseAmount = parseFloat(amount);
    const tip = parseFloat(tipAmount) || 0;
    const finalAmount = (isNaN(baseAmount) ? 0 : baseAmount) + tip;

    if (finalAmount <= 0) return;

    onAddTransaction(
      {
        type: 'income',
        amount: finalAmount,
        method: 'cash',
        customerNote: `${selectedTag}${tip > 0 ? ` (includes ₹${tip} tip)` : ''}`,
        senderName: 'Cash Passenger',
      },
      shouldAnnounce
    );

    onClose();
  };

  return (
    <div
      id="manual-cash-backdrop"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div
        id="manual-cash-card"
        className="w-full max-w-lg bg-slate-900 border border-amber-500/30 rounded-t-3xl sm:rounded-3xl p-5 sm:p-7 shadow-2xl shadow-amber-950/40 max-h-[92vh] overflow-y-auto"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Banknote className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Record Cash Payment</span>
                <span className="text-xl">💰</span>
              </h2>
              <p className="text-xs text-slate-400">Quick manual cash entry from passenger</p>
            </div>
          </div>
          <button
            id="btn-close-manual-cash"
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Main Amount Input */}
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide block mb-1">
              Fare Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-3xl font-bold text-amber-400">
                ₹
              </span>
              <input
                id="input-cash-amount"
                type="number"
                min="10"
                step="5"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
                placeholder="0"
                className="w-full bg-slate-950 border-2 border-slate-700 focus:border-amber-400 text-white text-3xl font-mono font-bold pl-12 pr-4 py-3 rounded-2xl outline-none transition-all shadow-inner"
              />
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1.5">
              Tap Quick Preset:
            </label>
            <div className="grid grid-cols-5 gap-2">
              {QUICK_AMOUNTS.map((val) => {
                const isSelected = amount === val.toString();
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleQuickSelect(val)}
                    className={`py-2.5 rounded-xl text-sm font-bold font-mono transition-all active:scale-95 border ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/30'
                        : 'bg-slate-800 hover:bg-slate-750 text-slate-200 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    ₹{val}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Trip Category Chips */}
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1.5">
              Trip Type:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {TRIP_TAGS.map((tag) => {
                const isSelected = selectedTag === tag;
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedTag(tag)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Tip / Extra */}
          <div className="flex items-center gap-3 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
            <div className="flex-1">
              <span className="text-xs text-slate-300 block">Passenger Extra / Tip (₹)</span>
              <p className="text-[11px] text-slate-500">"Keep the change"</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setTipAmount('10')}
                className={`px-2.5 py-1 text-xs rounded-md border ${
                  tipAmount === '10' ? 'bg-amber-500/20 border-amber-500 text-amber-300' : 'border-slate-700 text-slate-400'
                }`}
              >
                +₹10
              </button>
              <button
                type="button"
                onClick={() => setTipAmount('20')}
                className={`px-2.5 py-1 text-xs rounded-md border ${
                  tipAmount === '20' ? 'bg-amber-500/20 border-amber-500 text-amber-300' : 'border-slate-700 text-slate-400'
                }`}
              >
                +₹20
              </button>
              <button
                type="button"
                onClick={() => setTipAmount('50')}
                className={`px-2.5 py-1 text-xs rounded-md border ${
                  tipAmount === '50' ? 'bg-amber-500/20 border-amber-500 text-amber-300' : 'border-slate-700 text-slate-400'
                }`}
              >
                +₹50
              </button>
            </div>
          </div>

          {/* Say Out Loud Announcement Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-slate-200">
                Announce out loud on Soundbox
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                id="toggle-cash-soundbox"
                type="checkbox"
                checked={shouldAnnounce}
                onChange={(e) => setShouldAnnounce(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          {/* Total & Submit Button */}
          <div className="pt-2">
            <button
              id="btn-save-cash-payment"
              type="submit"
              className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-base flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 transition-transform active:scale-95"
            >
              <Check className="w-5 h-5 stroke-[3]" />
              <span>
                Record ₹{((parseFloat(amount) || 0) + (parseFloat(tipAmount) || 0)).toLocaleString('en-IN')} Cash
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
