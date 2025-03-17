import { IsString, IsNotEmpty, IsOptional, IsEnum, IsArray, IsMongoId, isDate, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum TaskStatus {
  COMPLETED = 'completed',
  PENDING = 'pending',
  STARTED = 'started',
  DROPPED = 'dropped',
}

export class CreateTaskDto{

  @ApiProperty({ description: 'Title of the Task', example: 'Task' })
  @IsString()
  @IsNotEmpty()
  readonly title: string;

  @ApiProperty({ description: 'Description of the Task', example: 'Description' })
  @IsString()
  @IsOptional()
  readonly description?: string;

  @ApiProperty({ description: 'Status of the Task', example: 'completed' })
  @IsEnum(TaskStatus)
  @IsNotEmpty()
  readonly status: TaskStatus;

  @ApiProperty({ description: 'Start Date of the Task', example: '2025-02-24T00:00:00Z' })
  @IsOptional()
  @IsDate()
  readonly startDate?: Date;

  @ApiProperty({ description: 'End Date of the Task', example: '2025-02-28T23:59:59Z' })
  @IsOptional()
  @IsDate()
  readonly endDate?: Date;

  @ApiProperty({ description: 'Due Date of the Task', example: '2025-02-28T23:59:59Z' })
  @IsOptional()
  @IsDate()
  readonly dueDate?: Date;

  @ApiProperty({ description: 'tags of the task', example: ['tag1', 'tag2'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  readonly tags?: string[];
}
