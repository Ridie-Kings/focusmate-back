import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
} from "class-validator";

export class LoginUserDto {
  @IsEmail({}, { message: "invalid email format" })
  readonly email: string;

  @IsString()
  @IsNotEmpty({ message: "Password is required" })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;
}
