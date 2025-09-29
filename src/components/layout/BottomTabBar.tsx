'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Home, Briefcase, DollarSign, User } from 'lucide-react';

interface TabItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
}

const tabs: TabItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    path: '/dashboard'
  },
  {
    id: 'tasks',
    label: 'Tasks',
    icon: Briefcase,
    path: '/dashboard/tasks'
  },
  {
    id: 'earnings',
    label: 'Earnings',
    icon: DollarSign,
    path: '/dashboard/earnings'
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: User,
    path: '/dashboard/profile'
  }
];

export default function BottomTabBar() {
  const pathname = usePathname();
  const router = useRouter();

  const getIsActive = (tabPath: string) => {
    if (tabPath === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(tabPath);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Frosted glass backdrop */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-xl border-t border-gray-200/50"></div>
      
      {/* Tab content */}
      <div className="relative px-4 py-2 pb-safe">
        <div className="flex items-center justify-around">
          {tabs.map((tab) => {
            const isActive = getIsActive(tab.path);
            const IconComponent = tab.icon;
            
            return (
              <button
                key={tab.id}
                onClick={() => router.push(tab.path)}
                className="flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all duration-200 hover:bg-gray-100/50 active:scale-95 min-w-[64px]"
              >
                <div className={`transition-colors duration-200 ${
                  isActive ? 'text-[#EF4444]' : 'text-gray-400'
                }`}>
                  <IconComponent className="h-6 w-6" />
                </div>
                
                <span className={`text-xs font-medium transition-colors duration-200 ${
                  isActive ? 'text-[#EF4444]' : 'text-gray-500'
                }`}>
                  {tab.label}
                </span>
                
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-[#EF4444] rounded-full"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}