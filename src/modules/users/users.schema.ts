import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema()
export class User extends Document {
  @Prop()
  name: string;

  @Prop({require: true, unique: true,  match: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,})
  email: string;

  @Prop({require: true, unique: true, minlength: 3})
  username: string;

  @Prop({require: true, minlength: 8})
  password: string;

  @Prop({ default: 0 })
  xp: number;

  @Prop({ default: 1 })
  level: number;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: null })
  updatedAt: Date;

  @Prop({ default: null })
  deletedAt: Date;

  @Prop({ type: Object, default: {} })
  profile: Record<string, any>;
  
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', function (next) {
  this.updatedAt = new Date(); // Actualiza updatedAt antes de guardar
  next();
});

UserSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updatedAt: new Date() }); // Actualiza updatedAt en operaciones de update
  next();
});

UserSchema.pre('updateOne', function (next) {
  this.set({ updatedAt: new Date() }); // Asegura que updatedAt se actualiza también aquí
  next();
});
