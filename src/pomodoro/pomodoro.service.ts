// src/pomodoro/pomodoro.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Pomodoro, PomodoroDocument } from './entities/pomodoro.entity';
import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { ConfigService } from '@nestjs/config';

// Create DTOs for validation
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
  private readonly logger = new Logger(PomodoroService.name);
  private activeTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor(
    @InjectModel(Pomodoro.name) private readonly pomodoroModel: Model<PomodoroDocument>,
    private readonly configService: ConfigService
  ) {}

  // Start a new Pomodoro session
  async startPomodoro(userId: string, duration: number = 1500) {
    try {
      // Check if user already has an active pomodoro
      const activePomodoro = await this.getPomodoroStatus(userId);
      if (activePomodoro) {
        throw new Error('User already has an active pomodoro session');
      }

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
      this.logger.log(`Started pomodoro session for user ${userId}`);
      return pomodoro;
    } catch (error) {
      this.logger.error(`Error starting pomodoro: ${error.message}`);
      throw error;
    }
  }

  // Stop a Pomodoro session
  async stopPomodoro(pomodoroId: string) {
    try {
      const pomodoro = await this.pomodoroModel.findById(pomodoroId);
      if (!pomodoro) {
        throw new Error('Pomodoro session not found');
      }

      pomodoro.active = false;
      pomodoro.endTime = new Date();
      pomodoro.completed = true;
      await pomodoro.save();
      
      this.logger.log(`Stopped pomodoro session ${pomodoroId}`);
      return pomodoro;
    } catch (error) {
      this.logger.error(`Error stopping pomodoro: ${error.message}`);
      throw error;
    }
  }

  // Update remaining time for a pomodoro
  async updateRemainingTime(pomodoroId: string, remainingTime: number) {
    try {
      const pomodoro = await this.pomodoroModel.findById(pomodoroId);
      if (!pomodoro) {
        throw new Error('Pomodoro not found');
      }

      pomodoro.remainingTime = remainingTime;
      await pomodoro.save();
      
      this.logger.log(`Updated remaining time for pomodoro ${pomodoroId} to ${remainingTime}`);
      return pomodoro;
    } catch (error) {
      this.logger.error(`Error updating remaining time: ${error.message}`);
      throw error;
    }
  }

  // Get a specific pomodoro by ID
  async getPomodoroById(pomodoroId: string) {
    try {
      const pomodoro = await this.pomodoroModel.findById(pomodoroId);
      if (!pomodoro) {
        throw new Error('Pomodoro not found');
      }
      return pomodoro;
    } catch (error) {
      this.logger.error(`Error getting pomodoro by ID: ${error.message}`);
      throw error;
    }
  }

  // Get the status of a Pomodoro session for a user
  async getPomodoroStatus(userId: string) {
    try {
      return await this.pomodoroModel.findOne({ userId, active: true }).sort({ startTime: -1 });
    } catch (error) {
      this.logger.error(`Error getting pomodoro status: ${error.message}`);
      throw error;
    }
  }

  // Get configuration values
  getDefaultDuration(): number {
    return this.configService.get('POMODORO_DEFAULT_DURATION', 1500);
  }
  
  getShortBreakDuration(): number {
    return this.configService.get('POMODORO_SHORT_BREAK', 300);
  }
  
  getLongBreakDuration(): number {
    return this.configService.get('POMODORO_LONG_BREAK', 900);
  }
}

