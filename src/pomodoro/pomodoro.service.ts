import { Injectable } from '@nestjs/common';
import { CreatePomodoroDto } from './dto/create-pomodoro.dto';
import { UpdatePomodoroDto } from './dto/update-pomodoro.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Pomodoro, PomodoroDocument } from './entities/pomodoro.entity';

@Injectable()
export class PomodoroService {

  constructor(
    @InjectModel(Pomodoro.name)
    private readonly pomodoroModel: Model<PomodoroDocument>,
  ) {}
  create(createPomodoroDto: CreatePomodoroDto) {
    return 'This action adds a new pomodoro';
  }

  findAll() {
    return `This action returns all pomodoro`;
  }

  findOne(id: number) {
    return `This action returns a #${id} pomodoro`;
  }

  update(id: number, updatePomodoroDto: UpdatePomodoroDto) {
    return `This action updates a #${id} pomodoro`;
  }

  remove(id: number) {
    return `This action removes a #${id} pomodoro`;
  }
}
