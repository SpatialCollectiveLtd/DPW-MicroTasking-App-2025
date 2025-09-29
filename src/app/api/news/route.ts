import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const news = await prisma.news.findMany({
      where: {
        isActive: true
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
      take: 10 // Limit to 10 most recent items
    });

    return NextResponse.json({
      success: true,
      data: news
    });

  } catch (error) {
    console.error('Error fetching news:', error);
    
    // Return mock data for development when database is not available
    const mockNews = [
      {
        id: '1',
        title: 'Welcome to Digital Public Works',
        content: 'Thank you for joining our community mapping initiative. Your contributions help build better communities through accurate data collection.',
        priority: 'HIGH',
        isActive: true,
        createdAt: new Date().toISOString(),
        createdBy: 'admin'
      },
      {
        id: '2',
        title: 'New Payment System Active',
        content: 'We have updated our payment processing system. All earnings will now be processed faster with improved tracking.',
        priority: 'MEDIUM',
        isActive: true,
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        createdBy: 'admin'
      },
      {
        id: '3',
        title: 'Quality Guidelines Reminder',
        content: 'Please take your time when reviewing images. Higher accuracy scores lead to better earnings and help improve our community data quality.',
        priority: 'LOW',
        isActive: true,
        createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        createdBy: 'admin'
      }
    ];

    return NextResponse.json({
      success: true,
      data: mockNews
    });
  }
}