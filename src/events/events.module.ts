// src/events/events.module.ts
import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { CalendarListener } from './event-listeners/calendar.listener';
import { HabitListener } from './event-listeners/habits.listener';
import { PomodoroListener } from './event-listeners/pomodoro.listener';
import { TaskListener } from './event-listeners/tasks.listener';
import { UserListener } from './event-listeners/user.listener';
import { StatsModule } from 'src/stats/stats.module';
import { GamificationProfileModule } from 'src/gamification-profile/gamification-profile.module';
import { CalendarModule } from 'src/calendar/calendar.module';
import { UserLogsModule } from 'src/user-logs/user-logs.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    CalendarModule,
    StatsModule, 
    GamificationProfileModule, 
    UserLogsModule], // Aquí puedes importar otros módulos si es necesario
  providers: [EventsService, CalendarListener, HabitListener, PomodoroListener, TaskListener, UserListener], // Asegúrate de agregar el listener si lo tienes
  exports: [EventsService], // Puedes exportar el servicio para usarlo en otros módulos
})
export class EventsModule {}
