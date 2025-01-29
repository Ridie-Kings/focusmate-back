import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

class Profile{
  @Prop()
  image: string;

  @Prop()
  description: string;

  @Prop()
  banner: string;
}

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

  @Prop({ type: Profile, default: {} }) //USAR INTERFAZ??
  profile: Profile[]; //imagen, descripcion, etc

  @Prop({ default: null })
  refreshToken: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
