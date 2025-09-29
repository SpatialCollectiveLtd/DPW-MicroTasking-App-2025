import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

// Import auth options directly from the route file
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { isValidKenyanPhone } from '@/lib/utils';
import type { AuthUser } from '@/types';

const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'phone',
      credentials: {
        phone: { 
          label: 'Phone Number', 
          type: 'tel', 
          placeholder: '+254712345678 or 0712345678' 
        },
        settlementId: { 
          label: 'Settlement', 
          type: 'text' 
        },
      },
      async authorize(credentials) {
        // Auth logic here - simplified for API use
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.phone = (user as AuthUser).phone;
        token.role = (user as AuthUser).role;
        token.settlementId = (user as AuthUser).settlementId;
        token.settlementName = (user as AuthUser).settlementName;
      }
      return token;
    },
    async session({ session, token }: any) {
      session.user = {
        id: token.id as string,
        phone: token.phone as string,
        role: token.role as 'WORKER' | 'ADMIN',
        settlementId: token.settlementId as string | undefined,
        settlementName: token.settlementName as string | undefined,
      };
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt' as const,
    maxAge: 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
};

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

    // Get user's settlement
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { settlement: true }
    });

    if (!user || !user.settlementId) {
      return NextResponse.json(
        { success: false, message: 'User settlement not found' },
        { status: 400 }
      );
    }

    // Find active campaigns for this settlement
    const activeCampaign = await prisma.campaign.findFirst({
      where: {
        isActive: true,
        settlements: {
          some: {
            settlementId: user.settlementId
          }
        }
      },
      include: {
        images: {
          where: {
            // Only include images the user hasn't responded to yet
            responses: {
              none: {
                userId: userId
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });

    if (!activeCampaign) {
      return NextResponse.json(
        { success: false, message: 'No active campaigns available' },
        { status: 404 }
      );
    }

    if (activeCampaign.images.length === 0) {
      return NextResponse.json(
        { success: false, message: 'All tasks completed for today' },
        { status: 404 }
      );
    }

    // Get total number of images in campaign for progress tracking
    const totalImages = await prisma.image.count({
      where: {
        campaignId: activeCampaign.id
      }
    });

    // Calculate current progress
    const completedImages = await prisma.response.count({
      where: {
        userId: userId,
        image: {
          campaignId: activeCampaign.id
        }
      }
    });

    const taskData = {
      campaign: {
        id: activeCampaign.id,
        title: activeCampaign.title,
        question: activeCampaign.question
      },
      images: activeCampaign.images.map((image: any) => ({
        id: image.id,
        url: image.url,
        campaignId: image.campaignId
      })),
      currentImageIndex: 0, // Always start with first unresponded image
      totalImages: totalImages,
      completedImages: completedImages,
      progress: Math.round((completedImages / totalImages) * 100)
    };

    return NextResponse.json({
      success: true,
      data: taskData
    });

  } catch (error) {
    console.error('Error fetching current tasks:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}