import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateHabitDto } from './create-habit.dto';
import mongoose from 'mongoose';
import { IsMongoId, IsOptional } from 'class-validator';

export class UpdateHabitDto extends PartialType(CreateHabitDto) {

  @ApiProperty({ description: 'TaskID', example: '289bnfsd01bas0123' })
  @IsOptional()
  @IsMongoId()
  taskId: mongoose.Types.ObjectId;

  @ApiProperty({ description: 'Status', example: 'true' })
  status: boolean;

  @ApiProperty({ description: 'Streak', example: '5' })
  streak: number;
}
