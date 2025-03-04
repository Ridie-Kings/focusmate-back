import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, versionKey: false })
export class GamificationProfile extends Document {
  // Cada perfil de gamificación pertenece a un usuario único.
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  user: Types.ObjectId;

  // XP acumulada.
  @Prop({ required: true, default: 0 })
  xp: number;

  // Nivel actual del usuario.
  @Prop({ required: true, default: 1 })
  level: number;

  @Prop()
  banner?: string;

  @Prop()
  avatar?: string;

  @Prop()
  frame?: string;

  @Prop()
  coins?: number;

  @Prop()
  bio?: string;

  // Recompensas directas, otorgadas sin estar asociadas a un badge, quest o racha.
  @Prop({ type: [Types.ObjectId], ref: 'Reward', default: [] })
  directRewards?: Types.ObjectId[];

  // Badges desbloqueados.
  @Prop({ type: [Types.ObjectId], ref: 'Badge', default: [] })
  unlockedBadges?: Types.ObjectId[];
}

export const GamificationProfileSchema = SchemaFactory.createForClass(GamificationProfile);
