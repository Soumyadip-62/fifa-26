import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

function loadEnvFile() {
  const envFilePath = [
    resolve(process.cwd(), '.env'),
    resolve(process.cwd(), 'apps/api/.env'),
  ].find((filePath) => existsSync(filePath));

  if (!envFilePath) {
    return;
  }

  const envFile = readFileSync(envFilePath, 'utf8');

  for (const line of envFile.split(/\r?\n/)) {
    const trimmedLine = line.trim();

    if (!trimmedLine || trimmedLine.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmedLine.indexOf('=');

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmedLine.slice(0, separatorIndex).trim();
    const value = trimmedLine.slice(separatorIndex + 1).trim();

    process.env[key] ??= value;
  }
}

async function bootstrap() {
  loadEnvFile();

  const app = await NestFactory.create(AppModule);
  const frontendUrl = process.env.FRONTEND_URL?.replace(/\/+$/, '');

  app.enableCors({
    origin: [
      'http://localhost:14000',
      'http://127.0.0.1:14000',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'https://fifa-26-web.vercel.app',
      'https://www.wccompanion.online',
      frontendUrl,
    ].filter(Boolean),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3001);
}
void bootstrap();
