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

  @Prop({ type: Date, required: true })
  startDate: Date;

  @Prop({ type: Date, required: true })
  endDate: Date;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true })
  user: mongoose.Types.ObjectId;
}

export const EventsCalendarSchema = SchemaFactory.createForClass(EventsCalendar);
EventsCalendarSchema.index({ user: 1 });
EventsCalendarSchema.index({ startDate: 1 });
EventsCalendarSchema.index({ endDate: 1 });
EventsCalendarSchema.index({ user: 1, startDate: 1 });
EventsCalendarSchema.index({ user: 1, endDate: 1 });
EventsCalendarSchema.index({ category: 1 });
EventsCalendarSchema.index({_id: 1});