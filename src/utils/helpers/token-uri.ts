import { getRandomValues } from 'node:crypto';
import { AssetType, DNALength } from '../enums';

export function generateDNA(assetType: AssetType): string {
  const length = DNALength[assetType];
  const newIntArray = new Uint32Array(length);
  const tokenURIBuffer = getRandomValues(newIntArray);
  for (let i = length - 8; i < length; i++) {
    tokenURIBuffer[i] = getExponentialShortValue();
  }
  return Buffer.from(tokenURIBuffer.buffer).toString('hex');
}

function getExponentialShortValue() {
  const firstValue = Math.floor(Math.log(Math.random()) * -7057);
  const secondValue = Math.floor(Math.log(Math.random()) * -7057);
  return Number(`${firstValue}${secondValue}`);
}
