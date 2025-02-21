import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { Profile, ProfileSchema } from "./profile.entity";

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({
    required: true,
    minlength: 3,
  })
  fullname: string;

  @Prop({
    required: true,
    unique: true,
  })
  email: string;

  @Prop({
    required: true,
    unique: true,
    minlength: 3,
    maxlength: 128, // Revisar
  })
  username: string;

  @Prop({
    required: true,
    minlength: 8,
  })
  password: string;

  @Prop({ default: 0 })
  xp: number;

  @Prop({ default: 1 })
  level: number;

  @Prop({ type: ProfileSchema, default: () => ({}) })
  profile: Profile;

  @Prop({ default: null })
  refreshToken: string;
}

export const UserSchema = SchemaFactory.createForClass(User);