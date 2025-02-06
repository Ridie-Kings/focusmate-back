import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { ApiProperty } from "@nestjs/swagger";

/**
 * 📌 Perfil del usuario que contiene información adicional.
 */
class Profile {
  /**
   * 📌 Biografía del usuario.
   */
  @ApiProperty({
    example: "Full-stack developer",
    description: "User biography",
  })
  @Prop({ type: String, default: "" }) // Solo permite strings
  bio: string;

  /**
   * 📌 URL del avatar del usuario.
   */
  @ApiProperty({
    example: "https://example.com/avatar.jpg",
    description: "User avatar URL",
  })
  @Prop({ type: String, default: "" }) // Solo permite strings
  avatar: string;

  /**
   * 📌 Configuración personalizada del usuario.
   */
  @ApiProperty({
    example: { theme: "dark", notifications: true },
    description: "User settings",
  })
  @Prop({ type: Map, of: String, default: {} }) // Valida como mapa de strings
  settings: Record<string, any>;
}

const ProfileSchema = SchemaFactory.createForClass(Profile);

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
  @Prop({ type: Profile, default: {} })
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
