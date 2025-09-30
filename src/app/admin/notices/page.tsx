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
  MessageSquare,
  Calendar,
  Users,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Bell,
  AlertCircle,
  Info,
  CheckCircle,
  Clock,
  Send
} from 'lucide-react';

interface Notice {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'urgent';
  priority: 'low' | 'medium' | 'high';
  status: 'draft' | 'published' | 'archived';
  targetAudience: 'all' | 'workers' | 'admins';
  createdBy: string;
  createdDate: string;
  publishedDate?: string;
  expiryDate?: string;
  readCount: number;
  totalRecipients: number;
  isSticky: boolean;
}

export default function NoticesManagement() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'published' | 'archived'>('all');
  const [filterType, setFilterType] = useState<'all' | 'info' | 'warning' | 'success' | 'urgent'>('all');
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || session.user?.role !== 'ADMIN') {
      router.push('/login');
      return;
    }

    // Fetch notices from database API
    const fetchNotices = async () => {
      try {
        const response = await fetch('/api/notices');
        const result = await response.json();
        
        if (result.success && result.data) {
          // Transform database notices to match admin interface format
          const transformedNotices: Notice[] = result.data.map((notice: any) => ({
            id: notice.id,
            title: notice.title,
            content: notice.content,
            type: notice.priority === 'HIGH' ? 'urgent' : notice.priority === 'MEDIUM' ? 'warning' : 'info',
            priority: notice.priority.toLowerCase(),
            status: notice.isActive ? 'published' : 'draft',
            targetAudience: notice.targetType === 'ALL' ? 'all' : 'workers',
            createdBy: 'Admin',
            createdDate: new Date(notice.createdAt).toISOString().split('T')[0],
            publishedDate: new Date(notice.createdAt).toISOString().split('T')[0],
            expiryDate: null,
            readCount: notice.readCount || 0,
            totalRecipients: 0,
            isSticky: notice.priority === 'HIGH'
          }));
          
          setNotices(transformedNotices);
        } else {
          console.error('Failed to fetch notices:', result.message);
          setNotices([]);
        }
      } catch (error) {
        console.error('Error fetching notices:', error);
        setNotices([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotices();
  }, [session, status, router]);

  const filteredNotices = notices.filter(notice => {
    const matchesSearch = notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notice.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || notice.status === filterStatus;
    const matchesType = filterType === 'all' || notice.type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'success': return 'bg-green-100 text-green-800 border-green-200';
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'info': return Info;
      case 'warning': return AlertCircle;
      case 'success': return CheckCircle;
      case 'urgent': return Bell;
      default: return Info;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'archived': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateReadPercentage = (readCount: number, totalRecipients: number) => {
    return totalRecipients > 0 ? Math.round((readCount / totalRecipients) * 100) : 0;
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
                <MessageSquare className="h-5 w-5 text-gray-600" />
                <h1 className="text-xl font-bold text-gray-900">Notices Management</h1>
              </div>
            </div>
            
            <button className="bg-[#EF4444] hover:bg-[#DC2626] text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200">
              <Plus className="h-4 w-4" />
              <span>Create Notice</span>
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
                <p className="text-sm font-medium text-gray-600">Total Notices</p>
                <p className="text-2xl font-bold text-gray-900">{notices.length}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-gray-400" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Published</p>
                <p className="text-2xl font-bold text-green-600">
                  {notices.filter(n => n.status === 'published').length}
                </p>
              </div>
              <Send className="h-8 w-8 text-green-400" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Draft</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {notices.filter(n => n.status === 'draft').length}
                </p>
              </div>
              <Edit className="h-8 w-8 text-yellow-400" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Read Rate</p>
                <p className="text-2xl font-bold text-blue-600">
                  {Math.round(
                    notices.filter(n => n.status === 'published').reduce((acc, n) => 
                      acc + calculateReadPercentage(n.readCount, n.totalRecipients), 0
                    ) / Math.max(notices.filter(n => n.status === 'published').length, 1)
                  )}%
                </p>
              </div>
              <Eye className="h-8 w-8 text-blue-400" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search notices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EF4444] focus:border-[#EF4444] outline-none"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'draft' | 'published' | 'archived')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EF4444] focus:border-[#EF4444] outline-none"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'info' | 'warning' | 'success' | 'urgent')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EF4444] focus:border-[#EF4444] outline-none"
            >
              <option value="all">All Types</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="success">Success</option>
              <option value="urgent">Urgent</option>
            </select>

            {/* Results Count */}
            <div className="flex items-center justify-end">
              <span className="text-sm text-gray-600">
                {filteredNotices.length} of {notices.length} notices
              </span>
            </div>
          </div>
        </div>

        {/* Notices List */}
        <div className="space-y-4">
          {filteredNotices.map((notice) => {
            const TypeIcon = getTypeIcon(notice.type);
            const readPercentage = calculateReadPercentage(notice.readCount, notice.totalRecipients);
            
            return (
              <div key={notice.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{notice.title}</h3>
                      {notice.isSticky && (
                        <div className="flex items-center px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                          📌 Sticky
                        </div>
                      )}
                      <span className={`text-xs font-medium ${getPriorityColor(notice.priority)}`}>
                        ● {notice.priority.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 mb-3">
                      <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border ${getTypeColor(notice.type)}`}>
                        <TypeIcon className="h-4 w-4 mr-1" />
                        {notice.type}
                      </span>
                      
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(notice.status)}`}>
                        {notice.status}
                      </span>
                      
                      <span className="text-sm text-gray-500">
                        Target: {notice.targetAudience === 'all' ? 'Everyone' : notice.targetAudience}
                      </span>
                    </div>
                  </div>
                  
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </div>

                {/* Content */}
                <p className="text-gray-700 text-sm leading-relaxed mb-4 line-clamp-2">
                  {notice.content}
                </p>

                {/* Stats and Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {/* Read Stats */}
                  {notice.status === 'published' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Read Rate</span>
                        <span className="font-medium">{readPercentage}%</span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-2 w-full">
                        <div 
                          className="bg-[#EF4444] h-2 rounded-full transition-all duration-300"
                          style={{ width: `${readPercentage}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-500">
                        {notice.readCount} of {notice.totalRecipients} recipients
                      </div>
                    </div>
                  )}

                  {/* Dates */}
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      Created: {formatDate(notice.createdDate)}
                    </div>
                    {notice.publishedDate && (
                      <div className="flex items-center">
                        <Send className="h-3 w-3 mr-1" />
                        Published: {formatDate(notice.publishedDate)}
                      </div>
                    )}
                    {notice.expiryDate && (
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        Expires: {formatDate(notice.expiryDate)}
                      </div>
                    )}
                  </div>

                  {/* Creator Info */}
                  <div className="text-sm text-gray-600">
                    <div className="flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      Created by: {notice.createdBy}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-2">
                    <button className="text-gray-600 hover:text-gray-900 p-2">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="text-gray-600 hover:text-gray-900 p-2">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-700 p-2">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {notice.status === 'draft' && (
                      <button className="bg-[#EF4444] hover:bg-[#DC2626] text-white px-3 py-1 rounded-md text-sm">
                        Publish
                      </button>
                    )}
                    {notice.status === 'published' && (
                      <button className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-md text-sm">
                        Archive
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredNotices.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notices found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your search criteria or create a new notice.</p>
            <button className="bg-[#EF4444] hover:bg-[#DC2626] text-white px-6 py-2 rounded-lg">
              Create New Notice
            </button>
          </div>
        )}
      </main>
    </div>
  );
}