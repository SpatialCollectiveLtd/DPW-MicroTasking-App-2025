'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

import { 
  ArrowLeft,
  Search,
  Filter,
  Download,
  DollarSign,
  TrendingUp,
  Calendar,
  Users,
  CheckCircle,
  Clock,
  AlertTriangle,
  MoreVertical,
  Eye,
  CreditCard,
  Banknote
} from 'lucide-react';

interface PaymentRecord {
  id: string;
  workerName: string;
  workerEmail: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  method: 'bank_transfer' | 'paypal' | 'crypto';
  transactionId?: string;
  campaignTitle: string;
  tasksCompleted: number;
  dateEarned: string;
  datePaid?: string;
  fees: number;
  netAmount: number;
}

interface PaymentSummary {
  totalPaid: number;
  totalPending: number;
  totalFees: number;
  totalWorkers: number;
  avgPayment: number;
  monthlyGrowth: number;
}

export default function PaymentReports() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'processing' | 'completed' | 'failed'>('all');
  const [filterMethod, setFilterMethod] = useState<'all' | 'bank_transfer' | 'paypal' | 'crypto'>('all');
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || session.user?.role !== 'ADMIN') {
      router.push('/login');
      return;
    }



    // Fetch payments from database API
    const fetchPayments = async () => {
      try {
        const response = await fetch('/api/payments');
        const result = await response.json();
        
        if (result.success && result.data) {
          // Transform API response to match UI interface
          const transformedPayments: PaymentRecord[] = result.data.payments.map((payment: any) => ({
            id: payment.id,
            workerName: payment.userName,
            workerEmail: payment.phone, // Using phone as identifier
            amount: payment.totalEarnings,
            status: payment.status,
            method: payment.paymentMethod,
            transactionId: payment.transactionId,
            campaignTitle: 'Task Completion', // Generic title
            tasksCompleted: payment.tasksCompleted,
            dateEarned: payment.lastPayment,
            datePaid: payment.status === 'completed' ? payment.lastPayment : null,
            fees: payment.totalEarnings * 0.05, // 5% fee
            netAmount: payment.totalEarnings * 0.95 // 95% net
          }));

          setPayments(transformedPayments);
          
          // Transform summary to match UI interface
          const transformedSummary: PaymentSummary = {
            totalPaid: result.data.summary.totalAmount,
            totalPending: result.data.summary.pendingPayments * result.data.summary.averageEarning,
            totalFees: result.data.summary.totalAmount * 0.05,
            totalWorkers: result.data.summary.totalPayments,
            avgPayment: result.data.summary.averageEarning,
            monthlyGrowth: 12.5 // Static for now
          };
          
          setSummary(transformedSummary);
        } else {
          console.error('Failed to fetch payments:', result.message);
          setPayments([]);
          setSummary({
            totalPaid: 0,
            totalPending: 0,
            totalFees: 0,
            totalWorkers: 0,
            avgPayment: 0,
            monthlyGrowth: 0
          });
        }
      } catch (error) {
        console.error('Error fetching payments:', error);
        setPayments([]);
        setSummary({
          totalPaid: 0,
          totalPending: 0,
          totalFees: 0,
          totalWorkers: 0,
          avgPayment: 0,
          monthlyGrowth: 0
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayments();
  }, [session, status, router]);

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.workerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.workerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.campaignTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    const matchesMethod = filterMethod === 'all' || payment.method === filterMethod;
    
    return matchesSearch && matchesStatus && matchesMethod;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'pending': return Clock;
      case 'processing': return TrendingUp;
      case 'failed': return AlertTriangle;
      default: return Clock;
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'bank_transfer': return Banknote;
      case 'paypal': return CreditCard;
      case 'crypto': return DollarSign;
      default: return CreditCard;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#EF4444]"></div>
      </div>
    );
  }

  if (!session || session.user?.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin')}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Admin
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-gray-600" />
                <h1 className="text-xl font-bold text-gray-900">Payment Reports</h1>
              </div>
            </div>
            
            <button className="bg-[#EF4444] hover:bg-[#DC2626] text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200">
              <Download className="h-4 w-4" />
              <span>Export Report</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Stats */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Paid</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalPaid)}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{formatCurrency(summary.totalPending)}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-400" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Fees</p>
                  <p className="text-2xl font-bold text-gray-600">{formatCurrency(summary.totalFees)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-gray-400" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Workers</p>
                  <p className="text-2xl font-bold text-blue-600">{summary.totalWorkers}</p>
                </div>
                <Users className="h-8 w-8 text-blue-400" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Payment</p>
                  <p className="text-2xl font-bold text-purple-600">{formatCurrency(summary.avgPayment)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-400" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Growth</p>
                  <p className="text-2xl font-bold text-green-600">+{summary.monthlyGrowth}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-400" />
              </div>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search payments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EF4444] focus:border-[#EF4444] outline-none"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'pending' | 'processing' | 'completed' | 'failed')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EF4444] focus:border-[#EF4444] outline-none"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>

            {/* Method Filter */}
            <select
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value as 'all' | 'bank_transfer' | 'paypal' | 'crypto')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EF4444] focus:border-[#EF4444] outline-none"
            >
              <option value="all">All Methods</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="paypal">PayPal</option>
              <option value="crypto">Cryptocurrency</option>
            </select>

            {/* Date Range */}
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as 'week' | 'month' | 'quarter' | 'year')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EF4444] focus:border-[#EF4444] outline-none"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
            </select>

            {/* Results Count */}
            <div className="flex items-center justify-end">
              <span className="text-sm text-gray-600">
                {filteredPayments.length} of {payments.length} payments
              </span>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Worker
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Campaign
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status & Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments.map((payment) => {
                  const StatusIcon = getStatusIcon(payment.status);
                  const MethodIcon = getMethodIcon(payment.method);
                  
                  return (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-[#EF4444] rounded-full flex items-center justify-center text-white font-medium">
                            {payment.workerName.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{payment.workerName}</div>
                            <div className="text-sm text-gray-500">{payment.workerEmail}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{payment.campaignTitle}</div>
                        <div className="text-sm text-gray-500">{payment.tasksCompleted} tasks completed</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{formatCurrency(payment.amount)}</div>
                        <div className="text-sm text-gray-500">
                          Fee: {formatCurrency(payment.fees)} | Net: {formatCurrency(payment.netAmount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-2">
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {payment.status}
                          </span>
                          <div className="flex items-center text-sm text-gray-500">
                            <MethodIcon className="h-3 w-3 mr-1" />
                            {payment.method.replace('_', ' ')}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            Earned: {formatDate(payment.dateEarned)}
                          </div>
                          {payment.datePaid && (
                            <div className="flex items-center">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Paid: {formatDate(payment.datePaid)}
                            </div>
                          )}
                          {payment.transactionId && (
                            <div className="text-xs text-gray-400">
                              ID: {payment.transactionId}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-[#EF4444] hover:text-[#DC2626] transition-colors duration-200">
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredPayments.length === 0 && (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
              <p className="text-gray-500">Try adjusting your search criteria or filters.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}