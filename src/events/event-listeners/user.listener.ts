// src/events/user.listener.ts
import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CalendarService } from 'src/calendar/calendar.service';
import { GamificationProfileService } from 'src/gamification-profile/gamification-profile.service';
import { StatsService } from 'src/stats/stats.service';
import { UserLogsService } from 'src/user-logs/user-logs.service';
import { EventsList } from '../list.events';
import mongoose from 'mongoose';
import { HabitsService } from 'src/habits/habits.service';

@Injectable()
export class UserListener {
  constructor(
    @Inject(UserLogsService) private readonly userLogsService: UserLogsService, // Asegúrate de importar el servicio correcto
    @Inject(CalendarService) private readonly calendarService: CalendarService, // Asegúrate de importar el servicio correcto
    @Inject(GamificationProfileService) private readonly gamificationProfileService: GamificationProfileService,
    @Inject(StatsService) private readonly statsService: StatsService,
    @Inject(HabitsService) private readonly habitsService: HabitsService,
    // Asegúrate de importar el servicio correcto
  ) {}
  // Escuchar evento cuando un usuario se registre
  @OnEvent(EventsList.USER_REGISTERED)
  async handleUserRegistered(payload: {userId: mongoose.Types.ObjectId}) {
    console.log('Usuario registrado:', payload);
    await this.userLogsService.create(payload.userId); // Crear logs de usuario
    await this.calendarService.createCalendar(payload.userId); // Crear calendario de usuario
    await this.gamificationProfileService.create(payload.userId); // Crear perfil de gamificación
    await this.statsService.updateUsersCount(); // Crear estadísticas de usuario
  }

  // Escuchar evento cuando un usuario inicie sesión
  @OnEvent(EventsList.USER_LOGGED_IN)
  async handleUserLoggedIn(payload: {userId: mongoose.Types.ObjectId}) {
    console.log('Usuario logueado:', payload);
    await this.userLogsService.updateLogin(payload.userId, new Date());
    await this.habitsService.checkHabits(payload.userId); // Crear logs de usuario
    // Aquí puedes registrar la hora de inicio de sesión, estadísticas, etc.
  }

  @OnEvent(EventsList.USER_PROFILE_UPDATED)
  async handleUserProfileUpdated(payload: {userId: mongoose.Types.ObjectId}) {
    console.log('Usuario actualizado:', payload);
    await this.userLogsService.updateProfile(payload.userId, new Date());
  }


  // Escuchar evento cuando un usuario actualice su perfil
  @OnEvent('user.updated')
  handleUserUpdated(payload: any) {
    console.log('Usuario actualizado:', payload);
    // Aquí podrías registrar qué se ha cambiado en el perfil del usuario
  }

  // Escuchar evento cuando un usuario elimine su cuenta
  @OnEvent('user.deleted')
  handleUserDeleted(payload: any) {
    console.log('Usuario eliminado:', payload);
    // Aquí puedes realizar limpieza de datos o registros asociados al usuario eliminado
  }
}
