import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// GET - Fetch notices for a user (using mock data for now)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const includeRead = searchParams.get('includeRead') === 'true';

    // Mock data for development - replace with database queries when ready
    const mockNotices = [
      {
        id: '1',
        title: 'Welcome to DPW MicroTasking',
        content: 'Thank you for joining our community mapping initiative. Your contributions help build better communities through accurate data collection. We appreciate your dedication to improving urban planning through technology.',
        priority: 'HIGH',
        targetType: 'ALL',
        createdAt: new Date().toISOString(),
        isRead: false
      },
      {
        id: '2',
        title: 'Payment System Update',
        content: 'We have updated our payment processing system. All earnings will now be processed faster with improved tracking. You can expect to see your payments reflected within 24 hours of task completion.',
        priority: 'MEDIUM',
        targetType: 'ALL',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        isRead: false
      },
      {
        id: '3',
        title: 'Settlement-Specific Instructions',
        content: 'Please note the updated guidelines for your specific settlement area. Check the latest mapping requirements in your region. Quality control measures have been enhanced for better accuracy.',
        priority: 'MEDIUM',
        targetType: 'SETTLEMENT',
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        isRead: true
      },
      {
        id: '4',
        title: 'Quality Guidelines Reminder',
        content: 'Please take your time when reviewing images. Higher accuracy scores lead to better earnings and help improve our community data quality. Remember to zoom in on images for better detail analysis.',
        priority: 'LOW',
        targetType: 'ALL',
        createdAt: new Date(Date.now() - 259200000).toISOString(),
        isRead: true
      }
    ];

    // Filter based on includeRead parameter
    const filteredNotices = includeRead 
      ? mockNotices 
      : mockNotices.filter(notice => !notice.isRead);

    return NextResponse.json({
      success: true,
      data: filteredNotices
    });

  } catch (error) {
    console.error('Error fetching notices:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notices' },
      { status: 500 }
    );
  }
}

// POST - Create a new notice (Admin only) - Mock implementation
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, content, priority, targetType, settlementId } = body;

    // Validate required fields
    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Mock created notice
    const notice = {
      id: Date.now().toString(),
      title,
      content,
      priority: priority || 'MEDIUM',
      targetType: targetType || 'ALL',
      settlementId: targetType === 'SETTLEMENT' ? settlementId : null,
      createdBy: session.user.id,
      createdAt: new Date().toISOString(),
      isActive: true
    };

    return NextResponse.json({
      success: true,
      data: notice
    });

  } catch (error) {
    console.error('Error creating notice:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create notice' },
      { status: 500 }
    );
  }
}