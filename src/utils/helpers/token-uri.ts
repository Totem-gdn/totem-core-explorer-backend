import { getRandomValues } from 'node:crypto';
import { AssetType, DNALength } from '../enums';

export function generateDNA(assetType: AssetType): string {
  const length = DNALength[assetType];
  const tokenURIBuffer = getRandomValues(new Uint32Array(length));
  return Buffer.from(tokenURIBuffer.buffer).toString('hex');
}
