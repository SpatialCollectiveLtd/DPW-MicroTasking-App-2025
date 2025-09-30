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

    // Only admins can view payment data
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      );
    }

    // Get users with their response counts to calculate payments
    const users = await prisma.user.findMany({
      where: {
        role: 'WORKER'
      },
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
      }
    });

    // Transform to payment records
    const paymentRecords = users.map((user) => {
      const tasksCompleted = user._count.responses;
      const earnings = tasksCompleted * 2.50; // 2.50 KES per task
      const lastPayment = user.responses.length > 0 
        ? new Date(Math.max(...user.responses.map(r => new Date(r.createdAt).getTime())))
        : new Date(user.createdAt);

      return {
        id: user.id,
        userName: user.name || `User ${user.phone.slice(-4)}`,
        phone: user.phone,
        settlement: user.settlement?.name || 'Unassigned',
        tasksCompleted,
        totalEarnings: earnings,
        lastPayment: lastPayment.toISOString().split('T')[0],
        status: earnings > 0 ? 'completed' : 'pending',
        paymentMethod: 'M-Pesa', // Static for now
        transactionId: earnings > 0 ? `MPesa${user.id.slice(-8)}` : null
      };
    }).filter(record => record.totalEarnings > 0); // Only show users with earnings

    // Calculate summary
    const summary = {
      totalPayments: paymentRecords.length,
      totalAmount: paymentRecords.reduce((sum, record) => sum + record.totalEarnings, 0),
      pendingPayments: paymentRecords.filter(r => r.status === 'pending').length,
      completedPayments: paymentRecords.filter(r => r.status === 'completed').length,
      averageEarning: paymentRecords.length > 0 
        ? paymentRecords.reduce((sum, record) => sum + record.totalEarnings, 0) / paymentRecords.length 
        : 0
    };

    return NextResponse.json({
      success: true,
      data: {
        payments: paymentRecords,
        summary
      }
    });

  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { success: false, message: 'Database connection failed. Please reload the page.' },
      { status: 500 }
    );
  }
}