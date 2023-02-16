import { BadRequestException, HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { AxiosError } from 'axios';
import { catchError, lastValueFrom } from 'rxjs';

import { AssetType, AssetTypeKey, PaymentStatuses, PaymentSystem } from '../../utils/enums';
import { generateDNA } from '../../utils/helpers';
import { CreatePaymentLinkRequest, CreatePaymentLinkResponse, ProcessWebhookRequest } from './withpaper.interface';
import { WithpaperAPIResponse } from './withpaper-api.interface';
import { AssetsService } from '../../repository/assets';
import { PaymentOrdersService } from '../../repository/payment-orders';

@Injectable()
export class WithpaperService {
  private logger = new Logger(WithpaperService.name);
  private readonly defaultSuccessURL: URL;
  private readonly paymentLinkHeaders: Record<string, string>;
  private readonly paymentLinkParams: Record<AssetType, [string, string, string]>;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly assetsRepository: AssetsService,
    private readonly paymentOrdersRepository: PaymentOrdersService,
  ) {
    this.defaultSuccessURL = new URL(this.configService.get<string>('WITHPAPER_PAYMENT_SUCCESS_URL'));
    this.paymentLinkHeaders = {
      Authorization: `Bearer ${this.configService.get<string>('WITHPAPER_AUTH_TOKEN')}`,
    };
    this.paymentLinkParams = {
      [AssetType.AVATAR]: [
        'Totem Asset Avatar',
        this.configService.get<string>('WITHPAPER_AVATAR_CONTRACT_ID'),
        this.configService.get<string>('WITHPAPER_AVATAR_SPENDER_ADDRESS'),
      ],
      [AssetType.ITEM]: [
        'Totem Asset Item',
        this.configService.get<string>('WITHPAPER_ITEM_CONTRACT_ID'),
        this.configService.get<string>('WITHPAPER_ITEM_SPENDER_ADDRESS'),
      ],
      [AssetType.GEM]: [
        'Totem Asset Gem',
        this.configService.get<string>('WITHPAPER_GEM_CONTRACT_ID'),
        this.configService.get<string>('WITHPAPER_GEM_SPENDER_ADDRESS'),
      ],
    };
  }

  async createPaymentLink(request: CreatePaymentLinkRequest): Promise<CreatePaymentLinkResponse> {
    const assetRecord = await this.assetsRepository.find(request.assetType);
    const orderId = await this.paymentOrdersRepository.create({
      ownerAddress: request.ownerAddress,
      assetType: request.assetType,
      status: PaymentStatuses.New,
      price: assetRecord.price,
      txHash: '',
      paymentSystem: PaymentSystem.Withpaper,
    });
    const [title, contractId, spender] = this.paymentLinkParams[request.assetType];

    try {
      const url = request.successUrl ? new URL(request.successUrl) : new URL(this.defaultSuccessURL);
      url.searchParams.set('type', AssetTypeKey[request.assetType]);
      url.searchParams.set('payment_result', 'success');
      const withpaperAPIRequest = this.httpService
        .post<WithpaperAPIResponse>(
          'https://withpaper.com/api/2022-08-12/checkout-link-intent',
          {
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
              name: 'safeMint(address,string)',
              args: {
                to: '$WALLET',
                uri: generateDNA(request.assetType),
              },
              payment: {
                // FIXME: 0.001 price works only on testnet. add testnet flag/env/chainId for the future mainnet support
                value: '0.001 * $QUANTITY',
                currency: 'USDC',
                spender: spender,
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
            contractId: contractId,
            title: title,
            walletAddress: request.ownerAddress,
            successCallbackUrl: url.toString(),
          },
          {
            headers: { ...this.paymentLinkHeaders },
          },
        )
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response?.data || error.message);
            throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
          }),
        );
      const withpaperAPIResponse = await lastValueFrom(withpaperAPIRequest);
      return { orderId, url: withpaperAPIResponse.data.checkoutLinkIntentUrl };
    } catch (ex: unknown) {
      this.logger.error(ex instanceof AxiosError ? ex.response?.data : (ex as Error).message);
      await this.paymentOrdersRepository.update(orderId, { status: PaymentStatuses.Error });
      throw ex;
    }
  }

  async processWebhook(request: ProcessWebhookRequest) {
    switch (request.event) {
      case 'transfer:succeeded':
        if (!request.txHash) {
          throw new BadRequestException(`invalid txHash: must not be empty`);
        }
        return await this.paymentOrdersRepository.update(request.orderId, {
          status: PaymentStatuses.Completed,
          txHash: request.txHash,
        });
      case 'payment:succeeded':
        return await this.paymentOrdersRepository.update(request.orderId, {
          status: PaymentStatuses.Processing,
        });
      default:
        throw new BadRequestException(`invalid event: ${request.event}`);
    }
  }
}
