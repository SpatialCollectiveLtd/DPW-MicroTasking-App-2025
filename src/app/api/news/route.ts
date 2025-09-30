import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const news = await prisma.news.findMany({
      where: {
        isActive: true
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
      take: 10 // Limit to 10 most recent items
    });

    return NextResponse.json({
      success: true,
      data: news
    });

  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json({
      success: false,
      message: 'Database connection failed. Please reload the page.',
    }, { status: 500 });
  }
}