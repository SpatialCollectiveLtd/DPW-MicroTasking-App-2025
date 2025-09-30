'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { NotificationToast } from '@/components/notifications/NotificationToast';
import NoticesPopup from '@/components/dashboard/NoticesPopup';
import ProgressRing from '@/components/dashboard/ProgressRing';
import CompletionScreen from '@/components/dashboard/CompletionScreen';

interface Notice {
  id: string;
  title: string;
  content: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt: string;
  isRead?: boolean;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { notifications, unreadCount, addNotification, markAllAsRead } = useNotifications();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [showNoticesPopup, setShowNoticesPopup] = useState(false);
  const [tasksCompleted, setTasksCompleted] = useState(0);
  const [showCompletionScreen, setShowCompletionScreen] = useState(false);
  
  const TARGET_TASKS = 300;

  useEffect(() => {
    if (session) {
      fetchNotices();
      checkCompletionStatus();
      fetchTasksCompleted();
    }
  }, [session]);

  const checkCompletionStatus = () => {
    const today = new Date().toDateString();
    const completionDate = localStorage.getItem('dpw-completion-date');
    const completedTasks = parseInt(localStorage.getItem('dpw-tasks-completed') || '0');
    
    // If user completed tasks today, show completion screen
    if (completionDate === today && completedTasks >= TARGET_TASKS) {
      setShowCompletionScreen(true);
    }
  };

