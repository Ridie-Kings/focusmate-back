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
      console.log(error)
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
      const diffDays = currentDate.getDay() - lastCompletedDate.getDay()
      return diffDays === 1;
    } else if (frequency === 'weekly') {
      const diffWeeks = currentDate.getDay() - lastCompletedDate.getDay()
      return (diffWeeks > 7  && diffWeeks < 14);
    } else if (frequency === 'monthly') {
      const diffMonths = currentDate.getMonth() - lastCompletedDate.getMonth()
      return diffMonths === 1;
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
      if (this.checkStreak(habit.frequency, habit.lastCompletedDate, new Date()) && habit.status === true) {
        streak = habit.streak + 1;
        await this.habitModel.findByIdAndUpdate(id ,{
          $set: {name: updateHabitDto.name, description: updateHabitDto.description, status: updateHabitDto.status, frequency: updateHabitDto.frequency, streak: streak, lastCompletedDate: new Date(), bestStreak: Math.max(streak, habit.bestStreak)},
          $addToSet: {completedDates: new Date()},
        },
        {new: true});
      }
      if (updateHabitDto.status === false && habit.status === true) {
        streak = habit.streak - 1;
        await this.habitModel.findByIdAndUpdate(id ,{
          $set: {streak: streak, name: updateHabitDto.name, description: updateHabitDto.description, status: updateHabitDto.status, frequency: updateHabitDto.frequency, bestStreak: Math.min(streak, habit.bestStreak)},
          $pull: {completedDates: new Date()},
        },
        {new: true});
      }
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
  async checkHabits(userId: mongoose.Types.ObjectId) {
    try {
      const habits = await this.habitModel.find({ userId });
      const today = new Date();
      
      for (const habit of habits) {
        // Get last completed date or creation date if never completed
        const lastDate = habit.lastCompletedDate
        
        // Skip if habit was completed today
        if (lastDate && lastDate.toDateString() === today.toDateString()) {
          continue;
        }

        // Check frequency and reset if needed
        switch (habit.frequency) {
          case 'daily':
            // Reset if not completed today
            await this.habitModel.findByIdAndUpdate(habit._id, {
              $set: { status: false }
            });
            break;

          case 'weekly':
            // Reset if last completion was in a different week
            if (this.getWeekNumber(lastDate) !== this.getWeekNumber(today)) {
              await this.habitModel.findByIdAndUpdate(habit._id, {
                $set: { status: false }
              });
            }
            break;

          case 'monthly':
            // Reset if last completion was in a different month
            if (lastDate.getMonth() !== today.getMonth() || 
                lastDate.getFullYear() !== today.getFullYear()) {
              await this.habitModel.findByIdAndUpdate(habit._id, {
                $set: { status: false }
              });
            }
            break;
        }
      }
      return habits;
    } catch (error) {
      throw new InternalServerErrorException('Error checking habits');
    }
  }
}
