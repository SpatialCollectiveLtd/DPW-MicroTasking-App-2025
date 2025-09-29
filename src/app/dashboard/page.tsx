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
    <div className="min-h-screen bg-[#0A0A0B]">
      {/* Header */}
      <header className="bg-[#1A1A1B] border-b border-[#2A2A2B]">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">DPW Platform</h1>
            <p className="text-sm text-gray-400">Dashboard</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="flex items-center gap-2 bg-transparent border-[#2A2A2B] text-gray-300 hover:bg-[#2A2A2B] hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Welcome Card */}
        <Card className="bg-[#1A1A1B] border-[#2A2A2B]">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-white">
              <User className="h-5 w-5 text-[#8B5CF6]" />
              Welcome Back!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-white">Phone:</span>
              <span className="text-gray-400">{session.user?.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-white">Role:</span>
              <span className="text-gray-400 capitalize">{session.user?.role?.toLowerCase()}</span>
            </div>
            {session.user?.settlementName && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-gray-400">{session.user.settlementName}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats Card */}
        <Card className="bg-[#1A1A1B] border-[#2A2A2B]">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-white">
              <Briefcase className="h-5 w-5 text-[#8B5CF6]" />
              Today's Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <div className="text-3xl font-bold text-white mb-2">0</div>
              <div className="text-sm text-gray-400 mb-4">Tasks Completed</div>
              <div className="bg-[#2A2A2B] rounded-full h-2 w-full">
                <div className="bg-[#8B5CF6] h-2 rounded-full w-0"></div>
              </div>
              <div className="text-xs text-gray-500 mt-2">0 of 300 daily target</div>
            </div>
          </CardContent>
        </Card>

        {/* Coming Soon Card */}
        <Card className="border-dashed border-[#2A2A2B] bg-[#1A1A1B]/50">
          <CardContent className="text-center py-8">
            <div className="text-gray-400 mb-2">🚧</div>
            <h3 className="font-semibold text-white mb-2">More Features Coming Soon</h3>
            <p className="text-sm text-gray-400">
              Task interface, image tagging, and payment tracking will be available in the next phases.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}