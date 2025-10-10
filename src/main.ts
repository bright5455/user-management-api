import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') ?? process.env.PORT;
  if (port === undefined) {
    throw new Error('PORT is not defined in config or environment variables');
  }
  await app.listen(port, () => {
    console.log(`Server is running on ${port}`);
  });
  
}
bootstrap();
