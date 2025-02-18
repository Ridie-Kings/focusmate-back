import { IsOptional } from "class-validator";
import { SharedUser } from "../entities/dict.entity";

export class AddListDictDto {

  @IsOptional()
  readonly tags?: string[];

  @IsOptional()
  readonly sharedWith?: SharedUser[];

  @IsOptional()
  readonly deleteSharedWith?: SharedUser[];

  @IsOptional()
  readonly deleteTags?: string[];
}