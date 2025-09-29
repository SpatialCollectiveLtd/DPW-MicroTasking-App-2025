'use client';

import { useState, useEffect } from 'react';
import { Clock, AlertCircle, Info, CheckCircle, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface NewsItem {
  id: string;
  title: string;
  content: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  isActive: boolean;
  createdAt: string;
  isRead?: boolean;
}

interface NoticesFeedProps {
  maxItems?: number;
  showHeader?: boolean;
}

export default function NoticesFeed({ maxItems = 5, showHeader = true }: NoticesFeedProps) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [readItems, setReadItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchNews();
    // Load read items from localStorage
    const savedReadItems = localStorage.getItem('readNotices');
    if (savedReadItems) {
      setReadItems(new Set(JSON.parse(savedReadItems)));
    }
  }, []);

  const fetchNews = async () => {
    try {
      const response = await fetch('/api/news');
      const result = await response.json();
      
      if (result.success) {
        setNews(result.data.slice(0, maxItems));
      }
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = (newsId: string) => {
    const newReadItems = new Set(readItems);
    newReadItems.add(newsId);
    setReadItems(newReadItems);
    
    // Save to localStorage
    localStorage.setItem('readNotices', JSON.stringify([...newReadItems]));
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'MEDIUM':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getPriorityBorder = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'border-l-red-500';
      case 'MEDIUM':
        return 'border-l-blue-500';
      default:
        return 'border-l-green-500';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        {showHeader && (
          <h3 className="text-lg font-bold text-gray-900 mb-4">Latest Notices</h3>
        )}
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-500">Loading notices...</span>
        </div>
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        {showHeader && (
          <h3 className="text-lg font-bold text-gray-900 mb-4">Latest Notices</h3>
        )}
        <div className="text-center py-8 text-gray-500">
          <Info className="h-8 w-8 mx-auto mb-2 text-gray-300" />
          <p>No notices at this time</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {showHeader && (
        <div className="px-6 pt-6 pb-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Latest Notices</h3>
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="h-4 w-4 mr-1" />
              {news.filter(item => !readItems.has(item.id)).length} unread
            </div>
          </div>
        </div>
      )}

      <div className="px-6 pb-6">
        <div className="space-y-3">
          {news.map((item) => {
            const isRead = readItems.has(item.id);
            
            return (
              <div
                key={item.id}
                onClick={() => !isRead && markAsRead(item.id)}
                className={`relative p-4 rounded-xl border-l-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                  getPriorityBorder(item.priority)
                } ${
                  isRead 
                    ? 'bg-gray-50 border-gray-200' 
                    : 'bg-blue-50 border-opacity-100 hover:bg-blue-100'
                }`}
              >
                {/* Unread indicator */}
                {!isRead && (
                  <div className="absolute top-4 right-4">
                    <div className="w-2 h-2 bg-[#EF4444] rounded-full"></div>
                  </div>
                )}

                {/* Content */}
                <div className="pr-6">
                  <div className="flex items-start gap-3 mb-2">
                    {getPriorityIcon(item.priority)}
                    <h4 className={`font-bold text-sm leading-tight ${
                      isRead ? 'text-gray-600' : 'text-gray-900'
                    }`}>
                      {item.title}
                    </h4>
                  </div>

                  <p className={`text-sm leading-relaxed mb-3 ${
                    isRead ? 'text-gray-500' : 'text-gray-700'
                  }`}>
                    {item.content.length > 120 
                      ? `${item.content.substring(0, 120)}...` 
                      : item.content
                    }
                  </p>

                  <div className="flex items-center justify-between">
                    <span className={`text-xs ${
                      isRead ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {formatTimeAgo(item.createdAt)}
                    </span>
                    
                    {item.priority === 'HIGH' && !isRead && (
                      <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded-full">
                        Important
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {news.length >= maxItems && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <button className="w-full text-center text-sm font-medium text-[#EF4444] hover:text-[#DC2626] transition-colors">
              View All Notices
            </button>
          </div>
        )}
      </div>
    </div>
  );
}