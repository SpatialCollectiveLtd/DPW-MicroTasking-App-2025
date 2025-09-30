'use client';

import { useEffect, useState } from 'react';

interface ProgressRingProps {
  completed: number;
  total: number;
  size?: number;
}

export default function ProgressRing({ completed, total, size = 200 }: ProgressRingProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const progress = Math.min((completed / total) * 100, 100);
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (animatedProgress / 100) * circumference;

  // Animate progress on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progress);
    }, 100);
    return () => clearTimeout(timer);
  }, [progress]);

  const isComplete = completed >= total;

  return (
    <div style={{
      position: 'relative',
      width: `${size}px`,
      height: `${size}px`,
      margin: '0 auto'
    }}>
      {/* Glassmorphism background */}
      <div style={{
        position: 'absolute',
        inset: '0',
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
      }} />

      {/* SVG Progress Ring */}
      <svg
        width={size}
        height={size}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          transform: 'rotate(-90deg)'
        }}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="8"
          fill="none"
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={isComplete ? '#10b981' : '#60a5fa'}
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          style={{
            transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
            filter: 'drop-shadow(0 0 8px rgba(96, 165, 250, 0.5))'
          }}
        />

        {/* Rotating light indicator (only if not complete) */}
        {!isComplete && (
          <circle
            cx={size / 2 + radius * Math.cos((animatedProgress / 100) * 2 * Math.PI)}
            cy={size / 2 + radius * Math.sin((animatedProgress / 100) * 2 * Math.PI)}
            r="4"
            fill="#60a5fa"
            style={{
              filter: 'drop-shadow(0 0 6px rgba(96, 165, 250, 0.8))',
              animation: !isComplete ? 'pulse 2s infinite' : 'none'
            }}
          />
        )}
      </svg>

      {/* Center content */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        color: 'white'
      }}>
        <div style={{
          fontSize: '36px',
          fontWeight: 'bold',
          marginBottom: '4px',
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
        }}>
          {completed}
        </div>
        <div style={{
          fontSize: '14px',
          opacity: 0.8,
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
        }}>
          of {total}
        </div>
        <div style={{
          fontSize: '12px',
          opacity: 0.7,
          marginTop: '2px',
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
        }}>
          tasks completed
        </div>
      </div>

      {/* Completion checkmark */}
      {isComplete && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#10b981',
          animation: 'checkmarkPop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <path
              d="M20 6L9 17L4 12"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { 
            opacity: 1; 
            transform: scale(1);
          }
          50% { 
            opacity: 0.7; 
            transform: scale(1.2);
          }
        }
        
        @keyframes checkmarkPop {
          0% { 
            transform: translate(-50%, -50%) scale(0);
            opacity: 0;
          }
          50% { 
            transform: translate(-50%, -50%) scale(1.2);
            opacity: 1;
          }
          100% { 
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}