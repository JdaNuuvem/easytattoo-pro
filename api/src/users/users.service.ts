import { Injectable, NotFoundException } from '@nestjs/common';
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

    return {
      ...user,
      profileImage: user.profilePhoto,
      styles: [...new Set(portfolio.map(p => p.style).filter(Boolean))],
      portfolio: portfolio.map(p => p.imageUrl),
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
}
