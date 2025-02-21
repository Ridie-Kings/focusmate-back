import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, IsObject } from "class-validator";

export class UpdateProfileDto {
  @ApiProperty({
    example: "Full-stack developer",
    description: "User biography",
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({
    example: "https://example.com/avatar.jpg",
    description: "User avatar URL",
  })
  @IsOptional()
  @IsString()
  avatar?: string;

//   @ApiProperty({
//     example: { theme: "dark", notifications: true },
//     description: "User settings",
//   })
//   @IsOptional()
//   @IsObject()
//   settings?: Record<string, any>;
// 
}