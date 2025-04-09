// src/pomodoro/pomodoro.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Pomodoro, PomodoroDocument } from './entities/pomodoro.entity';
import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { WebSocketGateway, SubscribeMessage } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { WsException } from '@nestjs/websockets';
import { ConfigService } from '@nestjs/config';

// Create DTOs for WebSocket events
export class StartPomodoroDto {
  @IsString()
  @IsNotEmpty()
  userId: string;
  
  @IsNumber()
  @IsOptional()
  duration?: number;
}

export class PomodoroStatusDto {
  @IsString()
  userId: string;
  
  @IsString()
  pomodoroId: string;
  
  @IsBoolean()
  active: boolean;
  
  @IsNumber()
  remainingTime: number;
}

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

@Injectable()
export class TimerService {
  private timers = new Map();

  startTimer(userId: string, duration: number, callbacks: {
    onTick: (time: number) => void,
    onComplete: () => void
  }) {
    this.stopTimer(userId); // Clear existing timer
    let remainingTime = duration;
    
    const interval = setInterval(() => {
      remainingTime--;
      callbacks.onTick(remainingTime);
      
      if (remainingTime <= 0) {
        this.stopTimer(userId);
        callbacks.onComplete();
      }
    }, 1000);
    
    this.timers.set(userId, interval);
  }
  
  stopTimer(userId: string) {
    if (this.timers.has(userId)) {
      clearInterval(this.timers.get(userId));
      this.timers.delete(userId);
    }
  }
}

@Injectable()
export class PomodoroStateService {
  private readonly activePomodoros = new Map<string, {
    pomodoroId: string;
    remainingTime: number;
    duration: number;
  }>();
  
  setActivePomodoro(userId: string, data: { pomodoroId: string; duration: number }) {
    this.activePomodoros.set(userId, { ...data, remainingTime: data.duration });
  }
  
  getActivePomodoro(userId: string) {
    return this.activePomodoros.get(userId);
  }
  
  updateRemainingTime(userId: string, time: number) {
    const pomodoro = this.activePomodoros.get(userId);
    if (pomodoro) {
      pomodoro.remainingTime = time;
    }
  }
  
  removeActivePomodoro(userId: string) {
    this.activePomodoros.delete(userId);
  }
}

@WebSocketGateway({ namespace: 'pomodoro' })
export class PomodoroGateway {
  constructor(
    private readonly pomodoroService: PomodoroService,
    private readonly timerService: TimerService,
    private readonly pomodoroStateService: PomodoroStateService
  ) {}

  @SubscribeMessage('startPomodoro')
  async startPomodoro(client: Socket, payload: { userId: string }) {
    try {
      if (!payload.userId) {
        throw new WsException('User ID is required');
      }
      
      const { userId } = payload;
      const duration = 1500;
      
      const pomodoro = await this.pomodoroService.startPomodoro(userId, duration);
      this.timerService.startTimer(userId, duration, {
        onTick: (time) => client.emit('pomodoroStatus', { 
          userId, active: true, remainingTime: time, pomodoroId: pomodoro.id 
        }),
        onComplete: async () => {
          await this.pomodoroService.stopPomodoro(pomodoro.id);
          client.emit('pomodoroStatus', { 
            userId, active: false, remainingTime: 0, pomodoroId: pomodoro.id 
          });
        }
      });
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('reconnect')
  async handleReconnect(client: Socket, payload: { userId: string }) {
    const activePomodoro = this.pomodoroStateService.getActivePomodoro(payload.userId);
    
    if (activePomodoro) {
      client.emit('pomodoroStatus', {
        userId: payload.userId,
        pomodoroId: activePomodoro.pomodoroId,
        active: true,
        remainingTime: activePomodoro.remainingTime
      });
    } else {
      // Try to load from DB if in-memory state is not available
      const dbPomodoro = await this.pomodoroService.getPomodoroStatus(payload.userId);
      if (dbPomodoro && dbPomodoro.active) {
        // Calculate remaining time based on start time and duration
        const elapsedTime = Math.floor((Date.now() - dbPomodoro.startTime.getTime()) / 1000);
        const remainingTime = Math.max(0, dbPomodoro.duration - elapsedTime);
        
        client.emit('pomodoroStatus', {
          userId: payload.userId,
          pomodoroId: dbPomodoro.id,
          active: remainingTime > 0,
          remainingTime
        });
      }
    }
  }
}

@Injectable()
export class PomodoroConfigService {
  constructor(private configService: ConfigService) {}
  
  get defaultDuration(): number {
    return this.configService.get('POMODORO_DEFAULT_DURATION', 1500);
  }
  
  get shortBreakDuration(): number {
    return this.configService.get('POMODORO_SHORT_BREAK', 300);
  }
  
  get longBreakDuration(): number {
    return this.configService.get('POMODORO_LONG_BREAK', 900);
  }
}

