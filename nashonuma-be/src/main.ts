import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

/** Shared by main() and the e2e tests, so both run the same pipes and prefix. */
export function configureApp(app: INestApplication) {
  app.setGlobalPrefix('api');
  // Unknown fields are dropped, not rejected, so an older phone build still works.
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configureApp(app);
  const origins = (process.env.CORS_ORIGIN ?? 'http://localhost:5173').split(',').map(s => s.trim());
  app.enableCors({ origin: origins });
  app.enableShutdownHooks();
  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port);
  console.log(`NashoNuma API on http://localhost:${port}/api`);
}

if (require.main === module) void bootstrap();
