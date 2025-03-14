import { ForbiddenException, Inject, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import mongoose, { Model } from "mongoose";
import { Calendar } from "./entities/calendar.entity";
import { TasksService } from "src/tasks/tasks.service";
import { EventsCalendarService } from "src/events-calendar/events-calendar.service";
import { RemindersService } from "src/reminders/reminders.service";

@Injectable()
export class CalendarService {
  constructor(
    @InjectModel(Calendar.name) private calendarModel: Model<Calendar>,
    @Inject(TasksService) private readonly tasksService: TasksService,
    @Inject(EventsCalendarService) private readonly eventsService: EventsCalendarService,
    @Inject(RemindersService) private readonly remindersService: RemindersService,
  ) {}

  private formatDate(dateString?: string): Date | undefined {
    return dateString ? new Date(dateString) : undefined;
  }

  async createCalendar(userId: mongoose.Types.ObjectId): Promise<Calendar> {
    try {
      const calendar = await this.calendarModel.create({ userId, tasks: [], reminders: [], events: []});
      return calendar;
    } catch (error) {
      throw new InternalServerErrorException("Error creating calendar");
    }
  }

  async addTask(calendarID: mongoose.Types.ObjectId, userId: mongoose.Types.ObjectId, taskId: mongoose.Types.ObjectId): Promise<Calendar> {
    const calendar = await this.calendarModel.findOne(calendarID);
    const task = await this.tasksService.findOne(taskId, userId);
    if (!calendar) {
      throw new NotFoundException("Calendar not found");
    }
    if (!calendar.user.equals(userId)) {
      throw new ForbiddenException("Forbidden access");
    }
    if (!task) {
      throw new NotFoundException("Task not found");
    }
    try {
      const updCal = await this.calendarModel.findByIdAndUpdate(calendar._id, { $push: { tasks: taskId } }, { new: true });
      return await updCal.populate("tasks");
    } catch (error) {
      throw new InternalServerErrorException("Error adding task to calendar");
    }
  }

  async addEvent(userId: mongoose.Types.ObjectId, eventID: mongoose.Types.ObjectId): Promise<Calendar> {
    const calendar = await this.calendarModel.findOne({ user: userId });
    if (!calendar) {
      throw new NotFoundException("Calendar not found");
    }
    if (!calendar.user.equals(userId)) {
      throw new ForbiddenException("Forbidden access");
    }
    const event = await this.eventsService.findOne(eventID, userId);
    if (!event) {
      throw new NotFoundException("Event not found");
    }
    try {
      const updCal = await this.calendarModel.findByIdAndUpdate(calendar._id, { $push: { events: eventID } }, { new: true });
      return await updCal.populate("tasks");
    } catch (error) {
      throw new InternalServerErrorException("Error adding task to calendar");
    }
  }

  async getCalendar(userId: string): Promise<Calendar> {
    return this.calendarModel.findOne({ user: userId });
  }

  async 


  // async getTasks(
  //   userId: string,
  //   startDate?: string,
  //   endDate?: string,
  //   status?: string,
  // ) {
  //   const calendar = await this.calendarModel
  //     .findOne({ user: userId })
  //     .populate({
  //       path: "tasks",
  //       select: "date status",
  //     });

  //   if (!calendar) {
  //     throw new NotFoundException("Calendar not found");
  //   }

  //   return calendar.tasks.filter((task) => {
  //     const taskDate = new Date(task["date"]); // Accede como objeto
  //     return (
  //       (!startDate || taskDate >= new Date(startDate)) &&
  //       (!endDate || taskDate <= new Date(endDate)) &&
  //       (!status || task["status"] === status)
  //     );
  //   });
  // }

  // async getEvents(
  //   userId: string,
  //   startDate?: string,
  //   endDate?: string,
  //   category?: string,
  // ) {
  //   const calendar = await this.calendarModel
  //     .findOne({ user: userId })
  //     .populate({
  //       path: "events",
  //       select: "date category",
  //     });

  //   if (!calendar) {
  //     throw new NotFoundException("Calendar not found");
  //   }

  //   return calendar.events.filter((event) => {
  //     const eventDate = new Date(event["date"]); // Accede como objeto
  //     return (
  //       (!startDate || eventDate >= new Date(startDate)) &&
  //       (!endDate || eventDate <= new Date(endDate)) &&
  //       (!category || event["category"] === category)
  //     );
  //   });
  // }

  // async getReminders(
  //   userId: string,
  //   startDate?: string,
  //   endDate?: string,
  //   priority?: string,
  // ) {
  //   const calendar = await this.calendarModel
  //     .findOne({ user: userId })
  //     .populate({
  //       path: "reminders",
  //       select: "date priority",
  //     });

  //   if (!calendar) {
  //     throw new NotFoundException("Calendar not found");
  //   }

  //   return calendar.reminders.filter((reminder) => {
  //     const reminderDate = new Date(reminder["date"]); // Accede como objeto
  //     return (
  //       (!startDate || reminderDate >= new Date(startDate)) &&
  //       (!endDate || reminderDate <= new Date(endDate)) &&
  //       (!priority || reminder["priority"] === priority)
  //     );
  //   });
  // }
}