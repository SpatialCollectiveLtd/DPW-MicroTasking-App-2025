import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

// Simplified auth options for this API route
const authOptions = {
  session: { strategy: 'jwt' as const },
  secret: process.env.NEXTAUTH_SECRET,
};

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { imageId, answer } = body;

    if (!imageId || typeof answer !== 'boolean') {
      return NextResponse.json(
        { success: false, message: 'Image ID and answer (boolean) are required' },
        { status: 400 }
      );
    }

    const userId = session.user.id;

    // Check if user has already responded to this image
    const existingResponse = await prisma.response.findUnique({
      where: {
        userId_imageId: {
          userId: userId,
          imageId: imageId
        }
      }
    });

    if (existingResponse) {
      return NextResponse.json(
        { success: false, message: 'You have already responded to this image' },
        { status: 400 }
      );
    }

    // Verify the image exists and belongs to an active campaign
    const image = await prisma.image.findUnique({
      where: { id: imageId },
      include: {
        campaign: {
          include: {
            settlements: true
          }
        }
      }
    });

    if (!image) {
      return NextResponse.json(
        { success: false, message: 'Image not found' },
        { status: 404 }
      );
    }

    if (!image.campaign.isActive) {
      return NextResponse.json(
        { success: false, message: 'Campaign is not active' },
        { status: 400 }
      );
    }

    // Get user's settlement to verify they can respond to this campaign
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { settlementId: true }
    });

    if (!user?.settlementId) {
      return NextResponse.json(
        { success: false, message: 'User settlement not found' },
        { status: 400 }
      );
    }

    // Check if user's settlement is assigned to this campaign
    const isSettlementAssigned = image.campaign.settlements.some(
      cs => cs.settlementId === user.settlementId
    );

    if (!isSettlementAssigned) {
      return NextResponse.json(
        { success: false, message: 'You are not assigned to this campaign' },
        { status: 403 }
      );
    }

    // Create the response
    const response = await prisma.response.create({
      data: {
        userId: userId,
        imageId: imageId,
        answer: answer
      }
    });

    // Update image statistics in a transaction
    await prisma.$transaction(async (tx) => {
      const updatedImage = await tx.image.update({
        where: { id: imageId },
        data: {
          totalResponses: { increment: 1 },
          yesCount: answer ? { increment: 1 } : undefined,
          noCount: !answer ? { increment: 1 } : undefined
        }
      });

      // Check if consensus is reached (simple majority with minimum responses)
      const minResponsesForConsensus = 5; // Configurable threshold
      
      if (updatedImage.totalResponses >= minResponsesForConsensus) {
        const majorityThreshold = Math.ceil(updatedImage.totalResponses / 2);
        const hasConsensus = updatedImage.yesCount >= majorityThreshold || 
                            updatedImage.noCount >= majorityThreshold;
        
        if (hasConsensus && !updatedImage.consensusReached) {
          await tx.image.update({
            where: { id: imageId },
            data: {
              consensusReached: true,
              groundTruth: updatedImage.yesCount > updatedImage.noCount
            }
          });
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        responseId: response.id,
        message: 'Response recorded successfully'
      }
    });

  } catch (error) {
    console.error('Error recording response:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Get user's response history for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayResponses = await prisma.response.findMany({
      where: {
        userId: userId,
        submittedAt: {
          gte: today,
          lt: tomorrow
        }
      },
      include: {
        image: {
          include: {
            campaign: true
          }
        }
      },
      orderBy: {
        submittedAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        todayCount: todayResponses.length,
        responses: todayResponses.map(r => ({
          id: r.id,
          answer: r.answer,
          submittedAt: r.submittedAt,
          campaign: r.image.campaign.title,
          imageId: r.imageId
        }))
      }
    });

  } catch (error) {
    console.error('Error fetching responses:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}