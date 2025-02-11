import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { Profile, ProfileSchema } from "./profile.entity";


@Schema({ timestamps: true })
export class User extends Document {
  /**
   * 📌 Nombre completo del usuario.
   */
  @ApiProperty({ example: "Johnan", description: "Full name of the user" })
  @Prop({
    required: true,
    minlength: 3,
  })
  name: string;

  /**
   * 📌 Correo electrónico único del usuario.
   */
  @ApiProperty({
    example: "johnan.sherpp@example.com",
    description: "User email address",
  })
  @Prop({
    required: true,
    unique: true,
  })
  email: string;

  @ApiProperty({ example: "johnan", description: "Unique username" })
  @Prop({
    required: true,
    unique: true,
    minlength: 3,
    maxlength: 128, // Revisar
  })
  username: string;

  @ApiProperty({
    example: "SecurePassword123!",
    description: "User password (hashed)",
  })
  @Prop({
    required: true,
    minlength: 8,
  })
  password: string;

  @ApiProperty({ example: 200, description: "Experience points of the user" })
  @Prop({ default: 0 })
  xp: number;

  @ApiProperty({ example: 5, description: "User level" })
  @Prop({ default: 1 })
  level: number;

  @ApiProperty({ description: "User profile information" })
  @Prop({ type: ProfileSchema, default: () => ({}) })
  profile: Profile;

  @ApiProperty({
    example: "eyJhbGciOiJIUzI1NiIsInR...",
    description: "Refresh token (optional)",
    required: false,
  })
  @Prop({ default: null })
  refreshToken: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
