export enum View {
  LANDING = 'LANDING',
  AUTH = 'AUTH',
  DASHBOARD = 'DASHBOARD',
  CUSTOMIZE = 'CUSTOMIZE',
  CHARACTER_GALLERY = 'CHARACTER_GALLERY',
  COMMUNITY_GALLERY = 'COMMUNITY_GALLERY',
  PARTY = 'PARTY',
  WALLET = 'WALLET',
  BANK_SETUP = 'BANK_SETUP',
  LOCATION_PICKER = 'LOCATION_PICKER',
  CAPTURE = 'CAPTURE',
  DONATE = 'DONATE'
}

export interface User {
  id: string;
  name: string;
  age: number;
  isLoggedIn: boolean;
  provider: 'google' | 'facebook' | 'apple' | 'phone' | 'steam' | null;
  parentalControlActive: boolean;
}

export interface AppearanceSlot {
  id: string;
  color: string;
  material: string;
  texture: string;
}

export interface Character {
  id: string;
  name: string;
  ageRange: string;
  bodyType: string;
  ownerId?: string;
  ownerName?: string;
  isCommunity?: boolean;
  // Body Parts (Individual Customization)
  head: AppearanceSlot;
  torso: AppearanceSlot;
  arms: AppearanceSlot;
  legs: AppearanceSlot;
  eyes: AppearanceSlot;
  // Clothing & Props
  outfit: AppearanceSlot;
  headwear: AppearanceSlot;
  footwear: AppearanceSlot;
  jewelry: AppearanceSlot;
  accessory: AppearanceSlot;
  handItem: AppearanceSlot;
  hair: AppearanceSlot;
  hairStyle: string;
  hairVolume: number;
}

export interface WalletState {
  balance: number;
  isLinked: boolean;
  currency: string;
  provider: string;
  autoWithdraw: boolean;
}

export interface PartySession {
  theme: string;
  location: string;
  vibe: number; // 0-100
  startTime: number;
  streamStartTime?: number;
  earned: number;
  guests: number;
  isStreaming: boolean;
  characterId: string;
}

export interface CustomItem {
  id: string;
  name: string;
  type: string;
  color: string;
  material: string;
  texture: string;
  description: string;
}