import { ExpenseCategory } from '../types';

/**
 * Audio Synthesizer & Soundbox Speech Engine for Cab Drivers
 */

// Web Audio API context for zero-latency, offline soundbox chimes
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Play authentic dual-tone / tri-tone Soundbox chime (Paytm / PhonePe style)
 */
export function playSoundboxChime(volume: number = 0.8): Promise<void> {
  return new Promise((resolve) => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;

      // Two-step harmonic chime (like Paytm Soundbox)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';

      // Chime progression: C5 -> E5 -> G5
      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc1.frequency.setValueAtTime(659.25, now + 0.12); // E5
      osc1.frequency.setValueAtTime(783.99, now + 0.24); // G5

      osc2.frequency.setValueAtTime(1046.50, now); // C6 octave sparkle
      osc2.frequency.setValueAtTime(1318.51, now + 0.12);
      osc2.frequency.setValueAtTime(1567.98, now + 0.24);

      gainNode.gain.setValueAtTime(0.01, now);
      gainNode.gain.linearRampToValueAtTime(volume * 0.4, now + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.6);
      osc2.stop(now + 0.6);

      setTimeout(resolve, 500);
    } catch {
      resolve();
    }
  });
}

/**
 * Play cash register / coin drop sound
 */
export function playCashChime(volume: number = 0.8): Promise<void> {
  return new Promise((resolve) => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, now); // B5
      osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6

      gainNode.gain.setValueAtTime(0.01, now);
      gainNode.gain.linearRampToValueAtTime(volume * 0.35, now + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);

      setTimeout(resolve, 300);
    } catch {
      resolve();
    }
  });
}

/**
 * Play descending warning chime for expenses/costs
 */
export function playExpenseChime(volume: number = 0.8): Promise<void> {
  return new Promise((resolve) => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'triangle';
      // Low descending two-tone: E4 (329.63Hz) -> C4 (261.63Hz)
      osc.frequency.setValueAtTime(329.63, now);
      osc.frequency.setValueAtTime(261.63, now + 0.12);

      gainNode.gain.setValueAtTime(0.01, now);
      gainNode.gain.linearRampToValueAtTime(volume * 0.35, now + 0.03);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.5);

      setTimeout(resolve, 350);
    } catch {
      resolve();
    }
  });
}

/**
 * Convert numbers into Hindi speech text for authentic soundbox announcements
 */
function numberToHindiWords(num: number): string {
  const units: Record<number, string> = {
    0: 'शून्य', 1: 'एक', 2: 'दो', 3: 'तीन', 4: 'चार', 5: 'पाँच', 6: 'छह', 7: 'सात', 8: 'आठ', 9: 'नौ',
    10: 'दस', 11: 'ग्यारह', 12: 'बारह', 13: 'तेरह', 14: 'चौदह', 15: 'पंद्रह', 16: 'सोलह', 17: 'सत्रह', 18: 'अठारह', 19: 'उन्नीस',
    20: 'बीस', 25: 'पच्चीस', 30: 'तीस', 40: 'चालीस', 50: 'पचास', 60: 'साठ', 70: 'सत्तर', 80: 'अस्सी', 90: 'नब्बे',
    100: 'एक सौ', 150: 'एक सौ पचास', 200: 'दो सौ', 250: 'दो सौ पचास', 300: 'तीन सौ', 400: 'चार सौ', 500: 'पाँच सौ',
    600: 'छह सौ', 700: 'सात सौ', 800: 'आठ सौ', 900: 'नौ सौ', 1000: 'एक हज़ार'
  };

  const rounded = Math.round(num);
  if (units[rounded]) return units[rounded];

  if (rounded < 100) {
    const tens = Math.floor(rounded / 10) * 10;
    const remainder = rounded % 10;
    return `${units[tens] || tens} ${units[remainder] || remainder}`;
  }

  if (rounded < 1000) {
    const hundreds = Math.floor(rounded / 100);
    const rem = rounded % 100;
    const hWord = hundreds === 1 ? 'एक सौ' : `${units[hundreds] || hundreds} सौ`;
    if (rem === 0) return hWord;
    return `${hWord} ${units[rem] || rem}`;
  }

  const thousands = Math.floor(rounded / 1000);
  const rem1000 = rounded % 1000;
  const tWord = thousands === 1 ? 'एक हज़ार' : `${units[thousands] || thousands} हज़ार`;
  if (rem1000 === 0) return tWord;
  return `${tWord} ${numberToHindiWords(rem1000)}`;
}

/**
 * Get provider vocal title
 */
function getProviderDisplayName(method: string): { hi: string; en: string } {
  switch (method) {
    case 'paytm':
      return { hi: 'पेटीएम', en: 'Paytm' };
    case 'phonepe':
      return { hi: 'फोन पे', en: 'PhonePe' };
    case 'gpay':
      return { hi: 'गूगल पे', en: 'Google Pay' };
    case 'cash':
      return { hi: 'नकद', en: 'Cash' };
    default:
      return { hi: 'यूपीआई', en: 'UPI' };
  }
}

/**
 * Announce payment on QR or Cash out loud (Soundbox feature)
 */
