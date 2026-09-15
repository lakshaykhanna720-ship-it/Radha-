export type PaymentMethod = 'gpay' | 'phonepe' | 'paytm' | 'cash' | 'other_upi';

export type TransactionType = 'income' | 'expense';

export type ExpenseCategory = 
  | 'fuel_cng' 
  | 'commission' 
  | 'toll_parking' 
  | 'maintenance' 
  | 'food_chai' 
  | 'other';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  method: PaymentMethod;
  expenseCategory?: ExpenseCategory;
  senderName?: string;
  customerNote?: string;
  refNumber?: string;
  timestamp: string; // ISO string
  rawSms?: string;
}

export interface DriverSettings {
  driverName: string;
  vehicleNumber: string;
  upiId: string;
  soundboxVoiceLang: 'hi' | 'hinglish' | 'en';
  soundboxVolume: number; // 0.1 to 1.0
  speechSpeed: number; // 0.8 to 1.3
  enableChime: boolean;
  autoSpeakIncoming: boolean;
  dailyTarget: number;
}

export interface ParsedSmsResult {
  amount: number;
  method: PaymentMethod;
  senderName?: string;
  refNumber?: string;
  dateStr?: string;
  confidence: number;
  rawText: string;
}

export interface VoiceCommandResult {
  action: 'record_income' | 'record_expense' | 'speak_summary' | 'unknown';
  amount?: number;
  method?: PaymentMethod;
  expenseCategory?: ExpenseCategory;
  note?: string;
  transcript: string;
}

export interface DaySummary {
  date: string; // YYYY-MM-DD
  dayName: string;
  income: number;
  expenses: number;
  net: number;
  trips: number;
  cashIncome: number;
  upiIncome: number;
}

export interface WeeklySummary {
  weekLabel: string;
  startDate: string;
  endDate: string;
  totalIncome: number;
  totalExpenses: number;
  netEarnings: number;
  tripCount: number;
  cashIncome: number;
  upiIncome: number;
  gpayIncome: number;
  phonepeIncome: number;
  paytmIncome: number;
  expenseBreakdown: {
    fuel_cng: number;
    commission: number;
    toll_parking: number;
    maintenance: number;
    food_chai: number;
    other: number;
  };
  dailyData: DaySummary[];
}
