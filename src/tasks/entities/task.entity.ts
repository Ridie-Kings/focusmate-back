import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document } from "mongoose";

export type TaskDocument = Task & Document;
@Schema({ timestamps: true, versionKey: false })
export class Task extends Document{

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true })
  userId: mongoose.Types.ObjectId;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({type: String, required: false, default: ""}) 
  description: string;

  @Prop({ required: true, enum: ["completed", "pending", "started", "dropped"] }) // Tipos de permisos
  status: string;

  @Prop({ type: Date, required: false })
  startDate?: Date;

  @Prop({ type: Date, required: false })
  endDate?: Date;

  @Prop({ type: Date, required: false })
  dueDate?: Date;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;

  @Prop({ type: [String], default: [], required: false })
  tags: string[];

}

export const TaskSchema = SchemaFactory.createForClass(Task);