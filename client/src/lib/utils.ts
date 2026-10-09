import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const formatDate = (date: string | Date, format: 'short' | 'long' | 'relative' = 'short'): string => {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();

  if (format === 'relative') {
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  }

  if (format === 'long') {
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const formatLastSeen = (date?: string): string => {
  if (!date) return 'Long time ago';
  return `Active ${formatDate(date, 'relative')}`;
};

export const truncate = (text: string, length: number): string => {
  if (text.length <= length) return text;
  return `${text.slice(0, length)}...`;
};

export const getInitials = (firstName: string, lastName?: string): string => {
  const first = firstName.charAt(0).toUpperCase();
  const last = lastName?.charAt(0).toUpperCase() ?? '';
  return `${first}${last}`;
};

export const debounce = <T extends (...args: unknown[]) => unknown>(fn: T, delay: number): ((...args: Parameters<T>) => void) => {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

export const throttle = <T extends (...args: unknown[]) => unknown>(fn: T, limit: number): ((...args: Parameters<T>) => void) => {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

export const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

export const parsePhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('91') && cleaned.length === 12) return `+${cleaned}`;
  if (cleaned.length === 10) return `+91${cleaned}`;
  return phone.startsWith('+') ? phone : `+${cleaned}`;
};

export const maskPhone = (phone: string): string => {
  if (phone.length < 6) return phone;
  return `${phone.slice(0, 3)}${'*'.repeat(Math.max(0, phone.length - 6))}${phone.slice(-3)}`;
};

export const maskEmail = (email: string): string => {
  const [user, domain] = email.split('@');
  if (!user || !domain) return email;
  return `${user.slice(0, 2)}${'*'.repeat(Math.max(0, user.length - 2))}@${domain}`;
};

export const getScoreColor = (score: number): string => {
  if (score >= 70) return 'text-emerald-600 dark:text-emerald-400';
  if (score >= 40) return 'text-amber-600 dark:text-amber-400';
  return 'text-brand-600 dark:text-brand-400';
};

export const getScoreBg = (score: number): string => {
  if (score >= 70) return 'bg-emerald-100 dark:bg-emerald-900/30';
  if (score >= 40) return 'bg-amber-100 dark:bg-amber-900/30';
  return 'bg-brand-100 dark:bg-brand-900/30';
};

export const generateAvatarUrl = (name: string, size = 64): string => {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&size=${size}&background=8b1538&color=fff&bold=true`;
};

export const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });

export const isImageFile = (file: File): boolean => file.type.startsWith('image/');
export const isVideoFile = (file: File): boolean => file.type.startsWith('video/');
export const isAudioFile = (file: File): boolean => file.type.startsWith('audio/');

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

export const calculateAge = (dob: string | Date): number => {
  const birth = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) age--;
  return age;
};

export const formatHeight = (cm: number): string => {
  const inches = Math.round(cm / 2.54);
  const feet = Math.floor(inches / 12);
  const remainingInches = inches % 12;
  return `${feet}'${remainingInches}" (${cm} cm)`;
};

export const formatIncome = (amount: number): string => {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`;
  return `₹${amount}`;
};
