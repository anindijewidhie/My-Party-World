export enum View {
  LANDING = 'LANDING',
  AUTH = 'AUTH',
  DASHBOARD = 'DASHBOARD',
  CUSTOMIZE = 'CUSTOMIZE',
  CHARACTER_GALLERY = 'CHARACTER_GALLERY',
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

export interface Character {
  id: string;
  name: string;
  ageRange: string;
  bodyType: string;
  outfit: string; // Tops/Bottoms/Full Costumes
  skinColor: string;
  hairStyle: string;
  headwear: string;
  footwear: string;
  jewelry: string;
  accessory: string; // Backpacks, wings, etc.
  handItem: string;
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
  texture: string;
  description: string;
}