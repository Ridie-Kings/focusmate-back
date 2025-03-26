import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document } from "mongoose";


export type SectionDocument = Section & Document;
@Schema({ timestamps: true, versionKey: false })
export class Section extends Document {
    @Prop({ type: String, required: true })
    name: string;
    @Prop({ type: String, required: true })
    description: string;
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "User", required: false })
    userId: mongoose.Types.ObjectId;
    @Prop({ type: Boolean, default: false })
    isDeleted: boolean;
    @Prop({ type: Date, required: false })
    completedAt?: Date;
    @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: "Task", default: []  })
    tasks?: [mongoose.Types.ObjectId];
    @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: "Section", default: []  })
    subSections?: [mongoose.Types.ObjectId];
    @Prop({ type: [], default: '', required: false})
    tags?: [string];
    @Prop({ type: String, default: '', required: false})
    category?: string;
    @Prop({ type: Number, default: 0, required: false})
    order?: number;

}
export const SectionSchema = SchemaFactory.createForClass(Section);