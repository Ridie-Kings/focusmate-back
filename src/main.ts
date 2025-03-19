import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { config } from "dotenv";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import * as cookieParser from "cookie-parser";
import * as express from "express";
// Carga las variables de entorno
config();

async function sherpmain() {
  console.log("Starting the application");

  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api/");

  // Middleware de seguridad HTTP
  app.use(helmet());

  // Middleware de seguridad CORS
  app.enableCors({
    origin: ["*"], // Dominio o lista de dominios permitidos
    methods: ["GET", "POST", "PUT", "DELETE"], // Métodos permitidos
    credentials: true, // Permitir enviar cookies
  });

  app.use(cookieParser());
  // configuracón de Rate Limiting ()
  app.use(
    rateLimit({
      windowMs: 60 * 1000, // 1 minuto
      max: 10000, // Máximo 10,000 solicitudes en total por minuto
      message: "Global API limit reached. Please try again later.",
    }),
  );
const expressApp = app.getHttpAdapter().getInstance();
expressApp.set("trust proxy", 1);
  // Configuración global de validaciones
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Elimina propiedades no definidas en los DTOs
      forbidNonWhitelisted: true, // Lanza error si hay propiedades no permitidas
      transform: true, // Transforma datos a los tipos de los DTOs
    }),
  );

  const config = new DocumentBuilder()
    .setTitle("SherpApp API")
    .setDescription("API documentation for SherpApp")
    .setVersion("1.0")
    .addBearerAuth() // Para que se pueda autenticar con JWT
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);
  const PORT = process.env.PORT ?? 4000;
  await app.listen(PORT);

  console.log(`Application running on port ${PORT}`);
}

sherpmain();