'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CheckCircle, Clock, TrendingUp, ArrowLeft, Loader2 } from 'lucide-react';

interface DailyStats {
  tasksCompleted: number;
  targetTasks: number;
  accuracyScore: number;
  basePay: number;
  qualityBonus: number;
  totalPay: number;
}

export default function TaskCompletePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [dailyStats, setDailyStats] = useState<DailyStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      fetchDailyStats();
    }
  }, [status, router]);

  const fetchDailyStats = async () => {
    try {
      const response = await fetch('/api/daily-report');
      const result = await response.json();

      if (result.success) {
        setDailyStats(result.data);
      }
    } catch (error) {
      console.error('Error fetching daily stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading your results...</p>
        </div>
      </div>
    );
  }

  const completionPercentage = dailyStats 
    ? Math.round((dailyStats.tasksCompleted / dailyStats.targetTasks) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-2"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-xl font-bold text-gray-900">Today's Work Complete!</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Success Message */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Congratulations!
          </h2>
          <p className="text-gray-600 mb-4">
            You have completed all available tasks for today. Thank you for your valuable contribution to the Digital Public Works project!
          </p>
        </div>

        {/* Daily Statistics */}
        {dailyStats && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Summary</h3>
            
            {/* Tasks Completed */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Tasks Completed</span>
                <span className="text-sm text-gray-600">
                  {dailyStats.tasksCompleted} of {dailyStats.targetTasks}
                </span>
              </div>
              <div className="bg-gray-200 rounded-full h-3 w-full">
                <div 
                  className="bg-green-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(completionPercentage, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {completionPercentage}% of daily target
              </p>
            </div>

            {/* Earnings */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  KSh {dailyStats.totalPay.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Earnings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {dailyStats.accuracyScore.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Accuracy Score</div>
              </div>
            </div>

            {/* Earnings Breakdown */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Base Pay:</span>
                <span className="text-gray-900">KSh {dailyStats.basePay.toLocaleString()}</span>
              </div>
              {dailyStats.qualityBonus > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Quality Bonus:</span>
                  <span className="text-green-600">+KSh {dailyStats.qualityBonus.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-blue-500" />
            What's Next?
          </h3>
          <div className="space-y-3 text-sm text-gray-600">
            <p>
              • <strong>Return tomorrow</strong> for new tasks and continue earning
            </p>
            <p>
              • <strong>Check your dashboard</strong> for daily progress updates
            </p>
            <p>
              • <strong>Review the news section</strong> for important announcements
            </p>
            <p>
              • <strong>Maintain high accuracy</strong> to earn quality bonuses
            </p>
          </div>
        </div>

        {/* Performance Tip */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <TrendingUp className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-blue-900 mb-1">Performance Tip</h4>
              <p className="text-sm text-blue-800">
                {dailyStats && dailyStats.accuracyScore >= 85 
                  ? "Excellent work! Your high accuracy rate helps improve the quality of our community data."
                  : "Take your time to carefully examine each image. Higher accuracy scores lead to better earnings and bonuses!"
                }
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="h-12 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
          >
            Dashboard
          </button>
          <button
            onClick={() => router.push('/news')}
            className="h-12 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-lg transition-colors"
          >
            View News
          </button>
        </div>

        {/* Footer Message */}
        <div className="text-center pt-4">
          <p className="text-xs text-gray-500">
            Thank you for contributing to Digital Public Works. Your work helps build better communities.
          </p>
        </div>
      </div>
    </div>
  );
}