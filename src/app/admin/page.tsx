'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  Users, 
  Settings, 
  FileText, 
  DollarSign, 
  MessageSquare,
  Activity,
  TrendingUp,
  Clock
} from 'lucide-react';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

interface StatItem {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative';
  icon: string;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<StatItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || session.user?.role !== 'ADMIN') {
      router.push('/login');
      return;
    }

    // Fetch admin stats from database API
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/stats');
        const result = await response.json();
        
        if (result.success && result.data) {
          setStats(result.data.stats);
        } else {
          console.error('Failed to fetch admin stats:', result.message);
          // Fallback to empty stats with error indication
          setStats([
            { title: 'Active Workers', value: 'Error', change: 'Reload page', changeType: 'negative', icon: 'Users' },
            { title: 'Total Campaigns', value: 'Error', change: 'Database issue', changeType: 'negative', icon: 'FileText' },
            { title: 'Monthly Revenue', value: 'Error', change: 'Connection failed', changeType: 'negative', icon: 'DollarSign' },
            { title: 'Completion Rate', value: 'Error', change: 'Retry needed', changeType: 'negative', icon: 'TrendingUp' }
          ]);
        }
      } catch (error) {
        console.error('Error fetching admin stats:', error);
        setStats([
          { title: 'Active Workers', value: 'Error', change: 'Reload page', changeType: 'negative', icon: 'Users' },
          { title: 'Total Campaigns', value: 'Error', change: 'Database issue', changeType: 'negative', icon: 'FileText' },
          { title: 'Monthly Revenue', value: 'Error', change: 'Connection failed', changeType: 'negative', icon: 'DollarSign' },
          { title: 'Completion Rate', value: 'Error', change: 'Retry needed', changeType: 'negative', icon: 'TrendingUp' }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [session, status, router]);

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#EF4444]"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  // Helper function to get icon component by name
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Users': return Users;
      case 'FileText': return FileText;
      case 'DollarSign': return DollarSign;
      case 'TrendingUp': return TrendingUp;
      default: return Activity;
    }
  };

  const quickActions = [
    {
      title: 'User Management',
      description: 'Manage workers and administrators',
      href: '/admin/users',
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: 'Campaign Management',
      description: 'Create and manage task campaigns',
      href: '/admin/campaigns',
      icon: FileText,
      color: 'bg-green-500'
    },
    {
      title: 'Payment Reports',
      description: 'View earnings and payment history',
      href: '/admin/payments',
      icon: DollarSign,
      color: 'bg-yellow-500'
    },
    {
      title: 'Notices Management',
      description: 'Create and manage platform notices',
      href: '/admin/notices',
      icon: MessageSquare,
      color: 'bg-purple-500'
    },
    {
      title: 'System Settings',
      description: 'Configure platform settings',
      href: '/admin/settings',
      icon: Settings,
      color: 'bg-gray-500'
    },
    {
      title: 'Activity Logs',
      description: 'Monitor system activity and logs',
      href: '/admin/logs',
      icon: Activity,
      color: 'bg-red-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-900">DPW Admin Panel</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-[#EF4444] rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {session.user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-700">{session.user?.name}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {session.user?.name}
          </h2>
          <p className="text-gray-600">
            Here&apos;s an overview of your platform&apos;s current status and quick access to management tools.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className="h-12 w-12 bg-gray-50 rounded-lg flex items-center justify-center">
                  {(() => {
                    const IconComponent = getIconComponent(stat.icon);
                    return <IconComponent className="h-6 w-6 text-gray-600" />;
                  })()}
                </div>
              </div>
              
              <div className="mt-4 flex items-center">
                <span className={`text-sm font-medium ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
                <span className="text-sm text-gray-500 ml-1">from last month</span>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => router.push(action.href)}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-left hover:shadow-md hover:border-gray-200 transition-all duration-200 group"
              >
                <div className="flex items-center space-x-4">
                  <div className={`h-12 w-12 ${action.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-base font-semibold text-gray-900 group-hover:text-[#EF4444] transition-colors duration-200">
                      {action.title}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity Preview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="text-center py-8">
            <div className="h-12 w-12 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Clock className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm">Recent activity will appear here</p>
            <p className="text-gray-400 text-xs mt-1">Activity tracking coming soon</p>
          </div>
          
          <button 
            onClick={() => router.push('/admin/logs')}
            className="mt-4 text-sm text-[#EF4444] hover:text-[#DC2626] font-medium"
          >
            View all activity →
          </button>
        </div>
      </main>
    </div>
  );
}