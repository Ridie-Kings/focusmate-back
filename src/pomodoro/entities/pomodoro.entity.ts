import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type PomodoroDocument = Pomodoro & Document;
@Schema({timestamps: true, versionKey: false})
export class Pomodoro extends Document{
    @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    userId: mongoose.Types.ObjectId;
    @Prop({ required: true, ref: 'Timer', type: mongoose.Schema.Types.ObjectId})
    duration: mongoose.Types.ObjectId;
    @Prop({ required: true, ref: 'Timer', type: mongoose.Schema.Types.ObjectId})
    breakShort: mongoose.Types.ObjectId;
    @Prop({ required: true, ref: 'Timer', type: mongoose.Schema.Types.ObjectId})
    breakLong: mongoose.Types.ObjectId;
    
}

export const PomodoroSchema = SchemaFactory.createForClass(Pomodoro);
