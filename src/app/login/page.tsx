'use client';

import { useState, useEffect } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { isValidKenyanPhone } from '@/lib/utils';

interface Settlement {
  id: string;
  name: string;
  location?: string;
}

interface LoginFormData {
  phone: string;
  settlementId: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [formData, setFormData] = useState<LoginFormData>({
    phone: '',
    settlementId: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSettlements, setIsLoadingSettlements] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSettlements();
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession();
      if (session) {
        // Check if user completed tasks today
        const today = new Date().toDateString();
        const completionDate = localStorage.getItem('dpw-completion-date');
        const completedTasks = parseInt(localStorage.getItem('dpw-tasks-completed') || '0');
        
        if (completionDate === today && completedTasks >= 300) {
          // User has completed today's tasks, redirect to dashboard which will show completion screen
          router.replace('/dashboard');
        } else {
          router.replace('/dashboard');
        }
      }
    };
    checkSession();
  }, [router]);

  const fetchSettlements = async () => {
    try {
      const response = await fetch('/api/settlements');
      const result = await response.json();
      
      if (result.success) {
        setSettlements(result.data);
      } else {
        setError('Network error, please try again');
      }
    } catch (err) {
      console.error('Error fetching settlements:', err);
      setError('Network error, please try again');
    } finally {
      setIsLoadingSettlements(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.phone.trim()) {
      setError('Please enter your phone number');
      return;
    }

    if (!isValidKenyanPhone(formData.phone)) {
      setError('Please enter a valid Kenyan phone number');
      return;
    }

    if (!formData.settlementId) {
      setError('Please select your settlement');
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        phone: formData.phone,
        settlementId: formData.settlementId,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid credentials. Please check your phone number and settlement.');
      } else if (result?.ok) {
        router.push('/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error, please try again');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, phone: value }));
    if (error) setError('');
  };

  const selectedSettlement = settlements.find(s => s.id === formData.settlementId);
  const isFormValid = formData.phone.trim() && formData.settlementId && !isLoadingSettlements;

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f5f5f5', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      position: 'relative'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        padding: '48px',
        width: '100%',
        maxWidth: '400px'
      }}>
        {/* Title inside the container */}
        <div style={{ 
          textAlign: 'center',
          marginBottom: '32px'
        }}>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#111827',
            margin: '0 0 4px 0',
            letterSpacing: '-0.5px'
          }}>
            DPW MicroTasking
          </h1>
          <p style={{
            color: '#6b7280',
            margin: '0 0 24px 0',
            fontSize: '14px'
          }}>
            Digital Public Works Platform
          </p>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <p style={{
            color: '#374151',
            margin: '0',
            fontSize: '18px',
            fontWeight: '500'
          }}>
            Welcome back! Please sign in to access your workspace.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="+254701234567"
              value={formData.phone}
              onChange={handlePhoneChange}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '16px',
                backgroundColor: 'white',
                color: '#111827',
                outline: 'none',
                transition: 'all 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#ef4444';
                e.target.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Settlement
            </label>
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                disabled={isLoading || isLoadingSettlements}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px',
                  backgroundColor: 'white',
                  color: formData.settlementId ? '#111827' : '#9ca3af',
                  outline: 'none',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#ef4444';
                  e.target.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <span>
                  {formData.settlementId 
                    ? settlements.find(s => s.id === formData.settlementId)?.name || 'Choose your settlement...'
                    : 'Choose your settlement...'
                  }
                </span>
                <svg 
                  style={{
                    width: '16px',
                    height: '16px',
                    transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s'
                  }}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: '0',
                  right: '0',
                  marginTop: '4px',
                  backgroundColor: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                  zIndex: 50,
                  maxHeight: '200px',
                  overflowY: 'auto'
                }}>
                  {settlements.map((settlement, index) => (
                    <button
                      key={settlement.id}
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, settlementId: settlement.id }));
                        setIsDropdownOpen(false);
                        if (error) setError('');
                      }}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        textAlign: 'left',
                        border: 'none',
                        backgroundColor: 'white',
                        cursor: 'pointer',
                        fontSize: '16px',
                        color: '#111827',
                        borderRadius: index === 0 ? '8px 8px 0 0' : index === settlements.length - 1 ? '0 0 8px 8px' : '0',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        (e.target as HTMLButtonElement).style.backgroundColor = '#f3f4f6';
                      }}
                      onMouseLeave={(e) => {
                        (e.target as HTMLButtonElement).style.backgroundColor = 'white';
                      }}
                    >
                      <div style={{ fontWeight: '500' }}>{settlement.name}</div>
                      {settlement.location && (
                        <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '2px' }}>
                          {settlement.location}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {isLoadingSettlements && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginTop: '8px',
                fontSize: '14px',
                color: '#6b7280'
              }}>
                <Loader2 style={{ width: '16px', height: '16px', marginRight: '8px' }} className="animate-spin" />
                Loading settlements...
              </div>
            )}
          </div>

          {error && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              padding: '12px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              marginBottom: '24px'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!isFormValid || isLoading}
            style={{
              width: '100%',
              padding: '12px 24px',
              backgroundColor: isFormValid && !isLoading ? '#1f2937' : '#9ca3af',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: isFormValid && !isLoading ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              if (isFormValid && !isLoading) {
                (e.target as HTMLButtonElement).style.backgroundColor = '#111827';
              }
            }}
            onMouseLeave={(e) => {
              if (isFormValid && !isLoading) {
                (e.target as HTMLButtonElement).style.backgroundColor = '#1f2937';
              }
            }}
          >
            {isLoading ? (
              <>
                <Loader2 style={{ width: '20px', height: '20px', marginRight: '8px' }} className="animate-spin" />
                Signing in...
              </>
            ) : (
              'Log in'
            )}
          </button>
        </form>

        <div style={{
          textAlign: 'center',
          marginTop: '24px',
          paddingTop: '24px',
          borderTop: '1px solid #e5e7eb'
        }}>
          <p style={{
            color: '#6b7280',
            fontSize: '14px',
            margin: '0'
          }}>
            Don't have an account?{' '}
            <span style={{
              color: '#ef4444',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}>
              Contact admin
            </span>
          </p>
        </div>

        {/* Copyright Footer inside container */}
        <div style={{ 
          textAlign: 'center',
          marginTop: '24px',
          paddingTop: '16px',
          borderTop: '1px solid #f3f4f6'
        }}>
          <p style={{
            color: '#9ca3af',
            fontSize: '12px',
            margin: '0'
          }}>
            © 2025 Spatial Collective Ltd. All rights reserved.
          </p>
        </div>
      </div>

      {/* Overlay to close dropdown */}
      {isDropdownOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 40
          }}
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
}