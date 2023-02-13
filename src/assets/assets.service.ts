import { randomUUID } from 'node:crypto';
import { HttpException, HttpStatus, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';

import { AssetTypeKey } from '../utils/enums';
import { ClaimAssetRequest, ClaimAssetResponse } from './assets.interface';

@Injectable()
export class AssetsService {
  private logger = new Logger(AssetsService.name);
  private paymentAPI: URL;

  constructor(private readonly configService: ConfigService, private readonly httpService: HttpService) {
    this.paymentAPI = new URL(configService.get<string>('PAYMENT_API_URL'));
  }

  async claimAsset(request: ClaimAssetRequest): Promise<ClaimAssetResponse> {
    try {
      const axiosResponse = await firstValueFrom(
        this.httpService
          .post<{ txHash: string }>(new URL('payments/claim', this.paymentAPI).toString(), {
            paymentKey: randomUUID(),
            publisher: 'TOTEM-AUTH',
            player: request.ownerAddress,
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
      return { txHash: axiosResponse.data.txHash };
    } catch (ex) {
      this.logger.error(ex.message);
      throw ex;
    }
  }
}
