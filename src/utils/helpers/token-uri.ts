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
  for (let i = 0; i < length - countOfBytes; i++) {
    const randomInt = getRandom32BitInt();
    const hexValue = randomInt.toString(16).padStart(8, '0');
    dna += hexValue;
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
