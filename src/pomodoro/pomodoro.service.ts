// src/pomodoro/pomodoro.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Pomodoro, PomodoroDocument } from './entities/pomodoro.entity';
import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { ConfigService } from '@nestjs/config';
import * as mongoose from 'mongoose';

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
      const activePomodoro = await this.getActivePomodoro(userId);
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
  async updateRemainingTime(pomodoroId: string, remainingTime: number): Promise<Pomodoro> {
    return this.pomodoroModel.findByIdAndUpdate(
      pomodoroId,
      { remainingTime },
      { new: true }
    );
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

  // Get the active Pomodoro session for a user
  async getActivePomodoro(userId: string) {
    try {
      return await this.pomodoroModel.findOne({ userId, active: true }).sort({ startTime: -1 });
    } catch (error) {
      this.logger.error(`Error getting active pomodoro: ${error.message}`);
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

  async updatePomodoroStatus(pomodoroId: string, status: { isPaused?: boolean }): Promise<Pomodoro> {
    return this.pomodoroModel.findByIdAndUpdate(
      pomodoroId,
      { $set: status },
      { new: true }
    );
  }

  async sharePomodoro(pomodoroId: string, userId: string): Promise<{ shareCode: string }> {
    const pomodoro = await this.pomodoroModel.findById(pomodoroId);
    if (!pomodoro) {
      throw new Error('Pomodoro not found');
    }

    // Check if the user is the owner of the pomodoro
    if (pomodoro.userId.toString() !== userId) {
      throw new Error('You can only share your own pomodoros');
    }

    // Generate a unique share code
    const shareCode = Math.random().toString(36).substring(2, 10);
    
    // Update the pomodoro with sharing information
    await this.pomodoroModel.findByIdAndUpdate(
      pomodoroId,
      { 
        isShared: true,
        shareCode,
        sharedWith: [new mongoose.Types.ObjectId(userId)] // Initialize with the owner
      },
      { new: true }
    );

    return { shareCode };
  }

  async joinSharedPomodoro(shareCode: string, userId: mongoose.Types.ObjectId): Promise<Pomodoro> {
    const pomodoro = await this.pomodoroModel.findOne({ shareCode, isShared: true });
    if (!pomodoro) {
      throw new Error('Shared pomodoro not found');
    }

    // Check if the user is already in the shared list
    if (pomodoro.sharedWith.includes(userId)) {
      return pomodoro;
    }

    // Add the user to the shared list
    return this.pomodoroModel.findByIdAndUpdate(
      pomodoro._id,
      { $addToSet: { sharedWith: userId } },
      { new: true }
    );
  }

  async getSharedPomodoros(userId: string): Promise<Pomodoro[]> {
    return this.pomodoroModel.find({
      $or: [
        { userId },
        { sharedWith: userId }
      ],
      isShared: true
    });
  }
}

