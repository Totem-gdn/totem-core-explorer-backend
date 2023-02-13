import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { InjectModel } from '@nestjs/mongoose';
import { AxiosError } from 'axios';
import { Model } from 'mongoose';
import { catchError, lastValueFrom } from 'rxjs';
import { webcrypto } from 'node:crypto';
import { AssetType, AssetTypeKey, DNALength, PaymentStatuses, PaymentSystem } from '../../utils/enums';
import {
  CreateWithpaperPaymentLinkRequest,
  CreateWithpaperPaymentLinkResponse,
  PaymentInfoResponse,
} from './payments.interface';
import { Order, OrderDocument } from './schemas/orders';
import { ProcessWithpaperWebhookRequest } from 'src/payments/payments.interface';

@Injectable()
export class PaymentsService {
  private logger = new Logger(PaymentsService.name);
  private paymentAPI: URL;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
  ) {
    this.paymentAPI = new URL(configService.get<string>('PAYMENT_API_URL'));
  }

  async createWithpaperPaymentLink(
    request: CreateWithpaperPaymentLinkRequest,
  ): Promise<CreateWithpaperPaymentLinkResponse> {
    const paymentInfo = await this.getAssetPaymentInfo(request.assetType);

    const orderId = await this.createPaymentOrder(request.assetType, request.ownerAddress, paymentInfo.price);

    const uri = this.generateDNA(request.assetType);

    const url = await this.generateWithpaperPaymentLink(
      request.assetType,
      request.ownerAddress,
      paymentInfo.price,
      orderId,
      request.successUrl,
      uri,
    );

    return { orderId, url };
  }

  private async getAssetPaymentInfo(assetType: AssetType): Promise<PaymentInfoResponse> {
    const parsedAssetType = AssetTypeKey[assetType];

    try {
      const url = new URL(`assets/${parsedAssetType}/payment-info`, this.paymentAPI);
      const request = this.httpService
        .get(url.toString(), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        })
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response.data);
            throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
          }),
        );
      const result = await lastValueFrom(request);

      return result.data;
    } catch (e) {
      this.logger.error(e.message);
      throw e;
    }
  }

  private async createPaymentOrder(assetType: AssetType, ownerAddress: string, price: string): Promise<string> {
    const data = {
      ownerAddress,
      assetType,
      status: PaymentStatuses.New,
      price,
      paymentSystem: PaymentSystem.Withpaper,
    };

    const order = await this.orderModel.create(data);

    const orderId = order.toObject();

    return orderId._id.toString();
  }

  private async generateWithpaperPaymentLink(
    assetType: AssetType,
    ownerAddress: string,
    price: string,
    orderId: string,
    successUrl: string,
    uri: string,
  ): Promise<string> {
    const parsedAssetType = AssetTypeKey[assetType];

    const url = successUrl
      ? new URL(successUrl)
      : new URL(`${this.configService.get<string>('WITHPAPER_PAYMENT_SUCCESS_URL')}`);

    const search_params = url.searchParams;
    search_params.set('type', parsedAssetType);
    search_params.set('payment_result', 'success');
    url.search = search_params.toString();

    try {
      let contractId, spender;
      if (parsedAssetType === 'avatar') {
        contractId = this.configService.get<string>('WITHPAPER_AVATAR_CONTRACT_ID');
        spender = this.configService.get<string>('WITHPAPER_AVATAR_SPENDER_ADDRESS');
      } else if (parsedAssetType === 'item') {
        contractId = this.configService.get<string>('WITHPAPER_ITEM_CONTRACT_ID');
        spender = this.configService.get<string>('WITHPAPER_ITEM_SPENDER_ADDRESS');
      } else {
        contractId = this.configService.get<string>('WITHPAPER_GEM_CONTRACT_ID');
        spender = this.configService.get<string>('WITHPAPER_GEM_SPENDER_ADDRESS');
      }

      const body = {
        expiresInMinutes: 15,
        limitPerTransaction: 1,
        redirectAfterPayment: true,
        sendEmailOnCreation: false,
        requireVerifiedEmail: false,
        quantity: 1,
        metadata: {
          orderId: orderId,
        },
        mintMethod: {
          name: 'safeMint',
          args: {
            to: '$WALLET',
            uri,
          },
          payment: {
            value: '0.001 * $QUANTITY',
            currency: 'USDC',
            spender,
          },
        },
        feeBearer: 'BUYER',
        hideNativeMint: true,
        hidePaperWallet: true,
        hideExternalWallet: true,
        hidePayWithCard: false,
        hidePayWithCrypto: true,
        hidePayWithIdeal: true,
        sendEmailOnTransferSucceeded: false,
        usePaperKey: false,
        contractId,
        title: `Totem Asset ${parsedAssetType}`,
        walletAddress: ownerAddress,
        successCallbackUrl: url.toString(),
      };

      const request = this.httpService
        .post('https://withpaper.com/api/2022-08-12/checkout-link-intent', body, {
          headers: {
            Authorization: `Bearer ${this.configService.get<string>('WITHPAPER_AUTH_TOKEN')}`,
          },
        })
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response.data);
            throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
          }),
        );
      const result = await lastValueFrom(request);

      return result.data.checkoutLinkIntentUrl;
    } catch (e) {
      this.logger.error(e.message);
      await this.orderModel.findByIdAndUpdate(orderId, {
        status: PaymentStatuses.Error,
      });
      throw e;
    }
  }

  private generateDNA(assetType: AssetType): string {
    const length = DNALength[assetType];
    const tokenURIBuffer = webcrypto.getRandomValues(new Uint32Array(length));
    return Buffer.from(tokenURIBuffer.buffer).toString('hex');
  }

  async processWithpaperWebhook(request: ProcessWithpaperWebhookRequest): Promise<void> {
    const order = await this.orderModel.findById(request.orderId);

    if (order) {
      if (request.event === 'transfer:succeeded' && request.txHash) {
        order.set({ status: PaymentStatuses.Completed, txHash: request.txHash });
      }
      if (request.event === 'payment:succeeded') {
        order.set({ status: PaymentStatuses.Processing });
      }

      await order.save();
    }
  }
}
