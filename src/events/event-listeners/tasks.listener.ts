// src/events/task.listener.ts
import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import mongoose from 'mongoose';
import { UserLogsService } from 'src/user-logs/user-logs.service';

@Injectable()
export class TaskListener {
  constructor(
    @Inject(UserLogsService) private readonly userLogsService: UserLogsService,
  ) {}
  // Escuchar evento cuando se crea una tarea
  @OnEvent('task.created')
  handleTaskCreated(payload: {userId: mongoose.Types.ObjectId, taskId: mongoose.Types.ObjectId}) {
    console.log('Tarea creada:', payload);
    this.userLogsService.taskCreated(payload.userId, payload.taskId);
    
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
