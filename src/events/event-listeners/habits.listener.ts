// src/events/habit.listener.ts
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class HabitListener {
  // Escuchar evento cuando se crea un hábito
  @OnEvent('habit.created')
  handleHabitCreated(payload: any) {
    console.log('Hábito creado:', payload);
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
