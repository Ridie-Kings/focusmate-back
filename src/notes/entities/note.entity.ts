import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document } from "mongoose";

export type NoteDocument = Note & Document;
@Schema({ timestamps: true, versionKey: false })
export class Note {}

export const NoteSchema = SchemaFactory.createForClass(Note);
