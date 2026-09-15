import React, { useState } from 'react';
import { X, Fuel, Percent, Car, Utensils, Wrench, Receipt, Check } from 'lucide-react';
import { ExpenseCategory, Transaction } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (txn: Omit<Transaction, 'id' | 'timestamp'>) => void;
}

const CATEGORIES: Array<{
  id: ExpenseCategory;
  label: string;
  icon: any;
  color: string;
  presets: number[];
}> = [
  {
    id: 'fuel_cng',
    label: 'CNG / Fuel / Petrol',
    icon: Fuel,
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    presets: [400, 500, 600, 750, 1000],
  },
  {
    id: 'commission',
    label: 'Uber / Ola / Rapido Cut',
    icon: Percent,
    color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    presets: [80, 150, 250, 400],
  },
  {
    id: 'toll_parking',
    label: 'Toll / MCD / Parking',
    icon: Car,
    color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    presets: [50, 85, 100, 150, 200],
  },
  {
    id: 'food_chai',
    label: 'Chai / Nashta / Meal',
    icon: Utensils,
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    presets: [20, 30, 50, 100, 150],
  },
  {
    id: 'maintenance',
    label: 'Puncture / Wash / Repair',
    icon: Wrench,
    color: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    presets: [50, 100, 250, 500],
  },
];

export const ExpenseModal: React.FC<Props> = ({ isOpen, onClose, onAddTransaction }) => {
  const [category, setCategory] = useState<ExpenseCategory>('fuel_cng');
  const [amount, setAmount] = useState<string>('500');
  const [note, setNote] = useState<string>('');

  if (!isOpen) return null;

  const currentCategory = CATEGORIES.find((c) => c.id === category) || CATEGORIES[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) return;

    onAddTransaction({
      type: 'expense',
      amount: val,
      method: 'cash',
      expenseCategory: category,
      customerNote: note.trim() || currentCategory.label,
    });

    onClose();
  };

  return (
    <div
      id="expense-modal-backdrop"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div
        id="expense-modal-card"
        className="w-full max-w-lg bg-slate-900 border border-rose-500/30 rounded-t-3xl sm:rounded-3xl p-5 sm:p-7 shadow-2xl shadow-rose-950/40 max-h-[92vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Record Cost / Expense</h2>
              <p className="text-xs text-slate-400">Deducted from your gross earnings</p>
            </div>
          </div>
          <button
            id="btn-close-expense-modal"
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category Selector Grid */}
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-2">
              Select Cost Category:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setCategory(cat.id);
                      if (cat.presets.length > 0) {
                        setAmount(cat.presets[1] ? cat.presets[1].toString() : cat.presets[0].toString());
                      }
                    }}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1.5 ${
                      isSelected
                        ? `${cat.color} ring-1 ring-white/20 font-bold shadow-md`
                        : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-xs">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide block mb-1">
              Expense Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-3xl font-bold text-rose-400">
                ₹
              </span>
              <input
                id="input-expense-amount"
                type="number"
                min="5"
                step="5"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
                placeholder="0"
                className="w-full bg-slate-950 border-2 border-slate-700 focus:border-rose-400 text-white text-3xl font-mono font-bold pl-12 pr-4 py-3 rounded-2xl outline-none transition-all shadow-inner"
              />
            </div>
          </div>

          {/* Presets */}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              {currentCategory.presets.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val.toString())}
                  className={`py-1.5 px-3 rounded-lg text-xs font-bold font-mono transition-all ${
                    amount === val.toString()
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  ₹{val}
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">
              Note (Optional)
            </label>
            <input
              id="input-expense-note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g., CNG 8.5 kg, DND Flyway Toll, Uber 20% cut"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:border-rose-400 outline-none"
            />
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              id="btn-save-expense"
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition-transform active:scale-95"
            >
              <Check className="w-5 h-5 stroke-[3]" />
              <span>Record ₹{parseFloat(amount) || 0} Cost</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
