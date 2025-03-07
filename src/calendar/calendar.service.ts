import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Calendar } from "./entities/calendar.entity";

@Injectable()
export class CalendarService {
  constructor(
    @InjectModel(Calendar.name) private calendarModel: Model<Calendar>,
  ) {}

  private formatDate(dateString?: string): Date | undefined {
    return dateString ? new Date(dateString) : undefined;
  }

  async getTasks(
    userId: string,
    startDate?: string,
    endDate?: string,
    status?: string,
  ) {
    const calendar = await this.calendarModel
      .findOne({ user: userId })
      .populate({
        path: "tasks",
        select: "date status",
      });

    if (!calendar) {
      throw new NotFoundException("Calendar not found");
    }

    return calendar.tasks.filter((task) => {
      const taskDate = new Date(task["date"]); // Accede como objeto
      return (
        (!startDate || taskDate >= new Date(startDate)) &&
        (!endDate || taskDate <= new Date(endDate)) &&
        (!status || task["status"] === status)
      );
    });
  }

  async getEvents(
    userId: string,
    startDate?: string,
    endDate?: string,
    category?: string,
  ) {
    const calendar = await this.calendarModel
      .findOne({ user: userId })
      .populate({
        path: "events",
        select: "date category",
      });

    if (!calendar) {
      throw new NotFoundException("Calendar not found");
    }

    return calendar.events.filter((event) => {
      const eventDate = new Date(event["date"]); // Accede como objeto
      return (
        (!startDate || eventDate >= new Date(startDate)) &&
        (!endDate || eventDate <= new Date(endDate)) &&
        (!category || event["category"] === category)
      );
    });
  }

  async getReminders(
    userId: string,
    startDate?: string,
    endDate?: string,
    priority?: string,
  ) {
    const calendar = await this.calendarModel
      .findOne({ user: userId })
      .populate({
        path: "reminders",
        select: "date priority",
      });

    if (!calendar) {
      throw new NotFoundException("Calendar not found");
    }

    return calendar.reminders.filter((reminder) => {
      const reminderDate = new Date(reminder["date"]); // Accede como objeto
      return (
        (!startDate || reminderDate >= new Date(startDate)) &&
        (!endDate || reminderDate <= new Date(endDate)) &&
        (!priority || reminder["priority"] === priority)
      );
    });
  }
}