import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import mongoose, { Model } from "mongoose";
import { Timer, TimerDocument } from "./entities/timer.entity";
import { StartTimerDto, UpdateTimerDto } from "./dto/index";

@Injectable()
export class TimerService {
  constructor(@InjectModel(Timer.name) private timerModel: Model<TimerDocument>) {}

  async startTimer(
    startTimerDto: StartTimerDto,
    userId: mongoose.Types.ObjectId,
  ): Promise<TimerDocument> {
    try{
      const timer = new this.timerModel({
        ...startTimerDto,
        user: userId,
        isRunning: true,
        startedAt: new Date(),
      });
  
      return (await timer.save()).populate("user");
    } catch (error) {
      throw new InternalServerErrorException("Error starting timer.");
    }
  }

  async updateTimer(
    id: mongoose.Types.ObjectId,
    updateTimerDto: UpdateTimerDto,
    userId: mongoose.Types.ObjectId,
  ): Promise<Timer> {
    try {
      const timer = await this.timerModel.findByIdAndUpdate(id,
        updateTimerDto,
        {new: true}
      );
      if (!timer) {
        throw new NotFoundException("Timer not found.");
      }
      if (timer.user.equals(userId)) {
        throw new UnauthorizedException("Unauthorized user.");
      }
      return timer;
    } catch (error) {
      throw new InternalServerErrorException("Error updating timer.");
    }


    // if (updateTimerDto.isRunning !== undefined) {
    //   timer.isRunning = updateTimerDto.isRunning;
    // }

    // if (!updateTimerDto.isRunning) {
    //   if (timer.startedAt) {
    //     const now = new Date();
    //     const elapsed = Math.floor(
    //       (now.getTime() - timer.startedAt.getTime()) / 1000,
    //     );
    //     timer.elapsedTime += elapsed > 0 ? elapsed : 0; // ✅ Evita sumar tiempo negativo
    //     timer.startedAt = undefined;
    //   }
    // } else {
    //   timer.startedAt = new Date();
    // }

    // return timer.save();
  }

  async getTimers(userId: mongoose.Types.ObjectId): Promise<Timer[]> {
    return this.timerModel.find({ user: userId });
  }
  
  async deleteTimer(id: mongoose.Types.ObjectId, userId: mongoose.Types.ObjectId): Promise<void> {
    try{
      const timer = await this.timerModel.findOne({ id,  user: userId });

      if (!timer) {
        throw new NotFoundException("Timer not found or unauthorized.");
      }

      await this.timerModel.deleteOne({ id});
    } catch (error) {
      throw new InternalServerErrorException("Error deleting timer.");
    }
  }

}

