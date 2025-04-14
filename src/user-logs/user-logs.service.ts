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
      return userLog;
    } catch (error) {
      console.error('Error creating user log:', error);
      throw new InternalServerErrorException('Error creating user log');
    }
  }

  async updateLogin(userId: mongoose.Types.ObjectId, loginTime: Date) {
    try {
      const userLog = await this.userLogModel.findOneAndUpdate(
        { userId },
        { $set: { lastLogin: loginTime, loginCount: { $inc: 1 }, lastUpdate: new Date()}},
        { new: true }
      );
      if (userLog.lastLogin.getDay() !== loginTime.getDay()) {
        userLog.loginDates.push(loginTime);
        this.checkStreak(userId, loginTime, userLog);
      }
      return userLog;
    } catch (error) {
      console.error('Error updating login time:', error);
      throw new InternalServerErrorException('Error updating login time');
    }
  }
  async checkStreak(userId: mongoose.Types.ObjectId, loginTime: Date, userLog: UserLogDocument) {
    if (userLog.lastLogin.getDay() - loginTime.getDay() > 1) {
      await this.userLogModel.findOneAndUpdate( 
        { userId },
        { $set: { streak: 0 } },
        { new: true }
      );
    }
    else {
      await this.userLogModel.findOneAndUpdate(
        { userId },
        { $set: { streak: { $inc: 1 } } },
        { new: true }
      );
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