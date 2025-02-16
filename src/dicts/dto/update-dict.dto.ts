import { PartialType } from "@nestjs/mapped-types";
import { CreateDictDto } from "./create-dict.dto";
import { IsOptional, IsString, MinLength, IsBoolean } from "class-validator";

export class UpdateDictDto extends PartialType(CreateDictDto) {
  @IsString()
  @MinLength(3)
  @IsOptional()
  readonly name?: string;

  @IsString()
  @IsOptional()
  readonly description?: string;

  @IsBoolean()
  @IsOptional()
  readonly public?: boolean;  

  @IsOptional()
  readonly tags?: string[];
}
