import 'reflect-metadata';
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const port = Number(process.env.PORT ?? 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid PORT');
  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();
  await app.listen(port, '0.0.0.0');
}
bootstrap().catch((error) => {
  console.error('Startup failed:', error.name);
  process.exitCode = 1;
});
