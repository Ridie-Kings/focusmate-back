import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document } from "mongoose";

export type EventsCalendarDocument = EventsCalendar & Document;
@Schema({ timestamps: true, versionKey: false })
export class EventsCalendar {
  @Prop({ type: String, required: true, maxlength: 25 })
  title: string;

  @Prop({ type: String, required: false, maxlength: 100 })
  description?: string;

  @Prop({ type: String, required: false, maxlength: 50 })
  location?: string;

  @Prop({ type: String, required: true, maxlength: 25, default: "General" })
  category: string;

  @Prop({ type: String, required: true })
  startDate: string;

  @Prop({ type: String, required: true })
  endDate: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true })
  user: mongoose.Types.ObjectId;
}

export const EventsCalendarSchema = SchemaFactory.createForClass(EventsCalendar);