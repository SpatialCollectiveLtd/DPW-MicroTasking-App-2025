'use client';

import { useState } from 'react';
import { X, Filter, Clock } from 'lucide-react';

interface Notice {
  id: string;
  title: string;
  content: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt: string;
  targetType: 'ALL' | 'SETTLEMENT' | 'PERSONAL';
  isRead?: boolean;
}

interface NoticesPopupProps {
  isOpen: boolean;
  onClose: () => void;
  notices: Notice[];
  onMarkAsRead: (id: string) => void;
}

export default function NoticesPopup({ isOpen, onClose, notices, onMarkAsRead }: NoticesPopupProps) {
  const [activeTab, setActiveTab] = useState<'recent' | 'past' | 'personal'>('recent');

  if (!isOpen) return null;

  const filterNotices = (type: 'recent' | 'past' | 'personal') => {
    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - (3 * 24 * 60 * 60 * 1000));

    switch (type) {
      case 'recent':
        return notices.filter(notice => new Date(notice.createdAt) > threeDaysAgo);
      case 'past':
        return notices.filter(notice => new Date(notice.createdAt) <= threeDaysAgo);
      case 'personal':
        return notices.filter(notice => notice.targetType === 'PERSONAL');
      default:
        return notices;
    }
  };

  const filteredNotices = filterNotices(activeTab);

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

  const getTargetTypeLabel = (targetType: string) => {
    switch (targetType) {
      case 'PERSONAL': return 'Personal';
      case 'SETTLEMENT': return 'Settlement';
      default: return 'General';
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 50,
          animation: 'fadeIn 0.3s ease-out'
        }}
        onClick={onClose}
      />

      {/* Popup Panel */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'white',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          maxHeight: '80vh',
          zIndex: 51,
          animation: 'slideUp 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          boxShadow: '0 -10px 25px -5px rgba(0, 0, 0, 0.1), 0 -10px 10px -5px rgba(0, 0, 0, 0.04)'
        }}
      >
        {/* Handle */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          padding: '12px 0 8px 0' 
        }}>
          <div style={{
            width: '40px',
            height: '4px',
            backgroundColor: '#d1d5db',
            borderRadius: '2px'
          }} />
        </div>

        {/* Header */}
        <div style={{
          padding: '0 24px 16px 24px',
          borderBottom: '1px solid #f3f4f6'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#111827',
              margin: '0'
            }}>
              DPW Notices
            </h2>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '8px',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.backgroundColor = '#f3f4f6';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.backgroundColor = 'transparent';
              }}
            >
              <X style={{ width: '24px', height: '24px', color: '#6b7280' }} />
            </button>
          </div>

          {/* Tabs */}
          <div style={{
            display: 'flex',
            gap: '8px'
          }}>
            {[
              { key: 'recent', label: 'Recent' },
              { key: 'past', label: 'Past' },
              { key: 'personal', label: 'Personal' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  backgroundColor: activeTab === tab.key ? '#111827' : '#f3f4f6',
                  color: activeTab === tab.key ? 'white' : '#6b7280'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{
          maxHeight: 'calc(80vh - 120px)',
          overflowY: 'auto',
          padding: '16px 24px 32px 24px'
        }}>
          {filteredNotices.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '48px 16px',
              color: '#9ca3af'
            }}>
              <Filter style={{ width: '48px', height: '48px', margin: '0 auto 16px', color: '#d1d5db' }} />
              <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 8px 0' }}>
                No notices yet
              </h3>
              <p style={{ fontSize: '14px', margin: '0' }}>
                {activeTab === 'recent' && 'No recent notices to show'}
                {activeTab === 'past' && 'No past notices found'}
                {activeTab === 'personal' && 'No personal notices for you'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {filteredNotices.map((notice) => (
                <div
                  key={notice.id}
                  onClick={() => !notice.isRead && onMarkAsRead(notice.id)}
                  style={{
                    padding: '20px',
                    backgroundColor: notice.isRead ? '#f9fafb' : '#fff',
                    border: `2px solid ${notice.isRead ? '#f3f4f6' : getPriorityColor(notice.priority)}`,
                    borderRadius: '16px',
                    cursor: notice.isRead ? 'default' : 'pointer',
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    if (!notice.isRead) {
                      (e.target as HTMLElement).style.transform = 'translateY(-2px)';
                      (e.target as HTMLElement).style.boxShadow = '0 8px 25px -5px rgba(0, 0, 0, 0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!notice.isRead) {
                      (e.target as HTMLElement).style.transform = 'translateY(0)';
                      (e.target as HTMLElement).style.boxShadow = 'none';
                    }
                  }}
                >
                  {/* Header */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    marginBottom: '12px'
                  }}>
                    <h4 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: notice.isRead ? '#6b7280' : '#111827',
                      margin: '0',
                      flex: 1,
                      lineHeight: '1.4'
                    }}>
                      {notice.title}
                    </h4>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        fontSize: '10px',
                        fontWeight: '600',
                        color: getPriorityColor(notice.priority),
                        backgroundColor: `${getPriorityColor(notice.priority)}20`,
                        padding: '4px 8px',
                        borderRadius: '12px'
                      }}>
                        {getTargetTypeLabel(notice.targetType)}
                      </span>
                      
                      {!notice.isRead && (
                        <div style={{
                          width: '8px',
                          height: '8px',
                          backgroundColor: getPriorityColor(notice.priority),
                          borderRadius: '50%'
                        }} />
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <p style={{
                    fontSize: '14px',
                    color: notice.isRead ? '#9ca3af' : '#4b5563',
                    margin: '0 0 12px 0',
                    lineHeight: '1.5'
                  }}>
                    {notice.content}
                  </p>

                  {/* Footer */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <Clock style={{ width: '14px', height: '14px', color: '#9ca3af' }} />
                    <span style={{
                      fontSize: '12px',
                      color: '#9ca3af'
                    }}>
                      {formatTimeAgo(notice.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { 
            transform: translateY(100%);
            opacity: 0;
          }
          to { 
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}