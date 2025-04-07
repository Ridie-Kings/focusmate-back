import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, MinLength } from "class-validator";

export class StartTimerDto {
  @ApiProperty({
    example: "studying-math",
    description: "Task ID or activity name",
  })
  @IsString()
  @MinLength(3, { message: "Task name must be at least 3 characters long" })
  @IsOptional()
  task: string;

  @ApiProperty({
    example: "Studying Math",
    description: "Activity name",
  })
  @IsString()
  @MinLength(3, { message: "Timer name must be at least 3 characters long" })
  title: string;
}
