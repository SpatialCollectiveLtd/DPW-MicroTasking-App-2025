'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  Target,
  Award,
  Loader2
} from 'lucide-react';

interface TaskSubmission {
  id: string;
  taskId: string;
  taskTitle: string;
  status: 'submitted' | 'under_review' | 'approved' | 'rejected';
  earnings: number;
  submittedAt: string;
  reviewedAt?: string;
}

interface ProgressStats {
  totalSubmissions: number;
  approved: number;
  pending: number;
  rejected: number;
  totalEarnings: number;
  thisWeekEarnings: number;
  averageRating: number;
  completionRate: number;
}

// Mock data
const mockSubmissions: TaskSubmission[] = [
  {
    id: '1',
    taskId: '1',
    taskTitle: 'Document Road Conditions',
    status: 'approved',
    earnings: 50,
    submittedAt: '2025-09-28T10:00:00Z',
    reviewedAt: '2025-09-28T15:30:00Z'
  },
  {
    id: '2',
    taskId: '2', 
    taskTitle: 'Water Point Assessment',
    status: 'under_review',
    earnings: 75,
    submittedAt: '2025-09-29T09:15:00Z'
  },
  {
    id: '3',
    taskId: '1',
    taskTitle: 'Document Road Conditions',
    status: 'submitted',
    earnings: 50,
    submittedAt: '2025-09-29T14:20:00Z'
  }
];

const mockStats: ProgressStats = {
  totalSubmissions: 3,
  approved: 1,
  pending: 2,
  rejected: 0,
  totalEarnings: 50,
  thisWeekEarnings: 50,
  averageRating: 4.8,
  completionRate: 95
};

export default function ProgressPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  useEffect(() => {
    // Simulate API calls
    setTimeout(() => {
      setSubmissions(mockSubmissions);
      setStats(mockStats);
      setIsLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status: TaskSubmission['status']) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: TaskSubmission['status']) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      case 'under_review':
      case 'submitted':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading progress...</p>
        </div>
      </div>
    );
  }

  if (!session || !stats) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b-2 border-gray-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => router.back()}
                variant="outline"
                size="sm"
                className="border-2 border-gray-200 hover:border-red-500"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-black">My Progress</h1>
                <p className="text-gray-600">Track your earnings and task performance</p>
              </div>
            </div>
            <Button
              onClick={() => router.push('/tasks')}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Find More Tasks
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Total Earnings */}
          <Card className="bg-white border-2 border-gray-100 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                  <p className="text-2xl font-bold text-green-600">KSh {stats.totalEarnings}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-xl">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* This Week */}
          <Card className="bg-white border-2 border-gray-100 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">This Week</p>
                  <p className="text-2xl font-bold text-blue-600">KSh {stats.thisWeekEarnings}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-xl">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Completion Rate */}
          <Card className="bg-white border-2 border-gray-100 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.completionRate}%</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-xl">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Average Rating */}
          <Card className="bg-white border-2 border-gray-100 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Quality Score</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.averageRating}/5.0</p>
                </div>
                <div className="bg-orange-100 p-3 rounded-xl">
                  <Award className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Submission Status */}
          <Card className="bg-white border-2 border-gray-100 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-black flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Submission Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">Approved</span>
                </div>
                <span className="text-lg font-bold text-green-600">{stats.approved}</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  <span className="font-medium text-yellow-800">Under Review</span>
                </div>
                <span className="text-lg font-bold text-yellow-600">{stats.pending}</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <span className="font-medium text-red-800">Rejected</span>
                </div>
                <span className="text-lg font-bold text-red-600">{stats.rejected}</span>
              </div>
            </CardContent>
          </Card>

          {/* Performance Tips */}
          <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-100 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-black flex items-center">
                <Award className="h-5 w-5 mr-2" />
                Performance Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5">
                    1
                  </div>
                  <p className="text-sm text-gray-700">Take clear, well-lit photos with good visibility</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5">
                    2
                  </div>
                  <p className="text-sm text-gray-700">Add detailed, accurate tags to describe what you see</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5">
                    3
                  </div>
                  <p className="text-sm text-gray-700">Follow task instructions carefully for better approval rates</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5">
                    4
                  </div>
                  <p className="text-sm text-gray-700">Submit tasks promptly to earn faster</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Submissions */}
        <Card className="bg-white border-2 border-gray-100 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-black">Recent Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            {submissions.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No submissions yet</h3>
                <p className="text-gray-600 mb-4">Start completing tasks to see your progress here</p>
                <Button
                  onClick={() => router.push('/tasks')}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  Browse Available Tasks
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {submissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(submission.status)}
                        <div>
                          <h4 className="font-semibold text-black">{submission.taskTitle}</h4>
                          <p className="text-sm text-gray-600">
                            Submitted {formatDate(submission.submittedAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <Badge className={`${getStatusColor(submission.status)} font-medium`}>
                        {submission.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <div className="text-right">
                        <div className="font-bold text-green-600">KSh {submission.earnings}</div>
                        {submission.status === 'approved' && (
                          <div className="text-xs text-gray-500">Paid</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}