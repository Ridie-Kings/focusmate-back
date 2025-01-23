import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, MinLength } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {

  @IsEmail()
  @IsOptional()
  readonly email?: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @IsOptional()
  password?: string;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  readonly xp?: number;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  readonly level?: number;

  @IsNotEmpty()
  @IsOptional()
  readonly profile?: Record<string, any>;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @IsOptional()
  readonly new_password?: string;

}
