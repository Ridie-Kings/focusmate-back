// src/events/pomodoro.listener.ts
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class PomodoroListener {
  // Escuchar evento cuando comienza un pomodoro
  @OnEvent('pomodoro.started')
  handlePomodoroStarted(payload: any) {
    console.log('Pomodoro iniciado:', payload);
  }

  // Escuchar evento cuando se detiene un pomodoro
  @OnEvent('pomodoro.stopped')
  handlePomodoroStopped(payload: any) {
    console.log('Pomodoro detenido:', payload);
  }

  // Escuchar evento cuando se actualiza la duración de un pomodoro
  @OnEvent('pomodoro.updated')
  handlePomodoroUpdated(payload: any) {
    console.log('Duración del Pomodoro actualizada:', payload);
  }
}
