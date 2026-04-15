import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with mock data...');

  // Create an Authority User
  const authority = await prisma.user.create({
    data: {
      name: 'Central Control Room',
      phone: '9999999999',
      role: 'AUTHORITY',
      points: 0,
    }
  });

  // Create a Citizen
  const citizen = await prisma.user.create({
    data: {
      name: 'Saurabh Humane',
      email: 'saurabhhumane125@gmail.com',
      role: 'CITIZEN',
      points: 120,
      trustScore: 95.5
    }
  });

  // Create mock leaks near Delhi
  const leaksData = [
    { lat: 28.6139, lng: 77.2090, cat: 'PIPE_BURST', sev: 'CRITICAL', flow: 'GUSH', status: 'REPORTED', score: 85 },
    { lat: 28.6149, lng: 77.2190, cat: 'TAP_LEAK', sev: 'MINOR', flow: 'DRIP', status: 'VERIFIED', score: 40 },
    { lat: 28.6239, lng: 77.1990, cat: 'UNDERGROUND', sev: 'SEVERE', flow: 'STREAM', status: 'IN_PROGRESS', score: 75 }
  ];

  for (const l of leaksData) {
    await prisma.leak.create({
      data: {
        reporterId: citizen.id,
        latitude: l.lat,
        longitude: l.lng,
        address: 'Connaught Place, New Delhi',
        photoUrl: 'processed-mock.webp',
        category: l.cat as any,
        severity: l.sev as any,
        flowRate: l.flow as any,
        status: l.status as any,
        priorityScore: l.score,
        waterLossRate: 30
      }
    });
  }

  console.log('Seed completed!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
