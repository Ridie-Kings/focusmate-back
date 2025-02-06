import { Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "./entities/user.entity";
import { JwtModule } from "@nestjs/jwt";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.register({}), // ✅ Asegurar que JwtModule esté disponible
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // ✅ Asegurar que se pueda usar en otros módulos
})
export class UsersModule {}
