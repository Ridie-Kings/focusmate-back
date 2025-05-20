// src/pomodoro/pomodoro.service.ts
import { BadRequestException, ForbiddenException, Inject, Injectable, InternalServerErrorException, Logger, NotFoundException, forwardRef } from '@nestjs/common';
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
    @Inject(forwardRef(() => PomodoroGateway)) private gateway: PomodoroGateway,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  async createPomodoro(createPomodoroDto: CreatePomodoroDto, user: mongoose.Types.ObjectId) : Promise<PomodoroDocument> {
    try {
      const previousPomodoro = await this.pomodoroModel.findOne({userId: user, state: PomodoroState.IDLE});
      if(previousPomodoro) {
        await this.pomodoroModel.findByIdAndUpdate(previousPomodoro._id, {state: PomodoroState.FINISHED});
      }
      
      const pomodoro = await this.pomodoroModel.create({...createPomodoroDto, userId: user});
      this.eventEmitter.emit(EventsList.POMODORO_CREATED, {userId: user, pomodoroId: pomodoro._id, duration: pomodoro.workDuration, cycles: pomodoro.cycles});
      return pomodoro;
    } catch (error) {
      this.logger.error('Error creating pomodoro:', error);
      throw new InternalServerErrorException('Error creating pomodoro');
    }
  }

  async createDefaultPomodoro(user: mongoose.Types.ObjectId) {
    try{
      const pomodoro = await this.pomodoroModel.create({userId: user, workDuration: 25*60, shortBreak: 5*60, longBreak: 15*60, cycles: 4});
      this.eventEmitter.emit(EventsList.POMODORO_CREATED, {userId: user, pomodoroId: pomodoro._id, duration: pomodoro.workDuration, cycles: pomodoro.cycles});
      return this.startPomodoro(pomodoro.id, user);
      //this.gateway.emitStatus(pomodoro);
    } catch (error) {
      this.logger.error('Error creating default pomodoro:', error);
      throw new InternalServerErrorException('Error creating default pomodoro');
    }
  }

  async findAll(user: mongoose.Types.ObjectId) {
    try{
      return this.pomodoroModel.find({userId: user, state: PomodoroState.IDLE});
    } catch (error) {
      this.logger.error('Error finding pomodoros:', error);
      throw new InternalServerErrorException('Error finding pomodoros');
    }
  }

  async findAllNotIdle(user: mongoose.Types.ObjectId) {
    try{
      return await this.pomodoroModel.find({userId: user});

    } catch (error) {
      this.logger.error('Error finding pomodoros:', error);
      throw new InternalServerErrorException('Error finding pomodoros');
    }
  }

  async findWorking(user: mongoose.Types.ObjectId) {
    try{
      return await this.pomodoroModel.findOne({
        userId: user, 
        state: { 
          $in: [
            PomodoroState.WORKING,
            PomodoroState.LONG_BREAK,
            PomodoroState.SHORT_BREAK,
            PomodoroState.IDLE
          ]
        }
      });
    } catch (error) {
      this.logger.error('Error finding pomodoros:', error);
      throw new InternalServerErrorException('Error finding pomodoros');
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
      pomodoro.startAt = new Date();
      pomodoro.endAt = new Date(pomodoro.startAt.getTime() + pomodoro.workDuration * 1000);
      await pomodoro.save();
      this.eventEmitter.emit(EventsList.POMODORO_STARTED, {userId: user, pomodoroId: pomodoro._id, duration: pomodoro.workDuration, cycles: pomodoro.cycles});

      this.gateway.emitStatus(pomodoro);
      this.scheduleNext(id, pomodoro.workDuration);    
      return pomodoro;
    } catch (error) {
      this.logger.error('Error starting pomodoro:', error);
      throw new InternalServerErrorException('Error starting pomodoro');
    }
  }

  async pausePomodoro(id: mongoose.Types.ObjectId, user: mongoose.Types.ObjectId) {
    try{
      const pomodoro = await this.findOne(id, user);
      if(!pomodoro) throw new NotFoundException('Pomodoro not found');
      if(!pomodoro.userId.equals(user)) throw new ForbiddenException('You are not allowed to pause this pomodoro');
      pomodoro.pausedState = PomodoroState.PAUSED;
      pomodoro.interruptions += 1;
      pomodoro.endAt = new Date( Date.now());
      if(!pomodoro.remainingTime) {
        if(pomodoro.state === PomodoroState.WORKING) {
          pomodoro.remainingTime = pomodoro.workDuration - Math.floor((pomodoro.endAt.getTime() - pomodoro.startAt.getTime()) / 1000);
        } else if(pomodoro.state === PomodoroState.SHORT_BREAK ) {
          pomodoro.remainingTime = pomodoro.shortBreak - Math.floor((pomodoro.endAt.getTime() - pomodoro.startAt.getTime()) / 1000);
        }else if(pomodoro.state === PomodoroState.LONG_BREAK) {
          pomodoro.remainingTime = pomodoro.longBreak - Math.floor((pomodoro.endAt.getTime() - pomodoro.startAt.getTime()) / 1000);
        }
      }else{
        pomodoro.remainingTime = pomodoro.remainingTime - Math.floor((pomodoro.endAt.getTime() - pomodoro.startAt.getTime()) / 1000);
      }
      
      pomodoro.endAt = null;
      pomodoro.startAt = null;
      await pomodoro.save();
      this.gateway.emitStatus(pomodoro);
      if (this.schedulerRegistry.doesExist('timeout', `pomodoro-${id}`)) {
        this.schedulerRegistry.deleteTimeout(`pomodoro-${id}`);
      }
      return pomodoro;
    } catch (error) {
      this.logger.error('Error pausing pomodoro:', error);
      throw new InternalServerErrorException('Error pausing pomodoro');
    }
  }

  async resumePomodoro(id: mongoose.Types.ObjectId, user: mongoose.Types.ObjectId) {
    try{
      const pomodoro = await this.findOne(id, user);
      if(!pomodoro) throw new NotFoundException('Pomodoro not found');
      if(!pomodoro.userId.equals(user)) throw new ForbiddenException('You are not allowed to resume this pomodoro');
      pomodoro.pausedState = null;
      const duration = pomodoro.remainingTime;
      pomodoro.startAt = new Date( Date.now());
      pomodoro.endAt = new Date( pomodoro.startAt.getTime() + duration * 1000);
      // this.logger.debug(`💡 Pomodoro ${id} resumed with duration ${duration / 1000} seconds -> ${duration / 60} minutes`);
      // this.logger.debug(`💡 Pomodoro ${id} resumed with endAt ${pomodoro.endAt}`);
      this.gateway.emitStatus(pomodoro);
      this.scheduleNext(id, duration);
      await pomodoro.save();
      return pomodoro;
    } catch (error) {
      this.logger.error('Error resuming pomodoro:', error);
      throw new InternalServerErrorException('Error resuming pomodoro');
    }
  }

  async stopPomodoro(id: mongoose.Types.ObjectId, user: mongoose.Types.ObjectId) {
    try{
      const pomodoro = await this.findOne(id, user);
      if(!pomodoro) throw new NotFoundException('Pomodoro not found');
      if(!pomodoro.userId.equals(user)) throw new ForbiddenException('You are not allowed to stop this pomodoro');
      pomodoro.state = PomodoroState.FINISHED;
      pomodoro.endAt = new Date( Date.now());
      await pomodoro.save();
      this.gateway.emitStatus(pomodoro);
      this.eventEmitter.emit(EventsList.POMODORO_FINISHED, {userId: pomodoro.userId, pomodoroId: pomodoro._id, duration: pomodoro.workDuration, cycles: pomodoro.cycles});
      if (this.schedulerRegistry.doesExist('timeout', `pomodoro-${id}`)) {
        this.schedulerRegistry.deleteTimeout(`pomodoro-${id}`);
      }
      return pomodoro;
    } catch (error) {
      this.logger.error('Error stopping pomodoro:', error);
      throw new InternalServerErrorException('Error stopping pomodoro');
    }
  }

  private scheduleNext(id: mongoose.Types.ObjectId, duration: number) {
    try {
      // Delete existing timeout if it exists
      if (this.schedulerRegistry.doesExist('timeout', `pomodoro-${id}`)) {
        this.schedulerRegistry.deleteTimeout(`pomodoro-${id}`);
      }

      const timeout = setTimeout(async () => {
        const pomodoro = await this.pomodoroModel.findById(id);
        if(!pomodoro) return;
        if(pomodoro.state === PomodoroState.WORKING) {
          pomodoro.currentCycle+=1;

          if( pomodoro.currentCycle % 4 === 0) {
            pomodoro.state = PomodoroState.LONG_BREAK;
            pomodoro.remainingTime = null;
            pomodoro.endAt = new Date( Date.now() + pomodoro.longBreak * 1000);
          } else {
            pomodoro.state = PomodoroState.SHORT_BREAK;
            pomodoro.remainingTime = null;
            pomodoro.endAt = new Date( Date.now() + pomodoro.shortBreak * 1000);
          }
        } else if (
          pomodoro.state === PomodoroState.SHORT_BREAK ||
          pomodoro.state === PomodoroState.LONG_BREAK
        ) {

          if( pomodoro.currentCycle >= pomodoro.cycles) {
            pomodoro.state = PomodoroState.COMPLETED;
            pomodoro.remainingTime = null;
            pomodoro.endAt = new Date( Date.now());

            await pomodoro.save();
            this.gateway.emitStatus(pomodoro);
            this.eventEmitter.emit(EventsList.POMODORO_COMPLETED, {userId: pomodoro.userId, pomodoroId: pomodoro._id, duration: pomodoro.workDuration, cycles: pomodoro.cycles});
            return;
          } 

          pomodoro.state = PomodoroState.WORKING;
          pomodoro.remainingTime = null;
          pomodoro.endAt = new Date( Date.now() + pomodoro.workDuration * 1000);
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
    } catch (error) {
      this.logger.error('Error scheduling next pomodoro:', error);
      throw new InternalServerErrorException('Error scheduling next pomodoro');
    }
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
      const pomodor_new = await this.pomodoroModel.findByIdAndUpdate(id, updatePomodoroDto, {new: true});
      this.gateway.emitStatus(pomodor_new);
      return pomodor_new;
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
      return this.pomodoroModel.findByIdAndUpdate(id, {state: PomodoroState.IDLE, currentCycle: 0, endAt: null, startAt: null}, {new: true});
    } catch (error) {
      this.logger.error('Error resetting pomodoro:', error);
      throw new InternalServerErrorException('Error resetting pomodoro');
    }
  } 

  async sharePomodoro(id: mongoose.Types.ObjectId, user: mongoose.Types.ObjectId) {
    try{
      const pomodoro = await this.findOne(id, user);
      if(!pomodoro) throw new NotFoundException('Pomodoro not found');
      if(!pomodoro.userId.equals(user)) throw new ForbiddenException('You are not allowed to share this pomodoro');
      return pomodoro;
    } catch (error) {
      this.logger.error('Error sharing pomodoro:', error);
      throw new InternalServerErrorException('Error sharing pomodoro');
    }
  } 
  
}