'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Camera, 
  Clock, 
  DollarSign, 
  CheckCircle, 
  AlertCircle,
  Users,
  Loader2
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  payment: number;
  estimatedTime: number; // in minutes
  location: string;
  status: 'available' | 'in_progress' | 'completed' | 'under_review';
  requiredImages: number;
  tags: string[];
  deadline: string;
  difficulty: 'easy' | 'medium' | 'hard';
  assignedCount: number;
  maxAssignments: number;
}

// Mock data for now - will be replaced with API calls
const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Document Road Conditions',
    description: 'Take photos of road surfaces, potholes, and infrastructure along designated routes in your settlement.',
    category: 'Infrastructure',
    payment: 50,
    estimatedTime: 30,
    location: 'Kibera Settlement',
    status: 'available',
    requiredImages: 5,
    tags: ['roads', 'infrastructure', 'maintenance'],
    deadline: '2025-10-05',
    difficulty: 'easy',
    assignedCount: 3,
    maxAssignments: 10
  },
  {
    id: '2',
    title: 'Water Point Assessment',
    description: 'Document water access points, quality issues, and usage patterns in your area.',
    category: 'Water & Sanitation',
    payment: 75,
    estimatedTime: 45,
    location: 'Mathare Settlement',
    status: 'available',
    requiredImages: 8,
    tags: ['water', 'sanitation', 'access'],
    deadline: '2025-10-03',
    difficulty: 'medium',
    assignedCount: 1,
    maxAssignments: 5
  },
  {
    id: '3',
    title: 'Waste Management Survey',
    description: 'Photo-document waste disposal points and cleanliness conditions around your settlement.',
    category: 'Environment',
    payment: 40,
    estimatedTime: 25,
    location: 'Mukuru Settlement',
    status: 'in_progress',
    requiredImages: 6,
    tags: ['waste', 'environment', 'cleanliness'],
    deadline: '2025-10-07',
    difficulty: 'easy',
    assignedCount: 7,
    maxAssignments: 15
  }
];

export default function TasksPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'available' | 'my_tasks'>('all');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setTasks(mockTasks);
      setIsLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: Task['difficulty']) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'available') return task.status === 'available';
    if (filter === 'my_tasks') return task.status === 'in_progress' || task.status === 'completed';
    return true;
  });

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading tasks...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b-2 border-gray-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-black">Available Tasks</h1>
              <p className="text-gray-600 text-base mt-1">Earn money by completing micro-tasks in your settlement</p>
            </div>
            <Button
              onClick={() => router.push('/dashboard')}
              variant="outline"
              className="border-2 border-gray-200 hover:border-red-500 hover:text-red-500"
            >
              Dashboard
            </Button>
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-1 mt-6 bg-gray-100 rounded-2xl p-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-3 rounded-xl font-medium text-sm transition-all ${
                filter === 'all'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              All Tasks
            </button>
            <button
              onClick={() => setFilter('available')}
              className={`px-6 py-3 rounded-xl font-medium text-sm transition-all ${
                filter === 'available'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              Available
            </button>
            <button
              onClick={() => setFilter('my_tasks')}
              className={`px-6 py-3 rounded-xl font-medium text-sm transition-all ${
                filter === 'my_tasks'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              My Tasks
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-600">
              {filter === 'available' 
                ? 'No available tasks at the moment. Check back soon!'
                : filter === 'my_tasks'
                ? 'You haven\'t started any tasks yet.'
                : 'No tasks available.'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredTasks.map((task) => (
              <Card key={task.id} className="bg-white border-2 border-gray-100 rounded-3xl shadow-sm hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl font-bold text-black mb-2">
                        {task.title}
                      </CardTitle>
                      <div className="flex items-center space-x-3 mb-3">
                        <Badge className={`${getStatusColor(task.status)} font-medium`}>
                          {task.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <Badge className={`${getDifficultyColor(task.difficulty)} font-medium`}>
                          {task.difficulty.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-red-500">
                        KSh {task.payment}
                      </div>
                      <div className="text-sm text-gray-500">per task</div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-gray-700 text-base leading-relaxed">
                    {task.description}
                  </p>

                  {/* Task Details */}
                  <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-gray-100">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{task.estimatedTime} mins</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Camera className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{task.requiredImages} photos</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{task.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {task.assignedCount}/{task.maxAssignments} assigned
                      </span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {task.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Action Button */}
                  <div className="pt-4">
                    {task.status === 'available' ? (
                      <Button
                        onClick={() => router.push(`/tasks/${task.id}`)}
                        className="w-full h-12 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-2xl"
                      >
                        Start Task
                      </Button>
                    ) : task.status === 'in_progress' ? (
                      <Button
                        onClick={() => router.push(`/tasks/${task.id}`)}
                        className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-2xl"
                      >
                        Continue Task
                      </Button>
                    ) : task.status === 'completed' ? (
                      <Button
                        disabled
                        className="w-full h-12 bg-gray-200 text-gray-600 font-semibold rounded-2xl cursor-not-allowed"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Completed
                      </Button>
                    ) : (
                      <Button
                        disabled
                        className="w-full h-12 bg-yellow-200 text-yellow-800 font-semibold rounded-2xl cursor-not-allowed"
                      >
                        Under Review
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}