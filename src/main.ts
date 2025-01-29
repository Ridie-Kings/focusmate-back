import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { config } from "dotenv";
import helmet from "helmet";
import * as cookieParser from "cookie-parser"; // Necesario para CSRF
import { doubleCsrf } from "csrf-csrf";

// Carga las variables de entorno
config();

async function sherpmain() {
  console.log("Starting the application");

  const app = await NestFactory.create(AppModule);

  // Middleware de seguridad HTTP
  app.use(helmet());

  // Middleware para leer cookies (NECESARIO para CSRF)
  app.use(cookieParser());

  app.enableCors({
    origin: ["http://localhost:3000"], // Dominio o lista de dominios permitidos
    methods: ["GET", "POST", "PUT", "DELETE"], // Métodos permitidos
    credentials: true, // Permitir enviar cookies
  });

  // Configuración de CSRF
  const { doubleCsrfProtection, generateToken, validateRequest } = doubleCsrf({
    getSecret: () => process.env.CSRF_SECRET || "default_secret", // Usa una variable de entorno segura
    cookieName: "XSRF-TOKEN", // Nombre de la cookie con el token CSRF
    size: 64, // Tamaño del token
    ignoredMethods: ["GET", "HEAD", "OPTIONS"], // No proteger estos métodos
  });

  // Aplicar protección CSRF
  app.use(doubleCsrfProtection);

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
