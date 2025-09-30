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

    // Only admins can view dashboard stats
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      );
    }

    // Get active workers count
    const activeWorkers = await prisma.user.count({
      where: {
        role: 'WORKER'
      }
    });

    // Get total campaigns count  
    const totalCampaigns = await prisma.campaign.count();

    // Get active campaigns
    const activeCampaigns = await prisma.campaign.count({
      where: {
        isActive: true
      }
    });

    // Calculate total earnings/revenue (responses * 2.50 KES per task)
    const totalResponses = await prisma.response.count();
    const monthlyRevenue = totalResponses * 2.50;

    // Calculate completion rate
    const totalImages = await prisma.image.count();
    const completedImages = await prisma.image.count({
      where: {
        consensusReached: true
      }
    });
    const completionRate = totalImages > 0 ? (completedImages / totalImages) * 100 : 0;

    // Get recent activity for growth calculations
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const recentResponses = await prisma.response.count({
      where: {
        createdAt: {
          gte: oneMonthAgo
        }
      }
    });

    const recentWorkers = await prisma.user.count({
      where: {
        role: 'WORKER',
        createdAt: {
          gte: oneMonthAgo
        }
      }
    });

    // Calculate growth rates (simplified)
    const workersGrowth = recentWorkers > 0 ? (recentWorkers / activeWorkers) * 100 : 0;
    const campaignsGrowth = activeCampaigns > totalCampaigns ? 0 : 5; // Static for now
    const revenueGrowth = recentResponses > 0 ? (recentResponses / totalResponses) * 100 : 0;
    const completionGrowth = completionRate > 90 ? 2.5 : 1.3; // Static improvement

    const stats = [
      {
        title: 'Active Workers',
        value: activeWorkers.toString(),
        change: `+${workersGrowth.toFixed(1)}%`,
        changeType: 'positive' as const,
        icon: 'Users'
      },
      {
        title: 'Total Campaigns',
        value: totalCampaigns.toString(),
        change: `+${campaignsGrowth}`,
        changeType: 'positive' as const,
        icon: 'FileText'
      },
      {
        title: 'Monthly Revenue',
        value: `KES ${monthlyRevenue.toLocaleString()}`,
        change: `+${revenueGrowth.toFixed(1)}%`,
        changeType: 'positive' as const,
        icon: 'DollarSign'
      },
      {
        title: 'Completion Rate',
        value: `${completionRate.toFixed(1)}%`,
        change: `+${completionGrowth}%`,
        changeType: 'positive' as const,
        icon: 'TrendingUp'
      }
    ];

    return NextResponse.json({
      success: true,
      data: {
        stats,
        summary: {
          activeWorkers,
          totalCampaigns,
          activeCampaigns,
          monthlyRevenue,
          completionRate,
          totalResponses,
          totalImages
        }
      }
    });

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { success: false, message: 'Database connection failed. Please reload the page.' },
      { status: 500 }
    );
  }
}