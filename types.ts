
export enum View {
  LANDING = 'LANDING',
  AUTH = 'AUTH',
  DASHBOARD = 'DASHBOARD',
  CUSTOMIZE = 'CUSTOMIZE',
  PARTY = 'PARTY',
  WALLET = 'WALLET',
  LOCATION_PICKER = 'LOCATION_PICKER',
  DONATE = 'DONATE',
  SIM_CONFIG = 'SIM_CONFIG'
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
  textureSize?: string;
}

export interface Character {
  id: string;
  name: string;
  ageRange: string;
  bodyType: string;
  headShape: string;
  head: AppearanceSlot;
  torso: AppearanceSlot;
  arms: AppearanceSlot;
  legs: AppearanceSlot;
  eyes: AppearanceSlot;
  nose: AppearanceSlot;
  mouth: AppearanceSlot;
  outfit: AppearanceSlot;
  headwear: AppearanceSlot;
  footwear: AppearanceSlot;
  jewelry: AppearanceSlot;
  accessory: AppearanceSlot;
  handItem: AppearanceSlot;
  hair: AppearanceSlot;
  hairStyle: string;
  hairVolume: number;
  hairShape: string;
  hairWarp: number;
}

export interface WalletState {
  balance: number;
  isLinked: boolean;
  currency: string;
  provider: string;
  autoWithdraw: boolean;
}

export interface PartyEnvironment {
  music: string;
  lighting: string;
  decor: string;
  specialEffect: string;
}

export interface PartySession {
  theme: string;
  location: string;
  vibe: number;
  startTime: number;
  earnedInSession: number;
  guests: number;
  isStreaming: boolean;
  characterId: string;
  activeEvents: PartyEvent[];
  env: PartyEnvironment;
}

export interface PartyEvent {
  id: string;
  text: string;
  impact: number;
  type: 'bonus' | 'hazard' | 'neutral';
}