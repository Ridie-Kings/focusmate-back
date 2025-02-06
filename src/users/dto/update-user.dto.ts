import { PartialType } from "@nestjs/mapped-types";
import { CreateUserDto } from "./create-user.dto";
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateUserDto extends PartialType(CreateUserDto) {

  @ApiProperty({
    example: "john.sherp@example.com",
    description: "User email (optional)",
    required: false,
  })
  @IsEmail()
  @IsOptional()
  readonly email?: string;

  @ApiProperty({
    example: "NewSecurePassword123!",
    description: "User password (optional, min 8 characters)",
    required: false,
  })
  @IsString()
  @MinLength(8, { message: "Password must be at least 8 characters long" })
  @IsOptional()
  password?: string;

  @ApiProperty({
    example: 150,
    description: "User XP points (optional)",
    required: false,
  })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  readonly xp?: number;

 
  @ApiProperty({
    example: 5,
    description: "User level (optional)",
    required: false,
  })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  readonly level?: number;


  @ApiProperty({
    example: { bio: "Gamer and student", avatar: "avatar_url" },
    description: "User profile (optional)",
    required: false,
  })
  @IsNotEmpty()
  @IsOptional()
  readonly profile?: Record<string, any>;

  
  @ApiProperty({
    example: "NewSecurePassword123!",
    description: "New password for user (optional, min 8 characters)",
    required: false,
  })
  @IsString()
  @MinLength(8, { message: "Password must be at least 8 characters long" })
  @IsOptional()
  readonly updatedPassword?: string;


  @ApiProperty({
    example: "eyJhbGciOiJIUzI1NiIsInR...",
    description: "Refresh token (optional)",
    required: false,
  })
  @IsOptional()
  @IsString()
  refreshToken?: string;
}
