export const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api/v1';

export const SUBSCRIPTION_PLANS = {
  free: { label: 'Free', price: 0, color: 'text-slate-500', badge: 'bg-muted' },
  silver: { label: 'Silver', price: 999, color: 'text-slate-500', badge: 'bg-slate-100' },
  gold: { label: 'Gold', price: 1999, color: 'text-gold-600', badge: 'bg-gold-50' },
  platinum: { label: 'Platinum', price: 3499, color: 'text-sky-600', badge: 'bg-sky-50' },
  elite: { label: 'Elite', price: 5999, color: 'text-violet-600', badge: 'bg-violet-50' },
  vip_assisted: { label: 'VIP Assisted', price: 9999, color: 'text-brand-700', badge: 'bg-brand-50' },
} as const;

export const PLAN_DURATIONS = [
  { days: 30, label: '1 Month', discount: 0 },
  { days: 90, label: '3 Months', discount: 15 },
  { days: 180, label: '6 Months', discount: 25 },
  { days: 365, label: '1 Year', discount: 35 },
] as const;

export const RELIGIONS = ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Jain', 'Buddhist', 'Parsi', 'Jewish', 'Other', 'No Religion'];

export const RASI_LIST = [
  'Mesha', 'Vrishabha', 'Mithuna', 'Kataka', 'Simha', 'Kanya',
  'Tula', 'Vrishchika', 'Dhanus', 'Makara', 'Kumbha', 'Meena',
];

export const NAKSHATRA_LIST = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
  'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishtha', 'Shatabhisha',
  'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati',
];

export const EDUCATION_LEVELS = [
  'School', 'Diploma', 'Degree', 'Masters', 'PhD', 'MBBS', 'CA', 'CS', 'Engineer', 'MBA', 'Other',
];

export const EMPLOYMENT_TYPES = [
  { value: 'employed_private', label: 'Employed (Private)' },
  { value: 'employed_government', label: 'Employed (Government)' },
  { value: 'self_employed', label: 'Self Employed' },
  { value: 'business', label: 'Business' },
  { value: 'not_working', label: 'Not Working' },
  { value: 'student', label: 'Student' },
  { value: 'retired', label: 'Retired' },
];

export const COMPLEXION_OPTIONS = [
  { value: 'very_fair', label: 'Very Fair' },
  { value: 'fair', label: 'Fair' },
  { value: 'wheatish', label: 'Wheatish' },
  { value: 'wheatish_brown', label: 'Wheatish Brown' },
  { value: 'dark', label: 'Dark' },
];

export const FAMILY_TYPES = ['Nuclear', 'Joint', 'Extended'];
export const FAMILY_VALUES = ['Traditional', 'Moderate', 'Liberal'];
export const FAMILY_STATUS = ['Middle Class', 'Upper Middle Class', 'Rich', 'Affluent'];

export const FOOD_HABITS = [
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'non_vegetarian', label: 'Non-Vegetarian' },
  { value: 'eggetarian', label: 'Eggetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'jain', label: 'Jain' },
  { value: 'occasionally_non_veg', label: 'Occasionally Non-Veg' },
];

export const ONBOARDING_STEPS = [
  { step: 1, title: 'Basic Details', description: 'Personal information', icon: 'User' },
  { step: 2, title: 'Photos', description: 'Profile photos', icon: 'Camera' },
  { step: 3, title: 'Education', description: 'Educational background', icon: 'GraduationCap' },
  { step: 4, title: 'Career', description: 'Employment details', icon: 'Briefcase' },
  { step: 5, title: 'Family', description: 'Family background', icon: 'Home' },
  { step: 6, title: 'Lifestyle', description: 'Habits & hobbies', icon: 'Heart' },
  { step: 7, title: 'Health', description: 'Health information', icon: 'Activity' },
  { step: 8, title: 'Assets', description: 'Property & assets', icon: 'Building2' },
  { step: 9, title: 'Astrology', description: 'Birth & horoscope', icon: 'Star' },
  { step: 10, title: 'Personality', description: 'Who you are', icon: 'Sparkles' },
  { step: 11, title: 'Partner Preferences', description: 'What you seek', icon: 'Search' },
  { step: 12, title: 'Verification', description: 'Verify identity', icon: 'ShieldCheck' },
] as const;

export const VERIFICATION_TYPES = [
  { type: 'mobile', label: 'Mobile Verified', icon: 'Phone' },
  { type: 'email', label: 'Email Verified', icon: 'Mail' },
  { type: 'aadhaar', label: 'Aadhaar Verified', icon: 'CreditCard' },
  { type: 'pan', label: 'PAN Verified', icon: 'FileText' },
  { type: 'passport', label: 'Passport Verified', icon: 'BookOpen' },
  { type: 'face', label: 'Face Verified', icon: 'Scan' },
  { type: 'employment', label: 'Employment Verified', icon: 'Briefcase' },
  { type: 'income', label: 'Income Verified', icon: 'DollarSign' },
];

export const LANGUAGES = ['English', 'Telugu', 'Hindi', 'Tamil', 'Kannada', 'Malayalam', 'Marathi', 'Bengali', 'Gujarati', 'Punjabi', 'Urdu', 'Odia'];

export const INTEREST_STAGE_LABELS: Record<string, string> = {
  suggested: 'Suggested',
  viewed: 'Viewed',
  sent: 'Interest Sent',
  received: 'Received',
  accepted: 'Accepted',
  declined: 'Declined',
  chat_started: 'Chatting',
  voice_called: 'Voice Called',
  video_called: 'Video Called',
  meeting_scheduled: 'Meeting Scheduled',
  family_discussion: 'Family Discussion',
  engaged: 'Engaged',
  married: 'Married',
  expired: 'Expired',
  withdrawn: 'Withdrawn',
};

export const SCORE_COLORS = {
  high: 'text-emerald-600',
  medium: 'text-gold-600',
  low: 'text-brand-700',
};

export const getScoreLevel = (score: number): 'high' | 'medium' | 'low' => {
  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
};

export const formatHeight = (cm: number): string => {
  const inches = Math.round(cm / 2.54);
  const feet = Math.floor(inches / 12);
  const remainingInches = inches % 12;
  return `${feet}'${remainingInches}" (${cm} cm)`;
};

export const formatIncome = (amount: number, currency = 'INR'): string => {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`;
  return `₹${amount}`;
};

export const calculateAge = (dob: string): number => {
  const birth = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

