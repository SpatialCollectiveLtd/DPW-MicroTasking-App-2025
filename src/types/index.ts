// Core entity types
export interface User {
  id: string;
  phone: string;
  role: 'WORKER' | 'ADMIN';
  settlementId?: string; // Optional for system-wide admins
  settlement?: Settlement;
  createdAt: Date;
  updatedAt: Date;
  responses?: Response[];
  dailyReports?: DailyReport[];
}

export interface Settlement {
  id: string;
  name: string;
  location?: string;
  users?: User[];
  campaigns?: Campaign[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Campaign {
  id: string;
  title: string;
  question: string;
  isActive: boolean;
  startDate: Date;
  endDate?: Date;
  createdBy: string;
  images?: Image[];
  settlements?: Settlement[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Image {
  id: string;
  url: string;
  campaignId: string;
  campaign?: Campaign;
  responses?: Response[];
  groundTruth?: boolean;
  consensusReached: boolean;
  totalResponses: number;
  yesCount: number;
  noCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Response {
  id: string;
  userId: string;
  user?: User;
  imageId: string;
  image?: Image;
  answer: boolean; // true for Yes, false for No
  submittedAt: Date;
}

export interface DailyReport {
  id: string;
  userId: string;
  user?: User;
  date: Date;
  tasksCompleted: number;
  targetTasks: number;
  accuracyScore: number; // percentage
  basePay: number;
  qualityBonus: number;
  totalPay: number;
  createdAt: Date;
  updatedAt: Date;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Authentication types
export interface LoginRequest {
  phone: string;
  settlementId: string;
}

export interface AuthUser {
  id: string;
  phone: string;
  role: 'WORKER' | 'ADMIN';
  settlementId?: string; // Optional for system-wide admins
  settlementName?: string; // Optional for system-wide admins
}

// Task types
export interface TaskImage {
  id: string;
  url: string;
  question: string;
}

export interface TaskResponse {
  imageId: string;
  answer: boolean;
}

// Dashboard types
export interface WorkerDashboard {
  user: AuthUser;
  dailyProgress: {
    completed: number;
    target: number;
    percentage: number;
  };
  earnings: {
    todayEstimated: number;
    thisWeekTotal: number;
    thisMonthTotal: number;
  };
  news: NewsItem[];
}

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

// Admin types
export interface AdminDashboard {
  totalUsers: number;
  activeUsers: number;
  totalCampaigns: number;
  activeCampaigns: number;
  totalTasksToday: number;
  completedTasksToday: number;
  settlements: Settlement[];
}

export interface CreateCampaignRequest {
  title: string;
  question: string;
  imageUrls: string[];
  settlementIds: string[];
  startDate: Date;
  endDate?: Date;
}

// Payment calculation types
export interface PaymentTier {
  minAccuracy: number;
  maxAccuracy: number;
  bonusPercentage: number;
  bonusAmount: number;
}

export interface PaymentCalculation {
  tasksCompleted: number;
  accuracyScore: number;
  basePay: number;
  qualityBonus: number;
  totalPay: number;
  tier: PaymentTier;
}