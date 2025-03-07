import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EventsCalendarService } from './events-calendar.service';
import { CreateEventsCalendarDto } from './dto/create-events-calendar.dto';
import { UpdateEventsCalendarDto } from './dto/update-events-calendar.dto';

@Controller('events-calendar')
export class EventsCalendarController {
  constructor(private readonly eventsCalendarService: EventsCalendarService) {}

  @Post()
  create(@Body() createEventsCalendarDto: CreateEventsCalendarDto) {
    return this.eventsCalendarService.create(createEventsCalendarDto);
  }

  @Get()
  findAll() {
    return this.eventsCalendarService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsCalendarService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEventsCalendarDto: UpdateEventsCalendarDto) {
    return this.eventsCalendarService.update(+id, updateEventsCalendarDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventsCalendarService.remove(+id);
  }
}
