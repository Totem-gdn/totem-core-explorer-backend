import { randomUUID } from 'node:crypto';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

import { ClaimPaymentKey, CreatePaymentKeys } from './payment-keys.interface';
import { AssetTypeKey, PaymentKeyStatus } from '../../utils/enums';
import { PaymentKeysStatusRequest } from '../../payment-keys/payment-keys.interface';
import { PaymentKey, PaymentKeyDocument } from './schemas';
import { Publisher, PublisherDocument } from '../publishers';

@Injectable()
export class PaymentKeysService {
  private logger = new Logger(PaymentKeysService.name);
  private paymentAPI: URL;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    @InjectModel(PaymentKey.name) private paymentKeyModel: Model<PaymentKeyDocument>,
    @InjectModel(Publisher.name) private publisherModel: Model<PublisherDocument>,
  ) {
    this.paymentAPI = new URL(configService.get<string>('PAYMENT_API_URL'));
  }

  async createPaymentKeys(request: CreatePaymentKeys) {
    const publisher = await this.publisherModel.findOne({ apiKey: request.apiKey });
    if (!publisher) {
      throw new BadRequestException('publisher not found');
    }
    const paymentKeys: PaymentKeyDocument[] = [];
    for (let i = 0; i < request.amount; i++) {
      paymentKeys.push(
        new this.paymentKeyModel({
          _id: randomUUID(),
          publisher: publisher._id,
          assetType: request.assetType,
        }),
      );
    }
    await this.paymentKeyModel.insertMany(paymentKeys);
  }

  async claimPaymentKey(request: ClaimPaymentKey) {
    const publisher = await this.publisherModel.findOne({ apiKey: request.apiKey });
    if (!publisher) {
      throw new BadRequestException('publisher not found');
    }
    const paymentKey = await this.paymentKeyModel.findOneAndUpdate(
      {
        publisher: publisher._id,
        assetType: request.assetType,
        status: PaymentKeyStatus.Reserved,
      },
      { status: PaymentKeyStatus.InTransaction },
      { new: true },
    );
    if (!paymentKey) {
      throw new HttpException('not enough payment keys', HttpStatus.PAYMENT_REQUIRED);
    }
    try {
      const axiosResponse = await firstValueFrom(
        this.httpService
          .post<{ txHash: string }>(new URL('payments/claim', this.paymentAPI).toString(), {
            paymentKey: paymentKey._id,
            publisher: publisher._id,
            player: request.player,
            assetType: AssetTypeKey[request.assetType],
          })
          .pipe(
            catchError((error: AxiosError) => {
              this.logger.error(error.response.data);
              throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
            }),
          ),
      );
      if (!axiosResponse.data.txHash) {
        throw new InternalServerErrorException('invalid payment api txHash response');
      }
      await this.paymentKeyModel.findByIdAndUpdate(paymentKey._id, {
        $set: {
          status: PaymentKeyStatus.Claimed,
          txHash: axiosResponse.data.txHash,
        },
      });
      return axiosResponse.data.txHash;
    } catch (ex) {
      this.logger.error(ex.message);
      await this.paymentKeyModel.findByIdAndUpdate(paymentKey._id, {
        $set: { status: PaymentKeyStatus.Reserved },
      });
      throw ex;
    }
  }

  async paymentKeysStatus(request: PaymentKeysStatusRequest) {
    const publisher = await this.publisherModel.findOne({ apiKey: request.apiKey });
    if (!publisher) {
      throw new BadRequestException('publisher not found');
    }
    return await this.paymentKeyModel
      .countDocuments({
        publisher: publisher._id,
        assetType: request.assetType,
        status: request.status,
      })
      .exec();
  }
}
