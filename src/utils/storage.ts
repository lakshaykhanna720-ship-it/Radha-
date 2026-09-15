import { DriverSettings, Transaction, WeeklySummary, DaySummary } from '../types';

const STORAGE_KEY_TXNS = 'cab_soundbox_transactions_v1';
const STORAGE_KEY_SETTINGS = 'cab_soundbox_settings_v1';

export const DEFAULT_SETTINGS: DriverSettings = {
  driverName: 'Rajesh Kumar',
  vehicleNumber: 'DL 01 TA 4921',
  upiId: 'rajesh.cab@okaxis',
  soundboxVoiceLang: 'hi', // default to Hindi like physical Paytm/PhonePe soundboxes
  soundboxVolume: 1.0,
  speechSpeed: 1.0,
  enableChime: true,
  autoSpeakIncoming: true,
  dailyTarget: 2500,
};

export const INITIAL_SEED_TRANSACTIONS: Transaction[] = [
  // Today's trips
  {
    id: 'txn-101',
    type: 'income',
    amount: 280,
    method: 'phonepe',
    senderName: 'Suraj Singh',
    customerNote: 'CP to Noida Sec 62',
    refNumber: '425182901238',
    timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    rawSms: 'Rs 280.00 credited to your A/C via PhonePe from SURAJ SINGH',
  },
  {
    id: 'txn-102',
    type: 'income',
    amount: 150,
    method: 'cash',
    senderName: 'Street Passenger',
    customerNote: 'Lajpat Nagar hail (Cash 💰)',
    timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
  },
  {
    id: 'txn-103',
    type: 'expense',
    amount: 550,
    method: 'cash',
    expenseCategory: 'fuel_cng',
    customerNote: 'Morning CNG Refill (10.2 kg)',
    timestamp: new Date(Date.now() - 140 * 60 * 1000).toISOString(),
  },
  {
    id: 'txn-104',
    type: 'income',
    amount: 350,
    method: 'gpay',
    senderName: 'Priya Verma',
    customerNote: 'Airport T3 Drop',
    refNumber: '425980123719',
    timestamp: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
    rawSms: 'Google Pay: You have received ₹350.00 from PRIYA VERMA',
  },
  {
    id: 'txn-105',
    type: 'expense',
    amount: 90,
    method: 'cash',
    expenseCategory: 'toll_parking',
    customerNote: 'Airport Toll Plaza',
    timestamp: new Date(Date.now() - 195 * 60 * 1000).toISOString(),
  },
  {
    id: 'txn-106',
    type: 'income',
    amount: 180,
    method: 'paytm',
    senderName: 'Vikram Malhotra',
    customerNote: 'Cyber City Gurugram',
    refNumber: '425891726354',
    timestamp: new Date(Date.now() - 250 * 60 * 1000).toISOString(),
    rawSms: 'Payment of Rs 180.00 received on Paytm for QR code from VIKRAM MALHOTRA',
  },
  {
    id: 'txn-107',
    type: 'expense',
    amount: 30,
    method: 'cash',
    expenseCategory: 'food_chai',
    customerNote: 'Morning Chai & Biscuit',
    timestamp: new Date(Date.now() - 280 * 60 * 1000).toISOString(),
  },

  // Past days in the current week (for weekly summary)
  // Yesterday (Day -1)
  {
    id: 'txn-091',
    type: 'income',
    amount: 1850,
    method: 'phonepe',
    customerNote: 'Yesterday rides (UPI Total)',
    timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'txn-092',
    type: 'income',
    amount: 600,
    method: 'cash',
    customerNote: 'Yesterday rides (Cash Total)',
    timestamp: new Date(Date.now() - 24 * 3600 * 1000 + 3600 * 1000).toISOString(),
  },
  {
    id: 'txn-093',
    type: 'expense',
    amount: 620,
    method: 'cash',
    expenseCategory: 'fuel_cng',
    customerNote: 'CNG gas cylinder fill',
    timestamp: new Date(Date.now() - 24 * 3600 * 1000 + 7200 * 1000).toISOString(),
  },
  {
    id: 'txn-094',
    type: 'expense',
    amount: 280,
    method: 'other_upi',
    expenseCategory: 'commission',
    customerNote: 'Uber platform deduction',
    timestamp: new Date(Date.now() - 24 * 3600 * 1000 + 10800 * 1000).toISOString(),
  },

  // 2 days ago (Day -2)
  {
    id: 'txn-081',
    type: 'income',
    amount: 2200,
    method: 'gpay',
    customerNote: 'Day -2 Rides (GPay/Paytm)',
    timestamp: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'txn-082',
    type: 'income',
    amount: 750,
    method: 'cash',
    customerNote: 'Day -2 Cash Rides',
    timestamp: new Date(Date.now() - 2 * 24 * 3600 * 1000 + 3600 * 1000).toISOString(),
  },
  {
    id: 'txn-083',
    type: 'expense',
    amount: 650,
    method: 'cash',
    expenseCategory: 'fuel_cng',
    customerNote: 'CNG refill',
    timestamp: new Date(Date.now() - 2 * 24 * 3600 * 1000 + 7200 * 1000).toISOString(),
  },
  {
    id: 'txn-084',
    type: 'expense',
    amount: 150,
    method: 'cash',
    expenseCategory: 'maintenance',
    customerNote: 'Tyre puncture & air topup',
    timestamp: new Date(Date.now() - 2 * 24 * 3600 * 1000 + 12000 * 1000).toISOString(),
  },

  // 3 days ago (Day -3)
  {
    id: 'txn-071',
    type: 'income',
    amount: 2450,
    method: 'paytm',
    customerNote: 'Day -3 Rides',
    timestamp: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'txn-072',
    type: 'expense',
    amount: 580,
    method: 'cash',
    expenseCategory: 'fuel_cng',
    customerNote: 'CNG gas',
    timestamp: new Date(Date.now() - 3 * 24 * 3600 * 1000 + 7200 * 1000).toISOString(),
  },

  // 4 days ago (Day -4)
  {
    id: 'txn-061',
    type: 'income',
    amount: 2800,
    method: 'phonepe',
    customerNote: 'Day -4 Rides',
    timestamp: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'txn-062',
    type: 'expense',
    amount: 700,
    method: 'cash',
    expenseCategory: 'fuel_cng',
    customerNote: 'CNG fill',
    timestamp: new Date(Date.now() - 4 * 24 * 3600 * 1000 + 7200 * 1000).toISOString(),
  },
  {
    id: 'txn-063',
    type: 'expense',
    amount: 320,
    method: 'other_upi',
    expenseCategory: 'commission',
    customerNote: 'Ola commission payout',
    timestamp: new Date(Date.now() - 4 * 24 * 3600 * 1000 + 11000 * 1000).toISOString(),
  },

  // 5 days ago (Day -5)
  {
    id: 'txn-051',
    type: 'income',
    amount: 2100,
    method: 'gpay',
    customerNote: 'Day -5 Rides',
    timestamp: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'txn-052',
    type: 'expense',
    amount: 600,
    method: 'cash',
    expenseCategory: 'fuel_cng',
    customerNote: 'CNG refill',
    timestamp: new Date(Date.now() - 5 * 24 * 3600 * 1000 + 7200 * 1000).toISOString(),
  },
];