export async function announcePayment(options: {
  amount: number;
  method: 'paytm' | 'phonepe' | 'gpay' | 'cash' | 'other_upi';
  senderName?: string;
  lang?: 'hi' | 'hinglish' | 'en';
  volume?: number;
  rate?: number;
  playChime?: boolean;
}): Promise<void> {
  const {
    amount,
    method,
    senderName,
    lang = 'hi',
    volume = 1.0,
    rate = 1.0,
    playChime = true
  } = options;

  if (playChime) {
    if (method === 'cash') {
      await playCashChime(volume);
    } else {
      await playSoundboxChime(volume);
    }
  }

  if (!('speechSynthesis' in window)) {
    console.warn('SpeechSynthesis is not supported in this browser');
    return;
  }

  window.speechSynthesis.cancel(); // cancel any ongoing speech

  const provider = getProviderDisplayName(method);
  let textToSpeak = '';

  if (lang === 'hi') {
    const hindiAmt = numberToHindiWords(amount);
    if (method === 'cash') {
      textToSpeak = `${hindiAmt} रुपये नकद प्राप्त हुए।`;
    } else {
      textToSpeak = `${provider.hi} पर ${hindiAmt} रुपये प्राप्त हुए।`;
    }
  } else if (lang === 'hinglish') {
    if (method === 'cash') {
      textToSpeak = `Cash payment of ${amount} Rupees receive ho gaye hain!`;
    } else {
      textToSpeak = `${provider.en} pe ${amount} Rupees receive ho gaye hain!`;
    }
  } else {
    // English
    if (method === 'cash') {
      textToSpeak = `Received ${amount} Rupees in Cash${senderName ? ' from ' + senderName : ''}.`;
    } else {
      textToSpeak = `Received ${amount} Rupees on ${provider.en}${senderName ? ' from ' + senderName : ''}.`;
    }
  }

  const utterance = new SpeechSynthesisUtterance(textToSpeak);
  utterance.volume = Math.min(1.0, Math.max(0.1, volume));
  utterance.rate = Math.min(1.3, Math.max(0.7, rate));
  utterance.pitch = 1.0;

  // Pick suitable voice
  const voices = window.speechSynthesis.getVoices();
  if (lang === 'hi') {
    const hiVoice = voices.find(v => v.lang.startsWith('hi') || v.name.includes('Hindi') || v.lang.includes('hi_IN'));
    if (hiVoice) {
      utterance.voice = hiVoice;
      utterance.lang = 'hi-IN';
    } else {
      const inVoice = voices.find(v => v.lang.includes('en-IN') || v.lang.includes('en_IN'));
      if (inVoice) utterance.voice = inVoice;
      utterance.lang = 'hi-IN';
    }
  } else {
    const inVoice = voices.find(v => v.lang.includes('en-IN') || v.lang.includes('en_IN'));
    if (inVoice) {
      utterance.voice = inVoice;
      utterance.lang = 'en-IN';
    } else {
      utterance.lang = 'en-US';
    }
  }

  window.speechSynthesis.speak(utterance);
}

/**
 * Announce operating expense / cost (CNG, Fuel, Toll, Chai)
 */
export async function announceExpense(options: {
  amount: number;
  category?: ExpenseCategory;
  expenseCategory?: ExpenseCategory;
  note?: string;
  lang?: 'hi' | 'hinglish' | 'en';
  volume?: number;
  rate?: number;
  playChime?: boolean;
}): Promise<void> {
  const {
    amount,
    lang = 'hi',
    volume = 1.0,
    rate = 1.0,
    playChime = true,
  } = options;
  const category: ExpenseCategory = options.category || options.expenseCategory || 'fuel_cng';

  if (playChime) {
    await playExpenseChime(volume);
  }

  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();

  const categoryNames: Record<ExpenseCategory, { hi: string; en: string }> = {
    fuel_cng: { hi: 'सीएनजी और ईंधन', en: 'CNG and Fuel' },
    commission: { hi: 'कमीशन कट', en: 'Platform Commission' },
    toll_parking: { hi: 'टोल और पार्किंग', en: 'Toll' },
    food_chai: { hi: 'चाय और नाश्ता', en: 'Food and Chai' },
    maintenance: { hi: 'मरम्मत और पंचर', en: 'Maintenance' },
    other: { hi: 'खर्चा', en: 'Cost' },
  };

  const catName = categoryNames[category] || { hi: 'खर्चा', en: 'Cost' };
  let textToSpeak = '';

  if (lang === 'hi') {
    const hindiAmt = numberToHindiWords(amount);
    if (category === 'fuel_cng') {
      textToSpeak = `सीएनजी का खर्चा ${hindiAmt} रुपये दर्ज किया गया। मुनाफे से काट दिया गया है।`;
    } else {
      textToSpeak = `${catName.hi} का खर्चा ${hindiAmt} रुपये दर्ज किया गया। मुनाफे से काट दिया गया है।`;
    }
  } else if (lang === 'hinglish') {
    if (category === 'fuel_cng') {
      textToSpeak = `CNG cost of ${amount} Rupees deduct ho gaya hai.`;
    } else {
      textToSpeak = `${catName.en} cost of ${amount} Rupees deduct ho gaya hai.`;
    }
  } else {
    if (category === 'fuel_cng') {
      textToSpeak = `Recorded CNG expense of ${amount} Rupees. Deducted from profits.`;
    } else {
      textToSpeak = `Recorded ${catName.en} expense of ${amount} Rupees. Deducted from earnings.`;
    }
  }

  const utterance = new SpeechSynthesisUtterance(textToSpeak);
  utterance.volume = Math.min(1.0, Math.max(0.1, volume));
  utterance.rate = Math.min(1.3, Math.max(0.7, rate));

  const voices = window.speechSynthesis.getVoices();
  if (lang === 'hi') {
    const hiVoice = voices.find(v => v.lang.startsWith('hi') || v.name.includes('Hindi') || v.lang.includes('hi_IN'));
    if (hiVoice) {
      utterance.voice = hiVoice;
      utterance.lang = 'hi-IN';
    } else {
      const inVoice = voices.find(v => v.lang.includes('en-IN') || v.lang.includes('en_IN'));
      if (inVoice) utterance.voice = inVoice;
      utterance.lang = 'hi-IN';
    }
  } else {
    const inVoice = voices.find(v => v.lang.includes('en-IN') || v.lang.includes('en_IN'));
    if (inVoice) {
      utterance.voice = inVoice;
      utterance.lang = 'en-IN';
    } else {
      utterance.lang = 'en-US';
    }
  }

  window.speechSynthesis.speak(utterance);
}

