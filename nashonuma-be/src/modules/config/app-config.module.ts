import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsModule } from '../events/events.module';
import { AppConfigController } from './app-config.controller';
import { AppConfigService } from './app-config.service';
import { AppConfig } from './entities/app-config.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AppConfig]), EventsModule],
  controllers: [AppConfigController],
  providers: [AppConfigService],
  exports: [AppConfigService]
})
export class AppConfigModule {}
