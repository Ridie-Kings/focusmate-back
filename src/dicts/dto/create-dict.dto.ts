import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";

export class CreateDictDto {
  @IsString()
  @MinLength(3)
  @IsNotEmpty({ message: "Name is required" })
  readonly name: string;

  @IsString()
  @IsOptional()
  readonly description?: string;

  @IsBoolean()
  @IsOptional()
  readonly public?: boolean;
}
