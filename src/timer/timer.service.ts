import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Timer } from "./entities/timer.entity";
import { StartTimerDto, UpdateTimerDto } from "./dto/index";

@Injectable()
export class TimerService {
  constructor(@InjectModel(Timer.name) private timerModel: Model<Timer>) {}

  async startTimer(
    startTimerDto: StartTimerDto,
    userId: string,
  ): Promise<Timer> {
    const existingTimer = await this.timerModel.findOne({
      user: userId,
      isRunning: true,
    });

    if (existingTimer) {
      throw new BadRequestException("You already have an active timer.");
    }

    const timer = new this.timerModel({
      ...startTimerDto,
      user: userId,
      isRunning: true,
      startedAt: new Date(),
    });

    return timer.save();
  }

  async updateTimer(
    updateTimerDto: UpdateTimerDto,
    userId: string,
  ): Promise<Timer> {
    const timer = await this.timerModel.findOne({
      _id: updateTimerDto.timerId,
      user: userId,
    });

    if (!timer) {
      throw new NotFoundException("Timer not found.");
    }

    if (updateTimerDto.isRunning !== undefined) {
      timer.isRunning = updateTimerDto.isRunning;
    }

    if (!updateTimerDto.isRunning) {
      if (timer.startedAt) {
        const now = new Date();
        const elapsed = Math.floor(
          (now.getTime() - timer.startedAt.getTime()) / 1000,
        );
        timer.elapsedTime += elapsed > 0 ? elapsed : 0; // ✅ Evita sumar tiempo negativo
        timer.startedAt = undefined;
      }
    } else {
      timer.startedAt = new Date();
    }

    return timer.save();
  }

  async getTimers(userId: string): Promise<Timer[]> {
    return this.timerModel.find({ user: userId }).exec();
  }

 async deleteTimer(timerId: string, userId: string): Promise<void> {
  const timer = await this.timerModel.findOne({ _id: timerId, user: userId });

  if (!timer) {
    throw new NotFoundException("Timer not found or unauthorized.");
  }

  await this.timerModel.deleteOne({ _id: timerId });
}

  }

