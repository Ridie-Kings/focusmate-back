import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { getDefaultAutoSelectFamily } from "net";

@Schema({ timestamps: true })
export class Timer extends Document {
  @Prop({ type: String, ref: "User", required: true })
  user: string;

  @Prop({ type: String, required: true })
  task: string;

  @Prop({ type: Number, default: 0 })
  elapsedTime: number;

  @Prop({ type: Boolean, default: false })
  isRunning: boolean;

  @Prop({ type: Date})
  startedAt?: Date;
}

export const TimerSchema = SchemaFactory.createForClass(Timer);