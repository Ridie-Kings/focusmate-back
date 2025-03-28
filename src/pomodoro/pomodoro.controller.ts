import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PomodoroService } from './pomodoro.service';
import { CreatePomodoroDto } from './dto/create-pomodoro.dto';
import { UpdatePomodoroDto } from './dto/update-pomodoro.dto';

@Controller('pomodoro')
export class PomodoroController {
  constructor(private readonly pomodoroService: PomodoroService) {}

  @Post()
  create(@Body() createPomodoroDto: CreatePomodoroDto) {
    return this.pomodoroService.create(createPomodoroDto);
  }

  @Get()
  findAll() {
    return this.pomodoroService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pomodoroService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePomodoroDto: UpdatePomodoroDto) {
    return this.pomodoroService.update(+id, updatePomodoroDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pomodoroService.remove(+id);
  }
}
