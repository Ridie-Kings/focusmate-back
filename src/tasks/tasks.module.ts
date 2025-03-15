import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { AuthModule } from 'src/auth/auth.module';
import { TaskSchema } from './entities/task.entity'; // Adjust the import path as necessary
import { Task } from './entities/task.entity';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]), AuthModule],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
