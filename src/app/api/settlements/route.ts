import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { ApiResponse, Settlement } from '@/types';

export async function GET() {
  try {
    const settlements = await prisma.settlement.findMany({
      select: {
        id: true,
        name: true,
        location: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      data: settlements,
    } as ApiResponse<Settlement[]>);
  } catch (error) {
    console.error('Failed to fetch settlements:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch settlements',
      } as ApiResponse,
      { status: 500 }
    );
  }
}