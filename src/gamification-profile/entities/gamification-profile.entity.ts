import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';

export type GamificationProfileDocument = GamificationProfile & Document;
@Schema({ timestamps: true, versionKey: false })
export class GamificationProfile extends Document {
  // Cada perfil de gamificación pertenece a un usuario único.
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true })
  user: mongoose.Types.ObjectId;

  // XP acumulada.
  @Prop({ required: true, default: 0 })
  xp: number;

  // Nivel actual del usuario.
  @Prop({ required: true, default: 0 })
  level: number;

  @Prop({required: true, default: ''})
  banner?: string;

  @Prop({required: true, default: ''})
  avatar?: string;

  @Prop({required: true, default: ''})
  frame?: string;

  @Prop({required: true, default: 0})
  coins?: number;

  @Prop({required: true, default: ''})
  bio?: string;

  @Prop({required: true, default: 'Novice'})
  title?: string;

  // Recompensas directas, otorgadas sin estar asociadas a un badge, quest o racha.
  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'Reward', default: [] })
  directRewards?: mongoose.Types.ObjectId[];

  // Badges desbloqueados.
  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'Badge', default: [] })
  unlockedBadges?: mongoose.Types.ObjectId[];
}

export const GamificationProfileSchema = SchemaFactory.createForClass(GamificationProfile);
