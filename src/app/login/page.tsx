'use client';

import { useState, useEffect } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Phone, MapPin, Eye, EyeOff } from 'lucide-react';
import { isValidKenyanPhone } from '@/lib/utils';
import Image from 'next/image';

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
    <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradient/pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0A0A0B] via-[#1A1A1B] to-[#2A2A2B]" />
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="h-full w-full" style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Main content container */}
      <div className="relative z-10 w-full max-w-md space-y-8">
        {/* Logo Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-48 h-28 bg-[#2D2D2D] rounded-lg flex flex-col items-center justify-center">
              <div className="text-white text-3xl font-black mb-2">DPW</div>
              <div className="text-white text-[8px] font-semibold tracking-widest">
                DIGITAL PUBLIC WORKS FOR URBAN RESILIENCE
              </div>
            </div>
          </div>
        </div>

        {/* Welcome Text */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome <span className="text-[#8B5CF6]">back</span>
          </h1>
        </div>

        {/* Login Form */}
        <div className="space-y-6">
          {/* Phone Number Input */}
          <div className="space-y-2">
            <div className="relative">
              <Input
                id="phone"
                type="tel"
                placeholder="+254701234567"
                value={formData.phone}
                onChange={handlePhoneChange}
                className="w-full h-14 px-4 text-white text-base bg-[#1A1A1B] border border-[#2A2A2B] rounded-xl focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20 transition-all duration-200 placeholder:text-gray-500"
                disabled={isLoading}
              />
              <Phone className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Settlement Selection */}
          <div className="space-y-2">
            <Select
              value={formData.settlementId}
              onValueChange={handleSettlementChange}
              disabled={isLoading || isLoadingSettlements}
            >
              <SelectTrigger className="w-full h-14 px-4 text-white bg-[#1A1A1B] border border-[#2A2A2B] rounded-xl focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20 transition-all duration-200">
                <div className="flex items-center justify-between w-full">
                  <SelectValue 
                    placeholder="Choose your settlement..." 
                    className="text-gray-500"
                  />
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-[#1A1A1B] border border-[#2A2A2B] rounded-xl">
                {settlements.map((settlement) => (
                  <SelectItem 
                    key={settlement.id} 
                    value={settlement.id}
                    className="text-white hover:bg-[#2A2A2B] focus:bg-[#2A2A2B] py-3 px-4"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{settlement.name}</span>
                      {settlement.location && (
                        <span className="text-sm text-gray-400">{settlement.location}</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isLoadingSettlements && (
              <div className="flex items-center text-sm text-gray-400 mt-2">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading settlements...
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4">
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {/* Terms text */}
          <div className="text-center text-sm text-gray-400 py-4">
            By continuing, you agree to DPW's{' '}
            <span className="text-white underline cursor-pointer hover:text-[#8B5CF6] transition-colors">
              Terms of Use
            </span>{' '}
            &{' '}
            <span className="text-white underline cursor-pointer hover:text-[#8B5CF6] transition-colors">
              Privacy Policy
            </span>
          </div>

          {/* Login Button */}
          <Button
            onClick={handleSubmit}
            className="w-full h-14 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold text-base rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
            disabled={isLoading || isLoadingSettlements}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Signing in...
              </>
            ) : (
              'Log in'
            )}
          </Button>

          {/* Forgot password link */}
          <div className="text-center pt-4">
            <button className="text-gray-400 hover:text-white text-sm transition-colors">
              Forgot your password?
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}