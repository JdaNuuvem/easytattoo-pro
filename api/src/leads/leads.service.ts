import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LeadsService {
  constructor(private readonly prisma: PrismaService) {}

  async getLeads(userId: string) {
    const bookings = await this.prisma.booking.findMany({
      where: { userId },
      include: {
        client: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return bookings.map((b) => ({
      id: b.client.id,
      firstName: b.client.firstName,
      lastName: b.client.lastName,
      email: b.client.email || '',
      phone: b.client.phone,
      instagram: b.client.instagram || '',
      city: '',
      state: '',
      tattooStyle: b.tattooType,
      bodyLocation: b.bodyLocation,
      createdAt: b.createdAt.toISOString(),
    }));
  }

  async getLeadStats(userId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalLeads, leadsThisMonth] = await Promise.all([
      this.prisma.client.count({
        where: { bookings: { some: { userId } } },
      }),
      this.prisma.client.count({
        where: {
          bookings: { some: { userId } },
          createdAt: { gte: startOfMonth },
        },
      }),
    ]);

    const bookings = await this.prisma.booking.findMany({
      where: { userId },
      select: { tattooType: true, bodyLocation: true },
    });

    const styleCounts: Record<string, number> = {};
    for (const b of bookings) {
      styleCounts[b.tattooType] = (styleCounts[b.tattooType] || 0) + 1;
    }

    const topStyles = Object.entries(styleCounts)
      .map(([style, count]) => ({ style, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalLeads,
      leadsThisMonth,
      topStyles,
      topLocations: [],
    };
  }

  async exportCsv(userId: string): Promise<string> {
    const leads = await this.getLeads(userId);
    const header = 'Nome,Email,Telefone,Instagram,Estilo,Data\n';
    const rows = leads
      .map(
        (l) =>
          `"${l.firstName} ${l.lastName}","${l.email}","${l.phone}","${l.instagram}","${l.tattooStyle}","${l.createdAt}"`,
      )
      .join('\n');

    return header + rows;
  }

  async exportLookalike(userId: string): Promise<string> {
    const leads = await this.getLeads(userId);
    const header = 'email,phone,fn,ln,country\n';
    const rows = leads
      .filter((l) => l.email)
      .map(
        (l) =>
          `"${l.email}","${l.phone}","${l.firstName}","${l.lastName}","BR"`,
      )
      .join('\n');

    return header + rows;
  }
}
