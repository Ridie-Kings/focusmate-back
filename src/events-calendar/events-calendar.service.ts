import { Injectable } from '@nestjs/common';
import { CreateEventsCalendarDto } from './dto/create-events-calendar.dto';
import { UpdateEventsCalendarDto } from './dto/update-events-calendar.dto';

@Injectable()
export class EventsCalendarService {
  create(createEventsCalendarDto: CreateEventsCalendarDto) {
    return 'This action adds a new eventsCalendar';
  }

  findAll() {
    return `This action returns all eventsCalendar`;
  }

  findOne(id: number) {
    return `This action returns a #${id} eventsCalendar`;
  }

  update(id: number, updateEventsCalendarDto: UpdateEventsCalendarDto) {
    return `This action updates a #${id} eventsCalendar`;
  }

  remove(id: number) {
    return `This action removes a #${id} eventsCalendar`;
  }
}
