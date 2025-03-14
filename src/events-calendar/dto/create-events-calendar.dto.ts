import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class CreateEventsCalendarDto {
  @ApiProperty({
    example: "Meeting",
    description: "Event title",
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(25)
  readonly title: string;

  @ApiProperty({
    example: "Meeting with the team",
    description: "Event description",
  })
  @IsString()
  @MaxLength(100)
  description?: string;

  @ApiProperty({
    example: "Office",
    description: "Event location",
  })
  @IsString()
  @MaxLength(50)
  readonly location?: string;

  @ApiProperty({
    example: "2021-12-31T23:59:59",
    description: "Event start date",
  })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({
    example: "2021-12-31T23:59:59",
    description: "Event end date",
  })
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    example: "General",
    description: "Event category",
  })
  @IsString()
  @MaxLength(25)
  readonly category?: string;
}
