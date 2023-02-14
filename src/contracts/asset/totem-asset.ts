import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Contract } from 'ethers';

import * as TotemAssetABI from '../abi/TotemAsset.json';
import { AssetType } from '../../utils/enums';
import { generateDNA, withRetry } from '../../utils/helpers';
import { ProviderService } from '../provider/provider.service';

@Injectable()
export class TotemAsset implements OnApplicationBootstrap {
  private contracts: Record<AssetType, Contract | null> = {
    [AssetType.AVATAR]: null,
    [AssetType.ITEM]: null,
    [AssetType.GEM]: null,
  };

  constructor(private config: ConfigService, private providerService: ProviderService) {}

  async onApplicationBootstrap() {
    this.contracts[AssetType.AVATAR] = new Contract(
      this.config.get<string>('AVATAR_CONTRACT'),
      TotemAssetABI,
      this.providerService.getWallet(),
    );
    this.contracts[AssetType.ITEM] = new Contract(
      this.config.get<string>('ITEM_CONTRACT'),
      TotemAssetABI,
      this.providerService.getWallet(),
    );
    this.contracts[AssetType.GEM] = new Contract(
      this.config.get<string>('GEM_CONTRACT'),
      TotemAssetABI,
      this.providerService.getWallet(),
    );
  }

  async claim(assetType: AssetType, ownerAddress: string): Promise<string> {
    const uri = generateDNA(assetType);
    const gasLimit = await this.contracts[assetType].estimateGas['safeMint(address,string)'](ownerAddress, uri);
    return await withRetry(
      `Claim asset: ${assetType} Owner: ${ownerAddress}`,
      async () => {
        const { maxFeePerGas, maxPriorityFeePerGas } = await this.providerService.getFeeData();
        const tx = await this.contracts[assetType]['safeMint(address,string)'](ownerAddress, uri, {
          gasLimit,
          maxFeePerGas,
          maxPriorityFeePerGas,
        });
        await tx.wait();
        return tx.hash;
      },
      {
        maxRetries: 60,
      },
    );
  }
}
