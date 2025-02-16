import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { StartTimerDto } from "./start-timer.dto";
import { IsBoolean, IsMongoId, IsNumber, IsOptional, Min } from "class-validator";

export class UpdateTimerDto extends PartialType(StartTimerDto) {
  @ApiProperty({ example: "65f2c3d8c9a7b98f7e4d1234", description: "Timer ID" })
  @IsMongoId({ message: "Invalid Timer ID" })
  timerId: string;

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
}
