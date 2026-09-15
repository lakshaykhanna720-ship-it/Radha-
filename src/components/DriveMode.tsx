import React, { useState } from 'react';
import {
  Volume2,
  Mic,
  Banknote,
  QrCode,
  MessageSquare,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Fuel,
  Sun,
  Moon,
  ShieldCheck,
  RefreshCw,
  Clock,
  Car,
  Zap
} from 'lucide-react';
import { DriverSettings, Transaction, PaymentMethod } from '../types';
import { ProviderBadge } from './ProviderBadge';
import { speakDailySummary, announcePayment, announceExpense } from '../utils/audio';

interface Props {
  todayTransactions: Transaction[];
  settings: DriverSettings;
  onOpenManualCash: () => void;
  onOpenVoiceAssistant: () => void;
  onOpenSmsReader: () => void;
  onOpenQrModal: () => void;
  onSimulateQuickPayment: (amount: number, method: PaymentMethod, sender: string) => void;
  onOpenApkModal?: () => void;
}

export const DriveMode: React.FC<Props> = ({
  todayTransactions,
  settings,
  onOpenManualCash,
  onOpenVoiceAssistant,
  onOpenSmsReader,
  onOpenQrModal,
  onSimulateQuickPayment,
  onOpenApkModal,
}) => {
  const [highContrast, setHighContrast] = useState(false);

  // Compute Today's Stats
  const todayIncomes = todayTransactions.filter((t) => t.type === 'income');
  const todayExpenses = todayTransactions.filter((t) => t.type === 'expense');

  const todayGross = todayIncomes.reduce((acc, t) => acc + t.amount, 0);
  const todayCosts = todayExpenses.reduce((acc, t) => acc + t.amount, 0);
  const todayNet = todayGross - todayCosts;
  const tripCount = todayIncomes.length;

  const lastTxn = todayTransactions[0]; // most recent

  // Handle "Mode which says details"
  const handleSayDetails = () => {
    speakDailySummary({
      tripCount,
      grossIncome: todayGross,
      totalExpenses: todayCosts,
      netProfit: todayNet,
      lang: settings.soundboxVoiceLang,
      driverName: settings.driverName,
      volume: settings.soundboxVolume,
    });
  };

  const handleReplayLast = () => {
    if (!lastTxn) return;
    if (lastTxn.type === 'income') {
      announcePayment({
        amount: lastTxn.amount,
        method: lastTxn.method,
        senderName: lastTxn.senderName,
        lang: settings.soundboxVoiceLang,
        volume: settings.soundboxVolume,
        rate: settings.speechSpeed,
        playChime: settings.enableChime,
      });
    } else if (lastTxn.type === 'expense') {
      announceExpense({
        amount: lastTxn.amount,
        expenseCategory: lastTxn.expenseCategory,
        lang: settings.soundboxVoiceLang,
        volume: settings.soundboxVolume,
        rate: settings.speechSpeed,
        playChime: settings.enableChime,
      });
    }
  };

  return (
    <div
      id="drive-mode-hud"
      className={`min-h-[78vh] flex flex-col justify-between space-y-4 rounded-3xl p-4 sm:p-6 transition-colors ${
        highContrast
          ? 'bg-black border-4 border-yellow-400 text-yellow-300'
          : 'bg-slate-950 border border-slate-800 text-slate-100'
      }`}
    >
      {/* HUD Header with Status Indicators */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold tracking-wider uppercase">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
            <span>DRIVE HUD ACTIVE</span>
          </div>
          <span className="hidden sm:inline text-xs text-slate-400 font-mono">
            {settings.vehicleNumber}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setHighContrast(!highContrast)}
            title="Toggle Night/Day High Contrast"
            className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 hover:text-white flex items-center gap-1"
          >
            {highContrast ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-cyan-400" />}
            <span className="hidden xs:inline">{highContrast ? 'Day Contrast' : 'OLED Night'}</span>
          </button>
        </div>
      </div>

      {/* Main Speedometer-Style Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-1">
        {/* Big Net In-Hand Cash / Profit Display */}
        <div className="md:col-span-2 bg-gradient-to-br from-slate-900 to-slate-900/90 border-2 border-emerald-500/50 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-bold tracking-wider text-emerald-400 uppercase flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Today's Net Profit (In-Hand Cash)</span>
            </span>
            <span className="text-xs font-mono text-slate-400">
              Target: ₹{settings.dailyTarget}
            </span>
          </div>

          <div className="my-3 flex items-baseline gap-3">
            <div className="text-5xl sm:text-7xl font-black font-mono tracking-tight text-white flex items-center">
              <span className="text-emerald-400 text-4xl sm:text-6xl mr-1">₹</span>
              <span>{todayNet.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Submetrics Row */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Gross Rides</span>
              <span className="font-bold text-emerald-400 font-mono text-sm sm:text-base">
                ₹{todayGross.toLocaleString('en-IN')}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Fuel & Costs</span>
              <span className="font-bold text-rose-400 font-mono text-sm sm:text-base">
                -₹{todayCosts.toLocaleString('en-IN')}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Trips Done</span>
              <span className="font-bold text-white font-mono text-sm sm:text-base">
                {tripCount} rides
              </span>
            </div>
          </div>
        </div>

        {/* Mode which says details: Dedicated Audio Readout HUD Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">
              <Volume2 className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>Audio Assistant</span>
            </div>
            <h3 className="text-base font-bold text-white mb-1">Say Details Mode</h3>
            <p className="text-xs text-slate-400">
              Tap to speak today's ride count, gross fare, and net earnings aloud
            </p>
          </div>

          <button
            id="btn-drive-say-details"
            onClick={handleSayDetails}
            className="w-full mt-4 py-4 px-4 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-lg shadow-cyan-600/30 transition-transform active:scale-95"
          >
            <Volume2 className="w-5 h-5 stroke-[2.5]" />
            <span>Say Details Aloud 🔊</span>
          </button>
        </div>
      </div>

      {/* Most Recent Payment Banner with Fast Replay */}
      {lastTxn && (
        <div className={`border rounded-2xl p-3.5 flex items-center justify-between gap-3 ${
          lastTxn.type === 'expense'
            ? 'bg-rose-950/40 border-rose-800/60'
            : 'bg-slate-900/90 border-slate-800'
        }`}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              lastTxn.type === 'expense'
                ? 'bg-rose-500/20 text-rose-400'
                : 'bg-emerald-500/20 text-emerald-400'
            }`}>
              {lastTxn.type === 'expense' ? <Fuel className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Last:</span>
                <span className="text-xs font-bold text-white truncate">
                  {lastTxn.type === 'income' ? lastTxn.senderName || 'Customer Fare' : lastTxn.customerNote || 'CNG / Expense'}
                </span>
                {lastTxn.type === 'income' && <ProviderBadge method={lastTxn.method} size="sm" />}
              </div>
              <span className={`text-sm font-extrabold font-mono ${
                lastTxn.type === 'expense' ? 'text-rose-400' : 'text-emerald-400'
              }`}>
                {lastTxn.type === 'income' ? '+' : '-'}₹{lastTxn.amount}
                {lastTxn.type === 'expense' && <span className="text-[10px] font-sans font-normal text-rose-300 ml-1.5">(Cost deducted)</span>}
              </span>
            </div>
          </div>

          <button
            onClick={handleReplayLast}
            className={`py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 border transition-all ${
              lastTxn.type === 'expense'
                ? 'bg-rose-900/50 hover:bg-rose-800/60 text-rose-200 border-rose-700/60'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            <Volume2 className={`w-3.5 h-3.5 ${lastTxn.type === 'expense' ? 'text-rose-400' : 'text-emerald-400'}`} />
            <span>Replay Audio</span>
          </button>
        </div>
      )}

      {/* Giant Action Touch Targets for Cab Drivers */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        {/* 1. Enter Cash Manually */}
        <button
          id="btn-drive-record-cash"
          onClick={onOpenManualCash}
          className="h-28 sm:h-32 rounded-3xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black p-4 flex flex-col justify-between items-start shadow-xl shadow-amber-500/20 transition-transform active:scale-95 group"
        >
          <div className="w-10 h-10 rounded-2xl bg-slate-950/20 flex items-center justify-center text-slate-950">
            <Banknote className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-lg sm:text-xl block leading-tight">Instant Cash</span>
            <span className="text-xs font-medium text-slate-900 block opacity-80">
              Enter Manual (💰)
            </span>
          </div>
        </button>

        {/* 2. Hands-Free Voice Mic */}
        <button
          id="btn-drive-voice-mic"
          onClick={onOpenVoiceAssistant}
          className="h-28 sm:h-32 rounded-3xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black p-4 flex flex-col justify-between items-start shadow-xl shadow-cyan-500/20 transition-transform active:scale-95 group"
        >
          <div className="w-10 h-10 rounded-2xl bg-slate-950/20 flex items-center justify-center text-slate-950">
            <Mic className="w-6 h-6 stroke-[2.5] animate-pulse" />
          </div>
          <div>
            <span className="text-lg sm:text-xl block leading-tight">Voice Record</span>
            <span className="text-xs font-medium text-slate-900 block opacity-80">
              "Cash 200" or "CNG 500"
            </span>
          </div>
        </button>

        {/* 3. Passenger QR Show & Quick Simulator */}
        <button
          id="btn-drive-show-qr"
          onClick={onOpenQrModal}
          className="h-28 sm:h-32 rounded-3xl bg-emerald-600 hover:bg-emerald-500 text-white font-black p-4 flex flex-col justify-between items-start shadow-xl shadow-emerald-600/25 transition-transform active:scale-95 group"
        >
          <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white">
            <QrCode className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-lg sm:text-xl block leading-tight">Show QR</span>
            <span className="text-xs font-medium text-emerald-100 block opacity-90">
              Paytm • PhonePe • GPay
            </span>
          </div>
        </button>

        {/* 4. SMS Transaction Reader / Paste */}
        <button
          id="btn-drive-sms-reader"
          onClick={onOpenSmsReader}
          className="h-28 sm:h-32 rounded-3xl bg-blue-600 hover:bg-blue-500 text-white font-black p-4 flex flex-col justify-between items-start shadow-xl shadow-blue-600/25 transition-transform active:scale-95 group"
        >
          <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white">
            <MessageSquare className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-lg sm:text-xl block leading-tight">SMS Reader</span>
            <span className="text-xs font-medium text-blue-100 block opacity-90">
              Auto-read UPI Messages
            </span>
          </div>
        </button>
      </div>

      {/* Rapid QR Payment Simulator Bar for Demo/Testing while in Drive Mode */}
      <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Test Soundbox Live Announcement (Customer QR Scan):</span>
          </span>
          <span className="text-[11px] text-slate-400">1-Tap Test</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => onSimulateQuickPayment(150, 'paytm', 'Ankit Verma')}
            className="py-2 px-2.5 rounded-xl bg-[#002e6e] hover:bg-[#003882] text-white text-xs font-bold flex items-center justify-between border border-[#00baf2]/40 transition-transform active:scale-95"
          >
            <span className="text-[#00baf2]">Paytm</span>
            <span className="font-mono">₹150 🔊</span>
          </button>

          <button
            type="button"
            onClick={() => onSimulateQuickPayment(250, 'phonepe', 'Suraj Singh')}
            className="py-2 px-2.5 rounded-xl bg-[#5f259f] hover:bg-[#6c2bb3] text-white text-xs font-bold flex items-center justify-between border border-purple-400/40 transition-transform active:scale-95"
          >
            <span>PhonePe</span>
            <span className="font-mono">₹250 🔊</span>
          </button>

          <button
            type="button"
            onClick={() => onSimulateQuickPayment(340, 'gpay', 'Priya Verma')}
            className="py-2 px-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold flex items-center justify-between border border-emerald-400/40 transition-transform active:scale-95"
          >
            <span>Google Pay</span>
            <span className="font-mono">₹340 🔊</span>
          </button>
        </div>
      </div>

      {/* Android Native APK Notice for Zero-Input Background Reading */}
      {onOpenApkModal && (
        <div className="p-3.5 bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-950 rounded-2xl border border-emerald-500/40 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white truncate">
                  Real Android APK: 100% Zero-Touch Auto-Reader
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  NO INPUT REQUIRED
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                Reads real SMS & GPay/PhonePe push notifications silently in background.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenApkModal}
            className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shrink-0 transition-all active:scale-95 shadow-md shadow-emerald-950"
          >
            Get .APK / Test
          </button>
        </div>
      )}
    </div>
  );
};
