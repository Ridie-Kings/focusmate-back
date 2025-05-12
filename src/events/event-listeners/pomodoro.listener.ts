// src/events/pomodoro.listener.ts
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { GamificationProfileService } from 'src/gamification-profile/gamification-profile.service';

@Injectable()
export class PomodoroListener {
  private readonly logger = new Logger(PomodoroListener.name);

  constructor(private readonly gamificationProfileService: GamificationProfileService) {}

  // Escuchar evento cuando comienza un pomodoro
  @OnEvent('pomodoro.started')
  async handlePomodoroStarted(payload: any) {
    this.logger.log('Pomodoro iniciado:', payload);
  }

  // Escuchar evento cuando se detiene un pomodoro
  @OnEvent('pomodoro.stopped')
  async handlePomodoroStopped(payload: any) {
    this.logger.log('Pomodoro detenido:', payload);
  }

  // Escuchar evento cuando se actualiza la duración de un pomodoro
  @OnEvent('pomodoro.duration.updated')
  async handlePomodoroDurationUpdated(payload: any) {
    this.logger.log('Duración del Pomodoro actualizada:', payload);
  }
}
