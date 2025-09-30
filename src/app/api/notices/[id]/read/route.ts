import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// In-memory storage for read notices (replace with database when ready)
const readNotices = new Set<string>();

// POST - Mark a notice as read (Mock implementation)
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
    const userNoticeKey = `${session.user.id}:${noticeId}`;

    if (readNotices.has(userNoticeKey)) {
      return NextResponse.json({
        success: true,
        message: 'Notice already marked as read'
      });
    }

    // Mark as read in mock storage
    readNotices.add(userNoticeKey);

    return NextResponse.json({
      success: true,
      message: 'Notice marked as read'
    });

  } catch (error) {
    console.error('Error marking notice as read:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to mark notice as read' },
      { status: 500 }
    );
  }
}