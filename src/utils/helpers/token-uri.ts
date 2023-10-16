import { getRandomValues } from 'node:crypto';
import { AssetType, DNALength } from '../enums';

export function generateDNA(assetType: AssetType): string {
  const length = DNALength[assetType];
  let countOfBytes;
  switch (assetType) {
    case AssetType.AVATAR:
      countOfBytes = 8;
      break;
    case AssetType.ITEM:
      countOfBytes = 4;
      break;
  }
  let dna = '';
  for (let i = 0; i < length - countOfBytes - countOfBytes; i++) {
    const randomInt = getRandom32BitInt();
    const hexValue = randomInt.toString(16).padStart(8, '0');
    dna += hexValue;
  }

  for (let i = 0; i < countOfBytes; i++) {
    const result = getGaussianShortValue();

    dna += result;
  }

  for (let i = 0; i < countOfBytes; i++) {
    const result = getExponentialShortValue();

    dna += result;
  }

  return dna;
}

function getExponentialShortValue() {
  const exponentialPart1 = Math.floor(Math.log(Math.random()) * -7057);
  const exponentialPart2 = Math.floor(Math.log(Math.random()) * -7057);
  const hexValue1 = exponentialPart1.toString(16).padStart(4, '0');
  const hexValue2 = exponentialPart2.toString(16).padStart(4, '0');

  return hexValue1 + hexValue2;
}

function getRandom32BitInt() {
  return Math.floor(Math.random() * 4294967296); // Generate a random integer between 0 and 2^32-1
}

function getGaussianRandom(min, max, skew): number {
  let u = 0,
    v = 0;
  while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
  while (v === 0) v = Math.random();
  let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);

  num = num / 10.0 + 0.5; // Translate to 0 -> 1
  if (num > 1 || num < 0) num = getGaussianRandom(min, max, skew); // resample between 0 and 1 if out of range
  num = Math.pow(num, skew); // Skew
  num *= max - min; // Stretch to fill range
  num += min; // offset to min
  return num;
}

function getGaussianShortValue() {
  const exponentialPart1 = Math.round(getGaussianRandom(0, 65535, 1));
  const exponentialPart2 = Math.round(getGaussianRandom(0, 65535, 1));
  const hexValue1 = exponentialPart1.toString(16).padStart(4, '0');
  const hexValue2 = exponentialPart2.toString(16).padStart(4, '0');

  return hexValue1 + hexValue2;
}
