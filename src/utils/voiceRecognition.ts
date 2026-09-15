import { ExpenseCategory, PaymentMethod, VoiceCommandResult } from '../types';

// SpeechRecognition type declarations for browsers
interface IWindow extends Window {
  webkitSpeechRecognition?: any;
  SpeechRecognition?: any;
}

// Hindi & English number words map (Latin & Devanagari)
const NUMBER_WORDS: Record<string, number> = {
  // English
  'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5, 'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
  'twenty': 20, 'twentyfive': 25, 'thirty': 30, 'forty': 40, 'fifty': 50, 'sixty': 60, 'seventy': 70, 'eighty': 80, 'ninety': 90,
  'hundred': 100, 'thousand': 1000,
  // Hindi transliteration
  'ek': 1, 'do': 2, 'teen': 3, 'char': 4, 'chaar': 4, 'paanch': 5, 'panch': 5, 'chhah': 6, 'che': 6, 'chhe': 6,
  'saat': 7, 'aath': 8, 'nau': 9, 'das': 10, 'gyarah': 11, 'barah': 12, 'terah': 13, 'chaudah': 14,
  'pandrah': 15, 'solah': 16, 'satrah': 17, 'atharah': 18, 'unnis': 19, 'bees': 20,
  'pachees': 25, 'pachis': 25, 'tees': 30, 'chaalis': 40, 'chalis': 40, 'pachaas': 50, 'pachas': 50,
  'saath': 60, 'sath': 60, 'sattar': 70, 'assi': 80, 'nabbe': 90,
  'sau': 100, 'so': 100, 'hazaar': 1000, 'hazar': 1000,
  // Devanagari
  'एक': 1, 'दो': 2, 'तीन': 3, 'चार': 4, 'पाँच': 5, 'पांच': 5, 'छह': 6, 'छे': 6,
  'सात': 7, 'आठ': 8, 'नौ': 9, 'दस': 10, 'ग्यारह': 11, 'बारह': 12,
  'बीस': 20, 'पच्चीस': 25, 'तीस': 30, 'चालीस': 40, 'पचास': 50,
  'साठ': 60, 'सत्तर': 70, 'अस्सी': 80, 'नब्बे': 90,
  'सौ': 100, 'हज़ार': 1000, 'हजार': 1000,
};

/**
 * Extract numerical amount from transcript (handles digits, Devanagari digits, and spoken words)
 */
export function extractAmountFromText(text: string): number | null {
  if (!text) return null;

  // 1. Convert Devanagari digits (०-९) to ASCII 0-9
  const devanagariDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  let normalized = text;
  devanagariDigits.forEach((digit, i) => {
    normalized = normalized.replaceAll(digit, String(i));
  });

  // 2. Look for amounts directly associated with currency/fuel:
  // e.g. "cng 500", "500 cng", "500 rs", "₹500", "cng 4 kg 360 rs"
  // If the user says "4 kg cng 350 rs", avoid returning 4 (which is kg)
  const kgNumberMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(?:kg|kilo|litre|liter)/i);
  const kgNumber = kgNumberMatch ? parseFloat(kgNumberMatch[1]) : null;

  // Find all number matches
  const digitMatches = [...normalized.matchAll(/(?:rs\.?|inr|₹)?\s*(\d+(?:\.\d{1,2})?)/gi)];
  for (const match of digitMatches) {
    const val = parseFloat(match[1]);
    if (!isNaN(val) && val > 0) {
      // If this matches the kg amount and there is another number in the text, prefer the other number
      if (kgNumber && val === kgNumber && digitMatches.length > 1) {
        continue;
      }
      return val;
    }
  }

  // 3. Parse spoken Hindi/English words e.g. "paanch sau" (500), "दो सौ पचास" (250)
  const cleanTokens = normalized
    .toLowerCase()
    .replace(/[^\w\s\u0900-\u097F]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  let total = 0;
  let current = 0;

  for (const w of cleanTokens) {
    // Check specific compounds like "डेढ़" (1.5 hundred = 150) or "ढाई" (2.5 hundred = 250)
    if (w === 'dedh' || w === 'डेढ़') {
      current = 150;
      continue;
    }
    if (w === 'dhai' || w === 'ढाई') {
      current = 250;
      continue;
    }

    const num = NUMBER_WORDS[w];
    if (num !== undefined) {
      if (num === 100) {
        current = (current === 0 ? 1 : current) * 100;
      } else if (num === 1000) {
        current = (current === 0 ? 1 : current) * 1000;
        total += current;
        current = 0;
      } else {
        current += num;
      }
    }
  }
  total += current;

  return total > 0 ? total : null;
}

