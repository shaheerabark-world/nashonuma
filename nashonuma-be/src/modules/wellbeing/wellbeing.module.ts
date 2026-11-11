import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsModule } from '../events/events.module';
import { WellbeingReport } from './entities/wellbeing-report.entity';
import { WellbeingController } from './wellbeing.controller';
import { WellbeingService } from './wellbeing.service';

@Module({
  imports: [TypeOrmModule.forFeature([WellbeingReport]), EventsModule],
  controllers: [WellbeingController],
  providers: [WellbeingService],
  exports: [WellbeingService]
})
export class WellbeingModule {}
