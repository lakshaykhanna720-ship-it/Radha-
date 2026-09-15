import React, { useState, useEffect } from 'react';
import {
  Car,
  BarChart3,
  ListOrdered,
  Plus,
  Mic,
  Banknote,
  Fuel,
  Settings,
  Volume2,
  ShieldCheck,
  QrCode,
  MessageSquare
} from 'lucide-react';
import { Transaction, DriverSettings, PaymentMethod } from './types';
import {
  loadTransactions,
  saveTransactions,
  loadSettings,
  saveSettings,
  calculateWeeklySummary,
  INITIAL_SEED_TRANSACTIONS,
} from './utils/storage';
import { announcePayment, speakDailySummary } from './utils/audio';

import { DriveMode } from './components/DriveMode';
import { WeeklySummaryView } from './components/WeeklySummaryView';
import { TransactionLedger } from './components/TransactionLedger';
import { SoundboxAlertModal } from './components/SoundboxAlertModal';
import { ManualCashModal } from './components/ManualCashModal';
import { ExpenseModal } from './components/ExpenseModal';
import { SmsReaderModal } from './components/SmsReaderModal';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import { DriverQrModal } from './components/DriverQrModal';
import { SettingsModal } from './components/SettingsModal';
import { PWAInstallBanner, RealWorldPublishModal } from './components/RealWorldPublishModal';
import { AndroidApkModal } from './components/AndroidApkModal';
import { Smartphone, Zap } from 'lucide-react';

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => loadTransactions());
  const [settings, setSettings] = useState<DriverSettings>(() => loadSettings());
  const [activeTab, setActiveTab] = useState<'drive' | 'details' | 'ledger'>('drive');

  // Modal States
  const [alertTxn, setAlertTxn] = useState<Transaction | null>(null);
  const [isManualCashOpen, setIsManualCashOpen] = useState<boolean>(false);
  const [isExpenseOpen, setIsExpenseOpen] = useState<boolean>(false);
  const [isSmsReaderOpen, setIsSmsReaderOpen] = useState<boolean>(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState<boolean>(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isPublishGuideOpen, setIsPublishGuideOpen] = useState<boolean>(false);
  const [isApkModalOpen, setIsApkModalOpen] = useState<boolean>(false);

  // Sync to local storage
  useEffect(() => {
    saveTransactions(transactions);
  }, [transactions]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Handle incoming transaction (from QR, SMS, manual cash, or voice)
  const handleAddTransaction = (
    newTxnData: Omit<Transaction, 'id' | 'timestamp'>,
    shouldAnnounceAudio: boolean = true
  ) => {
    const newTxn: Transaction = {
      ...newTxnData,
      id: `txn-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };

    setTransactions((prev) => [newTxn, ...prev]);

    // Announce out loud if it's an income payment (Soundbox functionality)
    if (newTxn.type === 'income' && shouldAnnounceAudio && settings.autoSpeakIncoming) {
      announcePayment({
        amount: newTxn.amount,
        method: newTxn.method,
        senderName: newTxn.senderName,
        lang: settings.soundboxVoiceLang,
        volume: settings.soundboxVolume,
        rate: settings.speechSpeed,
        playChime: settings.enableChime,
      });

      // Show celebratory soundbox overlay
      setAlertTxn(newTxn);
    }
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const handleResetData = () => {
    setTransactions(INITIAL_SEED_TRANSACTIONS);
    saveTransactions(INITIAL_SEED_TRANSACTIONS);
  };

  // Filter today's transactions
  const todayDateStr = new Date().toISOString().split('T')[0];
  const todayTransactions = transactions.filter((t) => t.timestamp.startsWith(todayDateStr));

  // Weekly calculation
  const weeklySummary = calculateWeeklySummary(transactions);

  // Today net stats
  const todayIncomes = todayTransactions.filter((t) => t.type === 'income');
  const todayExpenses = todayTransactions.filter((t) => t.type === 'expense');
  const todayGross = todayIncomes.reduce((acc, t) => acc + t.amount, 0);
  const todayCosts = todayExpenses.reduce((acc, t) => acc + t.amount, 0);
  const todayNet = todayGross - todayCosts;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white pb-10">
      {/* Top Navigation / Cab Soundbox Bar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-3.5 sm:px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
          {/* Logo & Driver Status */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-md shadow-emerald-950">
              <Car className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                  CAB SOUNDBOX
                </h1>
                <span className="hidden xs:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <Volume2 className="w-2.5 h-2.5 animate-pulse" />
                  <span>ONLINE 🔊</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                {settings.driverName} • {settings.vehicleNumber}
              </p>
            </div>
          </div>

          {/* Quick Header Action Shortcuts */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Quick Cash 💰 */}
            <button
              id="header-btn-quick-cash"
              onClick={() => setIsManualCashOpen(true)}
              className="py-1.5 px-2.5 sm:px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-sm transition-transform active:scale-95"
              title="Record Cash Payment"
            >
              <Banknote className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cash</span>
              <span>💰</span>
            </button>

            {/* Quick Expense ⛽ */}
            <button
              id="header-btn-quick-cost"
              onClick={() => setIsExpenseOpen(true)}
              className="py-1.5 px-2.5 sm:px-3 rounded-xl bg-rose-600/90 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-transform active:scale-95"
              title="Record Operating Cost (CNG, Fuel, Toll)"
            >
              <Fuel className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cost</span>
            </button>

            {/* Quick Voice Mic 🎤 */}
            <button
              id="header-btn-quick-voice"
              onClick={() => setIsVoiceOpen(true)}
              className="p-2 rounded-xl bg-cyan-600/90 hover:bg-cyan-500 text-white shadow-sm transition-transform active:scale-95"
              title="Offline Voice Payment Logger"
            >
              <Mic className="w-4 h-4" />
            </button>

            {/* Real-World / Phone Publish Guide 📱 */}
            <button
              id="header-btn-publish-guide"
              onClick={() => setIsPublishGuideOpen(true)}
              className="py-1.5 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 font-bold text-xs flex items-center gap-1 transition-all active:scale-95"
              title="Publish on Phone & Read Real UPI Messages"
            >
              <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Phone & UPI</span>
            </button>

            {/* Android APK 100% Auto-SMS Reader ⚡ */}
            <button
              id="header-btn-apk-auto"
              onClick={() => setIsApkModalOpen(true)}
              className="py-1.5 px-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-950 transition-all active:scale-95"
              title="Real Android APK: Zero-Touch Auto-SMS Reader"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>Android APK</span>
            </button>

            {/* Settings ⚙️ */}
            <button
              id="header-btn-settings"
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Driver & Soundbox Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Real-World Phone & UPI Install Notification Banner */}
      <PWAInstallBanner />

      {/* Main View Mode Selector Tabs */}
      <div className="max-w-6xl mx-auto w-full px-3.5 sm:px-6 pt-4 pb-2">
        <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <nav className="flex items-center gap-2 bg-slate-900/80 p-1 rounded-2xl border border-slate-800">
            {/* Drive Mode Tab */}
            <button
              id="tab-drive-mode"
              onClick={() => setActiveTab('drive')}
              className={`py-2 px-3.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
                activeTab === 'drive'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Car className="w-4 h-4" />
              <span>Drive Mode (HUD)</span>
            </button>

            {/* Details & Weekly Mode Tab */}
            <button
              id="tab-details-weekly"
              onClick={() => setActiveTab('details')}
              className={`py-2 px-3.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
                activeTab === 'details'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Weekly Details & Costs</span>
            </button>

            {/* Ledger Tab */}
            <button
              id="tab-ledger"
              onClick={() => setActiveTab('ledger')}
              className={`py-2 px-3.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
                activeTab === 'ledger'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ListOrdered className="w-4 h-4" />
              <span className="hidden xs:inline">Ride Ledger</span>
              <span className="xs:hidden">Ledger</span>
            </button>
          </nav>

          {/* Quick Voice Mode indicator */}
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" />
            <span>Voice Lang: {settings.soundboxVoiceLang === 'hi' ? 'Hindi' : settings.soundboxVoiceLang === 'hinglish' ? 'Hinglish' : 'English'}</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto w-full px-3.5 sm:px-6 pt-3 flex-1">
        {activeTab === 'drive' && (
          <DriveMode
            todayTransactions={todayTransactions}
            settings={settings}
            onOpenManualCash={() => setIsManualCashOpen(true)}
            onOpenVoiceAssistant={() => setIsVoiceOpen(true)}
            onOpenSmsReader={() => setIsSmsReaderOpen(true)}
            onOpenQrModal={() => setIsQrModalOpen(true)}
            onOpenApkModal={() => setIsApkModalOpen(true)}
            onSimulateQuickPayment={(amount, method, sender) => {
              handleAddTransaction({
                type: 'income',
                amount,
                method,
                senderName: sender,
                customerNote: 'Customer QR Scan Payment',
              });
            }}
          />
        )}

        {activeTab === 'details' && (
          <WeeklySummaryView summary={weeklySummary} settings={settings} />
        )}

        {activeTab === 'ledger' && (
          <TransactionLedger
            transactions={transactions}
            onDeleteTransaction={handleDeleteTransaction}
            settings={settings}
          />
        )}
      </main>

      {/* Modals & Overlays */}
      {/* 1. Celebratory Soundbox Audio Announcement Modal */}
      <SoundboxAlertModal
        transaction={alertTxn}
        settings={settings}
        onClose={() => setAlertTxn(null)}
      />

      {/* 2. Manual Cash Entry Modal (💰) */}
      <ManualCashModal
        isOpen={isManualCashOpen}
        onClose={() => setIsManualCashOpen(false)}
        onAddTransaction={handleAddTransaction}
        settings={settings}
      />

      {/* 3. Expense / Operating Cost Modal (⛽) */}
      <ExpenseModal
        isOpen={isExpenseOpen}
        onClose={() => setIsExpenseOpen(false)}
        onAddTransaction={(data) => handleAddTransaction(data, false)}
      />

      {/* 4. SMS Transaction Reader Modal */}
      <SmsReaderModal
        isOpen={isSmsReaderOpen}
        onClose={() => setIsSmsReaderOpen(false)}
        onProcessSmsTransaction={(data) => handleAddTransaction(data, true)}
        onOpenApkModal={() => setIsApkModalOpen(true)}
      />

      {/* 5. Driver Offline Voice Assistant Modal (🎤) */}
      <VoiceAssistantModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onAddTransaction={handleAddTransaction}
        onSpeakSummary={() => {
          speakDailySummary({
            tripCount: todayIncomes.length,
            grossIncome: todayGross,
            totalExpenses: todayCosts,
            netProfit: todayNet,
            lang: settings.soundboxVoiceLang,
            driverName: settings.driverName,
            volume: settings.soundboxVolume,
          });
        }}
        settings={settings}
      />

      {/* 6. Passenger QR Code Modal */}
      <DriverQrModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        settings={settings}
        onSimulateCustomerPayment={(amount, method, sender) => {
          handleAddTransaction({
            type: 'income',
            amount,
            method,
            senderName: sender,
            customerNote: 'Passenger QR payment',
          });
        }}
      />

      {/* 7. Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={(newSettings) => setSettings(newSettings)}
        onResetData={handleResetData}
      />

      {/* 8. Real-World Phone & UPI Publishing Guide Modal */}
      <RealWorldPublishModal
        isOpen={isPublishGuideOpen}
        onClose={() => setIsPublishGuideOpen(false)}
      />

      {/* 9. Android Native APK Auto-Reader Modal */}
      <AndroidApkModal
        isOpen={isApkModalOpen}
        onClose={() => setIsApkModalOpen(false)}
        settings={settings}
        onSimulateNativeTxn={(txn) => {
          setTransactions((prev) => [txn, ...prev]);
          setAlertTxn(txn);
        }}
      />
    </div>
  );
}
