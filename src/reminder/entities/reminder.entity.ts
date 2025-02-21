import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document } from "mongoose";

export type ReminderDocument = Reminder & Document;
@Schema({ timestamps: true})
export class Reminder extends Document {
    @Prop({ type: String, required: true }) 
    title: string;
    @Prop({type: String, required: false})
    description?: string;
    @Prop({type: Date, required: true})
    date: Date;
    @Prop({ type: String, enum: ['active', 'completed','cancelled'], default: 'active' })
    status: string;
    @Prop({type: Boolean, required: false})
    repeat: boolean;
    @Prop({type: String, enum: ['daily', 'weekly', 'monthly'], required: false})
    repeatInterval?: string;
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
    user: mongoose.Types.ObjectId;
}

export const ReminderSchema = SchemaFactory.createForClass(Reminder); 