/**
 * Detect if spoken command represents an operating cost/expense (CNG, Petrol, Toll, etc.)
 */
export function detectExpenseCategory(transcript: string): ExpenseCategory | null {
  const lower = transcript.toLowerCase();

  // Normalize single letters and spaces: e.g. "c n g" -> "cng", "c . n . g ." -> "cng"
  const collapsed = lower.replace(/\./g, '').replace(/\s+/g, ' ');
  const lettersOnly = lower.replace(/[^a-z0-9\u0900-\u097F]/g, '');

  // 1. Fuel / CNG / Petrol / Diesel / Gas
  const isCng =
    /\b(c\s*\.?\s*n\s*\.?\s*g|cng|c-n-g|see\s*n\s*g|see\s*en\s*jee|c\s*and\s*g|c&g)\b/i.test(lower) ||
    collapsed.includes('c n g') ||
    collapsed.includes('cng') ||
    lettersOnly.includes('cng') ||
    lower.includes('सीएनजी') ||
    lower.includes('सी एन जी') ||
    lower.includes('सी.एन.जी') ||
    lower.includes('सीएनजि');

  const isOtherFuel =
    /\b(petrol|patrol|diesel|dezil|fuel|gas|tel|tail)\b/i.test(lower) ||
    lower.includes('पेट्रोल') ||
    lower.includes('डीजल') ||
    lower.includes('डीज़ल') ||
    lower.includes('गैस') ||
    lower.includes('ईंधन') ||
    lower.includes('तेल');

  if (isCng || isOtherFuel) {
    return 'fuel_cng';
  }

  // 2. Toll / Parking / Fastag
  if (
    /\b(toll|fastag|fast\s*tag|fas\s*tag|fashtag|mcd|parking)\b/i.test(lower) ||
    lower.includes('टोल') ||
    lower.includes('फास्टैग') ||
    lower.includes('फास्ट टैग') ||
    lower.includes('पार्किंग')
  ) {
    return 'toll_parking';
  }

  // 3. Platform Cut / Commission (Uber, Ola, Rapido)
  if (
    /\b(commission|kamishan|uber\s*cut|ola\s*cut|rapido\s*cut|cut|platform)\b/i.test(lower) ||
    lower.includes('कमीशन') ||
    lower.includes('कट गया')
  ) {
    return 'commission';
  }

  // 4. Food / Chai / Nashta
  if (
    /\b(chai|tea|khana|lunch|dinner|nashta|naashta|biscuit|pani)\b/i.test(lower) ||
    lower.includes('चाय') ||
    lower.includes('खाना') ||
    lower.includes('नाश्ता')
  ) {
    return 'food_chai';
  }

  // 5. Maintenance / Puncture / Wash / Air
  if (
    /\b(puncture|panchar|pancher|service|wash|washing|hawa|repair|mechanic|mistri)\b/i.test(lower) ||
    lower.includes('पंचर') ||
    lower.includes('सर्विस') ||
    lower.includes('हवा') ||
    lower.includes('धुलाई') ||
    lower.includes('मरम्मत')
  ) {
    return 'maintenance';
  }

  // 6. Generic Cost & Spending words in Hindi / English
  if (
    /\b(kharcha|kharch|karcha|karch|expense|cost|spent|spend)\b/i.test(lower) ||
    lower.includes('खर्चा') ||
    lower.includes('खर्च') ||
    lower.includes('लागत') ||
    lower.includes('de diya') ||
    lower.includes('diya') ||
    lower.includes('bharwaya') ||
    lower.includes('dalwaya')
  ) {
    return 'other';
  }

  return null;
}

