import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { baseDataSourceOptions } from './config/data-source';
import { AuthModule } from './modules/auth/auth.module';
import { ChildrenModule } from './modules/children/children.module';
import { AppConfigModule } from './modules/config/app-config.module';
import { EventsModule } from './modules/events/events.module';
import { ReportsModule } from './modules/reports/reports.module';
import { UsersModule } from './modules/users/users.module';
import { WellbeingModule } from './modules/wellbeing/wellbeing.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env' }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        ...baseDataSourceOptions,
        url: config.getOrThrow<string>('DATABASE_URL'),
        // Each module registers its own entities with TypeOrmModule.forFeature.
        autoLoadEntities: true
      })
    }),
    EventsModule,
    UsersModule,
    AuthModule,
    ChildrenModule,
    ReportsModule,
    WellbeingModule,
    AppConfigModule
  ],
  providers: [
    // Order matters: JWT first (sets req.user), then roles.
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard }
  ]
})
export class AppModule {}
