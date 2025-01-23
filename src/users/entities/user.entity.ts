import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({})
  name: string;

  @Prop({
    require: true,
    unique: true,
  })
  email: string;

  @Prop({
    required: true,
    unique: true,
    minlength: 3,
    maxlength: 20, //revisar
  })
  username: string;

  @Prop({
    require: true,
    minlength: 8,
  })
  password: string;

  @Prop({ default: 0 })
  xp: number;

  @Prop({ default: 1 })
  level: number;

  @Prop({ type: Object, default: {} }) //USAR INTERFAZ??
  profile: Record<string, any>; //imagen, descripcion, etc
}

export const UserSchema = SchemaFactory.createForClass(User);
