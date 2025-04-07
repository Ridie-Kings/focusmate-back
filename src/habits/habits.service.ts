import { Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateHabitDto } from './dto/create-habit.dto';
import { UpdateHabitDto } from './dto/update-habit.dto';
import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Habit, HabitDocument } from './entities/habit.entity';

@Injectable()
export class HabitsService {

  constructor(
    @InjectModel(Habit.name) private habitModel: Model<HabitDocument>,
  ){}

  async create(createHabitDto: CreateHabitDto, userId: mongoose.Types.ObjectId): Promise<HabitDocument> { 
    try {
      const habit = await this.habitModel.create({
        ...createHabitDto,
        userId,
      });
      return await habit.populate('userId');
    } catch (error) {
      throw new Error('Error creating habit');
    }
  }

  async findAll(userId: mongoose.Types.ObjectId): Promise<HabitDocument[]> {
    try {
      return await this.habitModel.find({userId: userId});
    }catch (error) {
      throw new Error('Error getting habits');
    }
  }

  async findOne(id: mongoose.Types.ObjectId, userId: mongoose.Types.ObjectId): Promise<HabitDocument> {
    try {
      const habit = await this.habitModel.findById(id);
      if (!habit) throw new NotFoundException('Habit not found');
      if (!habit.userId.equals(userId)) throw new UnauthorizedException('Unauthorized access');
      return habit;
    }catch (error) {
      throw new InternalServerErrorException('Error getting habit');
    }
  }

  private checkStreak(frequency: string, lastCompletedDate: Date, completedDate: Date): boolean {
    if (!lastCompletedDate) return true;
    const lastDate = new Date(lastCompletedDate);
    const currentDate = new Date(completedDate);

    if (frequency === 'daily') {
      const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Difference in days
      return diffDays === 1;
    } else if (frequency === 'weekly') {
      const lastWeek = this.getWeekNumber(lastDate);
      const currentWeek = this.getWeekNumber(currentDate);
      return currentWeek === lastWeek + 1 && lastDate.getFullYear() === currentDate.getFullYear();
    } else if (frequency === 'monthly') {
      const lastMonth = lastDate.getMonth();
      const currentMonth = currentDate.getMonth();
      const lastYear = lastDate.getFullYear();
      const currentYear = currentDate.getFullYear();
      return (currentMonth === lastMonth + 1 && currentYear === lastYear) || 
             (currentMonth === 0 && lastMonth === 11 && currentYear === lastYear + 1);
    }
    return false;
  }

  private getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / (1000 * 60 * 60 * 24);
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  async update(id: mongoose.Types.ObjectId, updateHabitDto: UpdateHabitDto, userId: mongoose.Types.ObjectId): Promise<HabitDocument> {
    try {
      const habit = await this.habitModel.findById(id);
      let streak = 0;
      if (!habit) throw new NotFoundException('Habit not found');
      if (!habit.userId.equals(userId)) throw new UnauthorizedException('Unauthorized access');
      if (this.checkStreak(habit.frequency, habit.lastCompletedDate, updateHabitDto.completedDate)) {
        streak = habit.streak + 1;
      }
      await this.habitModel.findByIdAndUpdate(id ,{
        $set: {name: updateHabitDto.name, description: updateHabitDto.description, status: updateHabitDto.status, frequency: updateHabitDto.frequency, streak: streak, lastCompletedDate: updateHabitDto.completedDate, bestStreak: Math.max(streak, habit.bestStreak)},
        $push: {completedDates: updateHabitDto.completedDate},
      },
      {new: true});
      return (await this.findOne(id, userId)).populate('userId');
    } catch (error) {
      throw new InternalServerErrorException('Error updating habit');
    }
  }
  async addCompleteDate(id: mongoose.Types.ObjectId, date: Date, userId: mongoose.Types.ObjectId): Promise<HabitDocument> {
    try {
      const habit = await this.habitModel.findById(id);
      if (!habit) throw new NotFoundException('Habit not found');
      if (!habit.userId.equals(userId)) throw new UnauthorizedException('Unauthorized access');
      habit.completedDates.push(date);
      return await habit.save();
    }
    catch (error) {
      throw new InternalServerErrorException('Error adding completed date');
    }
  }

  async remove(id: mongoose.Types.ObjectId, userId: mongoose.Types.ObjectId): Promise<HabitDocument> {
    try {
      const habit = await this.habitModel.findById(id);
      if (!habit) throw new NotFoundException('Habit not found');
      if (!habit.userId.equals(userId)) throw new UnauthorizedException('Unauthorized access');
      return await this.habitModel.findByIdAndDelete(id);
    } catch (error) {
      throw new InternalServerErrorException('Error deleting habit');
    }
  }
}
