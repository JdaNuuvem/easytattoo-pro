import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateStudioDto } from './dto/create-studio.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async getPublicProfile(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        bio: true,
        instagram: true,
        profilePhoto: true,
        coverPhoto: true,
        acceptsCompanion: true,
        pixKey: true,
        pixName: true,
        pixBank: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Artist not found');
    }

    // Fetch portfolio items
    const portfolio = await this.prisma.portfolio.findMany({
      where: { userId: id, isPublic: true },
      orderBy: { order: 'asc' },
      select: { imageUrl: true, title: true, style: true, tags: true },
      take: 6,
    });

    const reviewStats = await this.prisma.review.aggregate({
      where: { userId: id },
      _avg: { rating: true },
      _count: { rating: true },
    });

    return {
      ...user,
      profileImage: user.profilePhoto,
      styles: [...new Set(portfolio.map(p => p.style).filter(Boolean))],
      portfolio: portfolio.map(p => p.imageUrl),
      averageRating: reviewStats._avg.rating ? Math.round(reviewStats._avg.rating * 10) / 10 : 0,
      totalReviews: reviewStats._count.rating,
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { ...dto },
    });

    const { password, ...result } = user;
    return result;
  }

  async updateProfilePhoto(userId: string, photoUrl: string) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { profilePhoto: photoUrl },
    });

    const { password, ...result } = user;
    return result;
  }

  async updateCoverPhoto(userId: string, photoUrl: string) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { coverPhoto: photoUrl },
    });

    const { password, ...result } = user;
    return result;
  }

  // Studio CRUD
  async getStudios(userId: string) {
    return this.prisma.studio.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createStudio(userId: string, dto: CreateStudioDto) {
    return this.prisma.studio.create({
      data: {
        ...dto,
        userId,
      },
    });
  }

  async updateStudio(userId: string, studioId: string, dto: CreateStudioDto) {
    const studio = await this.prisma.studio.findFirst({
      where: { id: studioId, userId },
    });

    if (!studio) {
      throw new NotFoundException('Studio not found');
    }

    return this.prisma.studio.update({
      where: { id: studioId },
      data: { ...dto },
    });
  }

  async deleteStudio(userId: string, studioId: string) {
    const studio = await this.prisma.studio.findFirst({
      where: { id: studioId, userId },
    });

    if (!studio) {
      throw new NotFoundException('Studio not found');
    }

    return this.prisma.studio.delete({
      where: { id: studioId },
    });
  }

  // Studio Members
  async getStudioMembers(userId: string, studioId: string) {
    const studio = await this.prisma.studio.findFirst({
      where: { id: studioId, userId },
    });

    if (!studio) {
      throw new NotFoundException('Studio not found');
    }

    return this.prisma.studioMember.findMany({
      where: { studioId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePhoto: true,
            role: true,
          },
        },
      },
      orderBy: { joinedAt: 'asc' },
    });
  }

  async addStudioMember(userId: string, studioId: string, email: string, role?: string) {
    const studio = await this.prisma.studio.findFirst({
      where: { id: studioId, userId },
    });

    if (!studio) {
      throw new NotFoundException('Studio not found');
    }

    const targetUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!targetUser) {
      throw new NotFoundException('User with this email not found');
    }

    const existing = await this.prisma.studioMember.findUnique({
      where: { studioId_userId: { studioId, userId: targetUser.id } },
    });

    if (existing) {
      throw new ConflictException('User is already a member of this studio');
    }

    return this.prisma.studioMember.create({
      data: {
        studioId,
        userId: targetUser.id,
        role: role || 'MEMBER',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePhoto: true,
          },
        },
      },
    });
  }

  async removeStudioMember(userId: string, studioId: string, memberId: string) {
    const studio = await this.prisma.studio.findFirst({
      where: { id: studioId, userId },
    });

    if (!studio) {
      throw new NotFoundException('Studio not found');
    }

    const member = await this.prisma.studioMember.findFirst({
      where: { id: memberId, studioId },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    return this.prisma.studioMember.delete({
      where: { id: memberId },
    });
  }
}
