import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import mongoose, { Model } from 'mongoose';
import { UserLog, UserLogDocument } from './entities/user-log.entity';
import { InjectModel } from '@nestjs/mongoose';
import { PomodoroDocument } from 'src/pomodoro/entities/pomodoro.entity';
import { Pomodoro } from 'src/pomodoro/entities/pomodoro.entity';

@Injectable()
export class UserLogsService {
  private readonly logger = new Logger(UserLogsService.name);

  constructor(
    @InjectModel(UserLog.name)
    private readonly userLogModel: Model<UserLogDocument>,
    @InjectModel(Pomodoro.name)
    private readonly pomodoroModel: Model<PomodoroDocument>,
  ){}

  async create(userId: mongoose.Types.ObjectId) {
    try {
      const userLog = new this.userLogModel({
        userId: userId,
        registerTime: new Date(),
        lastLogin: new Date(),
        loginCount: 1,
        taskCount: 0,
        logs: [],
        lastUpdate: new Date(),
      });
      return await userLog.save();
    } catch (error) {
      this.logger.error('Error creating user log:', error);
      throw new InternalServerErrorException('Error creating user log');
    }
  }

  async updateLogin(userId: mongoose.Types.ObjectId, loginTime: Date) {
    try {
      const result = await this.userLogModel.findOneAndUpdate(
        { userId },
        { 
          $set: { 
            lastLogin: loginTime, 
            lastUpdate: new Date()
          },
          $inc: { loginCount: 1 }
        },
        { new: true, upsert: true }
      );
      return result;
    } catch (error) {
      this.logger.error(`Error updating login for user ${userId}: ${error.message}`);
      throw new InternalServerErrorException('Error updating login');
    }
  }

  async checkStreak(userId: mongoose.Types.ObjectId, currentDate: Date) {
    try {
      const userLog = await this.userLogModel.findOne({ userId });
      if (!userLog) {
        return;
      }

      const lastLogin = userLog.lastLogin;
      if (!lastLogin) {
        return;
      }

      const lastLoginDate = new Date(lastLogin);
      const yesterday = new Date(currentDate);
      yesterday.setDate(yesterday.getDate() - 1);

      if (lastLoginDate.toDateString() === yesterday.toDateString()) {
        await this.userLogModel.updateOne(
          { userId },
          { $inc: { streak: 1 } }
        );
      } else if (lastLoginDate.toDateString() !== currentDate.toDateString()) {
        await this.userLogModel.updateOne(
          { userId },
          { $set: { streak: 0 } }
        );
      }
    } catch (error) {
      this.logger.error(`Error checking streak for user ${userId}: ${error.message}`);
      throw new InternalServerErrorException('Error checking streak');
    }
  }

  async taskCreated(userId: mongoose.Types.ObjectId, taskId: mongoose.Types.ObjectId) {
    try {
      const log = {type: 'task-created', object: taskId, date: new Date()};
      const userLog = await this.userLogModel.findOneAndUpdate(
        { userId },
        { $inc: { taskCount: 1 }, $push: { logs: log }, $set: { lastUpdate: new Date() } },
        { new: true }
      );
      return userLog;
    } catch (error) {
      console.error('Error updating task count:', error);
      throw new InternalServerErrorException('Error updating task count');
    }
  }

  async habitCreated(userId: mongoose.Types.ObjectId, habitId: mongoose.Types.ObjectId) {
    try {
      const log = {type: 'habit-created', object: habitId, date: new Date()};
      const userLog = await this.userLogModel.findOneAndUpdate(
        { userId },
        { $inc: { habitCount: 1 }, $push: { logs: log }, $set: { lastUpdate: new Date() } },
        { new: true }
      );
      return userLog;
    } catch (error) {
      console.error('Error updating habit count:', error);
      throw new InternalServerErrorException('Error updating habit count');
    }
  }

  async updateProfile(userId: mongoose.Types.ObjectId, updateTime: Date) {
    try {
      const log = {type: 'profile-updated', date: updateTime};
      const userLog = await this.userLogModel.findOneAndUpdate(
        { userId },
        { $push: { logs: log }, $set: { lastUpdate: updateTime } },
        { new: true }
      );
      return userLog;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw new InternalServerErrorException('Error updating profile');
    }
  }

  async getUserLogs(userId: mongoose.Types.ObjectId) {
    try {
      return await this.userLogModel.findOne({ userId });
    } catch (error) {
      console.error('Error getting user logs:', error);
      throw new InternalServerErrorException('Error getting user logs');
    }
  }

  async getPomodoroTime(userId: mongoose.Types.ObjectId) {
    try {
      // Get only completed pomodoros
      const pomodoros = await this.pomodoroModel.find({ 
        userId,
        completed: true,
        endTime: { $exists: true }
      });

      // Calculate actual time spent for each pomodoro
      const totalTime = pomodoros.reduce((acc, pomodoro) => {
        if (pomodoro.startTime && pomodoro.endTime) {
          // Calculate actual time spent in seconds
          const timeSpent = Math.floor(
            (pomodoro.endTime.getTime() - pomodoro.startTime.getTime()) / 1000
          );
          return acc + timeSpent;
        }
        return acc;
      }, 0);

      return {
        totalTimeInSeconds: totalTime,
        totalTimeFormatted: this.formatTime(totalTime),
        completedPomodoros: pomodoros.length
      };
    } catch (error) {
      this.logger.error('Error getting pomodoro time:', error);
      throw new InternalServerErrorException('Error getting pomodoro time');
    }
  }

  private formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (remainingSeconds > 0 || parts.length === 0) parts.push(`${remainingSeconds}s`);

    return parts.join(' ');
  }

  async getStreak(userId: mongoose.Types.ObjectId) {
    const userLog = await this.userLogModel.findOne({ userId });
    return userLog.streak;
  }

  async findAll() {
    return `This action returns all userLogs`;
  }
}