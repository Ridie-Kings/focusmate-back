import { ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateEventsCalendarDto } from './dto/create-events-calendar.dto';
import { UpdateEventsCalendarDto } from './dto/update-events-calendar.dto';
import { InjectModel } from '@nestjs/mongoose';
import { EventsCalendar } from './entities/events-calendar.entity';
import mongoose, { Model } from 'mongoose';

@Injectable()
export class EventsCalendarService {
  constructor(
    @InjectModel(EventsCalendar.name)
    private readonly eventsCalendarModel: Model<EventsCalendar>,
  ) {}

  async create(createEventsCalendarDto: CreateEventsCalendarDto, userId: mongoose.Types.ObjectId): Promise<EventsCalendar> {
    try {
      const event = await this.eventsCalendarModel.create({
        ...createEventsCalendarDto,
        userId,
      });
      return await event.populate('userId');
    }
    catch (error) {
      throw new InternalServerErrorException('Error creating event');
    }
  }

  async findAll(userId: mongoose.Types.ObjectId): Promise<EventsCalendar[]> {
    try {
      return await this.eventsCalendarModel.find({userId: userId}).populate('userId');
    }
    catch (error) {
      throw new InternalServerErrorException('Error getting events');
    }
  }

  async findOne(id: mongoose.Types.ObjectId, userId: mongoose.Types.ObjectId): Promise<EventsCalendar> {
    try {
      const event = await this.eventsCalendarModel.findById(id);
      if(!event) throw new NotFoundException('Event not found');
      if (!event.user.equals(userId)) throw new ForbiddenException('Unauthorized access');
      return await event.populate('userId');
    } catch (error) {
      throw new InternalServerErrorException('Error getting event');
    }
  }

  async update(id: mongoose.Types.ObjectId, updateEventsCalendarDto: UpdateEventsCalendarDto, userId: mongoose.Types.ObjectId): Promise<EventsCalendar> {
    try {
      const event = await this.eventsCalendarModel.findById(id);
      if (!event) throw new NotFoundException('Event not found');
      if (!event.user.equals(userId)) throw new ForbiddenException('Unauthorized access');
      const event_upd = await this.eventsCalendarModel.findByIdAndUpdate(id, {
        ...updateEventsCalendarDto,
      }, { new: true });
      return event_upd.populate('userId');
    } catch (error) {
      throw new InternalServerErrorException('Error updating event');
    }
  }

  async remove(id: mongoose.Types.ObjectId, userId: mongoose.Types.ObjectId): Promise<EventsCalendar> {
    try {
      const event = await this.eventsCalendarModel.findById(id);
      if (!event) throw new NotFoundException('Event not found');
      if (!event.user.equals(userId)) throw new ForbiddenException('Unauthorized access');
      return await this.eventsCalendarModel.findByIdAndDelete(id);
    } catch (error) {
      throw new InternalServerErrorException('Error deleting event');
    }
  }

  async getEventsCategory(userId: mongoose.Types.ObjectId, category: string): Promise<EventsCalendar[]> {
    try {
      const events = await this.eventsCalendarModel.find({ userId, category }).populate('userId');
      if (!events) throw new NotFoundException('Events not found');
      return events;
    } catch (error) {
      throw new InternalServerErrorException('Error getting events');
    }
  }
}
