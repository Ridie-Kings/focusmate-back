import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document } from "mongoose";


export type CalendarDocument = Calendar & Document;
@Schema({ timestamps: true })
export class Calendar extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true })
  user: mongoose.Types.ObjectId;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],
    default: [],
  })
  tasks: mongoose.Types.ObjectId[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],
    default: [],
  })
  events: mongoose.Types.ObjectId[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Reminder" }],
    default: [],
  })
  reminders: mongoose.Types.ObjectId[];
}
export const CalendarSchema = SchemaFactory.createForClass(Calendar);
CalendarSchema.index({ userId: 1 });
CalendarSchema.index({ startDate: 1 });
CalendarSchema.index({ endDate: 1 });
CalendarSchema.index({ userId: 1, startDate: 1 });
CalendarSchema.index({ userId: 1, endDate: 1 });
CalendarSchema.index({ tasks: 1 });
CalendarSchema.index({ events: 1 });
CalendarSchema.index({ reminders: 1 });
CalendarSchema.index({ tasks: 1, events: 1, reminders: 1 });
