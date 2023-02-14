import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

import { RepositoryModule } from '../../repository/repository.module';
import { WithpaperController } from './withpaper.controller';
import { WithpaperService } from './withpaper.service';

@Module({
  imports: [ConfigModule, HttpModule, RepositoryModule],
  controllers: [WithpaperController],
  providers: [WithpaperService],
})
export class WithpaperModule {}
