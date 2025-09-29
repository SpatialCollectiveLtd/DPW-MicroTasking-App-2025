'use client';

import { useState, useEffect } from 'react';
import { Play, Target, TrendingUp } from 'lucide-react';

interface DailyCompletionCardProps {
  tasksCompleted?: number;
  targetTasks?: number;
  onStartTask: () => void;
  isLoading?: boolean;
}

export default function DailyCompletionCard({ 
  tasksCompleted = 0, 
  targetTasks = 300, 
  onStartTask,
  isLoading = false 
}: DailyCompletionCardProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  
  const progress = Math.min((tasksCompleted / targetTasks) * 100, 100);
  const circumference = 2 * Math.PI * 90; // radius of 90
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (animatedProgress / 100) * circumference;

  // Animate progress ring on mount and when progress changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progress);
    }, 100);
    return () => clearTimeout(timer);
  }, [progress]);

  const getProgressColor = () => {
    if (progress >= 100) return '#10B981'; // green
    if (progress >= 70) return '#F59E0B';   // amber  
    return '#EF4444'; // red
  };

  const getProgressMessage = () => {
    if (progress >= 100) return 'Daily target achieved! 🎉';
    if (progress >= 70) return 'Great progress today!';
    if (progress >= 30) return 'Keep up the momentum!';
    return 'Ready to start earning?';
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 pb-2">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-bold text-gray-900">Daily Progress</h3>
          <Target className="h-5 w-5 text-gray-400" />
        </div>
        <p className="text-sm text-gray-600">{getProgressMessage()}</p>
      </div>

      {/* Progress Ring Section */}
      <div className="px-6 py-8">
        <div className="relative flex items-center justify-center">
          {/* Background circle */}
          <svg 
            width="200" 
            height="200" 
            className="transform -rotate-90"
          >
            <circle
              cx="100"
              cy="100"
              r="90"
              stroke="#F3F4F6"
              strokeWidth="8"
              fill="transparent"
            />
            {/* Progress circle */}
            <circle
              cx="100"
              cy="100"
              r="90"
              stroke={getProgressColor()}
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-center">
              <div className="text-4xl font-black text-gray-900 mb-1">
                {tasksCompleted}
              </div>
              <div className="text-lg text-gray-500 font-medium">
                of {targetTasks}
              </div>
              <div className="text-sm text-gray-400 mt-1">
                tasks completed
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Stats */}
      <div className="px-6 pb-4">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-xl font-bold text-gray-900">
              {Math.round(progress)}%
            </div>
            <div className="text-xs text-gray-500">Complete</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-gray-900">
              {targetTasks - tasksCompleted}
            </div>
            <div className="text-xs text-gray-500">Remaining</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-gray-900">
              {tasksCompleted > 0 ? Math.round(tasksCompleted / (Date.now() / (1000 * 60 * 60 * 24) % 1) || 1) : 0}
            </div>
            <div className="text-xs text-gray-500">Per Hour</div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="px-6 pb-6">
        <button
          onClick={onStartTask}
          disabled={isLoading || progress >= 100}
          className="w-full h-14 bg-[#EF4444] hover:bg-[#DC2626] active:bg-[#B91C1C] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold text-lg rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-[#EF4444]/30 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3"
        >
          {progress >= 100 ? (
            <>
              <TrendingUp className="h-5 w-5" />
              Target Achieved!
            </>
          ) : (
            <>
              <Play className="h-5 w-5" />
              {tasksCompleted === 0 ? 'Start Tasks' : 'Continue Tasks'}
            </>
          )}
        </button>
        
        {progress >= 100 && (
          <p className="text-center text-sm text-gray-500 mt-3">
            Come back tomorrow for new tasks!
          </p>
        )}
      </div>
    </div>
  );
}