import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsModule } from '../events/events.module';
import { ChildrenController } from './children.controller';
import { ChildrenService } from './children.service';
import { Child } from './entities/child.entity';
import { MorbasAssessment } from './entities/morbas-assessment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Child, MorbasAssessment]), EventsModule],
  controllers: [ChildrenController],
  providers: [ChildrenService],
  exports: [ChildrenService]
})
export class ChildrenModule {}
