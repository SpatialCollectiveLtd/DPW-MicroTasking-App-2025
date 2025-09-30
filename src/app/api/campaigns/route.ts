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

    // Only admins can view campaign management data
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      );
    }

    const campaigns = await prisma.campaign.findMany({
      include: {
        images: {
          include: {
            responses: true
          }
        },
        settlements: {
          include: {
            settlement: true
          }
        },
        _count: {
          select: {
            images: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform campaigns for admin interface
    const transformedCampaigns = campaigns.map((campaign) => {
      const totalImages = campaign._count.images;
      const totalResponses = campaign.images.reduce((sum, image) => sum + image.responses.length, 0);
      const completedImages = campaign.images.filter(image => image.consensusReached).length;
      
      // Get unique workers who have responded
      const uniqueWorkers = new Set();
      campaign.images.forEach(image => {
        image.responses.forEach(response => {
          uniqueWorkers.add(response.userId);
        });
      });

      return {
        id: campaign.id,
        title: campaign.title,
        question: campaign.question,
        description: campaign.title, // Use title as description for now
        status: campaign.isActive ? 'active' : 'completed',
        createdDate: new Date(campaign.createdAt).toISOString().split('T')[0],
        startDate: new Date(campaign.startDate).toISOString().split('T')[0],
        endDate: campaign.endDate ? new Date(campaign.endDate).toISOString().split('T')[0] : null,
        totalImages,
        completedResponses: completedImages,
        totalResponses,
        activeWorkers: uniqueWorkers.size,
        rewardPerTask: 2.50, // Static for now, could be added to schema
        priority: campaign.isActive ? 'high' : 'medium',
        createdBy: 'Admin',
        settlements: campaign.settlements.map(cs => cs.settlement?.name).filter(Boolean)
      };
    });

    return NextResponse.json({
      success: true,
      data: transformedCampaigns
    });

  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json(
      { success: false, message: 'Database connection failed. Please reload the page.' },
      { status: 500 }
    );
  }
}