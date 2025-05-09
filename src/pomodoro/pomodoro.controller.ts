import { Controller, Get, Post, Param, UseGuards, Req, Body, Patch, Delete } from '@nestjs/common';
import { PomodoroService } from './pomodoro.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetUser } from 'src/users/decorators/get-user.decorator';
import { CreatePomodoroDto } from './dto/create-pomodoro.dto';
import { UserDocument } from 'src/users/entities/user.entity';
import { ParseMongoIdPipe } from 'src/common/pipes/parse-mongo-id.pipe';
import { UpdatePomodoroDto } from './dto/update-pomodoro.dto';
import mongoose from 'mongoose';
@ApiTags('Pomodoro')
@Controller('pomodoro')
@UseGuards(JwtAuthGuard)
export class PomodoroController {
  constructor(private readonly pomodoroService: PomodoroService) {}

  @Get()
  @ApiOperation({ summary: 'Get all pomodoros with IDLE state' })
  @ApiResponse({ status: 200, description: 'Pomodoros retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized Access' })
  async getAllPomodoros(@GetUser() user: UserDocument) {
    return this.pomodoroService.findAll(user.id);
  }

  @Get('@me')
  @ApiOperation({ summary: 'Get all pomodoros with all states' })
  @ApiResponse({ status: 200, description: 'Pomodoros retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized Access' })
  async getAllFinishedPomodoros(@GetUser() user: UserDocument) {
    return this.pomodoroService.findAllNotIdle(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new pomodoro' })
  @ApiResponse({ status: 201, description: 'Pomodoro created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  async createPomodoro(@Body() createPomodoroDto: CreatePomodoroDto, @GetUser() user: UserDocument) {
    return this.pomodoroService.createPomodoro(createPomodoroDto, user.id);
  }

  @Post(':id/start')
  @ApiOperation({ summary: 'Start a pomodoro' })
  @ApiResponse({ status: 200, description: 'Pomodoro started successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized Access' })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  async startPomodoro(@Param('id', ParseMongoIdPipe) id: mongoose.Types.ObjectId, @GetUser() user: UserDocument) {
    return this.pomodoroService.startPomodoro(id, user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a pomodoro by id' })
  @ApiResponse({ status: 200, description: 'Pomodoro retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized Access' })
  @ApiResponse({ status: 404, description: 'Pomodoro not found' })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  async getPomodoro(@Param('id', ParseMongoIdPipe) id: mongoose.Types.ObjectId, @GetUser() user: UserDocument) {
    return this.pomodoroService.findOne(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a pomodoro by id' })
  @ApiResponse({ status: 200, description: 'Pomodoro updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized Access' })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  async updatePomodoro(@Param('id', ParseMongoIdPipe) id: mongoose.Types.ObjectId, @Body() updatePomodoroDto: UpdatePomodoroDto, @GetUser() user: UserDocument) {
    return this.pomodoroService.update(id, updatePomodoroDto, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a pomodoro by id' })
  @ApiResponse({ status: 200, description: 'Pomodoro deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized Access' })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  async reset(@Param('id', ParseMongoIdPipe) id: mongoose.Types.ObjectId, @GetUser() user: UserDocument) {
    return this.pomodoroService.reset(id, user.id);
  }
}