/**
 * Parse spoken driver command
 */
export function parseVoiceCommand(transcript: string): VoiceCommandResult {
  const lower = transcript.toLowerCase();

  // 1. Check for spoken summary / details request
  if (
    lower.includes('kitna kamaya') ||
    lower.includes('summary') ||
    lower.includes('details') ||
    lower.includes('total earning') ||
    lower.includes('today earnings') ||
    lower.includes('aaj kitna') ||
    lower.includes('hisab') ||
    lower.includes('report') ||
    lower.includes('मुनाफा') ||
    lower.includes('हिसाब')
  ) {
    return {
      action: 'speak_summary',
      transcript,
    };
  }

  // 2. First check if it is an EXPENSE / COST (CNG, Fuel, Toll, Chai, etc.)
  // CRITICAL: Must be checked BEFORE income, so that costs are NEVER added as income!
  const expenseCat = detectExpenseCategory(transcript);
  const amount = extractAmountFromText(transcript);

  if (expenseCat) {
    return {
      action: 'record_expense',
      amount: amount || undefined,
      expenseCategory: expenseCat,
      note: transcript,
      transcript,
    };
  }

  // 3. Check for Income / Fare Payments
  let method: PaymentMethod = 'cash'; // default driver offline payment is Cash
  let isExplicitIncome = false;

  if (lower.includes('phonepe') || lower.includes('phone pe') || lower.includes('फोन पे')) {
    method = 'phonepe';
    isExplicitIncome = true;
  } else if (lower.includes('paytm') || lower.includes('pay tm') || lower.includes('पेटीएम')) {
    method = 'paytm';
    isExplicitIncome = true;
  } else if (lower.includes('gpay') || lower.includes('google pay') || lower.includes('googlepay') || lower.includes('गूगल पे')) {
    method = 'gpay';
    isExplicitIncome = true;
  } else if (
    lower.includes('cash') ||
    lower.includes('nakad') ||
    lower.includes('nagad') ||
    lower.includes('haath me') ||
    lower.includes('offline') ||
    lower.includes('नकद') ||
    lower.includes('किराया') ||
    lower.includes('kiraya') ||
    lower.includes('fare') ||
    lower.includes('ride') ||
    lower.includes('passenger') ||
    lower.includes('sawari')
  ) {
    method = 'cash';
    isExplicitIncome = true;
  } else if (lower.includes('upi') || lower.includes('online')) {
    method = 'other_upi';
    isExplicitIncome = true;
  }

  if (amount) {
    return {
      action: 'record_income',
      amount,
      method,
      note: transcript,
      transcript,
    };
  }

  return {
    action: 'unknown',
    transcript,
  };
}

/**
 * Create Speech Recognition instance (offline capable in modern Chromium/Android)
 */
export function createSpeechRecognizer(
  onResult: (transcript: string, isFinal: boolean) => void,
  onError: (error: string) => void,
  onEnd: () => void,
  lang: string = 'en-IN'
) {
  const win = window as unknown as IWindow;
  const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    onError('Browser does not support SpeechRecognition');
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = lang; // 'en-IN' or 'hi-IN'

  recognition.onresult = (event: any) => {
    let interim = '';
    let final = '';

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        final += event.results[i][0].transcript;
      } else {
        interim += event.results[i][0].transcript;
      }
    }

    if (final.length > 0) {
      onResult(final.trim(), true);
    } else if (interim.length > 0) {
      onResult(interim.trim(), false);
    }
  };

  recognition.onerror = (event: any) => {
    onError(event.error || 'Speech error');
  };

  recognition.onend = () => {
    onEnd();
  };

  return recognition;
}
