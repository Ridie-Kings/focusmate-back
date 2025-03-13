import { Injectable } from '@nestjs/common';
import { CreateHabitDto } from './dto/create-habit.dto';
import { UpdateHabitDto } from './dto/update-habit.dto';
import mongoose from 'mongoose';

@Injectable()
export class HabitsService {
  create(createHabitDto: CreateHabitDto) {
    return 'This action adds a new habit';
  }

  findAll() {
    return `This action returns all habits`;
  }

  findOne(id: mongoose.Types.ObjectId) {
    return `This action returns a #${id} habit`;
  }

  update(id: mongoose.Types.ObjectId, updateHabitDto: UpdateHabitDto) {
    return `This action updates a #${id} habit`;
  }

  remove(id: mongoose.Types.ObjectId) {
    return `This action removes a #${id} habit`;
  }
}
