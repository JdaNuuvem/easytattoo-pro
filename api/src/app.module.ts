import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ClientsModule } from './clients/clients.module';
import { BookingsModule } from './bookings/bookings.module';
import { PricingModule } from './pricing/pricing.module';
import { PortfolioModule } from './portfolio/portfolio.module';
import { UploadModule } from './upload/upload.module';
import { ScheduleModule } from './schedule/schedule.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { MyBookingsModule } from './my-bookings/my-bookings.module';
import { PaymentsModule } from './payments/payments.module';
import { NotificationsModule } from './notifications/notifications.module';
import { LeadsModule } from './leads/leads.module';
import { GoogleCalendarModule } from './google-calendar/google-calendar.module';
import { ReviewsModule } from './reviews/reviews.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
      serveStaticOptions: {
        index: false,
      },
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ClientsModule,
    BookingsModule,
    PricingModule,
    PortfolioModule,
    UploadModule,
    ScheduleModule,
    AnalyticsModule,
    MyBookingsModule,
    PaymentsModule,
    NotificationsModule,
    LeadsModule,
    GoogleCalendarModule,
    ReviewsModule,
  ],
})
export class AppModule {}
