'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { NotificationToast } from '@/components/notifications/NotificationToast';

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

  useEffect(() => {
    if (session) {
      fetchNotices();
    }
  }, [session]);

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
    router.push('/dashboard/tasks');
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
              onClick={() => setShowNotificationPanel(!showNotificationPanel)}
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

            {/* Notification Panel */}
            {showNotificationPanel && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: '0',
                marginTop: '8px',
                width: '300px',
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                border: '1px solid #e5e7eb',
                zIndex: 50,
                maxHeight: '400px',
                overflow: 'hidden'
              }}>
                <div style={{
                  padding: '16px',
                  borderBottom: '1px solid #f3f4f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#111827',
                    margin: '0'
                  }}>
                    Notifications
                  </h3>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        style={{
                          fontSize: '12px',
                          color: '#6b7280',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          textDecoration: 'underline'
                        }}
                      >
                        Mark all read
                      </button>
                    )}
                    <button
                      onClick={() => setShowNotificationPanel(false)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px'
                      }}
                    >
                      <X style={{ width: '16px', height: '16px', color: '#6b7280' }} />
                    </button>
                  </div>
                </div>
                
                <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div style={{
                      padding: '32px 16px',
                      textAlign: 'center',
                      color: '#9ca3af'
                    }}>
                      No notifications yet
                    </div>
                  ) : (
                    notifications.slice(0, 10).map((notification) => (
                      <div
                        key={notification.id}
                        style={{
                          padding: '12px 16px',
                          borderBottom: '1px solid #f9fafb',
                          backgroundColor: notification.read ? 'white' : '#f0f9ff'
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between'
                        }}>
                          <div style={{ flex: 1 }}>
                            <h4 style={{
                              fontSize: '13px',
                              fontWeight: '600',
                              color: '#111827',
                              margin: '0 0 4px 0'
                            }}>
                              {notification.title}
                            </h4>
                            <p style={{
                              fontSize: '12px',
                              color: '#6b7280',
                              margin: '0 0 4px 0',
                              lineHeight: '1.4'
                            }}>
                              {notification.message}
                            </p>
                            <span style={{
                              fontSize: '11px',
                              color: '#9ca3af'
                            }}>
                              {formatTimeAgo(notification.timestamp.toISOString())}
                            </span>
                          </div>
                          {!notification.read && (
                            <div style={{
                              width: '8px',
                              height: '8px',
                              backgroundColor: '#3b82f6',
                              borderRadius: '50%',
                              marginTop: '4px',
                              marginLeft: '8px'
                            }} />
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
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

        {/* Notices Section */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#111827',
            margin: '0 0 16px 0'
          }}>
            Latest Updates
          </h3>
          
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{
                width: '24px',
                height: '24px',
                border: '2px solid #e5e7eb',
                borderTop: '2px solid #ef4444',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 8px'
              }} />
              <p style={{ color: '#6b7280', fontSize: '14px', margin: '0' }}>Loading updates...</p>
            </div>
          ) : notices.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <p style={{ color: '#9ca3af', fontSize: '14px', margin: '0' }}>No updates at this time</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {notices.map((notice) => (
                <div
                  key={notice.id}
                  style={{
                    padding: '16px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '12px',
                    borderLeft: `4px solid ${getPriorityColor(notice.priority)}`
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    justifyContent: 'space-between',
                    marginBottom: '8px'
                  }}>
                    <h4 style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#111827',
                      margin: '0',
                      flex: '1'
                    }}>
                      {notice.title}
                    </h4>
                    {notice.priority === 'HIGH' && (
                      <span style={{
                        fontSize: '10px',
                        fontWeight: '600',
                        color: '#ef4444',
                        backgroundColor: '#fef2f2',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        marginLeft: '8px'
                      }}>
                        Important
                      </span>
                    )}
                  </div>
                  <p style={{
                    fontSize: '13px',
                    color: '#6b7280',
                    margin: '0 0 8px 0',
                    lineHeight: '1.4'
                  }}>
                    {notice.content.length > 100 
                      ? `${notice.content.substring(0, 100)}...` 
                      : notice.content
                    }
                  </p>
                  <span style={{
                    fontSize: '11px',
                    color: '#9ca3af'
                  }}>
                    {formatTimeAgo(notice.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
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