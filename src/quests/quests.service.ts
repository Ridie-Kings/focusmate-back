import { Injectable } from '@nestjs/common';
import { CreateQuestDto } from './dto/create-quest.dto';
import { UpdateQuestDto } from './dto/update-quest.dto';
import mongoose from 'mongoose';

@Injectable()
export class QuestsService {
  create(createQuestDto: CreateQuestDto) {
    return 'This action adds a new quest';
  }

  findAll() {
    return `This action returns all quests`;
  }

  findOne(id: mongoose.Types.ObjectId) {
    return `This action returns a #${id} quest`;
  }

  update(id: mongoose.Types.ObjectId, updateQuestDto: UpdateQuestDto) {
    return `This action updates a #${id} quest`;
  }

  remove(id: mongoose.Types.ObjectId) {
    return `This action removes a #${id} quest`;
  }
}
