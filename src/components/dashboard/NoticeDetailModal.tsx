'use client';

import { useEffect } from 'react';
import { X, AlertTriangle, Info, CheckCircle } from 'lucide-react';

interface Notice {
  id: string;
  title: string;
  content: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt: string;
  targetType: 'ALL' | 'SETTLEMENT' | 'PERSONAL';
  isRead?: boolean;
}

interface NoticeDetailModalProps {
  notice: Notice | null;
  isOpen: boolean;
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
}

export default function NoticeDetailModal({ notice, isOpen, onClose, onMarkAsRead }: NoticeDetailModalProps) {
  // Close modal with escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !notice) return null;

  const getPriorityIcon = () => {
    switch (notice.priority) {
      case 'HIGH': return <AlertTriangle size={20} style={{ color: '#ef4444' }} />;
      case 'MEDIUM': return <Info size={20} style={{ color: '#f59e0b' }} />;
      default: return <CheckCircle size={20} style={{ color: '#10b981' }} />;
    }
  };

  const getPriorityColor = () => {
    switch (notice.priority) {
      case 'HIGH': return '#ef4444';
      case 'MEDIUM': return '#f59e0b';
      default: return '#10b981';
    }
  };

  const getTargetTypeBadge = () => {
    const colors = {
      'ALL': { bg: '#dbeafe', text: '#1e40af', border: '#3b82f6' },
      'SETTLEMENT': { bg: '#fef3c7', text: '#92400e', border: '#f59e0b' },
      'PERSONAL': { bg: '#dcfce7', text: '#166534', border: '#10b981' }
    };
    
    const color = colors[notice.targetType];
    
    return (
      <span style={{
        background: color.bg,
        color: color.text,
        border: `1px solid ${color.border}`,
        padding: '4px 8px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '600',
        textTransform: 'capitalize'
      }}>
        {notice.targetType.toLowerCase()}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleMarkAsRead = () => {
    if (!notice.isRead) {
      onMarkAsRead(notice.id);
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
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(8px)',
          zIndex: 50,
          animation: 'fadeIn 0.3s ease-out'
        }}
        onClick={onClose}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '80vh',
        backgroundColor: 'white',
        borderRadius: '20px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        zIndex: 51,
        overflow: 'hidden',
        animation: 'modalSlideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          padding: '24px',
          borderBottom: '1px solid #e2e8f0',
          position: 'relative'
        }}>
          {/* Priority indicator bar */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            backgroundColor: getPriorityColor()
          }} />

          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '16px'
          }}>
            <div style={{ flex: 1 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px'
              }}>
                {getPriorityIcon()}
                <span style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: getPriorityColor(),
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {notice.priority} Priority
                </span>
                {getTargetTypeBadge()}
              </div>
              
              <h2 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#1f2937',
                margin: '0 0 8px 0',
                lineHeight: '1.3'
              }}>
                {notice.title}
              </h2>
              
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                margin: 0,
                fontWeight: '500'
              }}>
                {formatDate(notice.createdAt)}
              </p>
            </div>

            <button
              onClick={onClose}
              style={{
                background: 'rgba(107, 114, 128, 0.1)',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                color: '#6b7280'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(107, 114, 128, 0.2)';
                e.currentTarget.style.color = '#374151';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(107, 114, 128, 0.1)';
                e.currentTarget.style.color = '#6b7280';
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{
          padding: '24px',
          maxHeight: 'calc(80vh - 200px)',
          overflowY: 'auto'
        }}>
          <div style={{
            fontSize: '16px',
            lineHeight: '1.6',
            color: '#374151',
            whiteSpace: 'pre-wrap'
          }}>
            {notice.content}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '20px 24px',
          backgroundColor: '#f9fafb',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {notice.isRead ? (
              <>
                <CheckCircle size={16} style={{ color: '#10b981' }} />
                <span style={{
                  fontSize: '14px',
                  color: '#10b981',
                  fontWeight: '500'
                }}>
                  Read
                </span>
              </>
            ) : (
              <>
                <div style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#ef4444',
                  borderRadius: '50%'
                }} />
                <span style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  fontWeight: '500'
                }}>
                  Unread
                </span>
              </>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            {!notice.isRead && (
              <button
                onClick={handleMarkAsRead}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(16, 185, 129, 0.3)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(16, 185, 129, 0.2)';
                }}
              >
                Mark as Read
              </button>
            )}
            
            <button
              onClick={onClose}
              style={{
                background: 'white',
                color: '#6b7280',
                border: '1px solid #d1d5db',
                borderRadius: '10px',
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#f9fafb';
                e.currentTarget.style.borderColor = '#9ca3af';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.borderColor = '#d1d5db';
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes modalSlideIn {
          from { 
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.9);
          }
          to { 
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
      `}</style>
    </>
  );
}