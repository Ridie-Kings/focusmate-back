import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document } from "mongoose";

export type EventsCalendarDocument = EventsCalendar & Document;
@Schema({ timestamps: true, versionKey: false })
export class EventsCalendar {}

export const EventsCalendarSchema = SchemaFactory.createForClass(EventsCalendar);