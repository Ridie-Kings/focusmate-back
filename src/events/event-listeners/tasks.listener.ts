// src/events/task.listener.ts
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class TaskListener {
  // Escuchar evento cuando se crea una tarea
  @OnEvent('task.created')
  handleTaskCreated(payload: any) {
    console.log('Tarea creada:', payload);
  }

  // Escuchar evento cuando se actualiza una tarea
  @OnEvent('task.updated')
  handleTaskUpdated(payload: any) {
    console.log('Tarea actualizada:', payload);
  }

  // Escuchar evento cuando se elimina una tarea
  @OnEvent('task.deleted')
  handleTaskDeleted(payload: any) {
    console.log('Tarea eliminada:', payload);
  }

  // Escuchar evento cuando se marca una tarea como completada
  @OnEvent('task.completed')
  handleTaskCompleted(payload: any) {
    console.log('Tarea completada:', payload);
  }
}
