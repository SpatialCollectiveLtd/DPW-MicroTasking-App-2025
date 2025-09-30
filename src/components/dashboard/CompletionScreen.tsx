'use client';

import { useEffect, useState } from 'react';
import { signOut } from 'next-auth/react';

interface CompletionScreenProps {
  tasksCompleted: number;
  targetTasks: number;
  onComplete?: () => void;
}

export default function CompletionScreen({ tasksCompleted, targetTasks, onComplete }: CompletionScreenProps) {
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAnimation(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const handleDone = async () => {
    try {
      // Mark completion in localStorage
      const today = new Date().toDateString();
      localStorage.setItem('dpw-completion-date', today);
      localStorage.setItem('dpw-tasks-completed', tasksCompleted.toString());
      
      // Sign out and redirect
      await signOut({ redirect: false });
      
      // Open Google in new tab
      window.open('https://www.google.com', '_blank');
      
      // Close current tab/window
      window.close();
      
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Error completing session:', error);
      // Fallback: just redirect to Google
      window.location.href = 'https://www.google.com';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(135deg, #ef4444 0%, #7f1d1d 50%, #000000 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      zIndex: 9999
    }}>
      {/* Animated particles background */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        pointerEvents: 'none'
      }}>
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: '4px',
              height: '4px',
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
              borderRadius: '50%',
              animation: `float ${3 + Math.random() * 4}s infinite linear`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>

      {/* Success checkmark */}
      <div style={{
        marginBottom: '32px',
        transform: showAnimation ? 'scale(1)' : 'scale(0)',
        transition: 'transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        transitionDelay: '0.2s'
      }}>
        <div style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
        }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
            <path
              d="M20 6L9 17L4 12"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="24"
              strokeDashoffset="24"
              style={{
                animation: showAnimation ? 'drawCheck 1s ease-out 0.5s forwards' : 'none'
              }}
            />
          </svg>
        </div>
      </div>

      {/* Main content */}
      <div style={{
        textAlign: 'center',
        maxWidth: '400px',
        padding: '0 32px',
        transform: showAnimation ? 'translateY(0) opacity(1)' : 'translateY(20px) opacity(0)',
        transition: 'all 0.8s ease-out',
        transitionDelay: '0.4s'
      }}>
        <h1 style={{
          fontSize: '48px',
          fontWeight: 'bold',
          margin: '0 0 16px 0',
          textShadow: '0 4px 8px rgba(0, 0, 0, 0.3)'
        }}>
          All done!
        </h1>

        <p style={{
          fontSize: '18px',
          lineHeight: '1.6',
          margin: '0 0 40px 0',
          opacity: 0.9,
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
        }}>
          Congratulations! You've completed all {targetTasks} tasks for today. 
          Your hard work contributes to building better communities through digital mapping. 
          Thank you for your dedication!
        </p>

        {/* Stats */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '40px',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '36px',
            fontWeight: 'bold',
            marginBottom: '8px'
          }}>
            {tasksCompleted}
          </div>
          <div style={{
            fontSize: '14px',
            opacity: 0.8
          }}>
            Tasks completed today
          </div>
        </div>
      </div>

      {/* Done button */}
      <button
        onClick={handleDone}
        style={{
          padding: '16px 48px',
          backgroundColor: 'white',
          color: '#111827',
          border: 'none',
          borderRadius: '50px',
          fontSize: '18px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
          transform: showAnimation ? 'translateY(0) opacity(1)' : 'translateY(20px) opacity(0)',
          transitionDelay: '0.8s',
          minWidth: '160px'
        }}
        onMouseEnter={(e) => {
          (e.target as HTMLButtonElement).style.transform = 'translateY(-2px)';
          (e.target as HTMLButtonElement).style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.3)';
        }}
        onMouseLeave={(e) => {
          (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
          (e.target as HTMLButtonElement).style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.2)';
        }}
      >
        Done
      </button>

      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(100vh) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100px) rotate(360deg);
            opacity: 0;
          }
        }
        
        @keyframes drawCheck {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  );
}