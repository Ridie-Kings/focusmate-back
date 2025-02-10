import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class StartTimerDto {
  @ApiProperty({
    example: "studying-math",
    description: "Task ID or activity name",
  })
  @IsString()
  task: string;
}
