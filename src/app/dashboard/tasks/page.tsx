'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2, ToggleLeft, ToggleRight, Eye, Focus, ArrowLeft } from 'lucide-react';
import dynamic from 'next/dynamic';
import DashboardLayout from '@/components/layout/DashboardLayout';

// Dynamically import the PhotoSphere component to avoid SSR issues
const PhotoSphere = dynamic(() => import('react-photo-sphere-viewer').then(mod => ({ default: mod.ReactPhotoSphereViewer })), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
    </div>
  )
});

interface Image {
  id: string;
  url: string;
  campaignId: string;
}

interface Campaign {
  id: string;
  title: string;
  question: string;
}

interface TaskData {
  campaign: Campaign;
  images: Image[];
  currentImageIndex: number;
  totalImages: number;
}

type ViewMode = 'immersive' | 'focused';

export default function TasksPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [taskData, setTaskData] = useState<TaskData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('immersive');
  const [error, setError] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      fetchTaskData();
    }
  }, [status, router]);

  const fetchTaskData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/tasks/current');
      const result = await response.json();

      if (result.success) {
        setTaskData(result.data);
      } else {
        setError(result.message || 'Failed to load tasks');
      }
    } catch (err) {
      console.error('Error fetching task data:', err);
      setError('Failed to load tasks. Please refresh the page.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResponse = async (answer: boolean) => {
    if (!taskData || isSubmitting) return;

    const currentImage = taskData.images[taskData.currentImageIndex];
    
    try {
      setIsSubmitting(true);
      
      const response = await fetch('/api/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageId: currentImage.id,
          answer: answer,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Check if there are more images
        const nextIndex = taskData.currentImageIndex + 1;
        
        if (nextIndex >= taskData.totalImages) {
          // All images completed - redirect to completion page
          router.push('/dashboard/tasks/complete');
        } else {
          // Smooth transition to next image
          setIsTransitioning(true);
          setTimeout(() => {
            setTaskData(prev => prev ? {
              ...prev,
              currentImageIndex: nextIndex
            } : null);
            setIsTransitioning(false);
          }, 300);
        }
      } else {
        setError(result.message || 'Failed to submit response');
      }
    } catch (err) {
      console.error('Error submitting response:', err);
      setError('Failed to submit response. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Error Loading Tasks</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!taskData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-4">No Tasks Available</h2>
          <p className="text-gray-600 mb-6">
            You have completed all available tasks for today. Check back tomorrow!
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentImage = taskData.images[taskData.currentImageIndex];
  const progress = ((taskData.currentImageIndex + 1) / taskData.totalImages) * 100;

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-md mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back
              </button>
              
              {/* View Toggle */}
              <div className="flex items-center space-x-2">
                <Eye className={`h-4 w-4 ${viewMode === 'immersive' ? 'text-[#EF4444]' : 'text-gray-400'}`} />
                <button
                  onClick={() => setViewMode(viewMode === 'immersive' ? 'focused' : 'immersive')}
                  className="p-1"
                >
                  {viewMode === 'immersive' ? (
                    <ToggleLeft className="h-6 w-6 text-[#EF4444]" />
                  ) : (
                    <ToggleRight className="h-6 w-6 text-[#EF4444]" />
                  )}
                </button>
                <Focus className={`h-4 w-4 ${viewMode === 'focused' ? 'text-[#EF4444]' : 'text-gray-400'}`} />
              </div>
            </div>
            
            <div>
              <h1 className="text-lg font-bold text-gray-900">{taskData.campaign.title}</h1>
              <p className="text-sm text-gray-600">
                Image {taskData.currentImageIndex + 1} of {taskData.totalImages}
              </p>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="bg-gray-200 rounded-full h-2 w-full">
                <div 
                  className="bg-[#EF4444] h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-md mx-auto p-4 space-y-4">
          {/* Question Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h2 className="text-base font-semibold text-gray-900 mb-2">Question:</h2>
            <p className="text-gray-700 text-sm leading-relaxed">{taskData.campaign.question}</p>
          </div>

          {/* Image Viewer */}
          <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 ${
            isTransitioning ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
          }`}>
            {viewMode === 'immersive' ? (
              // Immersive 360° View
              <div className="relative">
                <PhotoSphere
                  src={currentImage.url}
                  height="400px"
                  width="100%"
                  littlePlanet={false}
                  navbar={false}
                  touchmoveTwoFingers={false}
                  mousemove={true}
                  mousewheel={true}
                  container=""
                />
              </div>
            ) : (
              // Focused Panoramic View
              <div className="p-4">
                <div className="overflow-x-auto">
                  <img
                    src={currentImage.url}
                    alt="Panoramic view"
                    className="h-64 w-auto min-w-full object-cover rounded-lg"
                    style={{ 
                      transform: 'perspective(1000px) rotateX(0deg)',
                      filter: 'none'
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Scroll horizontally to explore the full panoramic view
                </p>
              </div>
            )}
          </div>

          {/* Response Buttons */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="grid grid-cols-2 gap-3">
              {/* No Button */}
              <button
                onClick={() => handleResponse(false)}
                disabled={isSubmitting || isTransitioning}
                className="h-12 border-2 border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed font-bold text-base rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-gray-500/20"
              >
                {isSubmitting ? (
                  <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                ) : (
                  'No'
                )}
              </button>

              {/* Yes Button */}
              <button
                onClick={() => handleResponse(true)}
                disabled={isSubmitting || isTransitioning}
                className="h-12 bg-[#EF4444] hover:bg-[#DC2626] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-base rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-[#EF4444]/20"
              >
                {isSubmitting ? (
                  <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                ) : (
                  'Yes'
                )}
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-3">
              Take your time to examine the image carefully before responding
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}