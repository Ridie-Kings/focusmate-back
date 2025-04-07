import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class CreateUserDto {
  @ApiProperty({
    example: "johnan.sherp@example.com",
    description: "User email",
  })
  @IsEmail()
  email: string;

  @ApiProperty({ example: "johnan", description: "Unique username" })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: "Johnan", description: "Full name of the user" })
  @IsString()
  @IsNotEmpty()
  fullname: string;

  @ApiProperty({
    example: "StrongPassword123!",
    description: "User password (min 8 characters)",
  })
  @IsString()
  @MinLength(8)
  password: string;
}