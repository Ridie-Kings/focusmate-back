// src/events/user.listener.ts
import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CalendarService } from 'src/calendar/calendar.service';
import { GamificationProfileService } from 'src/gamification-profile/gamification-profile.service';
import { StatsService } from 'src/stats/stats.service';
import { UserLogsService } from 'src/user-logs/user-logs.service';
import { EventsList } from '../list.events';
import mongoose from 'mongoose';

@Injectable()
export class UserListener {
  constructor(
    @Inject(UserLogsService) private readonly userLogsService: UserLogsService, // Asegúrate de importar el servicio correcto
    @Inject(CalendarService) private readonly calendarService: CalendarService, // Asegúrate de importar el servicio correcto
    @Inject(GamificationProfileService) private readonly gamificationProfileService: GamificationProfileService,
    @Inject(StatsService) private readonly statsService: StatsService// Asegúrate de importar el servicio correcto
  ){}
  // Escuchar evento cuando un usuario se registre
  @OnEvent(EventsList.USER_REGISTERED)
  async handleUserRegistered(payload: {userId: mongoose.Types.ObjectId}) {
    await this.userLogsService.create(payload.userId); // Crear logs de usuario
    await this.calendarService.createCalendar(payload.userId); // Crear calendario de usuario
    await this.gamificationProfileService.create(payload.userId); // Crear perfil de gamificación
    // Aquí puedes realizar acciones adicionales como enviar un correo de bienvenida
  }

  // Escuchar evento cuando un usuario inicie sesión
  @OnEvent('user.loggedIn')
  handleUserLoggedIn(payload: any) {
    console.log('Usuario logueado:', payload);
    // Aquí puedes registrar la hora de inicio de sesión, estadísticas, etc.
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
