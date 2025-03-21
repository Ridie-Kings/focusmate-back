import { Injectable } from '@nestjs/common';
import mongoose, { Model } from 'mongoose';
import { Quest } from './entities/quest.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class QuestsService {
  constructor(
    @InjectModel('Quest')
    private questModel: Model<Quest>

  ){}

  async findAll() {
    return await this.questModel.find().populate('reward').populate('badge').populate('tasks');;
  }

  findOne(id: mongoose.Types.ObjectId) {
    return `This action returns a #${id} quest`;
  }
}
