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
      <div className="w-full max-w-md space-y-8">
        {/* Logo/Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-black mb-2">DPW Platform</h1>
          <p className="text-gray-600">Digital Public Works</p>
        </div>

        {/* Login Form */}
        <Card className="border-gray-200 shadow-lg">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-xl font-semibold text-black">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-gray-600">
              Sign in to access your dashboard
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Phone Number Input */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-black">
                  Phone Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+254701234567"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    className="pl-10 border-gray-300 focus:border-red-500 focus:ring-red-500"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Settlement Selection */}
              <div className="space-y-2">
                <Label htmlFor="settlement" className="text-sm font-medium text-black">
                  Settlement
                </Label>
                <Select
                  value={formData.settlementId}
                  onValueChange={handleSettlementChange}
                  disabled={isLoading || isLoadingSettlements}
                >
                  <SelectTrigger className="border-gray-300 focus:border-red-500 focus:ring-red-500">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                      <SelectValue placeholder="Choose your settlement..." />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {settlements.map((settlement) => (
                      <SelectItem key={settlement.id} value={settlement.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{settlement.name}</span>
                          {settlement.location && (
                            <span className="text-xs text-gray-500">{settlement.location}</span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isLoadingSettlements && (
                  <p className="text-xs text-gray-500 flex items-center">
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    Loading settlements...
                  </p>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Login Button */}
              <Button
                type="submit"
                className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 rounded-md transition-colors"
                disabled={isLoading || isLoadingSettlements}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
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
        <div className="text-center text-xs text-gray-500">
          <p>Secure access to your digital workspace</p>
        </div>
      </div>
    </div>
  );
}