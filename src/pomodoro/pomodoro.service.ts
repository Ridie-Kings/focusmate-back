// src/pomodoro/pomodoro.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Pomodoro, PomodoroDocument } from './entities/pomodoro.entity';

@Injectable()
export class PomodoroService {
  constructor(@InjectModel(Pomodoro.name) private readonly pomodoroModel: Model<PomodoroDocument>) {}

  // Crear un nuevo Pomodoro
  async startPomodoro(userId: string, duration: number) {
    const startTime = new Date();
    const pomodoro = new this.pomodoroModel({
      userId,
      startTime,
      duration,
      remainingTime: duration,
      active: true,
      completed: false,
    });

    await pomodoro.save();
    return pomodoro;
  }

  // Detener un Pomodoro
  async stopPomodoro(pomodoroId: string) {
    const pomodoro = await this.pomodoroModel.findById(pomodoroId);
    if (pomodoro) {
      pomodoro.active = false;
      pomodoro.endTime = new Date();
      pomodoro.completed = true;
      await pomodoro.save();
    }
    return pomodoro;
  }

  // Obtener el estado de un Pomodoro por usuario
  async getPomodoroStatus(userId: string) {
    return this.pomodoroModel.findOne({ userId, active: true }).sort({ startTime: -1 });
  }
}

