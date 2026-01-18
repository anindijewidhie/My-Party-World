export const COLORS = {
  MAGENTA: '#8B008B',
  OLIVE: '#8B8B00',
  CYAN: '#008B8B',
  WHITE: '#FFFFFF',
  BLACK: '#000000',
  BG: '#F3F4F6',
  // Color theory matches
  MAGENTA_LIGHT: '#BF00BF',
  OLIVE_LIGHT: '#BFBF00',
  CYAN_LIGHT: '#00BFBF',
};

export const THEMES = [
  'Retro Bumper Bash',
  'City of Townsville Gala',
  'Nowhere Farmhouse Rave',
  'Sector V Treehouse Party',
  'Cul-de-sac Cookout',
  'Endsville Underworld Ball'
];

export const LOCATIONS = [
  { id: 'house', name: 'Science Lab', color: '#008B8B', icon: '🧪', style: 'bg-cyan-800 border-cyan-400' },
  { id: 'backyard', name: 'The Cul-de-sac', color: '#8B8B00', icon: '🚲', style: 'bg-olive border-yellow-400' },
  { id: 'underwater', name: 'Bikini Bottom Reach', color: '#00CED1', icon: '🏖️', style: 'bg-cyan-600 border-blue-200' },
  { id: 'space', name: 'Ghost Zone', color: '#483D8B', icon: '👻', style: 'bg-slate-900 border-green-500' },
  { id: 'volcano', name: 'Magma Lair', color: '#FF4500', icon: '🌋', style: 'bg-red-700 border-orange-500' },
  { id: 'city', name: 'Townsville Rooftop', color: '#708090', icon: '🏙️', style: 'bg-blue-900 border-pink-400' }
];

export const PROVIDERS = [
  'Cartoon Network Bank',
  'ToonTown Payouts',
  'Global Acme Wallet',
  'SwiftWithdraw Digital',
  'Hanna-Barbera Pay'
];

export const BODY_TYPES = [
  { id: 'standard', name: 'The Protagonist', width: 'w-20', height: 'h-28' },
  { id: 'tall', name: 'The Bravado', width: 'w-16', height: 'h-36' },
  { id: 'round', name: 'The Heavy', width: 'w-28', height: 'h-20' },
  { id: 'slim', name: 'The Nerd', width: 'w-12', height: 'h-32' }
];

export const AGE_RANGES = [
  { id: 'young_child', name: 'Kindergarten Kid', range: '5-7 years old', multiplier: 0.7 },
  { id: 'child', name: 'Middle School Toon', range: '8-12 years old', multiplier: 0.85 },
  { id: 'teenager', name: 'Cool Teen', range: '13-17 years old', multiplier: 1.0 },
  { id: 'young_adult', name: 'Toon Graduate', range: '18-24 years old', multiplier: 1.1 },
  { id: 'adult', name: 'Show Producer', range: '25-44 years old', multiplier: 1.1 },
  { id: 'middle_aged', name: 'Classic Relic', range: '45-64 years old', multiplier: 1.05 },
  { id: 'elderly', name: 'Golden Era Legend', range: '65+ years old', multiplier: 0.95 }
];

export const HAIR_STYLES = [
  { id: 'none', name: 'Smooth Dome' },
  { id: 'short', name: 'Standard Spikes' },
  { id: 'long', name: 'The Diva' },
  { id: 'spiky', name: 'Super Saiyan' },
  { id: 'curly', name: 'Bubble Curls' },
  { id: 'mohawk', name: 'Punk Bumper' },
  { id: 'pigtails', name: 'Powerpuff Tails' },
  { id: 'pompadour', name: 'The Bravo' }
];

export const CAPTURE_CONFIG = {
  ASPECT_RATIOS: [
    { id: '1:1', label: 'Social Square', class: 'aspect-square' },
    { id: '4:3', label: 'Classic CRT', class: 'aspect-[4/3]' },
    { id: '3:4', label: 'Mobile Portrait', class: 'aspect-[3/4]' },
    { id: '16:9', label: 'HD Widescreen', class: 'aspect-video' },
    { id: '9:16', label: 'Vertical Toon', class: 'aspect-[9/16]' }
  ],
  RESOLUTIONS: [
    { id: '480p', label: 'SD Retro', w: 640, h: 480 },
    { id: '1080p', label: 'Full Toon HD', w: 1920, h: 1080 },
    { id: '4k', label: 'Cinema Quality', w: 3840, h: 2160 }
  ],
  FILTERS: [
    { id: 'none', name: 'Normal', css: '' },
    { id: 'cn-ink', name: '90s Ink Trace', css: 'grayscale contrast-200 brightness-110 blur-[0.5px]' },
    { id: 'neon', name: 'Cyber Toon', css: 'hue-rotate-90 saturate-200 contrast-125' },
    { id: 'retro', name: 'CRT Static', css: 'sepia(0.2) saturate(140%) contrast(1.1) brightness(0.9)' },
    { id: 'glitch', name: 'Signal Jam', css: 'invert(0.1) contrast(1.8) saturate(0.5)' },
    { id: 'pop', name: 'Pop Art Dots', css: 'saturate(250%) brightness(1.1)' }
  ]
};

