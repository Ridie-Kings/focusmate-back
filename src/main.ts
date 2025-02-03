import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { config } from "dotenv";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";

// Carga las variables de entorno
config();

async function sherpmain() {
  console.log("Starting the application");

  const app = await NestFactory.create(AppModule);

  // Middleware de seguridad HTTP
  app.use(helmet());

  // Middleware de seguridad CORS
  app.enableCors({
    origin: ["http://localhost:3000"], // Dominio o lista de dominios permitidos
    methods: ["GET", "POST", "PUT", "DELETE"], // Métodos permitidos
    credentials: true, // Permitir enviar cookies
  });

  // configuracón de Rate Limiting ()
  app.use(
    rateLimit({
      windowMs: 60 * 1000, // 1 minuto
      max: 10000, // Máximo 10,000 solicitudes en total por minuto
      message: "Global API limit reached. Please try again later.",
    }),
  );

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
