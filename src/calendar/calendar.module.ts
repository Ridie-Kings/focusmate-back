import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CalendarController } from "./calendar.controller";
import { CalendarService } from "./calendar.service";
import { Calendar, CalendarSchema } from "./entities/calendar.entity";
import { AuthModule } from "../auth/auth.module"; // ✅ Importar AuthModule
import { Reminder, ReminderSchema } from "src/reminder/entities/reminder.entity";
import { Task, TaskSchema } from "src/tasks/entities/task.entity";
import { EventsCalendar, EventsCalendarSchema } from "src/events-calendar/entities/events-calendar.entity";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Calendar.name, schema: CalendarSchema },
      {name: Reminder.name, schema: ReminderSchema },
      {name: Task.name, schema: TaskSchema },
      {name: EventsCalendar.name, schema: EventsCalendarSchema },
    ]),
    AuthModule,
  ],
  controllers: [CalendarController],
  providers: [CalendarService],
  exports: [CalendarService],
})
export class CalendarModule {}