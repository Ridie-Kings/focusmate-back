import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document } from "mongoose";
// import { Profile, ProfileSchema } from "./profile.entity";

// export class Profile {
//   @Prop({ default: "" })
//   bio: string;
//   @Prop({ default: "" })
//   avatar: string;
//   //settings: Record<string, any>;
// }

export type UserDocument = User & Document;
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

  // @Prop({ default: 0 })
  // xp: number;

  // @Prop({ default: 1 })
  // level: number;

  // @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "Profile", req: true })
  // profile: mongoose.Types.ObjectId;

  @Prop({ default: null })
  refreshToken: string;

  @Prop({ default: null })
  stripeCustomerId: string;

}

export const UserSchema = SchemaFactory.createForClass(User);
//UserSchema.index({ _id: 1 });