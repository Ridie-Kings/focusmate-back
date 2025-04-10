import { Injectable, InternalServerErrorException } from '@nestjs/common';
import mongoose, { Model } from 'mongoose';
import { UserLog, UserLogDocument } from './entities/user-log.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class UserLogsService {

  constructor(
    @InjectModel(UserLog.name)
    private readonly userLogModel: Model<UserLogDocument>,
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
        { $set: { lastLogin: loginTime, loginCount: { $inc: 1 }, lastUpdate: new Date()} },
        { new: true }
      );
      return userLog;
    } catch (error) {
      console.error('Error updating login time:', error);
      throw new InternalServerErrorException('Error updating login time');
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
  

  async findAll() {
    return `This action returns all userLogs`;
  }

  findOne(id: number) {
    return `This action returns a #${id} userLog`;
  }

  update(id: number) {
    return `This action updates a #${id} userLog`;
  }

  remove(id: number) {
    return `This action removes a #${id} userLog`;
  }
}
