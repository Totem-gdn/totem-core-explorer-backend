import { BigNumber } from 'ethers';

export interface GasStationPrices {
  maxFeePerGas: BigNumber;
  maxPriorityFeePerGas: BigNumber;
  estimatedBaseFee: BigNumber;
  blockTime: number;
  blockNumber: number;
}

export interface GasStationPricesResponse {
  safeLow: {
    maxPriorityFee: number;
    maxFee: number;
  };
  standard: {
    maxPriorityFee: number;
    maxFee: number;
  };
  fast: {
    maxPriorityFee: number;
    maxFee: number;
  };
  estimatedBaseFee: number;
  blockTime: number;
  blockNumber: number;
}
