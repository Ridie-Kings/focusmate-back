import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document, mongo } from "mongoose";

export type TimerDocument = Timer & Document;
@Schema({ timestamps: true,
  versionKey: false,
})
export class Timer extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true })
  user: mongoose.Types.ObjectId;

  @Prop({ type: String, required: true })
  title: string

  @Prop({ type: mongoose.Schema.Types.ObjectId, required: false })
  task?: mongoose.Types.ObjectId;

  @Prop({ type: Number, default: 0 })
  elapsedTime: number;

  @Prop({ type: Boolean, default: false })
  isRunning: boolean;
  
  @Prop({ type: Date })
  endTime?: Date;
}

export const TimerSchema = SchemaFactory.createForClass(Timer);