import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { EventsCalendarService } from './events-calendar.service';
import { CreateEventsCalendarDto } from './dto/create-events-calendar.dto';
import { UpdateEventsCalendarDto } from './dto/update-events-calendar.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { EventsCalendar } from './entities/events-calendar.entity';
import { GetUser } from 'src/users/decorators/get-user.decorator';
import { User } from 'src/users/entities/user.entity';
import mongoose from 'mongoose';


@ApiTags('Events Calendar')
@ApiBearerAuth()
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
@UseGuards(JwtAuthGuard)
@Controller('events-calendar')
export class EventsCalendarController {
  constructor(private readonly eventsCalendarService: EventsCalendarService) {}

  @ApiOperation({ summary: 'Create a new event' })
  @ApiResponse({ status: 201, description: 'Event successfully created' })
  @ApiResponse({ status: 400, description: 'Invalid data provided' })
  @Post()
  async create(@Body() createEventsCalendarDto: CreateEventsCalendarDto, @GetUser() user: User): Promise<EventsCalendar> {
    return this.eventsCalendarService.create(createEventsCalendarDto, user.id);
  }

  @ApiOperation({ summary: 'Retrieve all events' })
  @ApiResponse({ status: 200, description: 'Events retrieved successfully' })
  @ApiResponse({ status: 404, description: 'No events found' })
  @ApiResponse({ status: 403, description: 'Unauthorized access' })
  @Get()
  async findAll(@GetUser() user: User): Promise<EventsCalendar[]> {
    return this.eventsCalendarService.findAll(user.id);
  }

  @ApiOperation({ summary: 'Retrieve an event by ID' })
  @ApiResponse({ status: 200, description: 'Event retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  @ApiResponse({ status: 403, description: 'Unauthorized access' })
  @Get(':id')
  async findOne(@Param('id') id: mongoose.Types.ObjectId, @GetUser() user: User): Promise<EventsCalendar> {
    return this.eventsCalendarService.findOne(id, user.id);
  }

  @ApiOperation({ summary: 'Update an event' })
  @ApiResponse({ status: 200, description: 'Event updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid data provided' })
  @ApiResponse({ status: 403, description: 'Unauthorized access' })
  @Patch(':id')
  async update(@Param('id') id: mongoose.Types.ObjectId, @Body() updateEventsCalendarDto: UpdateEventsCalendarDto, @GetUser() user: User): Promise<EventsCalendar> {
    return this.eventsCalendarService.update(id, updateEventsCalendarDto, user.id);
  }

  @ApiOperation({ summary: 'Delete an event' })
  @ApiResponse({ status: 200, description: 'Event deleted successfully' })
  @ApiResponse({ status: 403, description: 'Unauthorized access' })
  @Delete(':id')
  async remove(@Param('id') id: mongoose.Types.ObjectId, @GetUser() user: User): Promise<EventsCalendar> {
    return this.eventsCalendarService.remove(id, user.id);
    
  }
}
