import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";

console.log(NestFactory);

async function bootstrap() {
  console.log("Starting the application");
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  });
  await app.listen(3000);
  console.log("running on port 3000");
}
bootstrap();
