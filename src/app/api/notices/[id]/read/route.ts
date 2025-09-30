import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST - Mark a notice as read
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const noticeId = params.id;

    // Check if notice exists and is active
    const notice = await prisma.notice.findFirst({
      where: {
        id: noticeId,
        isActive: true
      }
    });

    if (!notice) {
      return NextResponse.json(
        { success: false, error: 'Notice not found' },
        { status: 404 }
      );
    }

    // Check if already marked as read
    const existingRead = await prisma.noticeRead.findUnique({
      where: {
        noticeId_userId: {
          noticeId,
          userId: session.user.id
        }
      }
    });

    if (existingRead) {
      return NextResponse.json({
        success: true,
        message: 'Notice already marked as read'
      });
    }

    // Mark as read
    await prisma.noticeRead.create({
      data: {
        noticeId,
        userId: session.user.id
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Notice marked as read'
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