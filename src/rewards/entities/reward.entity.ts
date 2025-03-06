import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RewardType = 'badge' | 'quest' | 'streak' | 'other';

@Schema({ timestamps: true, versionKey: false })
export class Reward extends Document {
  @Prop({ required: true })
  xp: number;

  @Prop({ required: true })
  icon: string;
  
  @Prop({ required: true, enum: ['badge', 'quest', 'streak', 'other'] })
  type: RewardType;

  @Prop()
  coins?: number;

  @Prop()
  title?: string;

  @Prop()
  description?: string;

  @Prop()
  banner?: string;

  @Prop()
  frame?: string;

  @Prop()
  avatar?: string;

  @Prop()
  active?: boolean;
}

export const RewardSchema = SchemaFactory.createForClass(Reward);
