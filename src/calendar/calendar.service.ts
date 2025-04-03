import { ForbiddenException, Inject, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import mongoose, { Model } from "mongoose";
import { Calendar, CalendarDocument } from "./entities/calendar.entity";
import { TasksService } from "src/tasks/tasks.service";
import { EventsCalendarService } from "src/events-calendar/events-calendar.service";
import { RemindersService } from "src/reminders/reminders.service";

@Injectable()
export class CalendarService {
  constructor(
    @InjectModel(Calendar.name) private calendarModel: Model<CalendarDocument>,
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

  async getCalendar(userId: string): Promise<Calendar> {
    return await this.calendarModel.findOne({ user: userId }).populate("tasks events reminders");
  }

  async addTask(userId: mongoose.Types.ObjectId, taskId: mongoose.Types.ObjectId): Promise<Calendar> {
    const calendar = await this.calendarModel.findOne({ user: userId });
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
      const updCal = await this.calendarModel.findByIdAndUpdate(calendar._id, { $addToSet: { tasks: taskId } }, { new: true });
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
      const updCal = await this.calendarModel.findByIdAndUpdate(calendar._id, { $addToSet: { events: eventID } }, { new: true });
      return await updCal.populate("tasks");
    } catch (error) {
      throw new InternalServerErrorException("Error adding event to calendar");
    }
  }

  async addReminder(userId: mongoose.Types.ObjectId, reminderID: mongoose.Types.ObjectId): Promise<Calendar> {
    const calendar = await this.calendarModel.findOne({ user: userId });
    if (!calendar) {
      throw new NotFoundException("Calendar not found");
    }
    if (!calendar.user.equals(userId)) {
      throw new ForbiddenException("Forbidden access");
    }
    const reminder = await this.remindersService.findOne(reminderID, userId);
    if (!reminder) {
      throw new NotFoundException("Reminder not found");
    }
    try {
      const updCal = await this.calendarModel.findByIdAndUpdate(calendar._id, { $addToSet: { reminders
        : reminderID } }, { new: true });
      return await updCal.populate("tasks");
    } catch (error) {
      throw new InternalServerErrorException("Error adding reminder to calendar");
    }
  }

  async removeTask(userId: mongoose.Types.ObjectId, taskId: mongoose.Types.ObjectId): Promise<Calendar> {
    const calendar = await this.calendarModel.findOne({ user: userId });
    if (!calendar) {
      throw new NotFoundException("Calendar not found");
    }
    if (!calendar.user.equals(userId)) {
      throw new ForbiddenException("Forbidden access");
    }
    try {
      const updCal = await this.calendarModel.findByIdAndUpdate(calendar._id, { $pull: { tasks: taskId } }, { new: true });
      return await updCal.populate("tasks");
    } catch (error) {
      throw new InternalServerErrorException("Error deleting task to calendar");
    }
  }

  async removeEvent(userId: mongoose.Types.ObjectId, eventID: mongoose.Types.ObjectId): Promise<Calendar> {
    const calendar = await this.calendarModel.findOne({ user: userId });
    if (!calendar) {
      throw new NotFoundException("Calendar not found");
    }
    if (!calendar.user.equals(userId)) {
      throw new ForbiddenException("Forbidden access");
    }
    try {
      const updCal = await this.calendarModel.findByIdAndUpdate(calendar._id, { $pull: { events: eventID } }, { new: true });
      return await updCal.populate("tasks");
    } catch (error) {
      throw new InternalServerErrorException("Error deleting event to calendar");
    }
  }

  async removeReminder(userId: mongoose.Types.ObjectId, reminderID: mongoose.Types.ObjectId): Promise<Calendar> {
    const calendar = await this.calendarModel.findOne({ user: userId });
    if (!calendar) {
      throw new NotFoundException("Calendar not found");
    }
    if (!calendar.user.equals(userId)) {
      throw new ForbiddenException("Forbidden access");
    }
    try {
      const updCal = await this.calendarModel.findByIdAndUpdate(calendar._id, { $pull: { reminders: reminderID } }, { new: true });
      return await updCal.populate("tasks");
    } catch (error) {
      throw new InternalServerErrorException("Error deleting reminder to calendar");
    }
  }

  async findTasks(userId: mongoose.Types.ObjectId): Promise<Calendar> {
    return await this.calendarModel.findOne({ user: userId }).populate("tasks");
  }

  async findEvents(userId: mongoose.Types.ObjectId): Promise<Calendar> {
    return await this.calendarModel.findOne({ user: userId }).populate("events");
  }

  async findReminders(userId: mongoose.Types.ObjectId): Promise<Calendar> {
    return await this.calendarModel.findOne({ user: userId }).populate("reminders");
  } 

  async findByDate(userId: mongoose.Types.ObjectId, date: Date){
    const start = date.setHours(0, 0, 0, 0);
    const end = date.setHours(23, 59, 59, 999);
    const calendar = await this.calendarModel.aggregate([
      {
        $match: { user: userId },
      },
      {
        $project: {
          tasks: { $filter: { input: "$tasks", as: "task", cond: { $and: [{ $gte: ["$$task.dueDate", start] }, { $lte: ["$$task.dueDate", end] }] } } },
          events: { $filter: { input: "$events", as: "event", cond: { $and: [{ $gte: ["$$event.dueDate", start] }, { $lte: ["$$event.dueDate", end] }] } } },
          reminders: { $filter: { input: "$reminders", as: "reminder", cond: { $and: [{ $gte: ["$$reminder.dueDate", start] }, { $lte: ["$$reminder.dueDate", end] }] } } },
        },
      },
    ]);
    return calendar;
  }

  async findRange(userId: mongoose.Types.ObjectId, startDate: Date, endDate: Date){
    const start = startDate.setHours(0, 0, 0, 0);
    const end = endDate.setHours(23, 59, 59, 999);
    const calendar = await this.calendarModel.aggregate([
      {
        $match: { user: userId },
      },
      {
        $project: {
          tasks: { $filter: { input: "$tasks", as: "task", cond: { $and: [{ $gte: ["$$task.dueDate", start] }, { $lte: ["$$task.dueDate", end] }] } } },
          events: { $filter: { input: "$events", as: "event", cond: { $and: [{ $gte: ["$$event.dueDate", start] }, { $lte: ["$$event.dueDate", end] }] } } },
          reminders: { $filter: { input: "$reminders", as: "reminder", cond: { $and: [{ $gte: ["$$reminder.dueDate", start] }, { $lte: ["$$reminder.dueDate", end] }] } } },
        },
      },
    ]);
    return calendar;
  }

  async findToday(userId: mongoose.Types.ObjectId){
    const format_date = new Date();    
    return this.findByDate(userId, format_date);
  }

  async findWeek(userId: mongoose.Types.ObjectId){
    const format_date = new Date();
    const start = format_date.setDate(format_date.getDate() - format_date.getDay());
    const end = format_date.setDate(format_date.getDate() + 6);
    return this.findRange(userId, new Date(start), new Date(end));
  }

  async findMonth(userId: mongoose.Types.ObjectId){
    const format_date = new Date();
    const start = format_date.setDate(1);
    const end = format_date.setMonth(format_date.getMonth() + 1);
    return this.findRange(userId, new Date(start), new Date(end));
  }

  async findYear(userId: mongoose.Types.ObjectId){
    const format_date = new Date();
    const start = format_date.setMonth(0);
    const end = format_date.setFullYear(format_date.getFullYear() + 1);
    return this.findRange(userId, new Date(start), new Date(end));
  }

  async findNextWeek(userId: mongoose.Types.ObjectId){
    const format_date = new Date();
    const start = format_date.setDate(format_date.getDate() + 7 - format_date.getDay());
    const end = format_date.setDate(format_date.getDate() + 6);
    return this.findRange(userId, new Date(start), new Date(end));
  }

  async findNextMonth(userId: mongoose.Types.ObjectId){
    const format_date = new Date();
    const start = format_date.setMonth(format_date.getMonth() + 1);
    const end = format_date.setMonth(format_date.getMonth() + 1);
    return this.findRange(userId, new Date(start), new Date(end));
  }

  async findNextYear(userId: mongoose.Types.ObjectId){
    const format_date = new Date();
    const start = format_date.setFullYear(format_date.getFullYear() + 1);
    const end = format_date.setFullYear(format_date.getFullYear() + 1);
    return this.findRange(userId, new Date(start), new Date(end));
  }

  async findTasksDate(userId: mongoose.Types.ObjectId, date: Date){
    const start = date.setHours(0, 0, 0, 0);
    const end = date.setHours(23, 59, 59, 999);
    const calendar = await this.calendarModel.aggregate([
      {
        $match: { user: userId },
      },
      {
        $project: {
          tasks: { $filter: { input: "$tasks", as: "task", cond: { $and: [{ $gte: ["$$task.dueDate", start] }, { $lte: ["$$task.dueDate", end] }] } } },
        },
      },
    ]);
    return calendar;
  }
  async findEventsDate(userId: mongoose.Types.ObjectId, date: Date){
    const start = date.setHours(0, 0, 0, 0);
    const end = date.setHours(23, 59, 59, 999);
    const calendar = await this.calendarModel.aggregate([
      {
        $match: { user: userId },
      },
      {
        $project: {
          events: { $filter: { input: "$events", as: "event", cond: { $and: [{ $gte: ["$$event.dueDate", start] }, { $lte: ["$$event.dueDate", end] }] } } },
        },
      },
    ]);
    return calendar;
  }

  async findRemindersDate(userId: mongoose.Types.ObjectId, date: Date){
    const start = date.setHours(0, 0, 0, 0);
    const end = date.setHours(23, 59, 59, 999);
    const calendar = await this.calendarModel.aggregate([
      {
        $match: { user: userId },
      },
      {
        $project: {
          reminders: { $filter: { input: "$reminders", as: "reminder", cond: { $and: [{ $gte: ["$$reminder.dueDate", start] }, { $lte: ["$$reminder.dueDate", end] }] } } },
        },
      },
    ]);
    return calendar;
  }
  async findTasksRange(userId: mongoose.Types.ObjectId, startDate: Date, endDate: Date){
    const start = startDate.setHours(0, 0, 0, 0);
    const end = endDate.setHours(23, 59, 59, 999);
    const calendar = await this.calendarModel.aggregate([
      {
        $match: { user: userId },
      },
      {
        $project: {
          tasks: { $filter: { input: "$tasks", as: "task", cond: { $and: [{ $gte: ["$$task.dueDate", start] }, { $lte: ["$$task.dueDate", end] }] } } },
        },
      },
    ]);
    return calendar;
  }
  async findEventsRange(userId: mongoose.Types.ObjectId, startDate: Date, endDate: Date){
    const start = startDate.setHours(0, 0, 0, 0);
    const end = endDate.setHours(23, 59, 59, 999);
    const calendar = await this.calendarModel.aggregate([
      {
        $match: { user: userId },
      },
      {
        $project: {
          events: { $filter: { input: "$events", as: "event", cond: { $and: [{ $gte: ["$$event.dueDate", start] }, { $lte: ["$$event.dueDate", end] }] } } },
        },
      },
    ]);
    return calendar;
  }
  async findRemindersRange(userId: mongoose.Types.ObjectId, startDate: Date, endDate: Date){
    const start = startDate.setHours(0, 0, 0, 0);
    const end = endDate.setHours(23, 59, 59, 999);
    const calendar = await this.calendarModel.aggregate([
      {
        $match: { user: userId },
      },
      {
        $project: {
          reminders: { $filter: { input: "$reminders", as: "reminder", cond: { $and: [{ $gte: ["$$reminder.dueDate", start] }, { $lte: ["$$reminder.dueDate", end] }] } } },
        },
      },
    ]);
    return calendar;
  }

  async findPriority(userId: mongoose.Types.ObjectId, priority: string){
    const calendar = await this.calendarModel.aggregate([
      {
        $match: { user: userId },
      },
      {
        $project: {
          tasks: { $filter: { input: "$tasks", as: "task", cond: { $eq: ["$$task.priority", priority] } } },
          events: { $filter: { input: "$events", as: "event", cond: { $eq: ["$$event.priority", priority] } } },
          reminders: { $filter: { input: "$reminders", as: "reminder", cond: { $eq: ["$$reminder.priority", priority] } } },
        },
      },
      ]);
    return calendar;
  }
  async findStatus(userId: mongoose.Types.ObjectId, status: string){
    const calendar = await this.calendarModel.aggregate([
      {
        $match: { user: userId },
      },
      {
        $project: {
          tasks: { $filter: { input: "$tasks", as: "task", cond: { $eq: ["$$task.status", status] } } },
          events: { $filter: { input: "$events", as: "event", cond: { $eq: ["$$event.status", status] } } },
          reminders: { $filter: { input: "$reminders", as: "reminder", cond: { $eq: ["$$reminder.status", status] } } },
        },
      },
      ]);
    return calendar;
  }

  async findCategory(userId: mongoose.Types.ObjectId, category: string){
    const calendar = await this.calendarModel.aggregate([
      {
        $match: { user: userId },
      },
      {
        $project: {
          tasks: { $filter: { input: "$tasks", as: "task", cond: { $eq: ["$$task.category", category] } } },
          events: { $filter: { input: "$events", as: "event", cond: { $eq: ["$$event.category", category] } } },
          reminders: { $filter: { input: "$reminders", as: "reminder", cond: { $eq: ["$$reminder.category", category] } } },
        },
      },
      ]);
    return calendar;
  }


  
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