  const fetchTasksCompleted = async () => {
    try {
      // Try to fetch from API first
      const response = await fetch('/api/daily-report');
      const result = await response.json();
      
      if (result.success && result.data.tasksCompleted) {
        const completed = result.data.tasksCompleted;
        setTasksCompleted(completed);
        
        // Check if user reached the limit
        if (completed >= TARGET_TASKS) {
          setShowCompletionScreen(true);
        }
      } else {
        // Fallback to localStorage or demo data
        const storedTasks = localStorage.getItem('dpw-demo-tasks');
        const demoTasks = storedTasks ? parseInt(storedTasks) : 47; // Demo value
        setTasksCompleted(demoTasks);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      // Use demo data
      const storedTasks = localStorage.getItem('dpw-demo-tasks');
      const demoTasks = storedTasks ? parseInt(storedTasks) : 47;
      setTasksCompleted(demoTasks);
    }
  };

  const fetchNotices = async () => {
    try {
      const response = await fetch('/api/news');
      const result = await response.json();
      
      if (result.success) {
        setNotices(result.data.slice(0, 5)); // Show latest 5 notices
      }
    } catch (error) {
      console.error('Error fetching notices:', error);
      // Set some demo notices for testing
      setNotices([
        {
          id: '1',
          title: 'Welcome to DPW MicroTasking',
          content: 'Thank you for joining our community mapping initiative. Your contributions help build better communities through accurate data collection.',
          priority: 'HIGH',
          createdAt: new Date().toISOString()
        },
        {
          id: '2', 
          title: 'Payment System Update',
          content: 'We have updated our payment processing system. All earnings will now be processed faster with improved tracking.',
          priority: 'MEDIUM',
          createdAt: new Date(Date.now() - 86400000).toISOString()
        }
      ]);
      
      // Add demo notifications for testing
      addNotification({
        title: 'Welcome to DPW!',
        message: 'Your account has been activated. Start tasking to earn rewards.',
        type: 'success'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartTasking = () => {
    // Increment demo tasks for testing completion
    const newCount = tasksCompleted + 1;
    setTasksCompleted(newCount);
    localStorage.setItem('dpw-demo-tasks', newCount.toString());
    
    // Check if reached completion
    if (newCount >= TARGET_TASKS) {
      const today = new Date().toDateString();
      localStorage.setItem('dpw-completion-date', today);
      localStorage.setItem('dpw-tasks-completed', newCount.toString());
      setShowCompletionScreen(true);
      return;
    }
    
    router.push('/dashboard/tasks');
  };

  const handleBellClick = () => {
    setShowNoticesPopup(true);
    // Close the old notification panel if open
    setShowNotificationPanel(false);
  };

  const handleMarkNoticeAsRead = (noticeId: string) => {
    setNotices(prev => 
      prev.map(notice => 
        notice.id === noticeId 
          ? { ...notice, isRead: true }
          : notice
      )
    );
    
    // Also save to localStorage
    const readNotices = JSON.parse(localStorage.getItem('readNotices') || '[]');
    if (!readNotices.includes(noticeId)) {
      readNotices.push(noticeId);
      localStorage.setItem('readNotices', JSON.stringify(readNotices));
    }
  };

  const getUserName = () => {
    if (session?.user?.name) {
      return session.user.name;
    }
    if (session?.user?.phone) {
      const lastFour = session.user.phone.slice(-4);
      return `Mji wa Huruma`; // Using the name from the inspiration
    }
    return 'Worker';
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return '#ef4444';
      case 'MEDIUM': return '#f59e0b';
      default: return '#10b981';
    }
  };

  // Show completion screen if tasks are complete
  if (showCompletionScreen) {
    return (
      <CompletionScreen 
        tasksCompleted={tasksCompleted}
        targetTasks={TARGET_TASKS}
        onComplete={() => setShowCompletionScreen(false)}
      />
    );
  }

  if (!session) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '32px',
            height: '32px',
            border: '2px solid #e5e7eb',
            borderTop: '2px solid #ef4444',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: '#6b7280' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          maxWidth: '400px',
          margin: '0 auto'
        }}>
          <div>
            <h1 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#111827',
              margin: '0 0 4px 0'
            }}>
              {getGreeting()}, {getUserName()}
            </h1>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              margin: '0'
            }}>
              Ready to start earning?
            </p>
          </div>
          
          <div style={{ position: 'relative' }}>
            <button
              onClick={handleBellClick}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                position: 'relative',
                padding: '8px'
              }}
            >
              <Bell style={{ 
                width: '24px', 
                height: '24px', 
                color: '#6b7280'
              }} />
              {unreadCount > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '0px',
                  right: '0px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '400px',
        margin: '0 auto',
        padding: '24px 20px'
      }}>
        {/* Hero Section */}
        <div style={{
          textAlign: 'center',
          marginBottom: '32px'
        }}>
          <h2 style={{
            fontSize: '36px',
            fontWeight: 'bold',
            color: '#111827',
            margin: '0 0 8px 0',
            lineHeight: '1.1'
          }}>
            The{' '}
            <span style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              power
            </span>
            {' '}of{' '}
            <span style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              digital
            </span>
            {' '}work in your{' '}
            <span style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              hands
            </span>
          </h2>
          <p style={{
            fontSize: '16px',
            color: '#6b7280',
            margin: '0',
            lineHeight: '1.5'
          }}>
            Transform your community through mapping and earn while making a difference
          </p>
        </div>

        {/* Progress Ring Section */}
        <div style={{
          padding: '32px 24px',
          marginBottom: '24px',
          position: 'relative',
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)',
          borderRadius: '24px',
          overflow: 'hidden'
        }}>
          {/* Background pattern */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
            pointerEvents: 'none'
          }} />
          
          <ProgressRing 
            completed={tasksCompleted} 
            total={TARGET_TASKS} 
            size={220}
          />
          
          <div style={{
            textAlign: 'center',
            marginTop: '24px',
            position: 'relative',
            zIndex: 1
          }}>
            <p style={{
              fontSize: '16px',
              color: '#4b5563',
              margin: '0 0 8px 0',
              fontWeight: '500'
            }}>
              Daily Progress
            </p>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              margin: '0',
              opacity: 0.8
            }}>
              {tasksCompleted >= TARGET_TASKS 
                ? 'Congratulations! You\'ve completed today\'s tasks!' 
                : `${TARGET_TASKS - tasksCompleted} tasks remaining`
              }
            </p>
          </div>
        </div>

        {/* Start Tasking Button */}
        <button
          onClick={handleStartTasking}
          style={{
            width: '100%',
            padding: '16px 24px',
            backgroundColor: '#111827',
            color: 'white',
            border: 'none',
            borderRadius: '16px',
            fontSize: '18px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = '#000000';
            (e.target as HTMLButtonElement).style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = '#111827';
            (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
          }}
        >
          ▶ Start Tasking
        </button>
      </div>

      {/* Add CSS animation */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* Notification Toast */}
      <NotificationToast />

      {/* Notices Popup */}
      <NoticesPopup
        isOpen={showNoticesPopup}
        onClose={() => setShowNoticesPopup(false)}
        notices={notices}
        onMarkAsRead={handleMarkNoticeAsRead}
      />

      {/* Overlay to close notification panel */}
      {showNotificationPanel && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 40
          }}
          onClick={() => setShowNotificationPanel(false)}
        />
      )}
    </div>
  );
}