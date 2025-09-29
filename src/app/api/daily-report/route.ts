import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

const authOptions = {
  session: { strategy: 'jwt' as const },
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

    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Try to find existing daily report for today
    let dailyReport = await prisma.dailyReport.findUnique({
      where: {
        userId_date: {
          userId: userId,
          date: today
        }
      }
    });

    // If no report exists, calculate and create one
    if (!dailyReport) {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Count today's responses
      const todayResponses = await prisma.response.findMany({
        where: {
          userId: userId,
          submittedAt: {
            gte: today,
            lt: tomorrow
          }
        },
        include: {
          image: true
        }
      });

      const tasksCompleted = todayResponses.length;
      const targetTasks = 300; // Default daily target

      // Calculate accuracy score based on consensus
      let correctResponses = 0;
      let totalValidated = 0;

      for (const response of todayResponses) {
        if (response.image.consensusReached && response.image.groundTruth !== null) {
          totalValidated++;
          if (response.answer === response.image.groundTruth) {
            correctResponses++;
          }
        }
      }

      const accuracyScore = totalValidated > 0 ? (correctResponses / totalValidated) * 100 : 0;

      // Calculate payments
      const basePayPerTask = 1.0; // KSh 1 per task
      const basePay = tasksCompleted * basePayPerTask;
      
      // Quality bonus: 50% extra for accuracy >= 85%
      const qualityBonus = accuracyScore >= 85 ? basePay * 0.5 : 0;
      const totalPay = basePay + qualityBonus;

      // Create daily report
      dailyReport = await prisma.dailyReport.create({
        data: {
          userId: userId,
          date: today,
          tasksCompleted: tasksCompleted,
          targetTasks: targetTasks,
          accuracyScore: accuracyScore,
          basePay: basePay,
          qualityBonus: qualityBonus,
          totalPay: totalPay
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        tasksCompleted: dailyReport.tasksCompleted,
        targetTasks: dailyReport.targetTasks,
        accuracyScore: dailyReport.accuracyScore,
        basePay: dailyReport.basePay,
        qualityBonus: dailyReport.qualityBonus,
        totalPay: dailyReport.totalPay,
        date: dailyReport.date
      }
    });

  } catch (error) {
    console.error('Error fetching daily report:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}