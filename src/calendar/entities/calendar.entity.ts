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
export const calendarSchema = SchemaFactory.createForClass(Calendar);