/**
 * Mode which says details aloud (Drive Mode detail announcer)
 */
export function speakDailySummary(data: {
  tripCount: number;
  grossIncome: number;
  totalExpenses: number;
  netProfit: number;
  lang?: 'hi' | 'hinglish' | 'en';
  driverName?: string;
  volume?: number;
}): void {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();

  const {
    tripCount,
    grossIncome,
    totalExpenses,
    netProfit,
    lang = 'hi',
    driverName,
    volume = 1.0,
  } = data;

  const greeting = driverName ? `${driverName} जी` : 'ड्राइवर साब';

  let text = '';
  if (lang === 'hi') {
    text = `${greeting}, आज आपने ${tripCount} राइड्स पूरी की हैं। कुल कमाई ${grossIncome} रुपये, खर्चे ${totalExpenses} रुपये। आपका शुद्ध मुनाफ़ा ${netProfit} रुपये है।`;
  } else if (lang === 'hinglish') {
    text = `Hello Driver Saab! Today total ${tripCount} rides completed. Gross earnings: ${grossIncome} Rupees. Total fuel and costs: ${totalExpenses} Rupees. Net profit in hand: ${netProfit} Rupees!`;
  } else {
    text = `Today's Summary: ${tripCount} trips completed. Total earnings: ${grossIncome} Rupees. Expenses: ${totalExpenses} Rupees. Net profit: ${netProfit} Rupees. Safe driving!`;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.volume = volume;
  utterance.rate = 0.95;

  const voices = window.speechSynthesis.getVoices();
  const hiVoice = voices.find(v => v.lang.startsWith('hi') || v.name.includes('Hindi'));
  const inVoice = voices.find(v => v.lang.includes('en-IN') || v.lang.includes('en_IN'));

  if (lang === 'hi' && hiVoice) {
    utterance.voice = hiVoice;
    utterance.lang = 'hi-IN';
  } else if (inVoice) {
    utterance.voice = inVoice;
    utterance.lang = 'en-IN';
  }

  window.speechSynthesis.speak(utterance);
}

/**
 * Speak weekly net earnings summary
 */
export function speakWeeklySummaryAloud(data: {
  tripCount: number;
  grossIncome: number;
  totalExpenses: number;
  netEarnings: number;
  profitMarginPercent: number;
  lang?: 'hi' | 'hinglish' | 'en';
  volume?: number;
}): void {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();

  const {
    tripCount,
    grossIncome,
    totalExpenses,
    netEarnings,
    profitMarginPercent,
    lang = 'hi',
    volume = 1.0,
  } = data;

  let text = '';
  if (lang === 'hi') {
    text = `इस हफ़्ते की रिपोर्ट: कुल ${tripCount} ट्रिप्स। कुल कमाई ${grossIncome} रुपये। सभी खर्चे काटकर आपकी कुल बचत ${netEarnings} रुपये रही। आपका लाभ प्रतिशत ${profitMarginPercent} प्रतिशत है।`;
  } else if (lang === 'hinglish') {
    text = `Weekly Summary: Total ${tripCount} trips. Gross earning ${grossIncome} Rupees. Deleting all costs, your net savings is ${netEarnings} Rupees. Profit margin is ${profitMarginPercent} percent.`;
  } else {
    text = `Weekly Report: ${tripCount} trips. Total earnings: ${grossIncome} Rupees. Net profit after expenses: ${netEarnings} Rupees. Profit margin: ${profitMarginPercent} percent.`;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.volume = volume;
  utterance.rate = 0.95;
  window.speechSynthesis.speak(utterance);
}
