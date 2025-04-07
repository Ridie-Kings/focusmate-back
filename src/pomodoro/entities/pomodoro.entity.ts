// src/pomodoro/pomodoro.model.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type PomodoroDocument = Pomodoro & Document;
@Schema({ timestamps: true, versionKey: false })
export class Pomodoro extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  userId: mongoose.Types.ObjectId;

  @Prop({ type: Date, required: true })
  startTime: Date;

  @Prop({ type: Date})
  endTime: Date;

  @Prop({ type: Number, required: true })
  duration: number;

  @Prop({ type:Boolean, default: false })
  completed: boolean;

  @Prop({ type:Boolean, default: false })
  active: boolean;

  @Prop({ type: Number, requiered: true })
  remainingTime: number; 
}

export const PomodoroSchema = SchemaFactory.createForClass(Pomodoro);
