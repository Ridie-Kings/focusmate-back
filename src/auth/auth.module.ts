import { Module, forwardRef } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { UsersModule } from "../users/users.module";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "src/users/entities/user.entity";

@Module({
  imports: [
    forwardRef(() => UsersModule), // ✅ Evita dependencia circular con UsersModule
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.registerAsync({
      imports: [ConfigModule], // ✅ Asegura que ConfigModule esté disponible
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>("JWT_SECRET"), // ✅ Obtiene JWT_SECRET de variables de entorno
        signOptions: { expiresIn: "12h" }, // ✅ Expiración de 12h
      }),
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), // ✅ Registra el esquema de Usuario en MongoDB
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy], // ✅ No es necesario incluir ConfigService aquí
  exports: [AuthService, JwtModule], // ✅ Exporta AuthService y JwtModule
})
export class AuthModule {}
