import {
  IsString,
  IsOptional,
  IsDateString,
  IsEnum,
  IsBoolean,
} from "class-validator";

export class CreateReminderDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsEnum(["active", "completed", "cancelled"])
  status?: string;

  @IsOptional()
  @IsBoolean()
  repeat?: boolean;

  @IsOptional()
  @IsEnum(["daily", "weekly", "monthly"])
  repeatInterval?: string;
}
