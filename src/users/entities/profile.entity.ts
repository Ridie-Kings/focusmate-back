// import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
// import { ApiProperty } from "@nestjs/swagger";

// /**
//  * 📌 Perfil del usuario que contiene información adicional.
//  */
// @Schema() // ✅ Ahora `Profile` es un Schema de Mongoose
// export class Profile {
//   @Prop({ type: String, default: "" })
//   bio: string;

//   @ApiProperty({
//     example: "https://example.com/avatar.jpg",
//     description: "User avatar URL",
//   })
//   @Prop({ type: String, default: "" })
//   avatar: string;

//   @ApiProperty({
//     example: { theme: "dark", notifications: true },
//     description: "User settings",
//   })
//   @Prop({ type: Map, of: String, default: {} })
//   settings: Record<string, any>;
// }

// // ✅ Ahora se genera el `Schema` para `Profile`
// export const ProfileSchema = SchemaFactory.createForClass(Profile);