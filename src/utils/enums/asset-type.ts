export enum AssetType {
  AVATAR = 0,
  ITEM = 1,
  GEM = 2,
}

export const AssetTypeKey = {
  [AssetType.AVATAR]: 'avatar',
  [AssetType.ITEM]: 'item',
  [AssetType.GEM]: 'gem',
};

export const DNALength = {
  [AssetType.AVATAR]: 32,
  [AssetType.ITEM]: 16,
  [AssetType.GEM]: 8,
};
