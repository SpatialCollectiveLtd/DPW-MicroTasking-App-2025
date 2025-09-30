// App constants
export const APP_CONFIG = {
  WORK_HOURS: {
    START: 6, // 6 AM
    END: 18,  // 6 PM
  },
  DAILY_TASK_TARGET: 300,
  PAYMENT: {
    BASE_PAY_KES: 760,
    TIERS: [
      { minAccuracy: 90, maxAccuracy: 100, bonusPercentage: 30, bonusAmount: 228 },
      { minAccuracy: 80, maxAccuracy: 89, bonusPercentage: 20, bonusAmount: 152 },
      { minAccuracy: 70, maxAccuracy: 79, bonusPercentage: 10, bonusAmount: 76 },
      { minAccuracy: 0, maxAccuracy: 69, bonusPercentage: 0, bonusAmount: 0 },
    ],
  },
  CONSENSUS: {
    MIN_RESPONSES: 5, // Minimum responses needed for consensus
    MIN_CONSENSUS_THRESHOLD: 0.6, // 60% agreement required
  },
} as const;