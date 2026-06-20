import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api/v1");
  app.enableCors();
  // Bind to all interfaces so devices on the LAN (e.g. a phone running Expo Go)
  // can reach the API at the host machine's IP, not just localhost.
  await app.listen(process.env.PORT ?? 3001, "0.0.0.0");
}

void bootstrap();

