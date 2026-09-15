import { ParsedSmsResult, PaymentMethod } from '../types';

/**
 * Intelligent SMS Transaction Parser for Indian UPI & Bank SMS
 */
export function parseTransactionSms(rawText: string): ParsedSmsResult | null {
  if (!rawText || rawText.trim().length === 0) return null;

  const text = rawText.trim();
  const lower = text.toLowerCase();

  // 1. Detect if this is a credit transaction
  const isCredit = 
    lower.includes('received') ||
    lower.includes('credited') ||
    lower.includes('credit') ||
    lower.includes('deposit') ||
    lower.includes('prapt') ||
    lower.includes('recieved');

  if (!isCredit && !lower.includes('payment of') && !lower.includes('via upi')) {
    // Check if there is an amount at least
    if (!/rs\.?|inr|₹/i.test(text)) {
      return null;
    }
  }

  // 2. Extract Amount
  // Matches: Rs. 150.00, Rs 150, ₹250, INR 350.50, etc.
  const amountRegexes = [
    /(?:rs\.?|inr|₹)\s*([\d,]+(?:\.\d{1,2})?)/i,
    /(?:amount|received|credited|for)\s*(?:of)?\s*(?:rs\.?|inr|₹)?\s*([\d,]+(?:\.\d{1,2})?)/i,
    /([\d,]+(?:\.\d{1,2})?)\s*(?:rs\.?|inr|₹|rupees)/i,
  ];

  let amount = 0;
  for (const regex of amountRegexes) {
    const match = text.match(regex);
    if (match && match[1]) {
      const cleanNum = parseFloat(match[1].replace(/,/g, ''));
      if (!isNaN(cleanNum) && cleanNum > 0) {
        amount = cleanNum;
        break;
      }
    }
  }

  if (amount <= 0) return null;

  // 3. Detect Payment Method (Google Pay, PhonePe, Paytm, or Generic UPI)
  let method: PaymentMethod = 'other_upi';
  if (lower.includes('phonepe') || lower.includes('phone pe')) {
    method = 'phonepe';
  } else if (lower.includes('paytm') || lower.includes('pay tm') || lower.includes('pytm')) {
    method = 'paytm';
  } else if (lower.includes('google pay') || lower.includes('googlepay') || lower.includes('gpay') || lower.includes('g pay')) {
    method = 'gpay';
  } else {
    method = 'other_upi';
  }

  // 4. Extract Sender / Customer Name
  let senderName: string | undefined;
  const senderPatterns = [
    /from\s+([A-Za-z\s]+?)(?:\s+on|\s+via|\s+ref|\s+upi|\s+\.|\s+with|\(|$)/i,
    /by\s+([A-Za-z\s]+?)(?:\s+on|\s+via|\s+ref|\s+upi|\/|\s+\.|$)/i,
    /customer\s+([A-Za-z\s]+?)(?:\s+paid|\s+transferred|\s+\.|$)/i,
    /vpa\s+([A-Za-z0-9_.-]+@[A-Za-z0-9_.-]+)/i,
    /transfer\s+from\s+([A-Za-z\s]+)/i,
  ];

  for (const pattern of senderPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const candidate = match[1].trim();
      // Filter out words like 'UPI', 'A/c', 'Your', etc.
      if (candidate.length > 2 && !/^(upi|bank|ac|account|your|card|user|customer)$/i.test(candidate)) {
        senderName = candidate;
        break;
      }
    }
  }

  // 5. Extract Reference / UTR Number
  let refNumber: string | undefined;
  const refPatterns = [
    /(?:upi\s*ref(?:erence)?(?:\s*no)?\.?|utr(?:\s*no)?\.?|txn\s*id|ref\s*no\.?)\s*[:\s#]?\s*([A-Za-z0-9]{8,18})/i,
    /(?:via\s*upi|upi)[\/:\s]+([0-9]{10,14})/i,
    /rrn\s*[:\s#]?\s*([0-9]{10,14})/i,
  ];

  for (const pattern of refPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      refNumber = match[1].trim();
      break;
    }
  }

  return {
    amount,
    method,
    senderName,
    refNumber,
    confidence: 0.95,
    rawText: text,
  };
}

/**
 * Built-in sample SMS messages for testing and instant simulation
 */
export const SAMPLE_SMS_MESSAGES = [
  {
    title: 'Paytm QR Payment (₹180)',
    provider: 'paytm' as PaymentMethod,
    text: 'Payment of Rs 180.00 received on Paytm for QR code from VIKRAM MALHOTRA. Ref: 425891726354 on 15-09-2026.',
    expectedAmount: 180,
    sender: 'Vikram Malhotra',
  },
  {
    title: 'PhonePe QR Payment (₹250)',
    provider: 'phonepe' as PaymentMethod,
    text: 'Rs 250.00 credited to your A/C ...8921 via PhonePe from RAHUL SHARMA (UPI Ref No 425182901238).',
    expectedAmount: 250,
    sender: 'Rahul Sharma',
  },
  {
    title: 'Google Pay Received (₹340)',
    provider: 'gpay' as PaymentMethod,
    text: 'Google Pay: You have received ₹340.00 from PRIYA VERMA on UPI ID (Txn ID: 425980123719) for cab ride.',
    expectedAmount: 340,
    sender: 'Priya Verma',
  },
  {
    title: 'HDFC UPI Credit (₹520)',
    provider: 'other_upi' as PaymentMethod,
    text: 'Dear Customer, your HDFC Bank A/c XX4521 is credited with INR 520.00 on 15-Sep-26 by UPI from AMITABH JOSHI. Ref: 4259120934.',
    expectedAmount: 520,
    sender: 'Amitabh Joshi',
  },
  {
    title: 'SBI UPI Alert (₹210)',
    provider: 'other_upi' as PaymentMethod,
    text: 'Dear SBI User, A/C 9812 credited by INR 210.00 on 15Sep26 transfer from HARSHIT GUPTA Ref No 425983719201. Bal: Rs 14,520.',
    expectedAmount: 210,
    sender: 'Harshit Gupta',
  },
  {
    title: 'BharatPe Merchant QR (₹450)',
    provider: 'other_upi' as PaymentMethod,
    text: 'Payment of Rs 450 received via UPI on BharatPe QR from MOHIT AGARWAL. UTR 425918239012.',
    expectedAmount: 450,
    sender: 'Mohit Agarwal',
  },
];