export const ITEM_CATEGORIES = [
  {
    id: 'outfit',
    name: 'Wardrobe',
    items: [
      { id: 'magenta_tee', name: 'Classic Magenta', hex: COLORS.MAGENTA },
      { id: 'lab_coat', name: 'Genius Coat', hex: '#FFFFFF' },
      { id: 'hero_suit', name: 'Vigilante Spandex', hex: '#FF0000' },
      { id: 'tutu', name: 'Dee Dee Pink', hex: '#FF69B4' },
      { id: 'striped_sweater', name: 'The Ed Special', hex: '#FFD700' },
      { id: 'armor', name: 'Mecha Armor', hex: '#94A3B8' }
    ]
  },
  {
    id: 'headwear',
    name: 'Headgear',
    items: [
      { id: 'none', name: 'Free Head', hex: 'transparent' },
      { id: 'genius_glasses', name: 'Dexter Optics', hex: '#000000' },
      { id: 'pink_ribbon', name: 'Leader Bow', hex: '#FF69B4' },
      { id: 'brain_bucket', name: 'Ape Emperor', hex: '#A855F7' },
      { id: 'bravo_shades', name: 'Mega Shades', hex: '#000000' },
      { id: 'wizard', name: 'Mystic Spire', hex: '#6366F1' }
    ]
  },
  {
    id: 'jewelry',
    name: 'Bling',
    items: [
      { id: 'none', name: 'None', hex: 'transparent' },
      { id: 'gold_chain', name: 'Host Chain', hex: '#EAB308' },
      { id: 'pearls', name: 'Fancy Beads', hex: '#F8FAFC' },
      { id: 'monocle', name: 'Gentry Glass', hex: '#D4D4D4' }
    ]
  },
  {
    id: 'footwear',
    name: 'Kicks',
    items: [
      { id: 'sneakers', name: 'High-Tops', hex: '#EF4444' },
      { id: 'lab_boots', name: 'Orange Stompers', hex: '#FF8C00' },
      { id: 'heels', name: 'Glamour Pumps', hex: '#DB2777' },
      { id: 'combat_boots', name: 'Rebel Boots', hex: '#333333' }
    ]
  },
  {
    id: 'handItem',
    name: 'Props',
    items: [
      { id: 'none', name: 'Empty Hands', hex: 'transparent' },
      { id: 'microphone', name: 'Host Mic', hex: '#D4D4D4' },
      { id: 'mallet', name: 'Giant Mallet', hex: '#94A3B8' },
      { id: 'wand', name: 'Magic Brush', hex: '#A855F7' },
      { id: 'anvil', name: 'Iron Anvil', hex: '#333333' },
      { id: 'phone', name: 'Toon Phone', hex: '#EC4899' }
    ]
  }
];

export const UNDERTOTES = [
  'Warm', 'Neutral Warm', 'Neutral', 'Neutral Cool', 'Cool', 'Cool Olive', 'Neutral Olive', 'Warm Olive'
];

export interface SkinTone {
  id: string;
  depth: string;
  undertone: string;
  hex: string;
}

export const SKIN_TONE_CHART: SkinTone[] = [
  // Fair
  { id: '00', depth: 'Fair', undertone: 'Warm', hex: '#FFF5E6' },
  { id: '02', depth: 'Fair', undertone: 'Neutral Warm', hex: '#FFEFDB' },
  { id: '04', depth: 'Fair', undertone: 'Neutral', hex: '#FDF5E6' },
  { id: '06', depth: 'Fair', undertone: 'Neutral Cool', hex: '#FFF0F5' },
  { id: '08', depth: 'Fair', undertone: 'Cool', hex: '#FFE4E1' },
  // Deep
  { id: '60', depth: 'Deep', undertone: 'Warm', hex: '#422811' },
  { id: '62', depth: 'Deep', undertone: 'Neutral Warm', hex: '#3B240E' },
  { id: '64', depth: 'Deep', undertone: 'Neutral', hex: '#2E1A08' },
  { id: '66', depth: 'Deep', undertone: 'Neutral Cool', hex: '#331D1F' },
  { id: '68', depth: 'Deep', undertone: 'Cool', hex: '#2A1416' },
  { id: '70', depth: 'Deep', undertone: 'Neutral Olive', hex: '#212100' }
];
