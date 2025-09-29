import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { taskId, images, notes } = await request.json();

    if (!taskId || !images || images.length === 0) {
      return NextResponse.json(
        { error: 'Task ID and images are required' },
        { status: 400 }
      );
    }

    // For now, we'll create a simple task submission record
    // In a real implementation, you would:
    // 1. Validate the task exists and is available
    // 2. Store the images in cloud storage
    // 3. Create task submission record with proper relations
    // 4. Update user progress/earnings
    
    const taskSubmission = await prisma.taskSubmission.create({
      data: {
        userId: session.user.id,
        taskId: taskId,
        status: 'submitted',
        submissionData: {
          images: images.map((img: any) => ({
            id: img.id,
            tags: img.tags,
            description: img.description,
            // In real app, this would be the uploaded file URL
            url: `placeholder-${img.id}.jpg`
          })),
          notes: notes || ''
        },
        submittedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      submissionId: taskSubmission.id,
      message: 'Task submitted successfully'
    });

  } catch (error) {
    console.error('Task submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit task' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || session.user.id;

    const submissions = await prisma.taskSubmission.findMany({
      where: {
        userId: userId
      },
      orderBy: {
        submittedAt: 'desc'
      },
      take: 50 // Limit to 50 recent submissions
    });

    return NextResponse.json({
      submissions: submissions.map(submission => ({
        id: submission.id,
        taskId: submission.taskId,
        status: submission.status,
        submittedAt: submission.submittedAt,
        reviewedAt: submission.reviewedAt,
        earnings: submission.earnings || 0
      }))
    });

  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}