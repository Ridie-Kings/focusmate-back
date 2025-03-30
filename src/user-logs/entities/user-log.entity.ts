import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document } from "mongoose";

export type UserLogDocument = UserLog & Document;
@Schema({ timestamps: true, versionKey: false })
export class UserLog {
  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true })
  userId: mongoose.Types.ObjectId;
  @Prop({ type: Number, required: false, default: 0 })
  habitCounts: number;
  @Prop({ type: Number, required: false, default: 0 })
  taskCounts: number;
  @Prop({ type: Number, required: false, default: 0 })
  questCounts: number;
  @Prop({ type: Number, required: false, default: 0 })
  reminderCounts: number;
  @Prop({ type: Number, required: false, default: 0 })
  badgeCounts: number;
  @Prop({ type: Number, required: false, default: 0 })
  


}
