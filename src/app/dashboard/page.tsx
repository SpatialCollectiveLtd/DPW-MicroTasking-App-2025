'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DailyCompletionCard from '@/components/dashboard/DailyCompletionCard';
import NoticesFeed from '@/components/dashboard/NoticesFeed';
import { Bell, Settings, LogOut } from 'lucide-react';

interface DailyStats {
  tasksCompleted: number;
  targetTasks: number;
  accuracyScore: number;
  totalPay: number;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [dailyStats, setDailyStats] = useState<DailyStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDailyStats();
  }, []);

  const fetchDailyStats = async () => {
    try {
      const response = await fetch('/api/daily-report');
      const result = await response.json();
      
      if (result.success) {
        setDailyStats(result.data);
      }
    } catch (error) {
      console.error('Error fetching daily stats:', error);
      // Set default values for demo
      setDailyStats({
        tasksCompleted: 0,
        targetTasks: 300,
        accuracyScore: 0,
        totalPay: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartTask = () => {
    router.push('/dashboard/tasks');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getUserName = () => {
    if (session?.user?.phone) {
      // Extract last 4 digits for a friendly display
      const lastFour = session.user.phone.slice(-4);
      return `Worker ${lastFour}`;
    }
    return 'Worker';
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {getGreeting()}, {getUserName()}
              </h1>
              <p className="text-sm text-gray-600">
                {session?.user?.settlementName || 'Digital Public Works'}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <Bell className="h-5 w-5 text-gray-600" />
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <Settings className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Daily Completion Card */}
        <DailyCompletionCard
          tasksCompleted={dailyStats?.tasksCompleted || 0}
          targetTasks={dailyStats?.targetTasks || 300}
          onStartTask={handleStartTask}
          isLoading={isLoading}
        />

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                KSh {dailyStats?.totalPay?.toLocaleString() || '0'}
              </div>
              <div className="text-sm text-gray-600">Today's Earnings</div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {dailyStats?.accuracyScore?.toFixed(1) || '0.0'}%
              </div>
              <div className="text-sm text-gray-600">Accuracy Score</div>
            </div>
          </div>
        </div>

        {/* Notices Feed */}
        <NoticesFeed maxItems={3} />

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => router.push('/dashboard/earnings')}
              className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <div className="font-medium text-gray-900">View Earnings</div>
              <div className="text-sm text-gray-500">Payment history</div>
            </button>
            
            <button 
              onClick={() => router.push('/dashboard/profile')}
              className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <div className="font-medium text-gray-900">Profile</div>
              <div className="text-sm text-gray-500">Account settings</div>
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}