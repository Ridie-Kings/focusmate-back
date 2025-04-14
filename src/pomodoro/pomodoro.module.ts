import { Module } from "@nestjs/common";
import { PomodoroService } from "./pomodoro.service";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "src/auth/auth.module";
import { Pomodoro, PomodoroSchema } from "./entities/pomodoro.entity";
import { PomodoroGateway } from "./pomodoro.gateway";
import { PomodoroController } from "./pomodoro.controller";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Pomodoro.name, schema: PomodoroSchema },
    ]),
    AuthModule,
  ],
  controllers: [PomodoroController],
  providers: [PomodoroService, PomodoroGateway],
  exports: [PomodoroService, MongooseModule],
})
export class PomodoroModule {}
