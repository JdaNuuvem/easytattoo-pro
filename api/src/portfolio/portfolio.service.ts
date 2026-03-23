import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';

@Injectable()
export class PortfolioService {
  constructor(private readonly prisma: PrismaService) {}

  async getByUserId(userId: string) {
    return this.prisma.portfolio.findMany({
      where: {
        userId,
        isPublic: true,
      },
      orderBy: { order: 'asc' },
    });
  }

  async getMyPortfolio(userId: string) {
    return this.prisma.portfolio.findMany({
      where: { userId },
      orderBy: { order: 'asc' },
    });
  }

  async create(userId: string, dto: CreatePortfolioDto) {
    // Get max order for this user
    const maxOrder = await this.prisma.portfolio.findFirst({
      where: { userId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    return this.prisma.portfolio.create({
      data: {
        userId,
        imageUrl: dto.imageUrl,
        title: dto.title,
        description: dto.description,
        style: dto.style,
        tags: dto.tags || [],
        isPublic: dto.isPublic ?? true,
        order: dto.order ?? (maxOrder ? maxOrder.order + 1 : 0),
      },
    });
  }

  async update(userId: string, portfolioId: string, dto: UpdatePortfolioDto) {
    const item = await this.prisma.portfolio.findFirst({
      where: { id: portfolioId, userId },
    });

    if (!item) {
      throw new NotFoundException('Portfolio item not found');
    }

    return this.prisma.portfolio.update({
      where: { id: portfolioId },
      data: { ...dto },
    });
  }

  async delete(userId: string, portfolioId: string) {
    const item = await this.prisma.portfolio.findFirst({
      where: { id: portfolioId, userId },
    });

    if (!item) {
      throw new NotFoundException('Portfolio item not found');
    }

    return this.prisma.portfolio.delete({
      where: { id: portfolioId },
    });
  }

  async reorder(userId: string, orderedIds: string[]) {
    const updates = orderedIds.map((id, index) =>
      this.prisma.portfolio.updateMany({
        where: { id, userId },
        data: { order: index },
      }),
    );

    await this.prisma.$transaction(updates);

    return this.getMyPortfolio(userId);
  }
}
