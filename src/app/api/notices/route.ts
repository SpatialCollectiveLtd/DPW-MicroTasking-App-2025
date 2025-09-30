import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Fetch notices for a user based on their settlement and read status
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

    // Get user with settlement info
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { settlement: true }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Build where clause for notices
    const whereClause = {
      isActive: true,
      OR: [
        { targetType: 'ALL' },
        { 
          targetType: 'SETTLEMENT',
          settlementId: user.settlementId 
        }
      ]
    };

    // Fetch notices with read status
    const notices = await prisma.notice.findMany({
      where: whereClause,
      include: {
        reads: {
          where: { userId: session.user.id }
        },
        settlement: true
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    // Transform notices to include isRead status
    const noticesWithReadStatus = notices.map(notice => ({
      id: notice.id,
      title: notice.title,
      content: notice.content,
      priority: notice.priority,
      targetType: notice.targetType,
      createdAt: notice.createdAt.toISOString(),
      isRead: notice.reads.length > 0
    }));

    // Filter based on includeRead parameter
    const filteredNotices = includeRead 
      ? noticesWithReadStatus 
      : noticesWithReadStatus.filter(notice => !notice.isRead);

    return NextResponse.json({
      success: true,
      data: filteredNotices
    });

  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database connection failed. Please refresh the page and try again.',
        needsReload: true 
      },
      { status: 503 }
    );
  }
}

// POST - Create a new notice (Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
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

    // Validate settlement ID if targeting specific settlement
    if (targetType === 'SETTLEMENT' && !settlementId) {
      return NextResponse.json(
        { success: false, error: 'Settlement ID required for settlement-specific notices' },
        { status: 400 }
      );
    }

    const notice = await prisma.notice.create({
      data: {
        title,
        content,
        priority: priority || 'MEDIUM',
        targetType: targetType || 'ALL',
        settlementId: targetType === 'SETTLEMENT' ? settlementId : null,
        createdBy: session.user.id
      }
    });

    return NextResponse.json({
      success: true,
      data: notice
    });

  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database connection failed. Please refresh the page and try again.',
        needsReload: true 
      },
      { status: 503 }
    );
  }
}