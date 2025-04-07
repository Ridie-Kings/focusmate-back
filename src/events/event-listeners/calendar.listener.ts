// src/events/calendar.listener.ts
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class CalendarListener {
  // Escuchar evento cuando se crea un evento en el calendario
  @OnEvent('calendar.event.created')
  handleEventCreated(payload: any) {
    console.log('Evento creado en el calendario:', payload);
    // Aquí puedes registrar la acción o hacer cualquier otra cosa que desees
  }

  // Escuchar evento cuando se actualiza un evento en el calendario
  @OnEvent('calendar.event.updated')
  handleEventUpdated(payload: any) {
    console.log('Evento actualizado en el calendario:', payload);
  }

  // Escuchar evento cuando se elimina un evento del calendario
  @OnEvent('calendar.event.deleted')
  handleEventDeleted(payload: any) {
    console.log('Evento eliminado del calendario:', payload);
  }
}
