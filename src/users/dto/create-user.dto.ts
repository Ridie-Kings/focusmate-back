import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";

export class CreateUserDto {
  @IsEmail({}, { message: "invalid email format" })
  readonly email: string;

  @IsString()
  @IsNotEmpty({ message: "Username is required" })
  readonly username: string;

  @IsString()
  @IsNotEmpty({ message: "Password is required" })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;
}
