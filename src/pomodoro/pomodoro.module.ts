import { Module } from "@nestjs/common";
import { PomodoroService } from "./pomodoro.service";
// import { PomodoroController } from './pomodoro.controller';
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "src/auth/auth.module";
import { Pomodoro, PomodoroSchema } from "./entities/pomodoro.entity";
import { PomodoroGateway } from "./pomodoro.gateway";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Pomodoro.name, schema: PomodoroSchema }, // Asegúrate de que el nombre y el esquema sean correctos
    ]),
    AuthModule,
  ], // Aquí puedes importar otros módulos si es necesario
  // controllers: [PomodoroController],
  providers: [PomodoroService, PomodoroGateway], // Asegúrate de que PomodoroGateway esté importado y registrado aquí
  exports: [PomodoroService, MongooseModule], // Exporta el servicio si lo necesitas en otros módulos
})
export class PomodoroModule {}
