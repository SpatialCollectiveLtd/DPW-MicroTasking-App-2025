import { PrismaClient, UserRole, NewsPriority } from '@prisma/client';
import { SAMPLE_SETTLEMENTS, SAMPLE_QUESTIONS, SAMPLE_IMAGE_URLS } from '../src/lib/constants';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  await prisma.response.deleteMany();
  await prisma.dailyReport.deleteMany();
  await prisma.image.deleteMany();
  await prisma.campaignSettlement.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.user.deleteMany();
  await prisma.settlement.deleteMany();
  await prisma.news.deleteMany();

  console.log('🗑️  Cleared existing data');

  // Create settlements
  const settlements = await Promise.all(
    SAMPLE_SETTLEMENTS.map(settlement =>
      prisma.settlement.create({
        data: {
          name: settlement.name,
          location: settlement.location,
        },
      })
    )
  );
  console.log(`✅ Created ${settlements.length} settlements`);

  // Create system admin user (no settlement restriction)
  const systemAdmin = await prisma.user.create({
    data: {
      phone: '+254701234567',
      role: UserRole.ADMIN,
      // No settlementId - system-wide admin
    },
  });

  // Create settlement-specific admin
  const settlementAdmin = await prisma.user.create({
    data: {
      phone: '+254702345678',
      role: UserRole.ADMIN,
      settlementId: settlements[0].id, // Mji wa Huruma admin
    },
  });
  
  console.log('👤 Created admin users (system + settlement-specific)');

  // Create sample worker users
  const workers = await Promise.all([
    prisma.user.create({
      data: {
        phone: '+254712345678',
        role: UserRole.WORKER,
        settlementId: settlements[0].id, // Mji wa Huruma
      },
    }),
    prisma.user.create({
      data: {
        phone: '+254723456789',
        role: UserRole.WORKER,
        settlementId: settlements[1].id, // Kayole Soweto
      },
    }),
    prisma.user.create({
      data: {
        phone: '+254734567890',
        role: UserRole.WORKER,
        settlementId: settlements[2].id, // Kariobangi
      },
    }),
  ]);
  console.log(`👷 Created ${workers.length} worker users`);

  // Create sample campaigns
  const campaigns = await Promise.all(
    SAMPLE_QUESTIONS.map((question, index) =>
      prisma.campaign.create({
        data: {
          title: `Infrastructure Assessment ${index + 1}`,
          question,
          isActive: index === 0, // Only first campaign is active
          createdBy: systemAdmin.id,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        },
      })
    )
  );
  console.log(`📋 Created ${campaigns.length} campaigns`);

  // Assign campaigns to settlements
  for (const campaign of campaigns) {
    await Promise.all(
      settlements.map(settlement =>
        prisma.campaignSettlement.create({
          data: {
            campaignId: campaign.id,
            settlementId: settlement.id,
          },
        })
      )
    );
  }
  console.log('🔗 Assigned campaigns to settlements');

  // Create images for the active campaign
  const activeCampaign = campaigns[0];
  const images = await Promise.all(
    SAMPLE_IMAGE_URLS.map(url =>
      prisma.image.create({
        data: {
          url,
          campaignId: activeCampaign.id,
        },
      })
    )
  );
  console.log(`🖼️  Created ${images.length} images for active campaign`);

  // Create some sample responses
  const sampleResponses = [
    { worker: workers[0], image: images[0], answer: true },
    { worker: workers[0], image: images[1], answer: false },
    { worker: workers[1], image: images[0], answer: true },
    { worker: workers[1], image: images[1], answer: true },
    { worker: workers[2], image: images[0], answer: false },
  ];

  await Promise.all(
    sampleResponses.map(({ worker, image, answer }) =>
      prisma.response.create({
        data: {
          userId: worker.id,
          imageId: image.id,
          answer,
        },
      })
    )
  );
  console.log(`💬 Created ${sampleResponses.length} sample responses`);

  // Update image counts
  for (const image of images) {
    const responses = await prisma.response.findMany({
      where: { imageId: image.id },
    });

    const yesCount = responses.filter((r: any) => r.answer === true).length;
    const noCount = responses.filter((r: any) => r.answer === false).length;

    await prisma.image.update({
      where: { id: image.id },
      data: {
        totalResponses: responses.length,
        yesCount,
        noCount,
      },
    });
  }
  console.log('📊 Updated image response counts');

  // Create sample news items
  await Promise.all([
    prisma.news.create({
      data: {
        title: 'Welcome to the DPW Platform!',
        content: 'Complete your daily tasks to earn KES 760 base pay plus quality bonuses.',
        priority: NewsPriority.HIGH,
        createdBy: systemAdmin.id,
      },
    }),
    prisma.news.create({
      data: {
        title: 'Payment Schedule Update',
        content: 'Payments are processed weekly every Friday. Check your earnings in the app.',
        priority: NewsPriority.MEDIUM,
        createdBy: systemAdmin.id,
      },
    }),
    prisma.news.create({
      data: {
        title: 'New Task Campaign Available',
        content: 'A new infrastructure assessment campaign is now live. Happy tasking!',
        priority: NewsPriority.LOW,
        createdBy: systemAdmin.id,
      },
    }),
  ]);
  console.log('📰 Created sample news items');

  // Create sample notices with proper targeting
  const globalNotice1 = await prisma.notice.create({
    data: {
      title: 'Platform Update: Enhanced Quality Controls',
      content: 'We have implemented new quality control measures to ensure the highest accuracy in community mapping data. Please take extra care when reviewing images, especially in areas with poor lighting or complex structures. Your attention to detail directly impacts community development planning and your bonus payments.',
      priority: 'HIGH',
      targetType: 'ALL',
      createdBy: systemAdmin.id,
      isActive: true
    }
  });

  const globalNotice2 = await prisma.notice.create({
    data: {
      title: 'Payment System Upgrade Complete',
      content: 'Our payment processing system has been successfully upgraded! All earnings will now be processed within 24 hours of task completion. You will receive SMS notifications when payments are sent to your M-Pesa account. Previous payment delays have been resolved.',
      priority: 'MEDIUM',
      targetType: 'ALL',
      createdBy: systemAdmin.id,
      isActive: true
    }
  });

  const globalNotice3 = await prisma.notice.create({
    data: {
      title: 'Weekly Bonus Opportunity',
      content: 'Complete 250+ tasks this week with 85% accuracy or higher to unlock a special KES 500 bonus! Track your progress in the dashboard and maintain high quality to maximize your earnings. Bonus payments will be processed on Friday.',
      priority: 'LOW',
      targetType: 'ALL',
      createdBy: systemAdmin.id,
      isActive: true
    }
  });

  // Settlement-specific notices
  const hurumaNotice = await prisma.notice.create({
    data: {
      title: 'Mji wa Huruma: Infrastructure Survey Priority',
      content: 'Special focus needed for the upcoming infrastructure development project in Mji wa Huruma. Please pay close attention to water access points, drainage systems, and road conditions in your assigned areas. This data will support the Q1 2026 community development initiatives.',
      priority: 'HIGH',
      targetType: 'SETTLEMENT',
      settlementId: settlements.find(s => s.name === 'Mji wa Huruma')?.id,
      createdBy: settlementAdmin.id,
      isActive: true
    }
  });

  const kayoleNotice = await prisma.notice.create({
    data: {
      title: 'Kayole Soweto: Safety Protocol Update',
      content: 'New safety guidelines are in effect for field work in Kayole Soweto. Please work in pairs when possible and check in with your supervisor every 2 hours. Safety equipment is available for collection at the local coordination center.',
      priority: 'MEDIUM',
      targetType: 'SETTLEMENT',
      settlementId: settlements.find(s => s.name === 'Kayole Soweto')?.id,
      createdBy: settlementAdmin.id,
      isActive: true
    }
  });

  console.log('📢 Created sample notices');

  // Create some realistic notice reads
  const worker1 = users.find(u => u.phone === '+254712345678');
  const worker2 = users.find(u => u.phone === '+254723456789');
  const worker3 = users.find(u => u.phone === '+254734567890');

  if (worker1) {
    await prisma.noticeRead.create({
      data: {
        noticeId: globalNotice1.id,
        userId: worker1.id
      }
    });
    await prisma.noticeRead.create({
      data: {
        noticeId: hurumaNotice.id,
        userId: worker1.id
      }
    });
  }

  if (worker2) {
    await prisma.noticeRead.create({
      data: {
        noticeId: globalNotice1.id,
        userId: worker2.id
      }
    });
    await prisma.noticeRead.create({
      data: {
        noticeId: globalNotice2.id,
        userId: worker2.id
      }
    });
    await prisma.noticeRead.create({
      data: {
        noticeId: kayoleNotice.id,
        userId: worker2.id
      }
    });
  }

  if (worker3) {
    await prisma.noticeRead.create({
      data: {
        noticeId: globalNotice1.id,
        userId: worker3.id
      }
    });
  }

  console.log('👁️ Created notice read tracking');

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📝 Sample credentials:');
  console.log('System Admin: +254701234567 (system-wide access)');
  console.log('Settlement Admin: +254702345678 (Mji wa Huruma)');
  console.log('Worker 1: +254712345678 (Mji wa Huruma)');
  console.log('Worker 2: +254723456789 (Kayole Soweto)');
  console.log('Worker 3: +254734567890 (Kariobangi)');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });