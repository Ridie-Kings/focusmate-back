// src/events/events.module.ts
import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EventsService } from './events.service';
import { CalendarListener } from './event-listeners/calendar.listener';
import { HabitListener } from './event-listeners/habits.listener';
import { PomodoroListener } from './event-listeners/pomodoro.listener';
import { TaskListener } from './event-listeners/tasks.listener';
import { UserListener } from './event-listeners/user.listener';

@Module({
  imports: [EventEmitterModule.forRoot()],
  providers: [EventsService, CalendarListener, HabitListener, PomodoroListener, TaskListener, UserListener], // Asegúrate de agregar el listener si lo tienes
  exports: [EventsService], // Puedes exportar el servicio para usarlo en otros módulos
})
export class EventsModule {}
