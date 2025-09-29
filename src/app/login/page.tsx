'use client';

import { useState, useEffect } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Phone, MapPin } from 'lucide-react';
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
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-10">
        {/* Logo/Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[#1D1D1F] mb-3">DPW Platform</h1>
          <p className="text-[#1D1D1F] text-lg">Digital Public Works</p>
        </div>

        {/* Login Form */}
        <Card className="border-gray-200 shadow-xl bg-white">
          <CardHeader className="text-center pb-8 pt-8">
            <CardTitle className="text-2xl font-semibold text-[#1D1D1F] mb-3">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-gray-600 text-base">
              Sign in to access your dashboard
            </CardDescription>
          </CardHeader>
          
          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Phone Number Input */}
              <div className="space-y-3">
                <Label htmlFor="phone" className="text-sm font-semibold text-[#1D1D1F]">
                  Phone Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+254701234567"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    className="pl-12 pr-4 py-3 text-base border-2 border-gray-200 focus:border-[#EF4444] focus:ring-2 focus:ring-[#EF4444]/20 rounded-lg transition-all duration-200 bg-gray-50/50 focus:bg-white"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Settlement Selection */}
              <div className="space-y-3">
                <Label htmlFor="settlement" className="text-sm font-semibold text-[#1D1D1F]">
                  Settlement
                </Label>
                <Select
                  value={formData.settlementId}
                  onValueChange={handleSettlementChange}
                  disabled={isLoading || isLoadingSettlements}
                >
                  <SelectTrigger className="border-2 border-gray-200 focus:border-[#EF4444] focus:ring-2 focus:ring-[#EF4444]/20 rounded-lg py-3 px-4 text-base bg-gray-50/50 hover:bg-white transition-all duration-200">
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                      <SelectValue placeholder="Choose your settlement..." />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="border-2 border-gray-200 shadow-lg rounded-lg">
                    {settlements.map((settlement) => (
                      <SelectItem 
                        key={settlement.id} 
                        value={settlement.id}
                        className="py-3 px-4 hover:bg-gray-50 focus:bg-[#EF4444]/5 cursor-pointer"
                      >
                        <div className="flex flex-col">
                          <span className="font-semibold text-[#1D1D1F]">{settlement.name}</span>
                          {settlement.location && (
                            <span className="text-sm text-gray-500 mt-1">{settlement.location}</span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isLoadingSettlements && (
                  <p className="text-sm text-gray-600 flex items-center font-medium">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Loading settlements...
                  </p>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-red-700">{error}</p>
                </div>
              )}

              {/* Login Button */}
              <Button
                type="submit"
                className="w-full bg-[#EF4444] hover:bg-[#DC2626] active:bg-[#B91C1C] text-white font-semibold py-4 text-base rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-[1.01] active:scale-[0.99]"
                disabled={isLoading || isLoadingSettlements}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-600 font-medium">Secure access to your digital workspace</p>
        </div>
      </div>
    </div>
  );
}