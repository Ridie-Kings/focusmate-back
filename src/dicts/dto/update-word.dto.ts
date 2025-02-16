import { IsBoolean, IsOptional, IsString } from "class-validator";
import { AddWordDto } from "./add-word.dto";
import { PartialType } from "@nestjs/mapped-types";

export class UpdateWordDto extends PartialType(AddWordDto) {
  @IsString()
  @IsOptional()
  readonly word?: string;

  @IsString()
  @IsOptional()
  readonly meaning?: string;

  @IsBoolean()
  @IsOptional()
  readonly example?: boolean;
}
