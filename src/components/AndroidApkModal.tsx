import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Download,
  Terminal,
  Code,
  CheckCircle,
  Radio,
  FileCode,
  Copy,
  Zap,
  Volume2,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { generateAndroidProjectZip, downloadBlob } from '../utils/apkExport';
import { announcePayment, announceExpense } from '../utils/audio';
import { DriverSettings, Transaction } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  settings: DriverSettings;
  onSimulateNativeTxn: (txn: Transaction) => void;
}

const SAMPLE_NATIVE_SIMULATIONS = [
  {
    title: 'Incoming SBI SMS (₹380)',
    sender: 'AD-SBIUPI',
    body: 'Dear SBI User, A/C 9812 credited by INR 380.00 on 15Sep26 transfer from ROHIT MEHTA Ref 425983719201.',
    amount: 380,
    provider: 'other_upi' as const,
    customer: 'Rohit Mehta',
    isExpense: false,
  },
  {
    title: 'PhonePe Push Notification (₹150)',
    sender: 'com.phonepe.app',
    body: 'Payment received: ₹150 from PRIYA SHARMA via PhonePe QR.',
    amount: 150,
    provider: 'phonepe' as const,
    customer: 'Priya Sharma',
    isExpense: false,
  },
  {
    title: 'Paytm Soundbox Broadcast (₹220)',
    sender: 'net.one97.paytm',
    body: 'Paytm par Vikram Singh se 220 rupaye prapt hue. Txn ID 8291038192.',
    amount: 220,
    provider: 'paytm' as const,
    customer: 'Vikram Singh',
    isExpense: false,
  },
  {
    title: 'Google Pay Business Alert (₹500)',
    sender: 'com.google.android.apps.nbu.paisa',
    body: 'GPay: You received ₹500.00 from AMIT JOSHI. Ref: 9102837192.',
    amount: 500,
    provider: 'gpay' as const,
    customer: 'Amit Joshi',
    isExpense: false,
  },
  {
    title: 'CNG Station Debit SMS (-₹600)',
    sender: 'VM-HDFCBK',
    body: 'Alert: Rs 600.00 debited from HDFC Bank A/c **4102 at IGL CNG PUMP OKHLA.',
    amount: 600,
    provider: 'cash' as const,
    customer: 'IGL CNG Pump',
    isExpense: true,
  },
];

