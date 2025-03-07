import { ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';
import mongoose, { Model, mongo } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<Task>,
  ) {}
  async create(createTaskDto: CreateTaskDto, userId: mongoose.Types.ObjectId) {
    try {
      const task = await this.taskModel.create({
        ...createTaskDto,
        userId,
      });
      return await task.populate('userId');
    } catch (error) {
      throw new InternalServerErrorException('Error creating task');
    }
  }

  async findAll(userId: mongoose.Types.ObjectId): Promise<Task[]> {
    try {
      return await this.taskModel.find({userId: userId}).populate('userId');
    }catch (error) {
      throw new InternalServerErrorException('Error getting tasks');
    }
  }

  async findOne(id: mongoose.Types.ObjectId, userId: mongoose.Types.ObjectId): Promise<Task> {
    try {
      const task = await this.taskModel.findById(id);
      if (!task.userId.equals(userId)) throw new ForbiddenException('Unauthorized access');
      return await task.populate('userId');
    }catch (error) {
      throw new InternalServerErrorException('Error getting task');
    }
  }

  async update(id: mongoose.Types.ObjectId, updateTaskDto: UpdateTaskDto, userId: mongoose.Types.ObjectId): Promise<Task> {
    try {
      const task = await this.taskModel.findById(id);
      if (!task) throw new NotFoundException('Task not found');
      if (!task.userId.equals(userId)) throw new ForbiddenException('Unauthorized access');
      await this.taskModel.findByIdAndUpdate(id ,
        {
          $set: {title: updateTaskDto.title, description: updateTaskDto.description, startDate: updateTaskDto.startDate, endDate: updateTaskDto.endDate, dueDate: updateTaskDto.dueDate},
        },
        {new: true});
      if (updateTaskDto.addTags.length || updateTaskDto.deleteTags.length) {
        return await this.updateTags(id, updateTaskDto, userId);
      }
      return (await this.findOne(id, userId)).populate('userId');
    } catch (error) {
      throw new InternalServerErrorException('Error updating task');
    }
  }

  async updateTags(id: mongoose.Types.ObjectId, updateTaskDto: UpdateTaskDto, userId: mongoose.Types.ObjectId): Promise<Task> {
    try {
      const task = await this.taskModel.findById(id);
      if (!task) throw new NotFoundException('Task not found');
      if (!task.userId.equals(userId)) throw new ForbiddenException('Unauthorized access');
      if (updateTaskDto.addTags.length) {
        await this.taskModel.findByIdAndUpdate(id,
          {
            $addToSet: {tags: { $each: updateTaskDto.addTags }},
          },
          {new: true});
      }
      if (updateTaskDto.deleteTags.length) {
        await this.taskModel.findByIdAndUpdate
        (id, { $pull: {tags: { $in: updateTaskDto.deleteTags }}}, {new: true});
      }
      return (await this.findOne(id, userId)).populate('userId');
    } catch (error) {
      throw new InternalServerErrorException('Error updating task tags');
    }
  }

  async softDelete(id: mongoose.Types.ObjectId, userId: mongoose.Types.ObjectId): Promise<Task> {
    try {
      const task = await this.taskModel.findById(id);
      if (!task) throw new NotFoundException('Task not found');
      if (!task.userId.equals(userId)) throw new ForbiddenException('Unauthorized access');
      await this.taskModel.findByIdAndUpdate(id, {isDeleted: true}, {new: true});
      return (await this.findOne(id, userId)).populate('userId');
    } catch (error) {
      throw new InternalServerErrorException('Error deleting task');
    }
  }

  
  async remove(id: mongoose.Types.ObjectId, userId: mongoose.Types.ObjectId): Promise<Task> {
    try {
      const task = await this.taskModel.findById(id);
      if (!task) throw new NotFoundException('Task not found');
      if (!task.userId.equals(userId)) throw new ForbiddenException('Unauthorized access');
      return this.taskModel.findByIdAndDelete(id);
    } catch (error) {
      throw new InternalServerErrorException('Error deleting task');
    }
  }
}
