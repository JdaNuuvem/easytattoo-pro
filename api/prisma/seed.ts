import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean existing data
  await prisma.bookingReference.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.portfolio.deleteMany();
  await prisma.workSchedule.deleteMany();
  await prisma.specialDate.deleteMany();
  await prisma.pricingConfig.deleteMany();
  await prisma.client.deleteMany();
  await prisma.studio.deleteMany();
  await prisma.user.deleteMany();

  // Create ADMIN user
  const adminPassword = await bcrypt.hash('admin123', 12);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@easytattoo.com',
      password: adminPassword,
      name: 'Admin EasyTattoo',
      role: 'ADMIN',
    },
  });

  console.log(`Created admin user: ${adminUser.email}`);

  // Create demo ARTIST user
  const hashedPassword = await bcrypt.hash('demo123', 12);

  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@easytattoo.com',
      password: hashedPassword,
      name: 'Pedro Gringo',
      role: 'ARTIST',
      phone: '+55 11 99999-9999',
      instagram: '@pedrogringotattoo',
      bio: 'Tatuador profissional com mais de 10 anos de experiencia. Especialista em realismo, blackwork e aquarela.',
      pixKey: 'demo@easytattoo.com',
      pixName: 'Pedro Gringo',
      pixBank: 'Nubank',
      depositPercentage: 20,
      acceptsCompanion: true,
      maxDailyHours: 8,
    },
  });

  console.log(`Created demo artist user: ${demoUser.email}`);

  // Create studio
  const studio = await prisma.studio.create({
    data: {
      name: 'Gringo Ink Studio',
      address: 'Rua Augusta, 1234',
      city: 'Sao Paulo',
      state: 'SP',
      phone: '+55 11 3333-4444',
      userId: demoUser.id,
    },
  });

  console.log(`Created studio: ${studio.name}`);

  // Create pricing config with comprehensive price table
  const priceTable = [
    // 5cm width
    { width: 5, height: 5, price: 150 },
    { width: 5, height: 10, price: 200 },
    { width: 5, height: 15, price: 280 },
    { width: 5, height: 20, price: 350 },
    { width: 5, height: 30, price: 450 },
    // 10cm width
    { width: 10, height: 5, price: 200 },
    { width: 10, height: 10, price: 300 },
    { width: 10, height: 15, price: 400 },
    { width: 10, height: 20, price: 500 },
    { width: 10, height: 30, price: 650 },
    // 15cm width
    { width: 15, height: 5, price: 280 },
    { width: 15, height: 10, price: 400 },
    { width: 15, height: 15, price: 550 },
    { width: 15, height: 20, price: 700 },
    { width: 15, height: 30, price: 900 },
    // 20cm width
    { width: 20, height: 5, price: 350 },
    { width: 20, height: 10, price: 500 },
    { width: 20, height: 15, price: 700 },
    { width: 20, height: 20, price: 900 },
    { width: 20, height: 30, price: 1200 },
    // 30cm width
    { width: 30, height: 5, price: 450 },
    { width: 30, height: 10, price: 650 },
    { width: 30, height: 15, price: 900 },
    { width: 30, height: 20, price: 1200 },
    { width: 30, height: 30, price: 1800 },
  ];

  const bodyLocations: Record<string, number> = {
    forearm: 1.0,
    arm: 1.0,
    shoulder: 1.0,
    chest: 1.1,
    back: 1.1,
    ribs: 1.3,
    stomach: 1.2,
    thigh: 1.0,
    calf: 1.0,
    ankle: 1.2,
    foot: 1.3,
    hand: 1.4,
    finger: 1.5,
    neck: 1.3,
    face: 1.5,
    wrist: 1.1,
    hip: 1.1,
    knee: 1.2,
    elbow: 1.3,
  };

  const shadingOptions: Record<string, number> = {
    NONE: 1.0,
    LIGHT: 1.15,
    MEDIUM: 1.3,
    REALISM: 1.6,
  };

  const colorOptions: Record<string, number> = {
    BLACK: 1.0,
    ONE_COLOR: 1.1,
    TWO_COLORS: 1.2,
    THREE_COLORS: 1.35,
  };

  const tattooTypes: Record<string, number> = {
    DRAWING: 1.0,
    TEXT: 0.8,
  };

  const pricingConfig = await prisma.pricingConfig.create({
    data: {
      userId: demoUser.id,
      priceTable: priceTable,
      bodyLocations: bodyLocations,
      shadingOptions: shadingOptions,
      colorOptions: colorOptions,
      tattooTypes: tattooTypes,
      maxDailyTime: 480,
      depositPercentage: 20,
      miniPackPrice: 250,
      secondTattooDiscount: 15,
    },
  });

  console.log('Created pricing config');

  // Create work schedules (Mon-Fri 9:00-18:00)
  const weekdays = [1, 2, 3, 4, 5]; // Monday to Friday
  for (const day of weekdays) {
    await prisma.workSchedule.create({
      data: {
        userId: demoUser.id,
        studioId: studio.id,
        dayOfWeek: day,
        startTime: '09:00',
        endTime: '18:00',
        isAvailable: true,
      },
    });
  }

  // Saturday half-day
  await prisma.workSchedule.create({
    data: {
      userId: demoUser.id,
      studioId: studio.id,
      dayOfWeek: 6,
      startTime: '10:00',
      endTime: '14:00',
      isAvailable: true,
    },
  });

  console.log('Created work schedules');

  // Create some special dates
  await prisma.specialDate.create({
    data: {
      userId: demoUser.id,
      date: new Date('2026-03-03'),
      isBlocked: true,
      notes: 'Carnaval',
    },
  });

  await prisma.specialDate.create({
    data: {
      userId: demoUser.id,
      date: new Date('2026-04-03'),
      isBlocked: true,
      notes: 'Sexta-feira Santa',
    },
  });

  console.log('Created special dates');

  // Create sample clients
  const client1 = await prisma.client.create({
    data: {
      firstName: 'Maria',
      lastName: 'Silva',
      phone: '+55 11 98765-4321',
      email: 'maria.silva@email.com',
      instagram: '@mariasilva',
    },
  });

  const client2 = await prisma.client.create({
    data: {
      firstName: 'Joao',
      lastName: 'Santos',
      phone: '+55 11 91234-5678',
      email: 'joao.santos@email.com',
      instagram: '@joaosantos',
    },
  });

  const client3 = await prisma.client.create({
    data: {
      firstName: 'Ana',
      lastName: 'Costa',
      phone: '+55 21 99876-5432',
      email: 'ana.costa@email.com',
    },
  });

  const client4 = await prisma.client.create({
    data: {
      firstName: 'Lucas',
      lastName: 'Oliveira',
      phone: '+55 11 97654-3210',
      instagram: '@lucasoliv',
    },
  });

  console.log('Created sample clients');

  // Create sample bookings
  const booking1 = await prisma.booking.create({
    data: {
      clientId: client1.id,
      userId: demoUser.id,
      studioId: studio.id,
      tattooType: 'DRAWING',
      tattooWidth: 10,
      tattooHeight: 15,
      shadingType: 'MEDIUM',
      colorType: 'BLACK',
      bodyLocation: 'forearm',
      hasCompanion: false,
      description: 'Flor de lotus em estilo fine-line',
      promotion: 'NONE',
      scheduledDate: new Date('2026-03-10'),
      scheduledTime: '10:00',
      estimatedDuration: 120,
      totalPrice: 520,
      depositAmount: 104,
      depositPaid: true,
      status: 'CONFIRMED',
    },
  });

  const booking2 = await prisma.booking.create({
    data: {
      clientId: client2.id,
      userId: demoUser.id,
      studioId: studio.id,
      tattooType: 'DRAWING',
      tattooWidth: 20,
      tattooHeight: 20,
      shadingType: 'REALISM',
      colorType: 'BLACK',
      bodyLocation: 'arm',
      hasCompanion: true,
      description: 'Retrato realista do cachorro',
      promotion: 'NONE',
      scheduledDate: new Date('2026-03-12'),
      scheduledTime: '14:00',
      estimatedDuration: 240,
      totalPrice: 1440,
      depositAmount: 288,
      depositPaid: true,
      status: 'CONFIRMED',
    },
  });

  const booking3 = await prisma.booking.create({
    data: {
      clientId: client3.id,
      userId: demoUser.id,
      studioId: studio.id,
      tattooType: 'TEXT',
      tattooWidth: 8,
      tattooHeight: 5,
      shadingType: 'NONE',
      colorType: 'BLACK',
      bodyLocation: 'wrist',
      hasCompanion: false,
      description: 'Frase motivacional em fonte cursiva',
      promotion: 'NONE',
      scheduledDate: new Date('2026-03-15'),
      scheduledTime: '11:00',
      estimatedDuration: 60,
      totalPrice: 176,
      depositAmount: 35.2,
      depositPaid: false,
      status: 'PENDING',
    },
  });

  const booking4 = await prisma.booking.create({
    data: {
      clientId: client1.id,
      userId: demoUser.id,
      studioId: studio.id,
      tattooType: 'DRAWING',
      tattooWidth: 5,
      tattooHeight: 5,
      shadingType: 'LIGHT',
      colorType: 'ONE_COLOR',
      bodyLocation: 'ankle',
      hasCompanion: false,
      description: 'Borboleta pequena colorida',
      promotion: 'SECOND_TATTOO',
      totalPrice: 160.6,
      depositAmount: 32.12,
      depositPaid: true,
      status: 'COMPLETED',
    },
  });

  const booking5 = await prisma.booking.create({
    data: {
      clientId: client4.id,
      userId: demoUser.id,
      studioId: studio.id,
      tattooType: 'DRAWING',
      tattooWidth: 15,
      tattooHeight: 10,
      shadingType: 'MEDIUM',
      colorType: 'TWO_COLORS',
      bodyLocation: 'chest',
      hasCompanion: false,
      description: 'Lobo geometrico',
      promotion: 'NONE',
      scheduledDate: new Date('2026-02-28'),
      scheduledTime: '09:00',
      estimatedDuration: 180,
      totalPrice: 686.4,
      depositAmount: 137.28,
      depositPaid: false,
      status: 'PENDING',
    },
  });

  console.log('Created sample bookings');

  // Create sample portfolio items
  await prisma.portfolio.createMany({
    data: [
      {
        userId: demoUser.id,
        imageUrl: '/uploads/portfolio/sample-1.jpg',
        title: 'Realismo Preto e Cinza',
        description: 'Retrato realista em preto e cinza',
        style: 'Realism',
        tags: ['realismo', 'retrato', 'preto-cinza'],
        isPublic: true,
        order: 0,
      },
      {
        userId: demoUser.id,
        imageUrl: '/uploads/portfolio/sample-2.jpg',
        title: 'Fine Line Floral',
        description: 'Composicao floral em fine-line',
        style: 'Fine Line',
        tags: ['fine-line', 'floral', 'delicado'],
        isPublic: true,
        order: 1,
      },
      {
        userId: demoUser.id,
        imageUrl: '/uploads/portfolio/sample-3.jpg',
        title: 'Blackwork Geometrico',
        description: 'Padroes geometricos em blackwork',
        style: 'Blackwork',
        tags: ['blackwork', 'geometrico', 'padrao'],
        isPublic: true,
        order: 2,
      },
      {
        userId: demoUser.id,
        imageUrl: '/uploads/portfolio/sample-4.jpg',
        title: 'Aquarela',
        description: 'Tattoo em estilo aquarela vibrante',
        style: 'Watercolor',
        tags: ['aquarela', 'colorida', 'vibrante'],
        isPublic: true,
        order: 3,
      },
    ],
  });

  console.log('Created sample portfolio items');

  console.log('\nSeed completed successfully!');
  console.log('\nAccounts:');
  console.log('  Admin:  admin@easytattoo.com / admin123');
  console.log('  Artist: demo@easytattoo.com / demo123');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
