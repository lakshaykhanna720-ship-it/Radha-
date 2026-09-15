import React from 'react';
import { Volume2, TrendingUp, Fuel, Percent, Car, Utensils, Wrench, ShieldCheck, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { DriverSettings, WeeklySummary } from '../types';
import { speakWeeklySummaryAloud } from '../utils/audio';

interface Props {
  summary: WeeklySummary;
  settings: DriverSettings;
}

export const WeeklySummaryView: React.FC<Props> = ({ summary, settings }) => {
  const profitMarginPercent = summary.totalIncome > 0
    ? Math.round((summary.netEarnings / summary.totalIncome) * 100)
    : 0;

  const handleSpeakSummary = () => {
    speakWeeklySummaryAloud({
      tripCount: summary.tripCount,
      grossIncome: summary.totalIncome,
      totalExpenses: summary.totalExpenses,
      netEarnings: summary.netEarnings,
      profitMarginPercent,
      lang: settings.soundboxVoiceLang,
      volume: settings.soundboxVolume,
    });
  };

  const maxDayIncome = Math.max(...summary.dailyData.map((d) => d.income), 1000);

  return (
    <div id="weekly-summary-container" className="space-y-6">
      {/* Top Banner: Real Net Take-Home Profit */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/60 border-2 border-emerald-500/40 p-5 sm:p-7 shadow-xl shadow-emerald-950/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-wider uppercase flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Net In-Pocket Profit (Costs Deleted)</span>
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {summary.weekLabel}
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-4xl sm:text-5xl font-extrabold text-white font-mono tracking-tight">
                ₹{summary.netEarnings.toLocaleString('en-IN')}
              </span>
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                {profitMarginPercent}% Margin
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Actual earnings after subtracting fuel, CNG, platform cuts, tolls & food
            </p>
          </div>

          {/* Read Aloud Button */}
          <button
            id="btn-speak-weekly-summary"
            onClick={handleSpeakSummary}
            className="self-start sm:self-center py-3 px-4.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-transform active:scale-95 shrink-0"
          >
            <Volume2 className="w-4 h-4 animate-pulse" />
            <span>Say Weekly Details Aloud 🔊</span>
          </button>
        </div>

        {/* 3 Metric Cards Grid */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4 mt-6 pt-5 border-t border-slate-800">
          <div className="bg-slate-950/70 p-3 sm:p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <ArrowDownRight className="w-3.5 h-3.5 text-emerald-400" />
              <span>Gross Income</span>
            </div>
            <div className="text-lg sm:text-2xl font-bold text-emerald-400 font-mono">
              ₹{summary.totalIncome.toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              {summary.tripCount} completed rides
            </span>
          </div>

          <div className="bg-slate-950/70 p-3 sm:p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <ArrowUpRight className="w-3.5 h-3.5 text-rose-400" />
              <span>Total Costs</span>
            </div>
            <div className="text-lg sm:text-2xl font-bold text-rose-400 font-mono">
              -₹{summary.totalExpenses.toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              Fuel, cuts & tolls
            </span>
          </div>

          <div className="bg-slate-950/70 p-3 sm:p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <Wallet className="w-3.5 h-3.5 text-amber-400" />
              <span>Cash In Hand</span>
            </div>
            <div className="text-lg sm:text-2xl font-bold text-amber-400 font-mono">
              ₹{summary.cashIncome.toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              +₹{summary.upiIncome.toLocaleString('en-IN')} Bank (UPI)
            </span>
          </div>
        </div>
      </div>

      {/* 7-Day Visual Performance Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Past 7 Days Daily Breakdown</span>
            </h3>
            <p className="text-xs text-slate-400">Green is Gross Fares, Rose is Costs, Center is Net</p>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Gross
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Costs
            </span>
          </div>
        </div>

        {/* Bar Chart Container */}
        <div className="grid grid-cols-7 gap-2 sm:gap-3 items-end h-44 pt-4 border-b border-slate-800 pb-2">
          {summary.dailyData.map((d, i) => {
            const incomeHeightPercent = Math.min(100, Math.round((d.income / maxDayIncome) * 100));
            const expenseHeightPercent = Math.min(100, Math.round((d.expenses / maxDayIncome) * 100));

            return (
              <div key={i} className="flex flex-col items-center h-full justify-end group">
                <div className="w-full flex items-end justify-center gap-1 h-32">
                  {/* Income bar */}
                  <div
                    style={{ height: `${Math.max(4, incomeHeightPercent)}%` }}
                    className="w-3 sm:w-5 bg-emerald-500 rounded-t-md transition-all group-hover:bg-emerald-400 relative"
                    title={`Gross: ₹${d.income}`}
                  />
                  {/* Expense bar */}
                  <div
                    style={{ height: `${Math.max(4, expenseHeightPercent)}%` }}
                    className="w-3 sm:w-5 bg-rose-500/80 rounded-t-md transition-all group-hover:bg-rose-400 relative"
                    title={`Cost: ₹${d.expenses}`}
                  />
                </div>

                <span className="text-[11px] font-bold text-slate-300 mt-2">
                  {d.dayName}
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                  ₹{d.net}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Operating Costs Detailed Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Costs Deleted */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Fuel className="w-4 h-4 text-rose-400" />
              <span>Costs & Deductions Breakdown</span>
            </span>
            <span className="text-xs font-mono text-rose-400 font-semibold">
              -₹{summary.totalExpenses.toLocaleString('en-IN')}
            </span>
          </h3>

          <div className="space-y-2.5">
            {[
              {
                label: 'CNG & Fuel / Petrol',
                amount: summary.expenseBreakdown.fuel_cng,
                icon: Fuel,
                color: 'text-amber-400',
              },
              {
                label: 'Platform Cut (Uber/Ola/Rapido)',
                amount: summary.expenseBreakdown.commission,
                icon: Percent,
                color: 'text-rose-400',
              },
              {
                label: 'Tolls & Parking Fees',
                amount: summary.expenseBreakdown.toll_parking,
                icon: Car,
                color: 'text-blue-400',
              },
              {
                label: 'Maintenance, Puncture, Wash',
                amount: summary.expenseBreakdown.maintenance,
                icon: Wrench,
                color: 'text-purple-400',
              },
              {
                label: 'Food, Meals & Chai',
                amount: summary.expenseBreakdown.food_chai,
                icon: Utensils,
                color: 'text-emerald-400',
              },
            ].map((cat, idx) => {
              const Icon = cat.icon;
              const pct = summary.totalExpenses > 0 ? Math.round((cat.amount / summary.totalExpenses) * 100) : 0;
              return (
                <div key={idx} className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${cat.color}`} />
                    <span className="text-xs text-slate-300 font-medium">{cat.label}</span>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-xs font-bold text-slate-200">
                      ₹{cat.amount.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-slate-500 ml-1.5">({pct}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Revenue Sources Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-emerald-400" />
              <span>Payment Ingestion Breakdown</span>
            </span>
            <span className="text-xs font-mono text-emerald-400 font-semibold">
              ₹{summary.totalIncome.toLocaleString('en-IN')}
            </span>
          </h3>

          <div className="space-y-2.5">
            {[
              {
                label: 'PhonePe QR',
                amount: summary.phonepeIncome,
                badgeColor: 'bg-[#5f259f] text-white',
              },
              {
                label: 'Google Pay',
                amount: summary.gpayIncome,
                badgeColor: 'bg-emerald-600 text-white',
              },
              {
                label: 'Paytm QR',
                amount: summary.paytmIncome,
                badgeColor: 'bg-[#002e6e] text-[#00baf2]',
              },
              {
                label: 'Cash Fares 💰',
                amount: summary.cashIncome,
                badgeColor: 'bg-amber-500 text-slate-950 font-bold',
              },
            ].map((m, idx) => {
              const pct = summary.totalIncome > 0 ? Math.round((m.amount / summary.totalIncome) * 100) : 0;
              return (
                <div key={idx} className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${m.badgeColor}`}>
                      {m.label}
                    </span>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-xs font-bold text-slate-200">
                      ₹{m.amount.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-slate-500 ml-1.5">({pct}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
