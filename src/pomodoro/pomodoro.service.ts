// src/pomodoro/pomodoro.service.ts
import { ForbiddenException, Inject, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Pomodoro, PomodoroDocument } from './entities/pomodoro.entity';
import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { ConfigService } from '@nestjs/config';
import * as mongoose from 'mongoose';
import { CreatePomodoroDto } from './dto/create-pomodoro.dto';
import { PomodoroState } from './entities/pomodoro.entity';
import { UserDocument } from 'src/users/entities/user.entity';
import { UpdatePomodoroDto } from './dto/update-pomodoro.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventsList } from 'src/events/list.events';
import { PomodoroGateway } from './pomodoro.gateway';
import { SchedulerRegistry } from '@nestjs/schedule';

@Injectable()
export class PomodoroService {
  private readonly logger = new Logger(PomodoroService.name);

  constructor(
    @InjectModel(Pomodoro.name) private pomodoroModel: Model<PomodoroDocument>,
    @Inject(EventEmitter2) private eventEmitter: EventEmitter2,
    private gateway: PomodoroGateway,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  async createPomodoro(createPomodoroDto: CreatePomodoroDto, user: mongoose.Types.ObjectId) {
    try {
      const pomodoro = await this.pomodoroModel.create({...createPomodoroDto, userId: user._id});
      this.eventEmitter.emit(EventsList.POMODORO_CREATED, {userId: user._id, pomodoroId: pomodoro._id});
      return pomodoro;
    } catch (error) {
      this.logger.error('Error creating pomodoro:', error);
      throw new InternalServerErrorException('Error creating pomodoro');
    }
  }

  async startPomodoro(id: mongoose.Types.ObjectId, user: mongoose.Types.ObjectId): Promise<Pomodoro> {
    try{
        const pomodoro = await this.pomodoroModel.findById(id);
      if (!pomodoro) {
        throw new NotFoundException('Pomodoro not found');
      }
      if( !pomodoro.userId.equals(user)) {
        throw new ForbiddenException('You are not allowed to start this pomodoro');
      }
      pomodoro.state = PomodoroState.WORKING;
      pomodoro.currentCycle = 1;
      pomodoro.startTime = new Date();
      pomodoro.endTime = new Date(pomodoro.startTime.getTime() + pomodoro.workDuration * 1000);
      await pomodoro.save();
      this.gateway.emitStatus(pomodoro);
      this.scheduleNext(id, pomodoro.workDuration);    
      return pomodoro;
    } catch (error) {
      this.logger.error('Error starting pomodoro:', error);
      throw new InternalServerErrorException('Error starting pomodoro');
    }
  }

  private scheduleNext(id: mongoose.Types.ObjectId, duration: number) {
    const timeout = setTimeout(async () => {
      const pomodoro = await this.pomodoroModel.findById(id);
      if(!pomodoro) return;
      if(pomodoro.state === PomodoroState.WORKING) {
        if( pomodoro.currentCycle % pomodoro.cycles === 0) {
          pomodoro.state = PomodoroState.LONG_BREAK;
          pomodoro.endTime = new Date( Date.now() + pomodoro.longBreak * 1000);
        } else {
          pomodoro.state = PomodoroState.SHORT_BREAK;
          pomodoro.endTime = new Date( Date.now() + pomodoro.shortBreak * 1000);
        }
      } else if (
        pomodoro.state === PomodoroState.SHORT_BREAK ||
        pomodoro.state === PomodoroState.LONG_BREAK
      ) {
        pomodoro.currentCycle+=1;
        pomodoro.state = PomodoroState.WORKING;
        pomodoro.endTime = new Date( Date.now() + pomodoro.workDuration * 1000);
      }

      await pomodoro.save();
      this.gateway.emitStatus(pomodoro);
      this.scheduleNext(id, 
        pomodoro.state === PomodoroState.WORKING ? pomodoro.workDuration : pomodoro.state === PomodoroState.LONG_BREAK ? pomodoro.longBreak : pomodoro.shortBreak
      );
    }, duration * 1000);
    this.schedulerRegistry.addTimeout(
      `pomodoro-${id}`,
      timeout
    );
  }

  async findOne(id: mongoose.Types.ObjectId, user: mongoose.Types.ObjectId  ) {
    try{
      const pomodoro = await this.pomodoroModel.findById(id);
      if(!pomodoro) throw new NotFoundException('Pomodoro not found');
      if(!pomodoro.userId.equals(user)) throw new ForbiddenException('You are not allowed to access this pomodoro');
      return pomodoro;
    } catch (error) {
      this.logger.error('Error finding pomodoro:', error);
      throw new InternalServerErrorException('Error finding pomodoro');
    }
  }

  async update(id: mongoose.Types.ObjectId, updatePomodoroDto: UpdatePomodoroDto, user: mongoose.Types.ObjectId) {
    try{
      const pomodoro = await this.findOne(id, user);
      if(!pomodoro) throw new NotFoundException('Pomodoro not found');
      if(!pomodoro.userId.equals(user)) throw new ForbiddenException('You are not allowed to update this pomodoro');
      return this.pomodoroModel.findByIdAndUpdate(id, updatePomodoroDto, {new: true});
    } catch (error) {
      this.logger.error('Error updating pomodoro:', error);
      throw new InternalServerErrorException('Error updating pomodoro');
    }
  }

  async reset(id: mongoose.Types.ObjectId, user: mongoose.Types.ObjectId): Promise<Pomodoro> { 
    try{
      await this.schedulerRegistry.deleteTimeout(`pomodoro-${id}`);
      const pomodoro = await this.findOne(id, user);
      if(!pomodoro) throw new NotFoundException('Pomodoro not found');
      if(!pomodoro.userId.equals(user)) throw new ForbiddenException('You are not allowed to reset this pomodoro');
      return this.pomodoroModel.findByIdAndUpdate(id, {state: PomodoroState.IDLE, currentCycle: 0, endTime: null, startTime: null}, {new: true});
    } catch (error) {
      this.logger.error('Error resetting pomodoro:', error);
      throw new InternalServerErrorException('Error resetting pomodoro');
    }
  } 
  
}