'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

import { 
  ArrowLeft,
  Search,
  Plus,
  FileText,
  Calendar,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Play,
  Pause,
  DollarSign,
  Image as ImageIcon
} from 'lucide-react';

interface Campaign {
  id: string;
  title: string;
  question: string;
  description: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  createdDate: string;
  startDate: string;
  endDate: string;
  totalImages: number;
  completedResponses: number;
  totalResponses: number;
  activeWorkers: number;
  rewardPerTask: number;
  priority: 'low' | 'medium' | 'high';
  createdBy: string;
}

export default function CampaignManagement() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'active' | 'paused' | 'completed'>('all');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || session.user?.role !== 'ADMIN') {
      router.push('/login');
      return;
    }

    // Fetch campaigns from database API
    const fetchCampaigns = async () => {
      try {
        const response = await fetch('/api/campaigns');
        const result = await response.json();
        
        if (result.success && result.data) {
          setCampaigns(result.data);
        } else {
          console.error('Failed to fetch campaigns:', result.message);
          setCampaigns([]);
        }
      } catch (error) {
        console.error('Error fetching campaigns:', error);
        setCampaigns([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaigns();
  }, [session, status, router]);

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || campaign.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return CheckCircle;
      case 'draft': return FileText;
      case 'paused': return Pause;
      case 'completed': return CheckCircle;
      default: return Clock;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const calculateProgress = (completed: number, total: number) => {
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
                <FileText className="h-5 w-5 text-gray-600" />
                <h1 className="text-xl font-bold text-gray-900">Campaign Management</h1>
              </div>
            </div>
            
            <button className="bg-[#EF4444] hover:bg-[#DC2626] text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200">
              <Plus className="h-4 w-4" />
              <span>New Campaign</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
                <p className="text-2xl font-bold text-gray-900">{campaigns.length}</p>
              </div>
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
                <p className="text-2xl font-bold text-green-600">
                  {campaigns.filter(c => c.status === 'active').length}
                </p>
              </div>
              <Play className="h-8 w-8 text-green-400" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Images</p>
                <p className="text-2xl font-bold text-blue-600">
                  {campaigns.reduce((sum, c) => sum + c.totalImages, 0)}
                </p>
              </div>
              <ImageIcon className="h-8 w-8 text-blue-400" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold text-purple-600">
                  {Math.round(
                    (campaigns.reduce((sum, c) => sum + c.completedResponses, 0) /
                     campaigns.reduce((sum, c) => sum + c.totalResponses, 0)) * 100
                  )}%
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-400" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EF4444] focus:border-[#EF4444] outline-none"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'draft' | 'active' | 'paused' | 'completed')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EF4444] focus:border-[#EF4444] outline-none"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
            </select>

            {/* Results Count */}
            <div className="flex items-center justify-end">
              <span className="text-sm text-gray-600">
                {filteredCampaigns.length} of {campaigns.length} campaigns
              </span>
            </div>
          </div>
        </div>

        {/* Campaigns Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredCampaigns.map((campaign) => {
            const StatusIcon = getStatusIcon(campaign.status);
            const progress = calculateProgress(campaign.completedResponses, campaign.totalResponses);
            
            return (
              <div key={campaign.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{campaign.title}</h3>
                      <span className={`text-xs font-medium ${getPriorityColor(campaign.priority)}`}>
                        ● {campaign.priority.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{campaign.description}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(campaign.status)}`}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {campaign.status}
                    </span>
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>Progress</span>
                    <span>{campaign.completedResponses} / {campaign.totalResponses} responses</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2 w-full">
                    <div 
                      className="bg-[#EF4444] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="text-right text-xs text-gray-500 mt-1">{progress}% complete</div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <ImageIcon className="h-4 w-4" />
                    <span>{campaign.totalImages} images</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>{campaign.activeWorkers} workers</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <DollarSign className="h-4 w-4" />
                    <span>${campaign.rewardPerTask} per task</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Ends {formatDate(campaign.endDate)}</span>
                  </div>
                </div>

                {/* Question Preview */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-xs font-medium text-gray-600 mb-1">QUESTION:</p>
                  <p className="text-sm text-gray-900">{campaign.question}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-xs text-gray-500">
                    Created by {campaign.createdBy} • {formatDate(campaign.createdDate)}
                  </span>
                  
                  <div className="flex items-center space-x-2">
                    <button className="text-gray-600 hover:text-gray-900 p-1">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="text-gray-600 hover:text-gray-900 p-1">
                      <Edit className="h-4 w-4" />
                    </button>
                    {campaign.status === 'active' ? (
                      <button className="text-yellow-600 hover:text-yellow-700 p-1">
                        <Pause className="h-4 w-4" />
                      </button>
                    ) : campaign.status === 'paused' ? (
                      <button className="text-green-600 hover:text-green-700 p-1">
                        <Play className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredCampaigns.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your search criteria or create a new campaign.</p>
            <button className="bg-[#EF4444] hover:bg-[#DC2626] text-white px-6 py-2 rounded-lg">
              Create New Campaign
            </button>
          </div>
        )}
      </main>
    </div>
  );
}