export function loadTransactions(): Transaction[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_TXNS);
    if (data) {
      const parsed: Transaction[] = JSON.parse(data);
      if (Array.isArray(parsed)) {
        // Auto-heal: Ensure any transaction that contains CNG / Fuel / Toll / Expense in its note or sender is properly marked as expense
        const sanitized = parsed.map((t) => {
          if (t.type === 'income') {
            const noteLower = (t.customerNote || '').toLowerCase();
            const senderLower = (t.senderName || '').toLowerCase();
            const isFuelOrCng =
              /\b(c\s*\.?\s*n\s*\.?\s*g|cng|c-n-g|gas|petrol|diesel|fuel|तेल)\b/i.test(noteLower) ||
              noteLower.includes('cng') ||
              noteLower.includes('c n g') ||
              noteLower.includes('सीएनजी') ||
              senderLower.includes('cng') ||
              senderLower.includes('c n g');

            const isToll = /\b(toll|fastag|parking)\b/i.test(noteLower) || noteLower.includes('टोल');
            const isChai = /\b(chai|tea|khana|nashta)\b/i.test(noteLower) || noteLower.includes('चाय');
            const isPuncture = /\b(puncture|repair|service)\b/i.test(noteLower) || noteLower.includes('पंचर');

            if (isFuelOrCng) {
              return {
                ...t,
                type: 'expense' as const,
                expenseCategory: 'fuel_cng' as const,
                senderName: undefined,
              };
            }
            if (isToll) {
              return {
                ...t,
                type: 'expense' as const,
                expenseCategory: 'toll_parking' as const,
                senderName: undefined,
              };
            }
            if (isChai) {
              return {
                ...t,
                type: 'expense' as const,
                expenseCategory: 'food_chai' as const,
                senderName: undefined,
              };
            }
            if (isPuncture) {
              return {
                ...t,
                type: 'expense' as const,
                expenseCategory: 'maintenance' as const,
                senderName: undefined,
              };
            }
          }
          return t;
        });

        // If changes were made, persist sanitized list
        if (JSON.stringify(sanitized) !== data) {
          saveTransactions(sanitized);
        }
        return sanitized;
      }
    }
  } catch (e) {
    console.error('Failed to load transactions', e);
  }
  saveTransactions(INITIAL_SEED_TRANSACTIONS);
  return INITIAL_SEED_TRANSACTIONS;
}

