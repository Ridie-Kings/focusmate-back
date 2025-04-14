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

  @Prop({ type: Date })
  endTime: Date;

  @Prop({ type: Number, required: true })
  duration: number;

  @Prop({ type: Boolean, default: false })
  completed: boolean;

  @Prop({ type: Boolean, default: true })
  active: boolean;

  @Prop({ type: Boolean, default: false })
  isPaused: boolean;

  @Prop({ type: Number, required: true })
  remainingTime: number;
  
  @Prop({ type: String, enum: ['pomodoro', 'shortBreak', 'longBreak'], default: 'pomodoro' })
  type: string;
  
  @Prop({ type: Number, default: 0 })
  interruptions: number;
  
  @Prop({ type: mongoose.Schema.Types.Mixed })
  metadata: Record<string, any>;
}

export const PomodoroSchema = SchemaFactory.createForClass(Pomodoro);
