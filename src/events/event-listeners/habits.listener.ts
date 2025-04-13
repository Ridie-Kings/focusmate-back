// src/events/habit.listener.ts
import { Injectable, Inject, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import mongoose from 'mongoose';
import { UserLogsService } from 'src/user-logs/user-logs.service';

@Injectable()
export class HabitListener {
  private readonly logger = new Logger(HabitListener.name);

  constructor(
    @Inject(UserLogsService) private readonly userLogsService: UserLogsService, // Asegúrate de importar el servicio correcto
  ) {}
  // Escuchar evento cuando se crea un hábito
  @OnEvent('habit.created')
  async handleHabitCreated(payload: {userId: mongoose.Types.ObjectId, habitId: mongoose.Types.ObjectId}) {
    this.logger.log('Hábito creado:', payload);
    await this.userLogsService.habitCreated(payload.userId, payload.habitId);
  }

  // Escuchar evento cuando se actualiza un hábito
  @OnEvent('habit.updated')
  handleHabitUpdated(payload: any) {
    this.logger.log('Hábito actualizado:', payload);
  }

  // Escuchar evento cuando se marca un hábito como completado
  @OnEvent('habit.completed')
  handleHabitCompleted(payload: any) {
    this.logger.log('Hábito completado:', payload);
  }
}
