import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({
    required: true,
  })
  name: string;

  @Prop({
    required: true,
    unique: true,
  })
  email: string;

  @Prop({
    required: true,
    unique: true,
  })
  username: string;

  @Prop({
    required: true,
  })
  password: string;

  @Prop({ default: 0 })
  xp: number;

  @Prop({ default: 1 })
  level: number;

  @Prop({ type: Object, default: {} }) //USAR INTERFAZ??
  profile: Record<string, any>; //imagen, descripcion, etc

  @Prop({ default: null })
  refreshToken: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
