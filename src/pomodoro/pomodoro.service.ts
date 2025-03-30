import { Injectable } from '@nestjs/common';
import { CreatePomodoroDto } from './dto/create-pomodoro.dto';
import { UpdatePomodoroDto } from './dto/update-pomodoro.dto';

@Injectable()
export class PomodoroService {
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
