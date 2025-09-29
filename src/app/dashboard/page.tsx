'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, User, MapPin, Briefcase } from 'lucide-react';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b-2 border-gray-100 shadow-sm">
        <div className="max-w-lg mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-8 bg-[#1D1D1F] rounded-xl flex items-center justify-center">
              <div className="text-white text-sm font-black">DPW</div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#1D1D1F]">Dashboard</h1>
              <p className="text-gray-600 text-sm">Welcome back!</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="flex items-center gap-2 bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-[#EF4444] hover:text-[#EF4444] px-4 py-2 rounded-2xl font-medium transition-all duration-200"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto px-6 py-8 space-y-8">
        {/* Welcome Card */}
        <Card className="bg-white border-2 border-gray-100 rounded-3xl shadow-sm hover:shadow-lg transition-all duration-200">
          <CardHeader className="pb-4 px-8 pt-8">
            <CardTitle className="text-xl flex items-center gap-3 text-[#1D1D1F]">
              <User className="h-6 w-6 text-[#EF4444]" />
              Welcome Back!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 px-8 pb-8">
            <div className="flex items-center gap-3 text-base">
              <span className="font-semibold text-[#1D1D1F]">Phone:</span>
              <span className="text-gray-600">{session.user?.phone}</span>
            </div>
            <div className="flex items-center gap-3 text-base">
              <span className="font-semibold text-[#1D1D1F]">Role:</span>
              <span className="text-gray-600 capitalize">{session.user?.role?.toLowerCase()}</span>
            </div>
            {session.user?.settlementName && (
              <div className="flex items-center gap-3 text-base">
                <MapPin className="h-5 w-5 text-[#EF4444]" />
                <span className="text-gray-600">{session.user.settlementName}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats Card */}
        <Card className="bg-white border-2 border-gray-100 rounded-3xl shadow-sm hover:shadow-lg transition-all duration-200">
          <CardHeader className="pb-4 px-8 pt-8">
            <CardTitle className="text-xl flex items-center gap-3 text-[#1D1D1F]">
              <Briefcase className="h-6 w-6 text-[#EF4444]" />
              Today's Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <div className="text-center py-8">
              <div className="text-4xl font-bold text-[#1D1D1F] mb-3">0</div>
              <div className="text-base text-gray-600 mb-6 font-medium">Tasks Completed</div>
              <div className="bg-gray-100 rounded-full h-3 w-full mb-4">
                <div className="bg-[#EF4444] h-3 rounded-full w-0 transition-all duration-500"></div>
              </div>
              <div className="text-sm text-gray-500 mb-6">0 of 300 daily target</div>
              <Button
                onClick={() => router.push('/dashboard/tasks')}
                variant="outline"
                className="w-full border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-[#EF4444] hover:text-[#EF4444] rounded-2xl font-medium"
              >
                Start Tasks
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tasks Card */}
        <Card className="bg-white border-2 border-gray-100 rounded-3xl shadow-sm hover:shadow-lg transition-all duration-200">
          <CardContent className="text-center py-10 px-8">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="font-bold text-[#1D1D1F] mb-3 text-lg">Ready to Earn?</h3>
            <p className="text-base text-gray-600 leading-relaxed mb-6">
              Complete micro-tasks in your settlement and earn money for contributing to urban resilience.
            </p>
            <Button
              onClick={() => router.push('/tasks')}
              className="w-full h-12 bg-[#EF4444] hover:bg-[#DC2626] text-white font-semibold rounded-2xl transition-all duration-200"
            >
              View Available Tasks
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}