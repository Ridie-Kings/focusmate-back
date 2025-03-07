import { Module } from '@nestjs/common';
import { EventsCalendarService } from './events-calendar.service';
import { EventsCalendarController } from './events-calendar.controller';

@Module({
  controllers: [EventsCalendarController],
  providers: [EventsCalendarService],
})
export class EventsCalendarModule {}
