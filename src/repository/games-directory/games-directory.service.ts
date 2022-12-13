import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { GameDocument, GamesDirectory } from '../schemas';
import { CreateGameRecord } from './games-directory.interface';

@Injectable()
export class GamesDirectoryService {
  constructor(@InjectModel(GamesDirectory.name) private gameRecordModel: Model<GameDocument>) {}

  async create(request: CreateGameRecord) {
    const { recordId, ...record } = request;
    await this.gameRecordModel.create({ _id: recordId, ...record });
  }
}
