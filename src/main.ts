import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from './transform.interceptor';
import * as dotenv from 'dotenv';
import * as express from 'express'
import serverlessExpress from '@vendia/serverless-express';
import { ExpressAdapter } from '@nestjs/platform-express';

dotenv.config();
const expressApp = express();
async function bootstrap() {
  const logger = new Logger();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));
  app.setGlobalPrefix('api');
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new TransformInterceptor());
  await app.init();

  const port = process.env.PORT || 3000;
  logger.log(`Application listening on port ${port}`);
}
bootstrap();

export const handler = serverlessExpress({app: expressApp})
