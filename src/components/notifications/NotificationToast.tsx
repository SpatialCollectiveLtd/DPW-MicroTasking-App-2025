'use client';

import { useState } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import { X, Check, AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';

export function NotificationToast() {
  const { notifications, markAsRead, removeNotification } = useNotifications();
  const [visible, setVisible] = useState<string[]>([]);

  // Show unread notifications as toasts
  const unreadNotifications = notifications.filter(n => !n.read && !visible.includes(n.id)).slice(0, 3);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle style={{ width: '20px', height: '20px', color: '#10b981' }} />;
      case 'error': return <XCircle style={{ width: '20px', height: '20px', color: '#ef4444' }} />;
      case 'warning': return <AlertTriangle style={{ width: '20px', height: '20px', color: '#f59e0b' }} />;
      default: return <Info style={{ width: '20px', height: '20px', color: '#3b82f6' }} />;
    }
  };

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case 'success': return '#ecfdf5';
      case 'error': return '#fef2f2';
      case 'warning': return '#fffbeb';
      default: return '#eff6ff';
    }
  };

  const getBorderColor = (type: string) => {
    switch (type) {
      case 'success': return '#10b981';
      case 'error': return '#ef4444';
      case 'warning': return '#f59e0b';
      default: return '#3b82f6';
    }
  };

  const handleDismiss = (id: string) => {
    markAsRead(id);
    setVisible(prev => [...prev, id]);
  };

  if (unreadNotifications.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      maxWidth: '320px'
    }}>
      {unreadNotifications.map((notification) => (
        <div
          key={notification.id}
          style={{
            backgroundColor: getBackgroundColor(notification.type),
            border: `1px solid ${getBorderColor(notification.type)}`,
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            animation: 'slideInRight 0.3s ease-out'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            {getIcon(notification.type)}
            <div style={{ flex: 1 }}>
              <h4 style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#111827',
                margin: '0 0 4px 0'
              }}>
                {notification.title}
              </h4>
              <p style={{
                fontSize: '13px',
                color: '#6b7280',
                margin: '0',
                lineHeight: '1.4'
              }}>
                {notification.message}
              </p>
            </div>
            <button
              onClick={() => handleDismiss(notification.id)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X style={{ width: '16px', height: '16px', color: '#6b7280' }} />
            </button>
          </div>
        </div>
      ))}

      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}