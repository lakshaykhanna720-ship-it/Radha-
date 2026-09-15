import React, { useState } from 'react';
import { Search, Filter, Trash2, Download, Volume2, ArrowDownRight, ArrowUpRight, Calendar } from 'lucide-react';
import { PaymentMethod, Transaction, DriverSettings } from '../types';
import { ProviderBadge } from './ProviderBadge';
import { announcePayment } from '../utils/audio';

interface Props {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
  settings: DriverSettings;
}

export const TransactionLedger: React.FC<Props> = ({
  transactions,
  onDeleteTransaction,
  settings,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'upi' | 'cash' | 'expense'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = transactions.filter((t) => {
    if (filterType === 'upi' && (t.type !== 'income' || t.method === 'cash')) return false;
    if (filterType === 'cash' && (t.type !== 'income' || t.method !== 'cash')) return false;
    if (filterType === 'expense' && t.type !== 'expense') return false;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchSender = t.senderName?.toLowerCase().includes(term);
      const matchNote = t.customerNote?.toLowerCase().includes(term);
      const matchRef = t.refNumber?.toLowerCase().includes(term);
      const matchMethod = t.method.toLowerCase().includes(term);
      const matchAmount = t.amount.toString().includes(term);
      return matchSender || matchNote || matchRef || matchMethod || matchAmount;
    }

    return true;
  });

  const handleReplayAnnouncement = (txn: Transaction) => {
    if (txn.type === 'income') {
      announcePayment({
        amount: txn.amount,
        method: txn.method,
        senderName: txn.senderName,
        lang: settings.soundboxVoiceLang,
        volume: settings.soundboxVolume,
        rate: settings.speechSpeed,
        playChime: settings.enableChime,
      });
    }
  };

  const handleExportCsv = () => {
    const headers = ['Date', 'Time', 'Type', 'Amount (INR)', 'Method/Category', 'Passenger/Vendor', 'Ref/UTR', 'Note'];
    const rows = transactions.map((t) => {
      const d = new Date(t.timestamp);
      return [
        d.toLocaleDateString('en-IN'),
        d.toLocaleTimeString('en-IN'),
        t.type,
        t.amount,
        t.type === 'income' ? t.method : t.expenseCategory || 'cost',
        t.senderName || '',
        t.refNumber || '',
        `"${(t.customerNote || '').replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `cab_earnings_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="transaction-ledger-container" className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="input-ledger-search"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search passenger, ride, amount, or UTR..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:border-emerald-500 outline-none"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All' },
            { id: 'upi', label: 'UPI (QR)' },
            { id: 'cash', label: 'Cash 💰' },
            { id: 'expense', label: 'Expenses ⛽' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                filterType === tab.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}

          <button
            onClick={handleExportCsv}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg text-xs font-medium border border-slate-700 flex items-center gap-1 ml-auto shrink-0"
            title="Export CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Transaction List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-800/80">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs sm:text-sm">
            No transactions match the selected filter.
          </div>
        ) : (
          filtered.map((txn) => {
            const isIncome = txn.type === 'income';
            const date = new Date(txn.timestamp);
            const timeStr = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
            const dateStr = date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });

            return (
              <div
                key={txn.id}
                className="p-3.5 sm:p-4 hover:bg-slate-850/40 transition-colors flex items-center gap-3 justify-between"
              >
                {/* Left icon & details */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                      isIncome
                        ? txn.method === 'cash'
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                          : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                    }`}
                  >
                    {isIncome ? (
                      <ArrowDownRight className="w-5 h-5" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-white truncate">
                        {isIncome ? txn.senderName || 'Passenger' : txn.customerNote || 'Expense'}
                      </span>
                      {isIncome ? (
                        <ProviderBadge method={txn.method} size="sm" />
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-950 border border-rose-800 text-rose-300 font-medium">
                          {txn.expenseCategory || 'Cost'}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span>{dateStr}, {timeStr}</span>
                      {txn.customerNote && isIncome && (
                        <>
                          <span>•</span>
                          <span className="truncate max-w-[180px] sm:max-w-xs">{txn.customerNote}</span>
                        </>
                      )}
                      {txn.refNumber && (
                        <>
                          <span>•</span>
                          <span className="font-mono text-slate-500 truncate">UTR: {txn.refNumber}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Amount & actions */}
                <div className="flex items-center gap-2.5 shrink-0">
                  <div className="text-right">
                    <div
                      className={`text-base sm:text-lg font-bold font-mono ${
                        isIncome ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isIncome ? '+' : '-'}₹{txn.amount.toLocaleString('en-IN')}
                    </div>
                  </div>

                  {isIncome && (
                    <button
                      onClick={() => handleReplayAnnouncement(txn)}
                      title="Speak Announcement"
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 transition-colors"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    onClick={() => {
                      if (confirm('Delete this record?')) {
                        onDeleteTransaction(txn.id);
                      }
                    }}
                    title="Delete"
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
