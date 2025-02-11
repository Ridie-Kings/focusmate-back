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
    ConfigModule,
    forwardRef(() => UsersModule), // ✅ Evita dependencia circular
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.registerAsync({
      imports: [ConfigModule], // ✅ Importa ConfigModule en JwtModule
      inject: [ConfigService], // ✅ Inyecta ConfigService en JwtModule
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>("JWT_SECRET"), // ✅ Obtener `JWT_SECRET` correctamente
        signOptions: { expiresIn: "12h" },
      }),
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, ConfigService], // ✅ Asegúrate de que ConfigService está aquí
  exports: [AuthService, JwtModule, ConfigService], // ✅ Exporta ConfigService para que JwtStrategy lo use
})
export class AuthModule {}
