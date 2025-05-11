import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
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
        streak: 1,
        bestStreak: 1,
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

  async updateLogin(userId: mongoose.Types.ObjectId) {
    try {
      await this.checkStreak(userId, new Date());
      const log={type: 'login', date: new Date()};
      const result = await this.userLogModel.findOneAndUpdate(
        { userId },
        { 
          $set: { 
            lastLogin: new Date(), 
            lastUpdate: new Date()
          },
          $inc: { loginCount: 1 },
          $addToSet: { logs: log, loginDates: new Date() }
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
      // Find the user log
      let userLog = await this.userLogModel.findOne({ userId });
      
      if (!userLog) {
        throw new NotFoundException('User log not found');
      }

      const lastLogin = userLog.lastLogin;
      if (!lastLogin) {
        // First login ever, initialize streak
        await this.userLogModel.updateOne(
          { userId },
          { 
            $set: { 
              lastLogin: currentDate,
              streak: 1,
              bestStreak: 1
            }
          }
        );
        return 1;
      }

      // Normalize dates to midnight for comparison
      const lastLoginDate = new Date(lastLogin);
      const normalizedLastLogin = new Date(
        lastLoginDate.getFullYear(), 
        lastLoginDate.getMonth(), 
        lastLoginDate.getDate()
      );
      const normalizedCurrentDate = new Date(
        currentDate.getFullYear(), 
        currentDate.getMonth(), 
        currentDate.getDate()
      );
      // If already logged in today, don't change anything
      if (normalizedLastLogin.getTime() === normalizedCurrentDate.getTime()) {
        this.logger.log("already logged in today, returning streak");
        if (userLog.streak === 0) {
          await this.userLogModel.updateOne(
            { userId },
            { 
              $set: { 
                streak: 1,
                bestStreak: 1
              }
            }
          );
        }
        return userLog.streak;
      }

      // Check if last login was yesterday
      const oneDayInMs = 24 * 60 * 60 * 1000;
      const daysDifference = Math.round(
        (normalizedCurrentDate.getTime() - normalizedLastLogin.getTime()) / oneDayInMs
      );

      let newStreak = userLog.streak || 0;
      let bestStreak = userLog.bestStreak || 0;

      if (daysDifference === 1) {
        // User logged in yesterday, increment streak
        newStreak += 1;
        // Update best streak if current streak is higher
        if (newStreak > bestStreak) {
          bestStreak = newStreak;
        }
      } else {
        // User didn't log in yesterday, reset streak
        newStreak = 1; // Set to 1 because they're logging in today
      }
      // Update the user log
      await this.userLogModel.updateOne(
        { userId },
        { 
          $set: { 
            streak: newStreak,
            bestStreak: bestStreak,
            lastLogin: currentDate
          }
        }
      );
      
      return newStreak;
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
        { $inc: { taskCounts: 1 }, $push: { logs: log }, $set: { lastUpdate: new Date() } },
        { new: true }
      );
      return userLog.save();
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
        { $inc: { habitCounts: 1 }, $push: { logs: log }, $set: { lastUpdate: new Date() } },
        { new: true }
      );
      return userLog.save();
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

  async taskDeleted(userId: mongoose.Types.ObjectId, taskId: mongoose.Types.ObjectId) {
    const log = {type: 'task-deleted', object: taskId, date: new Date()};
    const userLog = await this.userLogModel.findOneAndUpdate(
      { userId },
      { $inc: { taskDeleted: 1 }, $push: { logs: log }, $set: { lastUpdate: new Date() } },
      { new: true }
    );
    return userLog;
  }

  async habitDeleted(userId: mongoose.Types.ObjectId, habitId: mongoose.Types.ObjectId) {
    const log = {type: 'habit-deleted', object: habitId, date: new Date()};
    const userLog = await this.userLogModel.findOneAndUpdate(
      { userId },
      { $inc: { habitDeleted: 1 }, $push: { logs: log }, $set: { lastUpdate: new Date() } },
      { new: true } 
    );
    return userLog;
  }

  async taskCompleted(userId: mongoose.Types.ObjectId, taskId: mongoose.Types.ObjectId) {
    const log = {type: 'task-completed', object: taskId, date: new Date()};
    const userLog = await this.userLogModel.findOneAndUpdate(
      { userId },
      { $inc: { taskCompleted: 1 }, $push: { logs: log }, $set: { lastUpdate: new Date() } },
      { new: true }
    );
    return userLog;
  }

  async habitCompleted(userId: mongoose.Types.ObjectId, habitId: mongoose.Types.ObjectId) {
    const log = {type: 'habit-completed', object: habitId, date: new Date()};
    const userLog = await this.userLogModel.findOneAndUpdate(
      { userId },
      { $inc: { habitCompleted: 1 }, $push: { logs: log }, $set: { lastUpdate: new Date() } },
      { new: true }
    );
    return userLog;
  }

  async taskCalendarCreated(userId: mongoose.Types.ObjectId, taskId: mongoose.Types.ObjectId) {
    const log = {type: 'task-calendar-created', object: taskId, date: new Date()};
    const userLog = await this.userLogModel.findOneAndUpdate(
      { userId },
      { $inc: { taskCalendarCreated: 1 }, $push: { logs: log }, $set: { lastUpdate: new Date() } },
      { new: true }
    );
    return userLog;
  }

  async pomodoroCreated(userId: mongoose.Types.ObjectId, pomodoroId: mongoose.Types.ObjectId, duration: number, cycles: number) {
    const log = {type: 'pomodoro-created', date: new Date(), object: pomodoroId, value: {duration: duration, cycles: cycles}};
    const userLog = await this.userLogModel.findOneAndUpdate(
      { userId },
      { $inc: { pomodoroCreated: 1 }, $push: { logs: log }, $set: { lastUpdate: new Date() } },
      { new: true }
    );
    return userLog;
  }


  async pomodoroStarted(userId: mongoose.Types.ObjectId, pomodoroId: mongoose.Types.ObjectId, duration: number, cycles: number) {
    const log = {type: 'pomodoro-started', date: new Date(), object: pomodoroId, value: {duration: duration, cycles: cycles}};
    const userLog = await this.userLogModel.findOneAndUpdate(
      { userId },
      { $inc: { pomodoroStarted: 1 }, $push: { logs: log }, $set: { lastUpdate: new Date() } },
      { new: true }
    );
    return userLog;
  }

  async pomodoroCompleted(userId: mongoose.Types.ObjectId, pomodoroId: mongoose.Types.ObjectId, duration: number, cycles: number) {
    const log = {type: 'pomodoro-completed', object: pomodoroId, value: {duration: duration, cycles: cycles}};
    const userLog = await this.userLogModel.findOneAndUpdate(
      { userId },
      { $inc: { pomodoroCompleted: 1 }, $push: { logs: log }, $set: { lastUpdate: new Date() } },
      { new: true }
    );
    return userLog;
  }

  async eventCalendarCreated(userId: mongoose.Types.ObjectId, eventId: mongoose.Types.ObjectId) {
    const log = {type: 'event-calendar-created', object: eventId, date: new Date()};
    const userLog = await this.userLogModel.findOneAndUpdate(
      { userId },
      { $inc: { EventsCalendarCreated: 1 }, $push: { logs: log }, $set: { lastUpdate: new Date() } },
      { new: true }
    );
    return userLog;
  }

  async pomodoroFinished(userId: mongoose.Types.ObjectId, pomodoroId: mongoose.Types.ObjectId, duration: number, cycles: number) {
    const log = {type: 'pomodoro-finished', object: pomodoroId, value: {duration: duration, cycles: cycles}};
    const userLog = await this.userLogModel.findOneAndUpdate(
      { userId },
      { $inc: { pomodoroFinished: 1 }, $push: { logs: log }, $set: { lastUpdate: new Date() } },
      { new: true }
    );
    return userLog;
  }
  
}