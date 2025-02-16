import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

class Word {
  @Prop({ required: true })
  word: string;

  @Prop({ required: true })
  definition: string;

  @Prop()
  example?: string;
}

class SharedUser {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true, enum: ["viewer", "editor"] }) // Tipos de permisos
  role: string;
}

@Schema({ timestamps: true })
export class Dict extends Document {
  @Prop({
    required: true,
    minlength: 3,
  })
  name: string;

  @Prop({ required: true, ref: "User" })
  ownerId: string;

  @Prop({type: String, required: false, default: ""})
  description: string;

  @Prop({ default: false })
  public: boolean;

  @Prop({ type: [Word], default: [] })
  words: Word[];

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ type: [SharedUser], default: [] })
  sharedWith: SharedUser[];

  @Prop({ type: [String], default: [] })
  tags: string[];
}

export const DictSchema = SchemaFactory.createForClass(Dict);
