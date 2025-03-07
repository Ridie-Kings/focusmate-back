import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CalendarController } from "./calendar.controller";
import { CalendarService } from "./calendar.service";
import { Calendar, calendarSchema } from "./entities/calendar.entity";
import { AuthModule } from "../auth/auth.module"; // ✅ Importar AuthModule
import { Reminder, ReminderSchema } from "src/reminder/entities/reminder.entity";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Calendar.name, schema: calendarSchema },
      {name: Reminder.name, schema: ReminderSchema },
    ]),
    AuthModule,
  ],
  controllers: [CalendarController],
  providers: [CalendarService],
  exports: [CalendarService],
})
export class CalendarModule {}