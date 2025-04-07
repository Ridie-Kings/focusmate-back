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
      });
      return userLog;
    } catch (error) {
      console.error('Error creating user log:', error);
      throw new InternalServerErrorException('Error creating user log');
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
