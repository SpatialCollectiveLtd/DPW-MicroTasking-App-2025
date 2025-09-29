'use client';

import { useState, useEffect } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Phone, MapPin, Eye, EyeOff } from 'lucide-react';
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
  const [error, setError] = useState('');

  // Fetch settlements on component mount
  useEffect(() => {
    fetchSettlements();
  }, []);

  // Check if user is already authenticated
  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession();
      if (session) {
        router.replace('/dashboard');
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
        setError('Failed to load settlements. Please refresh the page.');
      }
    } catch (err) {
      console.error('Error fetching settlements:', err);
      setError('Failed to load settlements. Please refresh the page.');
    } finally {
      setIsLoadingSettlements(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
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
        // Successful login - redirect to dashboard
        router.push('/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, phone: value }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSettlementChange = (value: string) => {
    setFormData(prev => ({ ...prev, settlementId: value }));
    // Clear error when user makes selection
    if (error) setError('');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-sm">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-black mb-3">
            Sign in to access your dashboard
          </h1>
          <p className="text-gray-700 text-base">Enter your phone number and select your settlement</p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Phone Number Field */}
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-black mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                <input
                  id="phone"
                  type="tel"
                  placeholder="+254701234567"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  disabled={isLoading}
                  className="w-full pl-12 pr-4 py-4 h-14 text-base bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-red-500 focus:bg-white focus:outline-none transition-all duration-200 placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Settlement Field */}
            <div>
              <label htmlFor="settlement" className="block text-sm font-semibold text-black mb-2">
                Settlement
              </label>
              <Select
                value={formData.settlementId}
                onValueChange={handleSettlementChange}
                disabled={isLoading || isLoadingSettlements}
              >
                <SelectTrigger className="w-full h-14 px-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-red-500 focus:bg-white text-base">
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                    <SelectValue placeholder="Choose your settlement..." />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white border-2 border-gray-200 rounded-2xl shadow-2xl">
                  {settlements.map((settlement) => (
                    <SelectItem 
                      key={settlement.id} 
                      value={settlement.id}
                      className="py-3 px-4 hover:bg-gray-50 cursor-pointer"
                    >
                      <div>
                        <div className="font-medium text-black">{settlement.name}</div>
                        {settlement.location && (
                          <div className="text-sm text-gray-500">{settlement.location}</div>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isLoadingSettlements && (
                <div className="flex items-center mt-2 text-sm text-gray-600">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Loading settlements...
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || isLoadingSettlements}
              className="w-full h-14 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold text-lg rounded-2xl transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-red-500/20"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-600 text-sm">
            By continuing, you agree to DPW's{' '}
            <span className="text-red-500 hover:text-red-600 cursor-pointer underline font-medium">
              Terms of Use
            </span>{' '}
            &{' '}
            <span className="text-red-500 hover:text-red-600 cursor-pointer underline font-medium">
              Privacy Policy
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}