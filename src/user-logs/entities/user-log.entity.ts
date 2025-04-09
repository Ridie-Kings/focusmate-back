import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document } from "mongoose";


export class eventLog{
  type: string;
  dateLog: Date;
  object?: mongoose.Types.ObjectId;
  value: number;
}

export type UserLogDocument = UserLog & Document;
@Schema({ timestamps: true, versionKey: false })
export class UserLog extends Document {
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
  @Prop({ type: [eventLog], required: true, default: []})
  logs: eventLog[];
  @Prop({ type: Date, required: false })
  lastLogin: Date;
  @Prop({ type: Date, required: false })
  lastUpdate: Date;
  @Prop({ type: Date, required: false })
  lastPasswordChange: Date;
  @Prop({ type: Date, required: false })
  lastEmailChange: Date;
  @Prop({ type: Number, required: false })
  loginCount: number;
  @Prop({ type: Number, required: false })
  lastSessionDuration: number;
  @Prop({ type: Number, required: false })
  PromedioSessionDuration: number;
  @Prop({ type: Number, required: false })
  totalSessionDuration: number;
  @Prop({ type: Number, required: false })
  totalProfileUpdate: number;
  @Prop({ type: Date, required: false })
  lastProfileUpdate: Date;
  registerTime: Date;

}

export const UserLogSchema = SchemaFactory.createForClass(UserLog);
UserLogSchema.index({ userId: 1 }, { unique: true });