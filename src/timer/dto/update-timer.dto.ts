import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { StartTimerDto } from "./start-timer.dto";
import { IsBoolean, IsMongoId, IsNumber, IsOptional, Min } from "class-validator";

export class UpdateTimerDto extends PartialType(StartTimerDto) {
  @ApiPropertyOptional({
    example: false,
    description: "Indicates if the timer is running or paused",
  })
  @IsOptional()
  @IsBoolean()
  isRunning?: boolean;

  @ApiPropertyOptional({
    example: 120,
    description: "Elapsed time in seconds",
  })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: "Elapsed time must be a positive number" })
  elapsedTime?: number;

  @ApiPropertyOptional({
    example: "605f3a6e9b0f4c001f9d2c5b",
    description: "Task ID",
  })
  @IsOptional()
  @IsMongoId()
  task?: string;

  @ApiPropertyOptional({
    example: "2021-03-28T17:00:00.000Z",
    description: "End time of the timer",
  })
  @IsOptional()
  endTime?: Date;
}
