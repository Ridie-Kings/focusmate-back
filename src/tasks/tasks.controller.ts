import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ParseMongoIdPipe } from 'src/common/pipes/parse-mongo-id.pipe';
import { GetUser } from 'src/users/decorators/get-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { Task } from './entities/task.entity';
import mongoose from 'mongoose';


@ApiTags('Tasks')
@ApiBearerAuth()
@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({ status: 201, description: 'Task successfully created' })
  @ApiResponse({ status: 400, description: 'Invalid data provided' })
  async create(
    @Body() createTaskDto: CreateTaskDto,
    @GetUser() user: User
  ): Promise<Task> 
  {
    return this.tasksService.create(createTaskDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all tasks' })
  @ApiResponse({ status: 200, description: 'List of tasks retrieved' })
  @ApiResponse({ status: 403, description: 'Unauthorized access' })
  async findAll(
    @GetUser() user: User
  ) {
    return this.tasksService.findAll(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a task by ID' })
  @ApiResponse({ status: 200, description: 'Task successfully retrieved' })
  @ApiResponse({ status: 403, description: 'Unauthorized access' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async findOne(
    @Param('id', ParseMongoIdPipe) id: mongoose.Types.ObjectId,
    @GetUser() user: User
  ): Promise<Task>
  {
    return this.tasksService.findOne(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a task by ID' })
  @ApiResponse({ status: 200, description: 'Task updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid data provided' })
  @ApiResponse({ status: 403, description: 'Unauthorized access' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async update(
    @Param('id', ParseMongoIdPipe) id: mongoose.Types.ObjectId, 
    @Body() updateTaskDto: UpdateTaskDto,
    @GetUser() user: User
  ): Promise<Task> 
  {
    return this.tasksService.update(id, updateTaskDto, user.id);
  }

  @Patch('/addTags/:id')
  @ApiOperation({ summary: 'Update a task by ID' })
  @ApiResponse({ status: 200, description: 'Task updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid data provided' })
  @ApiResponse({ status: 403, description: 'Unauthorized access' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async updateTags(
    @Param('id', ParseMongoIdPipe) id: mongoose.Types.ObjectId, 
    @Body() updateTaskDto: UpdateTaskDto,
    @GetUser() user: User
  ): Promise<Task> 
  {
    return this.tasksService.updateTags(id, updateTaskDto, user.id);
  }

  // @Patch('/addDates/:id')
  // @ApiOperation({ summary: 'Update a task by ID' })
  // @ApiResponse({ status: 200, description: 'Task updated successfully' })
  // @ApiResponse({ status: 400, description: 'Invalid data provided' })
  // @ApiResponse({ status: 403, description: 'Unauthorized access' })
  // @ApiResponse({ status: 404, description: 'Task not found' })
  // async updateDates(
  //   @Param('id', ParseMongoIdPipe) id: string, 
  //   @Body() updateTaskDto: UpdateTaskDto,
  //   @GetUser() user: User
  // ): Promise<Task> 
  // {
  //   return this.tasksService.updateDates(id, updateTaskDto, user.id);
  // }

  // @Patch('/status/:id')
  // @ApiOperation({ summary: 'Update a task by ID' })
  // @ApiResponse({ status: 200, description: 'Task updated successfully' })
  // @ApiResponse({ status: 400, description: 'Invalid data provided' })
  // @ApiResponse({ status: 403, description: 'Unauthorized access' })
  // @ApiResponse({ status: 404, description: 'Task not found' })
  // async updateStatus(
  //   @Param('id', ParseMongoIdPipe) id: string, 
  //   @Body() updateTaskDto: UpdateTaskDto,
  //   @GetUser() user: User
  // ): Promise<Task> 
  // {
  //   return this.tasksService.updateStatus(id, updateTaskDto, user.id);
  // }

  @Patch('/softDelete/:id')
  @ApiOperation({ summary: 'Update a task by ID' })
  @ApiResponse({ status: 200, description: 'Task updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid data provided' })
  @ApiResponse({ status: 403, description: 'Unauthorized access' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async softDelete(
    @Param('id', ParseMongoIdPipe) id: mongoose.Types.ObjectId, 
    @Body() updateTaskDto: UpdateTaskDto,
    @GetUser() user: User): Promise<Task>
    {    
      return this.tasksService.softDelete(id, user.id);
    }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a task by ID' })
  @ApiResponse({ status: 200, description: 'Task deleted successfully' })
  @ApiResponse({ status: 403, description: 'Unauthorized access' })
  remove(
    @Param('id', ParseMongoIdPipe) id: mongoose.Types.ObjectId,
    @GetUser() user: User
  ): Promise<Task>
  {
    return this.tasksService.remove(id, user.id);
  }
}
