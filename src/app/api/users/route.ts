import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only admins can view user management data
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      );
    }

    const users = await prisma.user.findMany({
      include: {
        settlement: true,
        responses: {
          select: {
            id: true,
            createdAt: true
          }
        },
        _count: {
          select: {
            responses: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform users for admin interface
    const transformedUsers = users.map((user) => {
      const lastActivity = user.responses.length > 0 
        ? new Date(Math.max(...user.responses.map(r => new Date(r.createdAt).getTime())))
        : new Date(user.createdAt);

      return {
        id: user.id,
        phone: user.phone,
        name: user.name || `User ${user.phone.slice(-4)}`,
        role: user.role,
        settlement: user.settlement?.name || 'Unassigned',
        settlementId: user.settlementId,
        status: 'active', // Could be enhanced with actual status tracking
        tasksCompleted: user._count.responses,
        totalEarnings: user._count.responses * 2.50, // Static calculation for now
        accuracy: 95, // Static for now, could be calculated from response quality
        joinDate: new Date(user.createdAt).toISOString().split('T')[0],
        lastActive: lastActivity.toISOString().split('T')[0],
        verified: true // Static for now
      };
    });

    return NextResponse.json({
      success: true,
      data: transformedUsers
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, message: 'Database connection failed. Please reload the page.' },
      { status: 500 }
    );
  }
}