import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";

export class AddWordDto {
  @IsString()
  @IsNotEmpty()
  readonly word: string;

  @IsString()
  @IsNotEmpty()
  readonly meaning: string;

  @IsBoolean()
  @IsOptional()
  readonly example?: boolean;
}
