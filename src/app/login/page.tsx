'use client';

import { useState, useEffect } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2, Phone, MapPin, ChevronDown } from 'lucide-react';
import { isValidKenyanPhone } from '@/lib/utils';
import { cn } from '@/lib/utils';

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
  const [shakeCard, setShakeCard] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
        setError('Network error, please try again');
      }
    } catch (err) {
      console.error('Error fetching settlements:', err);
      setError('Network error, please try again');
    } finally {
      setIsLoadingSettlements(false);
    }
  };

  const triggerShakeAnimation = () => {
    setShakeCard(true);
    setTimeout(() => setShakeCard(false), 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.phone.trim()) {
      setError('Please enter your phone number');
      triggerShakeAnimation();
      return;
    }

    if (!isValidKenyanPhone(formData.phone)) {
      setError('Please enter a valid Kenyan phone number');
      triggerShakeAnimation();
      return;
    }

    if (!formData.settlementId) {
      setError('Please select your settlement');
      triggerShakeAnimation();
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
        triggerShakeAnimation();
      } else if (result?.ok) {
        // Successful login - redirect to dashboard
        router.push('/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error, please try again');
      triggerShakeAnimation();
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, phone: value }));
    if (error) setError('');
  };

  const handleSettlementSelect = (settlementId: string) => {
    setFormData(prev => ({ ...prev, settlementId }));
    setIsDropdownOpen(false);
    if (error) setError('');
  };

  const selectedSettlement = settlements.find(s => s.id === formData.settlementId);
  const isFormValid = formData.phone.trim() && formData.settlementId && !isLoadingSettlements;

  return (
    <>
      {/* Desktop View - Relume inspired */}
      <div className="hidden md:flex min-h-screen bg-[#F7F7F7] items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div 
            className={cn(
              "bg-white rounded-lg shadow-lg border border-gray-200 p-8 transition-transform duration-300",
              shakeCard && "animate-[shake_0.5s_ease-in-out]"
            )}
          >
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-black mb-2">Welcome Back</h1>
              <p className="text-gray-600 text-base">Sign in to your digital workspace</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Phone Number Field */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-black mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="phone"
                    type="tel"
                    placeholder="+254701234567"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EF4444] focus:border-[#EF4444] outline-none transition-all duration-200 placeholder:text-gray-400 text-black bg-white"
                  />
                </div>
              </div>

              {/* Settlement Field */}
              <div>
                <label htmlFor="settlement" className="block text-sm font-medium text-black mb-2">
                  Settlement
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    disabled={isLoading || isLoadingSettlements}
                    className={cn(
                      "w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EF4444] focus:border-[#EF4444] outline-none transition-all duration-200 bg-white text-left",
                      selectedSettlement ? "text-black" : "text-gray-400"
                    )}
                  >
                    {selectedSettlement ? selectedSettlement.name : "Choose your settlement..."}
                  </button>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  
                  {isDropdownOpen && (
                    <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {settlements.map((settlement) => (
                        <button
                          key={settlement.id}
                          type="button"
                          onClick={() => handleSettlementSelect(settlement.id)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150 first:rounded-t-lg last:rounded-b-lg"
                        >
                          <div className="font-medium text-black">{settlement.name}</div>
                          {settlement.location && (
                            <div className="text-sm text-gray-500">{settlement.location}</div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {isLoadingSettlements && (
                  <div className="flex items-center mt-2 text-sm text-gray-600">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Loading settlements...
                  </div>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!isFormValid || isLoading}
                className="w-full py-3 bg-[#EF4444] hover:bg-[#DC2626] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#EF4444] focus:ring-offset-2"
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
        </div>
      </div>

      {/* Mobile View - Opal inspired */}
      <div className="md:hidden min-h-screen bg-[#1D1D1F] flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div 
            className={cn(
              "transition-transform duration-300",
              shakeCard && "animate-[shake_0.5s_ease-in-out]"
            )}
          >
            {/* Header */}
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold text-white mb-3">Welcome Back</h1>
              <p className="text-gray-400 text-base">Sign in to your digital workspace</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Phone Number Field */}
              <div>
                <label htmlFor="phone-mobile" className="block text-sm font-medium text-white mb-3">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="phone-mobile"
                    type="tel"
                    placeholder="+254701234567"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    disabled={isLoading}
                    className="w-full pl-12 pr-4 py-4 bg-gray-800 border border-gray-600 text-white rounded-xl focus:ring-2 focus:ring-[#EF4444] focus:border-[#EF4444] outline-none transition-all duration-200 placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* Settlement Field */}
              <div>
                <label htmlFor="settlement-mobile" className="block text-sm font-medium text-white mb-3">
                  Settlement
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    disabled={isLoading || isLoadingSettlements}
                    className={cn(
                      "w-full pl-12 pr-12 py-4 bg-gray-800 border border-gray-600 rounded-xl focus:ring-2 focus:ring-[#EF4444] focus:border-[#EF4444] outline-none transition-all duration-200 text-left",
                      selectedSettlement ? "text-white" : "text-gray-400"
                    )}
                  >
                    {selectedSettlement ? selectedSettlement.name : "Choose your settlement..."}
                  </button>
                  <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  
                  {isDropdownOpen && (
                    <div className="absolute z-20 w-full mt-1 bg-gray-800 border border-gray-600 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                      {settlements.map((settlement) => (
                        <button
                          key={settlement.id}
                          type="button"
                          onClick={() => handleSettlementSelect(settlement.id)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors duration-150 first:rounded-t-xl last:rounded-b-xl text-white"
                        >
                          <div className="font-medium text-white">{settlement.name}</div>
                          {settlement.location && (
                            <div className="text-sm text-gray-400">{settlement.location}</div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {isLoadingSettlements && (
                  <div className="flex items-center mt-3 text-sm text-gray-400">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Loading settlements...
                  </div>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-900/30 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!isFormValid || isLoading}
                className="w-full py-4 bg-white hover:bg-gray-100 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900 mt-8"
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
        </div>
      </div>

      {/* Overlay to close dropdown */}
      {isDropdownOpen && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setIsDropdownOpen(false)}
        />
      )}

      {/* Add shake animation styles */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
      `}</style>
    </>
  );
}