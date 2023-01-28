import { randomBytes, randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Publisher, PublisherDocument } from './schemas';
import { CreatePublisher } from './publishers.interface';

@Injectable()
export class PublishersService {
  constructor(
    private readonly configService: ConfigService,
    @InjectModel(Publisher.name) private publisherModel: Model<PublisherDocument>,
  ) {}

  async createPublisher(request: CreatePublisher): Promise<string> {
    const apiKey = randomBytes(32).toString('hex');
    await this.publisherModel.create({
      _id: randomUUID(),
      apiKey,
      name: request.name,
      webhookUrl: request.webhookUrl,
    });
    return apiKey;
  }
}
