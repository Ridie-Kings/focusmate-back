import { Injectable } from '@nestjs/common';
import mongoose, { Model } from 'mongoose';
import { UserLog, UserLogDocument } from './entities/user-log.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class UserLogsService {

  constructor(
    @InjectModel(UserLog.name)
    private readonly userLogModel: Model<UserLogDocument>,
  ){}
  create(userId: mongoose.Types.ObjectId) {
    return 'This action adds a new userLog';
  }

  findAll() {
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
