import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({
    require: true,
    unique: true,
    match: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
  })
  email: string;

  @Prop({
    required: true,
    unique: true,
    minlength: 3,
    maxlength: 20,
    match: /^[a-zA-Z0-9_]+$/,
  })
  username: string;

  @Prop({
    require: true,
    minlength: 8,
    maxlength: 20,
    match: /^[a-zA-Z0-9_]+$/,
  })
  password: string;

  @Prop({ default: 0 })
  xp: number;

  @Prop({ default: 1 })
  level: number;

  @Prop({ type: Object, default: {} })
  profile: Record<string, any>;
}

export const UserSchema = SchemaFactory.createForClass(User);
