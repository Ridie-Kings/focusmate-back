import { ForbiddenException, Injectable, InternalServerErrorException, NotFoundException, Logger } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task, TaskDocument } from './entities/task.entity';
import mongoose, { Model, mongo } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { EventsList } from 'src/events/list.events';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DiscordWebhookService } from '../webhooks/discord-webhook.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
    private eventEmitter: EventEmitter2,
    private readonly discordWebhookService: DiscordWebhookService,
    private readonly usersService: UsersService,
  ) {}

  async create(createTaskDto: CreateTaskDto, userId: mongoose.Types.ObjectId) {
    this.logger.debug('Creating task with DTO:', createTaskDto);
    try {
      const task = await this.taskModel.create({
        ...createTaskDto,
        userId: userId,
      });
      this.eventEmitter.emit(EventsList.TASK_CREATED, {userId: userId, taskId: task._id});
      
      return task;
    } catch (error) {
      console.error('Error creating task:', error);
      throw new InternalServerErrorException('Error creating task');
    }
  }
  // private async checkTaskDates(date: Date): Promise<boolean> {
  //   const allTasks = await this.taskModel.find({});
  //   return allTasks.some(task => {
  //     const taskDate = new Date(task.dueDate);
  //     return taskDate.toDateString() === date.toDateString();
  //   });
    
  // }

  async findAll(userId: mongoose.Types.ObjectId): Promise<TaskDocument[]> {
    try {
      return await this.taskModel.find({userId: userId});
    }catch (error) {
      throw new InternalServerErrorException('Error getting tasks');
    }
  }

  async findOne(id: mongoose.Types.ObjectId, userId: mongoose.Types.ObjectId): Promise<TaskDocument> {
    try {
      const task = await this.taskModel.findById(id);
      if (!task) throw new NotFoundException('Task not found');
      if (!task.userId.equals(userId)) throw new ForbiddenException('Unauthorized access');
      if(task.subTasks.length > 0) {
        return await task.populate('subTasks');
      }
      return task.populate('userId');
    }catch (error) {
      console.error('Error getting task:', error);
      throw new InternalServerErrorException('Error getting task');
    }
  }

  async update(id: mongoose.Types.ObjectId, updateTaskDto: UpdateTaskDto, userId: mongoose.Types.ObjectId): Promise<TaskDocument> {
    this.logger.debug('Updating task with DTO:', updateTaskDto);
    try {
      const task = await this.taskModel.findById(id);
      if (!task) throw new NotFoundException('Task not found');
      if (!task.userId.equals(userId)) throw new ForbiddenException('Unauthorized access');
      
      if (updateTaskDto.addTags || updateTaskDto.deleteTags) {
        return await this.updateTags(id, updateTaskDto, userId);
        updateTaskDto.addTags = null;
        updateTaskDto.deleteTags = null;
      }
      
      const updatedTask = await this.taskModel.findByIdAndUpdate(id,
        {
          ...updateTaskDto,
        },
        {new: true});
      
      return updatedTask;
    } catch (error) {
      console.error('Error updating task:', error);
      throw new InternalServerErrorException('Error updating task');
    }
  }

  async updateTags(id: mongoose.Types.ObjectId, updateTaskDto: UpdateTaskDto, userId: mongoose.Types.ObjectId): Promise<TaskDocument> {
    try {
      const task = await this.taskModel.findById(id);
      if (!task) throw new NotFoundException('Task not found');
      if (!task.userId.equals(userId)) throw new ForbiddenException('Unauthorized access');
      if (updateTaskDto.status === 'completed') {
        this.eventEmitter.emit(EventsList.TASK_COMPLETED, {userId: userId, taskId: task._id});
      }
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
      return (await this.findOne(id, userId));
    } catch (error) {
      throw new InternalServerErrorException('Error updating task tags');
    }
  }

  async softDelete(id: mongoose.Types.ObjectId, userId: mongoose.Types.ObjectId): Promise<TaskDocument> {
    try {
      const task = await this.taskModel.findById(id);
      if (!task) throw new NotFoundException('Task not found');
      if (!task.userId.equals(userId)) throw new ForbiddenException('Unauthorized access');
      await this.taskModel.findByIdAndUpdate(id, {isDeleted: true}, {new: true});
      this.eventEmitter.emit(EventsList.TASK_DELETED, {userId: userId, taskId: task._id});
      return (await this.findOne(id, userId)).populate('userId');
    } catch (error) {
      throw new InternalServerErrorException('Error deleting task');
    }
  }

  
  async remove(id: mongoose.Types.ObjectId, userId: mongoose.Types.ObjectId): Promise<TaskDocument> {
    try {
      const task = await this.taskModel.findById(id);
      if (!task) throw new NotFoundException('Task not found');
      if (!task.userId.equals(userId)) throw new ForbiddenException('Unauthorized access');
      this.eventEmitter.emit(EventsList.TASK_DELETED, {userId: userId, taskId: task._id});
      return this.taskModel.findByIdAndDelete(id);
    } catch (error) {
      throw new InternalServerErrorException('Error deleting task');
    }
  }

  async createSubtask(id: mongoose.Types.ObjectId, subtask: CreateTaskDto, userId: mongoose.Types.ObjectId): Promise<TaskDocument> {
    try {
      const task = await this.taskModel.findById(id);
      if (!task) throw new NotFoundException('Task not found');
      if (!task.userId.equals(userId)) throw new ForbiddenException('Unauthorized access');
      const newSubtask = await this.taskModel.create({
        ...subtask,
        userId,
      });
      const parentTask = await this.taskModel.findByIdAndUpdate(id, { $push: {subtasks: newSubtask._id}}, {new: true});
      return parentTask.populate('userId');
    } catch (error) {
      throw new InternalServerErrorException('Error creating subtask');
    }
  }

  // async getSubtasks(id: mongoose.Types.ObjectId, userId: mongoose.Types.ObjectId): Promise<TaskDocument> {
  //   try {
  //     const task = await this.taskModel.findById(id);
  //     if (!task) throw new NotFoundException('Task not found');
  //     if (!task.userId.equals(userId)) throw new ForbiddenException('Unauthorized access');
  //     return task.populate('subtasks');
  //   } catch (error) {
  //     throw new InternalServerErrorException('Error getting subtasks');
  //   }
  // }

  // async getTasksByTags(tagsArray: string[] ,userId: mongoose.Types.ObjectId): Promise<TaskDocument[]> {
  //   try {
  //     const tasks = await this.taskModel.find({tags: tagsArray, userId});
  //     return tasks;
  //   } catch (error) {
  //     throw new InternalServerErrorException('Error getting tasks by tags');
  //   }
  // }

  async getTasksByPriority(priority: string, userId: mongoose.Types.ObjectId): Promise<TaskDocument[]> {
    try {
      const tasks = await this.taskModel.find({priority, userId});
      return tasks;
    } catch (error) {
      throw new InternalServerErrorException('Error getting tasks by priority');
    }
  }

  async getTasksByCategory(category: string, userId: mongoose.Types.ObjectId): Promise<TaskDocument[]> {
    try {
      const tasks = await this.taskModel.find({category, userId});
      return tasks;
    } catch (error) {
      throw new InternalServerErrorException('Error getting tasks by category');
    }
  }

  // async findAllCategories(userId: mongoose.Types.ObjectId): Promise<string[]> {
  //     const tasks = await this.taskModel.aggregate([
  //       {
  //         $match: { user: userId },
  //       },
  //       {
  //         $project: {
  //           categories: {
  //             $setUnion: [
  //               { $map: { input: "$tasks", as: "task", in: "$$task.category" } },
  //             ],
  //           },
  //         },
  //       },
  //     ]);
  
  //     return tasks.length > 0 ? tasks[0].categories : [];
  //   }
}