export function saveTransactions(txns: Transaction[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_TXNS, JSON.stringify(txns));
  } catch (e) {
    console.error('Failed to save transactions', e);
  }
}

export function loadSettings(): DriverSettings {
  try {
    const data = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (data) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    }
  } catch (e) {
    console.error('Failed to load settings', e);
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: DriverSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
}

/**
 * Calculate weekly summary with all revenue sources minus operating costs
 */
export function calculateWeeklySummary(transactions: Transaction[], referenceDate: Date = new Date()): WeeklySummary {
  // Compute past 7 days (including today)
  const days: DaySummary[] = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(referenceDate);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = dayNames[d.getDay()];

    days.push({
      date: dateStr,
      dayName,
      income: 0,
      expenses: 0,
      net: 0,
      trips: 0,
      cashIncome: 0,
      upiIncome: 0,
    });
  }

  const startDateStr = days[0].date;
  const endDateStr = days[days.length - 1].date;

  let totalIncome = 0;
  let totalExpenses = 0;
  let tripCount = 0;
  let cashIncome = 0;
  let upiIncome = 0;
  let gpayIncome = 0;
  let phonepeIncome = 0;
  let paytmIncome = 0;

  const expenseBreakdown = {
    fuel_cng: 0,
    commission: 0,
    toll_parking: 0,
    maintenance: 0,
    food_chai: 0,
    other: 0,
  };

  for (const t of transactions) {
    const tDate = t.timestamp.split('T')[0];
    const dayObj = days.find(d => d.date === tDate);

    if (tDate >= startDateStr && tDate <= endDateStr) {
      if (t.type === 'income') {
        totalIncome += t.amount;
        tripCount += 1;

        if (t.method === 'cash') {
          cashIncome += t.amount;
          if (dayObj) dayObj.cashIncome += t.amount;
        } else {
          upiIncome += t.amount;
          if (dayObj) dayObj.upiIncome += t.amount;

          if (t.method === 'gpay') gpayIncome += t.amount;
          else if (t.method === 'phonepe') phonepeIncome += t.amount;
          else if (t.method === 'paytm') paytmIncome += t.amount;
        }

        if (dayObj) {
          dayObj.income += t.amount;
          dayObj.trips += 1;
        }
      } else if (t.type === 'expense') {
        totalExpenses += t.amount;
        const cat = t.expenseCategory || 'other';
        expenseBreakdown[cat] = (expenseBreakdown[cat] || 0) + t.amount;

        if (dayObj) {
          dayObj.expenses += t.amount;
        }
      }
    }
  }

  // Update net in daily objects
  for (const d of days) {
    d.net = d.income - d.expenses;
  }

  const netEarnings = totalIncome - totalExpenses;

  const startFormatted = new Date(startDateStr).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  const endFormatted = new Date(endDateStr).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });

  return {
    weekLabel: `${startFormatted} – ${endFormatted}`,
    startDate: startDateStr,
    endDate: endDateStr,
    totalIncome,
    totalExpenses,
    netEarnings,
    tripCount,
    cashIncome,
    upiIncome,
    gpayIncome,
    phonepeIncome,
    paytmIncome,
    expenseBreakdown,
    dailyData: days,
  };
}
