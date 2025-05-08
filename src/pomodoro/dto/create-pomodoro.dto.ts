import { IsInt, IsOptional, Min } from "class-validator";


export class CreatePomodoroDto {
  @IsInt()
  @Min(1)
  @IsOptional()
  workDuration?: number; // seconds

  @IsInt()
  @Min(1)
  @IsOptional()
  shortBreak?: number; // seconds

  @IsInt()
  @Min(1)
  @IsOptional()
  longBreak?: number; // seconds

  @IsInt()
  @Min(1)
  @IsOptional()
  cycles?: number;

}
