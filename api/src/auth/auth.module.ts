import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: () => {
        const secret = process.env.JWT_SECRET;
        if (!secret || secret === 'easytattoo-jwt-secret-dev') {
          if (process.env.NODE_ENV === 'production') {
            throw new Error('JWT_SECRET must be set in production');
          }
        }
        return {
          secret: secret || 'easytattoo-jwt-secret-dev',
          signOptions: { expiresIn: process.env.JWT_EXPIRATION || '7d' },
        };
      },
    }),
    UsersModule,
    NotificationsModule,
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