export const AndroidApkModal: React.FC<Props> = ({
  isOpen,
  onClose,
  settings,
  onSimulateNativeTxn,
}) => {
  const [activeTab, setActiveTab] = useState<'build' | 'code' | 'test'>('build');
  const [activeCodeFile, setActiveCodeFile] = useState<'receiver' | 'service' | 'manifest'>('receiver');
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [simStatus, setSimStatus] = useState<string>('');

  if (!isOpen) return null;

  const handleDownloadZip = async () => {
    try {
      setIsExporting(true);
      const blob = await generateAndroidProjectZip();
      downloadBlob(blob, 'CabSoundbox-Android-Native-Project.zip');
    } catch (err) {
      console.error('Failed to export zip', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleRunZeroTouchSimulation = async (item: typeof SAMPLE_NATIVE_SIMULATIONS[0]) => {
    setSimStatus(`⚡ [Background Event Fired]: Intercepted ${item.sender}...`);

    setTimeout(async () => {
      setSimStatus(`🔊 Speaking aloud: ${item.isExpense ? `CNG Expense -₹${item.amount}` : `₹${item.amount} via ${item.provider}`}...`);

      if (item.isExpense) {
        await announceExpense({
          amount: item.amount,
          category: 'fuel_cng',
          lang: settings.soundboxVoiceLang,
          volume: settings.soundboxVolume,
          rate: settings.speechSpeed,
          playChime: settings.enableChime,
        });
      } else {
        await announcePayment({
          amount: item.amount,
          method: item.provider,
          senderName: item.customer,
          lang: settings.soundboxVoiceLang,
          volume: settings.soundboxVolume,
          rate: settings.speechSpeed,
          playChime: settings.enableChime,
        });
      }

      // Automatically add to ledger without driver touching anything!
      onSimulateNativeTxn({
        id: 'native_' + Date.now(),
        amount: item.amount,
        type: item.isExpense ? 'expense' : 'income',
        method: item.provider,
        expenseCategory: item.isExpense ? 'fuel_cng' : undefined,
        senderName: item.isExpense ? undefined : item.customer,
        customerNote: item.isExpense ? 'IGL CNG Gas' : `Auto-read from ${item.sender}`,
        timestamp: new Date().toISOString(),
        verified: true,
        referenceNumber: 'AUTO_' + Math.floor(Math.random() * 89999999 + 10000000),
      });

      setSimStatus(`✅ Zero-touch process complete: Audio announced & ledger updated.`);
    }, 400);
  };

  const getCodeSnippet = () => {
    switch (activeCodeFile) {
      case 'receiver':
        return `// SmsReceiver.kt - 100% AUTOMATIC Background SMS Broadcast Receiver
package com.cabsoundbox.app

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.provider.Telephony

class SmsReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != Telephony.Sms.Intents.SMS_RECEIVED_ACTION) return

        val messages = Telephony.Sms.Intents.getMessagesFromIntent(intent)
        val body = messages.joinToString("") { it.messageBody }
        
        // Zero-touch parsing & loud TTS announcement
        val parsed = UpiParser.parse(body)
        if (parsed != null) {
            val speaker = SoundboxSpeaker.getInstance(context)
            if (parsed.isExpense) {
                speaker.announceExpense(parsed.amount, "CNG")
            } else {
                speaker.announcePayment(parsed.amount, parsed.provider, parsed.senderName)
            }
        }
    }
}`;
      case 'service':
        return `// UpiNotificationListenerService.kt - 24/7 Push Notification Reader
package com.cabsoundbox.app

import android.app.Notification
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification

class UpiNotificationListenerService : NotificationListenerService() {
    private val packages = setOf(
        "net.one97.paytm", "com.phonepe.app", 
        "com.google.android.apps.nbu.paisa.user", "com.bharatpe.app"
    )

    override fun onNotificationPosted(sbn: StatusBarNotification?) {
        if (sbn == null || !packages.contains(sbn.packageName)) return
        val extras = sbn.notification.extras ?: return
        val text = "\${extras.getCharSequence(Notification.EXTRA_TITLE)} \${extras.getCharSequence(Notification.EXTRA_TEXT)}"
        
        val parsed = UpiParser.parse(text)
        if (parsed != null) {
            SoundboxSpeaker.getInstance(applicationContext)
                .announcePayment(parsed.amount, parsed.provider, parsed.senderName)
        }
    }
}`;
      case 'manifest':
        return `<!-- AndroidManifest.xml -->
<manifest xmlns:android="http://schemas.android.com/apk/res/android" package="com.cabsoundbox.app">
    <uses-permission android:name="android.permission.RECEIVE_SMS" />
    <uses-permission android:name="android.permission.READ_SMS" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />

    <application android:label="Cab Soundbox" android:theme="@style/Theme.AppCompat.Light.NoActionBar">
        <!-- Zero-Touch SMS Interceptor (Highest Priority) -->
        <receiver android:name=".SmsReceiver" android:exported="true" android:permission="android.permission.BROADCAST_SMS">
            <intent-filter android:priority="999">
                <action android:name="android.provider.Telephony.SMS_RECEIVED" />
            </intent-filter>
        </receiver>

        <!-- Zero-Touch Push Notification Listener -->
        <service android:name=".UpiNotificationListenerService"
            android:permission="android.permission.BIND_NOTIFICATION_LISTENER_SERVICE" android:exported="true">
            <intent-filter>
                <action android:name="android.service.notification.NotificationListenerService" />
            </intent-filter>
        </service>
    </application>
</manifest>`;
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(getCodeSnippet());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id="android-apk-modal-backdrop"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150"
    >
      <div
        id="android-apk-modal-card"
        className="w-full max-w-2xl bg-slate-900 border border-emerald-500/40 rounded-t-3xl sm:rounded-3xl p-5 sm:p-7 shadow-2xl max-h-[92vh] overflow-y-auto flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Real Android APK: Zero-Touch Auto-SMS Reader
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  NO INPUT REQUIRED
                </span>
              </div>
              <p className="text-xs text-slate-400">
                100% background automation using Android BroadcastReceiver & NotificationListener
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Why APK is required banner */}
        <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 mb-4 text-xs text-amber-200 leading-relaxed">
          <div className="font-bold flex items-center gap-1.5 text-amber-300 mb-1">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Why an Android .APK is necessary for 100% Auto-Reading:</span>
          </div>
          Web browsers (Chrome/Safari) intentionally block websites from silently reading SMS in the background to prevent OTP theft. An Android <strong>.APK</strong> has native OS permissions (<code className="bg-slate-900 px-1 rounded text-amber-300 font-mono">RECEIVE_SMS</code>) so the moment customer pays and the bank sends an SMS or GPay notification, Android wakes the app and speaks the announcement with <strong>ZERO taps or clicks</strong>!
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b border-slate-800 pb-3 mb-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab('build')}
            className={`flex-1 py-2 px-3 rounded-xl border transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'build'
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-950'
                : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>1. Download APK / Build</span>
          </button>
          <button
            onClick={() => setActiveTab('test')}
            className={`flex-1 py-2 px-3 rounded-xl border transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'test'
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-950'
                : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            <Radio className="w-4 h-4 text-cyan-400" />
            <span>2. Test Zero-Touch Now</span>
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`flex-1 py-2 px-3 rounded-xl border transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'code'
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-950'
                : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            <Code className="w-4 h-4" />
            <span>3. View Kotlin Source</span>
          </button>
        </div>

        {/* TAB 1: BUILD & DOWNLOAD */}
        {activeTab === 'build' && (
          <div className="space-y-4 text-xs text-slate-300">
            {/* Quick 1-Click ZIP Download */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/40">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>Download Ready-to-Build Android Studio Project (.ZIP)</span>
                  </h3>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Includes all Gradle scripts, AndroidManifest.xml, Kotlin broadcast receivers, and layout files.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDownloadZip}
                disabled={isExporting}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 active:scale-95 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>{isExporting ? 'Packaging Zip...' : 'Download Android Project (CabSoundbox.zip)'}</span>
              </button>
            </div>

            {/* Free Automated Cloud Build with GitHub Actions */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <h4 className="text-sm font-bold text-white">Generate .APK Free in 2 Minutes on GitHub (0 Errors)</h4>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                The GitHub Actions workflow <code className="bg-slate-900 px-1 py-0.5 rounded text-amber-300 font-mono">.github/workflows/build-apk.yml</code> has been fully upgraded to use <strong>Gradle 8.5 + Java 17</strong> with all missing Android themes, drawables, and repository conflicts fixed.
              </p>

              <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl space-y-2">
                <span className="font-bold text-emerald-400 text-xs block">How to push to a brand-new GitHub repository:</span>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 select-all space-y-1">
                  <div># 1. Create a new empty repository on github.com (e.g. cab-soundbox)</div>
                  <div>git remote add origin https://github.com/YOUR_USERNAME/cab-soundbox.git</div>
                  <div>git branch -M main</div>
                  <div>git push -u origin main</div>
                </div>
              </div>

              <ol className="list-decimal list-inside space-y-2 text-[11px] text-slate-300 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <li>
                  Push to your new GitHub repo using the commands above or AI Studio's <strong>Export to GitHub</strong>.
                </li>
                <li>
                  Go to your repository on GitHub and click the <strong>Actions</strong> tab.
                </li>
                <li>
                  The <strong>"Build Android APK"</strong> action runs automatically. (Or click <em>"Run workflow"</em>).
                </li>
                <li>
                  Once green, click the completed run and download <strong className="text-emerald-400">CabSoundbox-AutoSMS-Release-APK</strong> artifact.
                </li>
                <li>
                  Install the <code className="text-amber-300">.apk</code> on your Android phone and grant SMS + Notification access!
                </li>
              </ol>
            </div>

            {/* Local Android Studio Build Steps */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="font-bold text-white text-xs block mb-1">Building locally with Android Studio:</span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Extract the downloaded zip &rarr; Open folder in Android Studio &rarr; Click <code className="bg-slate-900 px-1 py-0.5 rounded text-slate-300 font-mono">Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s)</code>. The APK generates in seconds!
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: ZERO-TOUCH SIMULATOR */}
        {activeTab === 'test' && (
          <div className="space-y-4 text-xs text-slate-300">
            <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/40">
              <h3 className="text-sm font-bold text-cyan-400 mb-1 flex items-center gap-1.5">
                <Radio className="w-4 h-4" />
                <span>Zero-Touch Hands-Free Test</span>
              </h3>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Tap any incoming event below to simulate an incoming bank SMS or push notification arriving while your phone is mounted on the dashboard. The background engine will intercept it, extract the amount, ring the dual chime, speak aloud, and update your ledger without you having to touch the screen!
              </p>
            </div>

            {simStatus && (
              <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 text-xs font-semibold animate-in fade-in flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse shrink-0" />
                <span className="truncate">{simStatus}</span>
              </div>
            )}

            <div className="space-y-2">
              <span className="font-bold text-slate-400 text-[11px] uppercase tracking-wider">
                Simulate Incoming Phone Events (Zero Input):
              </span>
              {SAMPLE_NATIVE_SIMULATIONS.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`font-bold text-xs ${item.isExpense ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {item.title}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                        {item.sender}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate max-w-md">
                      "{item.body}"
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRunZeroTouchSimulation(item)}
                    className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shrink-0 active:scale-95 transition-all shadow-md"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-300" />
                    <span>Trigger Event</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: KOTLIN CODE VIEWER */}
        {activeTab === 'code' && (
          <div className="space-y-3 text-xs text-slate-300 flex-1 flex flex-col">
            <div className="flex items-center justify-between">
              <div className="flex gap-1.5">
                <button
                  onClick={() => setActiveCodeFile('receiver')}
                  className={`py-1 px-2.5 rounded-lg border text-[11px] font-bold ${
                    activeCodeFile === 'receiver'
                      ? 'bg-slate-800 text-emerald-400 border-emerald-500/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  SmsReceiver.kt
                </button>
                <button
                  onClick={() => setActiveCodeFile('service')}
                  className={`py-1 px-2.5 rounded-lg border text-[11px] font-bold ${
                    activeCodeFile === 'service'
                      ? 'bg-slate-800 text-emerald-400 border-emerald-500/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  UpiNotificationService.kt
                </button>
                <button
                  onClick={() => setActiveCodeFile('manifest')}
                  className={`py-1 px-2.5 rounded-lg border text-[11px] font-bold ${
                    activeCodeFile === 'manifest'
                      ? 'bg-slate-800 text-emerald-400 border-emerald-500/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  AndroidManifest.xml
                </button>
              </div>

              <button
                type="button"
                onClick={copyCode}
                className="py-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] font-bold flex items-center gap-1 transition-all"
              >
                {copied ? <CheckCircle className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
                <span>{copied ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>

            <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-72 leading-relaxed">
              <code>{getCodeSnippet()}</code>
            </pre>
          </div>
        )}

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 mt-4 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Source files created in <code className="text-slate-400 font-mono">/android/</code>
          </span>
          <button
            onClick={onClose}
            className="py-2 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
