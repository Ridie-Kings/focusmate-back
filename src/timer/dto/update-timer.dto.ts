import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { StartTimerDto } from "./create-timer.dto";
import { IsBoolean, IsMongoId, IsNumber, IsOptional } from "class-validator";

export class UpdateTimerDto extends PartialType(StartTimerDto) {
  @ApiProperty({ example: "65f2c3d8c9a7b98f7e4d1234", description: "Timer ID" })
  @IsMongoId()
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
  elapsedTime?: number;
}
