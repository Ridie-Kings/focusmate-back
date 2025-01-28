import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { config } from "dotenv";

// Carga las variables de entorno
config();

async function sherpmain() {
  console.log("Starting the application");

  const app = await NestFactory.create(AppModule);

  // Configuración global de validaciones
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Elimina propiedades no definidas en los DTOs
      forbidNonWhitelisted: true, // Lanza error si hay propiedades no permitidas
      transform: true, // Transforma datos a los tipos de los DTOs
    }),
  );

  const PORT = process.env.PORT ?? 3000;
  await app.listen(PORT);

  console.log(`Application running on port ${PORT}`);
}

sherpmain();
