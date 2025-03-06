import { IsNotEmpty, IsNumber, IsOptional, IsString, IsEnum, IsBoolean } from 'class-validator';
import { RewardType } from '../entities/reward.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRewardDto {
  
  @ApiProperty({ description: 'XP of the Reward', example: 100 })
  @IsNumber()
  @IsNotEmpty()
  xp: number;

  @ApiProperty({ description: 'Coins of the Reward', example: 10 })
  @IsOptional()
  @IsNumber()
  coins?: number;

  @ApiProperty({ description: 'Title of the Reward', example: 'Reward' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ description: 'Description of the Reward', example: 'Reward description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Banner of the Reward', example: 'reward-banner' })
  @IsOptional()
  @IsString()
  banner?: string;

  @ApiProperty({ description: 'Frame of the Reward', example: 'reward-frame' })
  @IsOptional()
  @IsString()
  frame?: string;

  @ApiProperty({ description: 'Avatar of the Reward', example: 'reward-avatar' })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiProperty({ description: 'Type of the Reward', example: 'badge' })
  @IsEnum(['badge', 'quest', 'streak', 'other'])
  @IsNotEmpty()
  type: RewardType;

  @ApiProperty({ description: 'active or not reward', example: 'reward-status' })
  @IsBoolean()
  @IsNotEmpty()
  active: boolean;
}
