import { Prop, Schema } from "@nestjs/mongoose";
import mongoose, { Document } from "mongoose";


@Schema({ timestamps: true })
export class GamificationProfile extends Document {
  
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "User" })
  user: mongoose.Types.ObjectId;

  @Prop({ default: 0 })
  xp: number;

  @Prop({ default: 1 })
  level: number;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Badges' }],
  })
  badges: mongoose.Types.ObjectId[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Events' }],
  })
  events: mongoose.Types.ObjectId[];
  
  @Prop({ default: "" })
  bio: string;

  @Prop({ default: "" })
  avatar: string;

    
}
