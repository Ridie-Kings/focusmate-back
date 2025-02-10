import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { UsersModule } from "../users/users.module";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose"; // ✅ Importar MongooseModule
import { User, UserSchema } from "src/users/entities/user.entity"; // ✅ Importar UserSchema

@Module({
  imports: [
    ConfigModule.forRoot(),
    UsersModule,
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.register({
      secret: process.env.JWT_SECRET, // 🔹 Asegúrate de que esto no esté vacío
      signOptions: { expiresIn: "12h" }, // 12 horas de expiración
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), // ✅ Registrar UserSchema
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
