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
      {/* Glassmorphism background - black effect */}
      <div style={{
        position: 'absolute',
        inset: '0',
        borderRadius: '50%',
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.4), inset 0 2px 4px 0 rgba(255, 255, 255, 0.05)'
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
        
        {/* Progress circle with filling animation */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={isComplete ? '#10b981' : '#ef4444'}
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          style={{
            transition: 'stroke-dashoffset 2s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.5s ease',
            filter: 'drop-shadow(0 0 12px rgba(239, 68, 68, 0.8))'
          }}
        />

        {/* Artistic flowing particles animation */}
        {!isComplete && animatedProgress > 0 && (
          <>
            <defs>
              <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(239, 68, 68, 0)" />
                <stop offset="50%" stopColor="rgba(239, 68, 68, 0.8)" />
                <stop offset="100%" stopColor="rgba(239, 68, 68, 0)" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            {/* Flowing energy particles */}
            {[...Array(6)].map((_, i) => {
              const angle = (animatedProgress / 100) * 2 * Math.PI + (i * Math.PI / 3);
              const particleRadius = radius + Math.sin(Date.now() * 0.003 + i) * 8;
              return (
                <circle
                  key={i}
                  cx={size / 2 + particleRadius * Math.cos(angle)}
                  cy={size / 2 + particleRadius * Math.sin(angle)}
                  r={2 + Math.sin(Date.now() * 0.005 + i) * 1}
                  fill="#ef4444"
                  opacity={0.6 + Math.sin(Date.now() * 0.004 + i) * 0.3}
                  filter="url(#glow)"
                  style={{
                    animation: `particleFloat${i} ${3 + i * 0.5}s infinite ease-in-out`
                  }}
                />
              );
            })}
            
            {/* Central energy core */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={4}
              fill="#ef4444"
              opacity="0.4"
              filter="url(#glow)"
              style={{
                animation: 'energyPulse 2s infinite ease-in-out'
              }}
            />
          </>
        )}
      </svg>

      {/* Center content with better visibility */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        color: 'white'
      }}>
        <div style={{
          fontSize: '42px',
          fontWeight: 'bold',
          marginBottom: '4px',
          textShadow: '0 2px 8px rgba(0, 0, 0, 0.8), 0 0 20px rgba(239, 68, 68, 0.5)',
          color: '#ffffff'
        }}>
          {completed}
        </div>
        <div style={{
          fontSize: '16px',
          opacity: 0.9,
          textShadow: '0 1px 4px rgba(0, 0, 0, 0.8)',
          color: '#e5e7eb',
          fontWeight: '500'
        }}>
          of {total}
        </div>
        <div style={{
          fontSize: '13px',
          opacity: 0.8,
          marginTop: '2px',
          textShadow: '0 1px 4px rgba(0, 0, 0, 0.8)',
          color: '#d1d5db',
          fontWeight: '400'
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
          animation: 'checkmarkPop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          filter: 'drop-shadow(0 0 10px rgba(16, 185, 129, 0.5))'
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
        @keyframes energyPulse {
          0%, 100% { 
            opacity: 0.4; 
            transform: scale(1);
          }
          50% { 
            opacity: 0.8; 
            transform: scale(1.5);
          }
        }
        
        @keyframes particleFloat0 {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        
        @keyframes particleFloat1 {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.9; }
        }
        
        @keyframes particleFloat2 {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 0.3; }
        }
        
        @keyframes particleFloat3 {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        
        @keyframes particleFloat4 {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 0.4; }
        }
        
        @keyframes particleFloat5 {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.9; }
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