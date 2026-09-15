import React, { useState } from 'react';
import { X, Settings, Volume2, Globe, Shield, RefreshCw, Check, Sparkles } from 'lucide-react';
import { DriverSettings } from '../types';
import { announcePayment } from '../utils/audio';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  settings: DriverSettings;
  onSaveSettings: (settings: DriverSettings) => void;
  onResetData: () => void;
}

export const SettingsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onResetData,
}) => {
  const [formData, setFormData] = useState<DriverSettings>(settings);
  const [tested, setTested] = useState(false);

  if (!isOpen) return null;

  const handleTestSpeaker = () => {
    setTested(true);
    announcePayment({
      amount: 250,
      method: 'paytm',
      senderName: 'Test Passenger',
      lang: formData.soundboxVoiceLang,
      volume: formData.soundboxVolume,
      rate: formData.speechSpeed,
      playChime: formData.enableChime,
    });
    setTimeout(() => setTested(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    onClose();
  };

  return (
    <div
      id="settings-backdrop"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div
        id="settings-card"
        className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-t-3xl sm:rounded-3xl p-5 sm:p-7 shadow-2xl max-h-[92vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Soundbox & Driver Settings</h2>
              <p className="text-xs text-slate-400">Audio voice, UPI ID, and driver profile</p>
            </div>
          </div>
          <button
            id="btn-close-settings"
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Soundbox Voice Language */}
          <div className="p-3.5 bg-slate-950/70 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-cyan-400" />
                <span>Soundbox Voice Language</span>
              </label>
              <button
                type="button"
                onClick={handleTestSpeaker}
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{tested ? 'Speaking...' : 'Test Speaker 🔊'}</span>
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'hi', label: 'हिंदी (Hindi)', sample: 'पेटीएम पर 250 प्राप्त हुए' },
                { id: 'hinglish', label: 'Hinglish', sample: 'PhonePe pe 250 receive hue' },
                { id: 'en', label: 'English', sample: 'Received ₹250 on GPay' },
              ].map((lang) => (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, soundboxVoiceLang: lang.id as any })
                  }
                  className={`p-2.5 rounded-xl text-left border transition-all ${
                    formData.soundboxVoiceLang === lang.id
                      ? 'bg-emerald-600/20 border-emerald-500 text-white font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="text-xs block">{lang.label}</span>
                  <span className="text-[10px] text-slate-500 block truncate mt-0.5">
                    {lang.sample}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Soundbox Audio Controls */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Volume: {Math.round(formData.soundboxVolume * 100)}%
              </label>
              <input
                type="range"
                min="0.2"
                max="1.0"
                step="0.1"
                value={formData.soundboxVolume}
                onChange={(e) =>
                  setFormData({ ...formData, soundboxVolume: parseFloat(e.target.value) })
                }
                className="w-full accent-emerald-500"
              />
            </div>

            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Speech Speed: {formData.speechSpeed}x
              </label>
              <input
                type="range"
                min="0.8"
                max="1.2"
                step="0.1"
                value={formData.speechSpeed}
                onChange={(e) =>
                  setFormData({ ...formData, speechSpeed: parseFloat(e.target.value) })
                }
                className="w-full accent-emerald-500"
              />
            </div>
          </div>

          {/* Chime Bell Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <div>
              <span className="text-xs font-semibold text-slate-200 block">
                Paytm/PhonePe Bell Chime
              </span>
              <span className="text-[11px] text-slate-400">
                Play ding-dong melody before speaking amount
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.enableChime}
                onChange={(e) =>
                  setFormData({ ...formData, enableChime: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          {/* Driver Profile */}
          <div className="space-y-2.5 pt-1">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">
                Driver Name
              </label>
              <input
                type="text"
                value={formData.driverName}
                onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:border-emerald-500 outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Vehicle Number
                </label>
                <input
                  type="text"
                  value={formData.vehicleNumber}
                  onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:border-emerald-500 outline-none font-mono uppercase"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Daily Earnings Goal (₹)
                </label>
                <input
                  type="number"
                  value={formData.dailyTarget}
                  onChange={(e) =>
                    setFormData({ ...formData, dailyTarget: parseInt(e.target.value) || 2000 })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:border-emerald-500 outline-none font-mono"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">
                Your UPI ID (For passenger QR code)
              </label>
              <input
                type="text"
                value={formData.upiId}
                onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:border-emerald-500 outline-none font-mono"
                placeholder="e.g. driver@okhdfcbank"
              />
            </div>
          </div>

          {/* Reset Demo Data Button */}
          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                if (confirm('Reset to standard realistic cab driver records?')) {
                  onResetData();
                  onClose();
                }
              }}
              className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Demo Transactions</span>
            </button>
          </div>

          {/* Save */}
          <div className="pt-2">
            <button
              id="btn-save-settings"
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-transform active:scale-95"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Save Settings</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
