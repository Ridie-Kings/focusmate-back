
import { IsMongoId, IsArray, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import mongoose from "mongoose";

export class CreateCalendarDto {
  @ApiProperty({
    description: "Array of Task IDs",
    example: ["507f1f77bcf86cd799439011"],
  })
  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  tasks?: mongoose.Types.ObjectId[];

  @ApiProperty({
    description: "Array of Event IDs",
    example: ["507f1f77bcf86cd799439011"],
  })
  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  events?: mongoose.Types.ObjectId[];

  @ApiProperty({
    description: "Array of Reminder IDs",
    example: ["507f1f77bcf86cd799439011"],
  })
  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  reminders?: mongoose.Types.ObjectId[];
}