import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { APP_CONFIG } from './constants';
import type { PaymentTier, PaymentCalculation } from '@/types';

/**
 * Utility function to combine class names using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Check if current time is within work hours (6 AM - 6 PM)
 */
export function isWithinWorkHours(): boolean {
  const now = new Date();
  const currentHour = now.getHours();
  return currentHour >= APP_CONFIG.WORK_HOURS.START && currentHour < APP_CONFIG.WORK_HOURS.END;
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phone: string): string {
  // Remove any non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format as +254 XXX XXX XXX for Kenyan numbers
  if (cleaned.startsWith('254') && cleaned.length === 12) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
  }
  
  // Format as 0XXX XXX XXX for local format
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  
  return phone;
}

/**
 * Validate Kenyan phone number
 */
export function isValidKenyanPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  
  // Check for international format (+254XXXXXXXXX) or local format (07XXXXXXXX, 01XXXXXXXX)
  return (
    (cleaned.startsWith('254') && cleaned.length === 12) ||
    (cleaned.startsWith('0') && cleaned.length === 10 && ['07', '01'].includes(cleaned.slice(0, 2)))
  );
}

/**
 * Calculate payment based on accuracy score
 */
export function calculatePayment(tasksCompleted: number, accuracyScore: number): PaymentCalculation {
  const basePay = tasksCompleted >= APP_CONFIG.DAILY_TASK_TARGET ? APP_CONFIG.PAYMENT.BASE_PAY_KES : 0;
  
  // Find the appropriate payment tier
  const tier = APP_CONFIG.PAYMENT.TIERS.find(
    t => accuracyScore >= t.minAccuracy && accuracyScore <= t.maxAccuracy
  ) || APP_CONFIG.PAYMENT.TIERS[APP_CONFIG.PAYMENT.TIERS.length - 1];
  
  const qualityBonus = basePay > 0 ? tier.bonusAmount : 0;
  const totalPay = basePay + qualityBonus;
  
  return {
    tasksCompleted,
    accuracyScore,
    basePay,
    qualityBonus,
    totalPay,
    tier,
  };
}

/**
 * Calculate consensus for an image based on responses
 */
export function calculateConsensus(yesCount: number, noCount: number): {
  groundTruth: boolean | null;
  consensusReached: boolean;
  confidenceLevel: number;
} {
  const totalResponses = yesCount + noCount;
  
  if (totalResponses < APP_CONFIG.CONSENSUS.MIN_RESPONSES) {
    return {
      groundTruth: null,
      consensusReached: false,
      confidenceLevel: 0,
    };
  }
  
  const yesPercentage = yesCount / totalResponses;
  const noPercentage = noCount / totalResponses;
  const consensusThreshold = APP_CONFIG.CONSENSUS.MIN_CONSENSUS_THRESHOLD;
  
  let groundTruth: boolean | null = null;
  let consensusReached = false;
  let confidenceLevel = Math.max(yesPercentage, noPercentage);
  
  if (yesPercentage >= consensusThreshold) {
    groundTruth = true;
    consensusReached = true;
  } else if (noPercentage >= consensusThreshold) {
    groundTruth = false;
    consensusReached = true;
  }
  
  return {
    groundTruth,
    consensusReached,
    confidenceLevel: Math.round(confidenceLevel * 100) / 100,
  };
}

/**
 * Format currency in KES
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  }).format(dateObj);
}

/**
 * Format time for display
 */
export function formatTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-KE', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(dateObj);
}

/**
 * Get greeting based on time of day
 */
export function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();
  
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/**
 * Generate a random ID (for development purposes)
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
}

/**
 * Sleep utility for development/testing
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
