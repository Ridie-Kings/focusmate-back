import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document } from "mongoose";


@Schema({ timestamps: true })
export class Badge extends Document {

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: String, required: true })
  icon: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Rewards' })
  reward: mongoose.Types.ObjectId;
}
export const BadgeSchema = SchemaFactory.createForClass(Badge);