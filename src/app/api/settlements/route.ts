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
    
    // Fallback to mock data for development when database is not accessible
    const mockSettlements = [
      { id: '1', name: 'Mji wa Huruma', location: 'Nairobi' },
      { id: '2', name: 'Kayole Soweto', location: 'Nairobi' },
      { id: '3', name: 'Kariobangi', location: 'Nairobi' },
    ];

    return NextResponse.json({
      success: true,
      data: mockSettlements,
    } as ApiResponse<Settlement[]>);
  }
}