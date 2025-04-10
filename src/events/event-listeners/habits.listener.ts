// src/events/habit.listener.ts
import { Injectable, Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import mongoose from 'mongoose';
import { UserLogsService } from 'src/user-logs/user-logs.service';

@Injectable()
export class HabitListener {
  constructor(
    @Inject(UserLogsService) private readonly userLogsService: UserLogsService, // Asegúrate de importar el servicio correcto
  ) {}
  // Escuchar evento cuando se crea un hábito
  @OnEvent('habit.created')
  async handleHabitCreated(payload: {userId: mongoose.Types.ObjectId, habitId: mongoose.Types.ObjectId}) {
    console.log('Hábito creado:', payload);
    await this.userLogsService.habitCreated(payload.userId, payload.habitId);
  }

  // Escuchar evento cuando se actualiza un hábito
  @OnEvent('habit.updated')
  handleHabitUpdated(payload: any) {
    console.log('Hábito actualizado:', payload);
  }

  // Escuchar evento cuando se marca un hábito como completado
  @OnEvent('habit.completed')
  handleHabitCompleted(payload: any) {
    console.log('Hábito completado:', payload);
  }
}
