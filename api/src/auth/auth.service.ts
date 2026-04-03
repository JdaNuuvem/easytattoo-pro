import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleCallbackDto } from './dto/google-callback.dto';

interface GoogleTokenResponse {
  access_token: string;
  refresh_token?: string;
  id_token: string;
  expires_in: number;
  token_type: string;
}

interface GoogleUserInfo {
  sub: string;
  email: string;
  name: string;
  picture?: string;
  email_verified: boolean;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async register(dto: RegisterDto) {
    try {
      const role = dto.role || 'ARTIST';

      if ((role as string) === 'ADMIN') {
        throw new BadRequestException('Cannot register as ADMIN');
      }

      const existingUser = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (existingUser) {
        throw new ConflictException('Email already registered');
      }

      const hashedPassword = await bcrypt.hash(dto.password, 12);

      const user = await this.prisma.user.create({
        data: {
          name: dto.name,
          email: dto.email,
          password: hashedPassword,
          role,
          phone: dto.phone,
        },
      });

      // If CLIENT, create linked Client profile
      if (role === 'CLIENT') {
        const nameParts = dto.name.trim().split(/\s+/);
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || firstName;

        await this.prisma.client.create({
          data: {
            firstName,
            lastName,
            phone: dto.phone || '',
            email: dto.email,
            userId: user.id,
          },
        });
      }

      const token = this.generateToken(user.id, user.email, user.role);

      const { password, ...userWithoutPassword } = user;

      return {
        user: userWithoutPassword,
        access_token: token,
      };
    } catch (error) {
      console.error('[REGISTER ERROR]', error);
      throw error;
    }
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.password) {
      throw new UnauthorizedException(
        'This account uses Google login. Please sign in with Google.',
      );
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.generateToken(user.id, user.email, user.role);

    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      access_token: token,
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        studios: true,
        pricingConfig: true,
        clientProfile: {
          include: {
            _count: {
              select: { bookings: true },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async googleCallback(dto: GoogleCallbackDto) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new BadRequestException('Google OAuth not configured on server');
    }

    // Exchange authorization code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: dto.code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: dto.redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorBody = await tokenResponse.text();
      throw new BadRequestException(`Google token exchange failed: ${errorBody}`);
    }

    const tokens: GoogleTokenResponse = await tokenResponse.json();

    // Get user info from Google
    const userInfoResponse = await fetch(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      { headers: { Authorization: `Bearer ${tokens.access_token}` } },
    );

    if (!userInfoResponse.ok) {
      throw new BadRequestException('Failed to fetch Google user info');
    }

    const googleUser: GoogleUserInfo = await userInfoResponse.json();

    // Find or create user
    let user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { googleId: googleUser.sub },
          { email: googleUser.email },
        ],
      },
    });

    if (user) {
      // Update Google tokens
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: googleUser.sub,
          googleAccessToken: tokens.access_token,
          googleRefreshToken: tokens.refresh_token || user.googleRefreshToken,
          profilePhoto: user.profilePhoto || googleUser.picture || null,
        },
      });
    } else {
      // Create new user
      user = await this.prisma.user.create({
        data: {
          email: googleUser.email,
          name: googleUser.name,
          googleId: googleUser.sub,
          googleAccessToken: tokens.access_token,
          googleRefreshToken: tokens.refresh_token || null,
          profilePhoto: googleUser.picture || null,
          role: 'ARTIST',
        },
      });
    }

    const jwtToken = this.generateToken(user.id, user.email, user.role);
    const { password, googleAccessToken, googleRefreshToken, ...safeUser } = user;

    return {
      user: safeUser,
      access_token: jwtToken,
      googleAccessToken: tokens.access_token,
      googleRefreshToken: tokens.refresh_token || null,
      hasCalendarAccess: !!user.googleRefreshToken,
    };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return; // Don't reveal if email exists

    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hour

    await this.prisma.user.update({
      where: { id: user.id },
      data: { resetPasswordToken: hashedToken, resetPasswordExpires: expires },
    });

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3080'}/reset-password?token=${token}`;
    await this.notificationsService.sendPasswordResetEmail(user.email, resetUrl);
  }

  async resetPassword(token: string, newPassword: string) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await this.prisma.user.findFirst({
      where: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { gt: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestException('Token inválido ou expirado');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });
  }

  private generateToken(
    userId: string,
    email: string,
    role: string,
  ): string {
    const payload = { sub: userId, email, role };
    return this.jwtService.sign(payload);
  }
}
