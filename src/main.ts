import { join } from 'node:path';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { GrpcOptions, MicroserviceOptions, Transport } from '@nestjs/microservices';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  app.enableShutdownHooks();
  app.connectMicroservice<MicroserviceOptions>(<GrpcOptions>{
    transport: Transport.GRPC,
    options: {
      url: config.get<string>('GRPC_URL'),
      package: ['grpc.health.v1', 'asset_legacy', 'game_legacy', 'games_directory'],
      protoPath: [
        join(__dirname, 'health', 'proto', 'health.proto'),
        join(__dirname, 'asset-legacy', 'proto', 'asset_legacy.proto'),
        join(__dirname, 'game-legacy', 'proto', 'game_legacy.proto'),
        join(__dirname, 'games-directory', 'proto', 'games_directory.proto'),
      ],
    },
  });
  await app.init();
  await app.startAllMicroservices();
  Logger.log(`🚀 Application is running on: ${config.get<string>('GRPC_URL')}`);
}

void bootstrap();
