
export const COLORS = {
  MAGENTA: '#FF00FF',
  OLIVE: '#A2A200',
  CYAN: '#00FFFF',
  WHITE: '#FFFFFF',
  BLACK: '#000000',
  NUCLEAR_GREEN: '#39FF14',
  SUN_YELLOW: '#FFD700',
  DEEP_INDIGO: '#2E008B',
  LAB_BLACK: '#0a0a0c',
  DEX_ORANGE: '#FF4500',
  DEEDEE_YELLOW: '#FFFF00',
  MOM_RED: '#D80000',
  MANDARK_BLACK: '#000000'
};

export const QUESTS = [
  { id: 'q1', title: 'Science Fair', desc: 'Host a gathering in the Secret Lab for 15 minutes.', reward: 20.00, target: 'nebula' },
  { id: 'q2', title: 'Dork Alert!', desc: 'Keep your Cool Vibe high while Dee Dee is around.', reward: 10.00, target: 'living_room' },
  { id: 'q3', title: 'Atomic Party', desc: 'Reach 100% Vibe using experimental fission.', reward: 30.00, target: 'any' }
];

export const MATERIALS = [
  { id: 'matte', name: 'Solid Paint', css: '' },
  { id: 'hatch', name: 'Ink Shade', css: 'bg-[radial-gradient(#000_2px,transparent_0)] [background-size:6px_6px]' },
  { id: 'blueprint', name: 'Draft Grid', css: 'bg-[linear-gradient(#000_1px,transparent_1px),linear-gradient(90deg,#000_1px,transparent_1px)] [background-size:10px_10px]' },
  { id: 'metallic', name: 'Chrome Chrome', css: 'border-white border-4' }
];

export const TEXTURES = [
  { id: 'none', name: 'Flat Color', pattern: 'none' },
  { id: 'dots', name: 'Halftone', pattern: 'radial-gradient(rgba(0,0,0,1) 1px, transparent 0)', size: '4px 4px' },
  { id: 'shine', name: 'Glossy', pattern: 'linear-gradient(45deg, rgba(255,255,255,0.2) 25%, transparent 25%)', size: '10px 10px' }
];

export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'Credits', rate: 1 }
];

export const THEMES = [
  'Secret Lab Experiment',
  'Nuclear Disco',
  'Interdimensional Mixer',
  'Recursive Reality Party',
  'Deep Sea Rave',
  'Magma Mosh',
  'Orbiting Afterparty',
  'Cybernetic Shindig'
];

export const LOCATIONS = [
  { id: 'living_room', name: 'The Suburbs', color: '#FFD700', icon: '🏡', style: 'bg-sun-yellow text-black' },
  { id: 'penthouse', name: 'High Rise', color: '#FFFFFF', icon: '🏢', style: 'bg-white text-black' },
  { id: 'outer_space', name: 'Orbit Station', color: '#2E008B', icon: '🛸', style: 'bg-[#0a0a20] text-white' },
  { id: 'nebula', name: 'The Secret Lab', color: '#D100D1', icon: '🧪', style: 'bg-magenta text-white' },
  { id: 'industrial', name: 'Tech Factory', color: '#A2A200', icon: '⚙️', style: 'bg-olive text-white' },
  { id: 'underwater', name: 'Deep Sea Dome', color: '#00FFFF', icon: '🧜‍♂️', style: 'bg-cyan text-black' },
  { id: 'volcano', name: 'Magma Fortress', color: '#D80000', icon: '🌋', style: 'bg-red-600 text-white' },
  { id: 'arcade', name: 'Retro Joypad', color: '#FF00FF', icon: '🕹️', style: 'bg-magenta text-white' },
  { id: 'mall', name: 'Mega Mall', color: '#FFFFFF', icon: '🛍️', style: 'bg-white text-black' },
  { id: 'mansion', name: 'Spooky Manor', color: '#4B2E1E', icon: '🏰', style: 'bg-[#1a0f0a] text-white' },
  { id: 'jungle', name: 'Wild Canopy', color: '#39FF14', icon: '🌴', style: 'bg-nuclear-green text-black' },
  { id: 'clouds', name: 'Sky Haven', color: '#00FFFF', icon: '☁️', style: 'bg-cyan text-black' },
  { id: 'ice', name: 'Ice Kingdom', color: '#FFFFFF', icon: '❄️', style: 'bg-blue-100 text-black' },
  { id: 'desert', name: 'Dune Oasis', color: '#FFD700', icon: '🏜️', style: 'bg-orange-300 text-black' },
  { id: 'temple', name: 'Pixel Ruins', color: '#A2A200', icon: '⛩️', style: 'bg-yellow-800 text-white' },
  { id: 'stadium', name: 'Hyper Arena', color: '#FFFFFF', icon: '🏟️', style: 'bg-white text-black' },
  { id: 'dojo', name: 'Martial Dojo', color: '#D80000', icon: '🥋', style: 'bg-red-700 text-white' },
  { id: 'subway', name: 'Subway Station', color: '#A2A200', icon: '🚇', style: 'bg-gray-600 text-white' },
  { id: 'farm', name: 'The Countryside', color: '#FFD700', icon: '🚜', style: 'bg-green-600 text-white' },
  { id: 'cyber', name: 'Neon City', color: '#00FFFF', icon: '🌃', style: 'bg-black text-cyan' }
];

export const PROVIDERS = ['Lab Network', 'Global Science Fund', 'Digital Payouts'];

export const BODY_TYPES = [
  { id: 'boxy', name: 'The Genius', chestW: 'w-36', waistW: 'w-36', hipsW: 'w-36', torsoH: 'h-32', limbW: 'w-3', shape: 'rect' },
  { id: 'lanky', name: 'The Pest', chestW: 'w-20', waistW: 'w-16', hipsW: 'w-20', torsoH: 'h-56', limbW: 'w-2', shape: 'slender' },
  { id: 'triangle', name: 'The Muscle', chestW: 'w-56', waistW: 'w-16', hipsW: 'w-16', torsoH: 'h-48', limbW: 'w-6', shape: 'bravo' },
  { id: 'round', name: 'The Friend', chestW: 'w-44', waistW: 'w-44', hipsW: 'w-44', torsoH: 'h-44', limbW: 'w-4', shape: 'bloo' }
];

export const HEAD_SHAPES = [
  { id: 'round', name: 'Hyper Round', css: 'rounded-full' },
  { id: 'pill', name: 'Long Pill', css: 'rounded-[4rem]' },
  { id: 'wedge', name: 'Modern Wedge', css: 'rounded-[2rem_2rem_0.5rem_0.5rem]' },
  { id: 'geometric', name: 'Boxy Prime', css: 'rounded-[1rem]' }
];

export const EYE_STYLES = [
  { id: 'glasses', name: 'Huge Spectacles', radius: 'rounded-none border-[6px] border-black scale-125' },
  { id: 'round', name: 'Wide Eyed', radius: 'rounded-full border-[4px] border-black' },
  { id: 'angry', name: 'Determined', radius: 'rounded-t-full border-[4px] border-black scale-y-75' },
  { id: 'sparkle', name: 'Dreamy', radius: 'rounded-full border-[4px] border-black shadow-[inset_2px_2px_0_white]' }
];

export const NOSE_STYLES = [
  { id: 'pointy', name: 'The Beak', shape: 'w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[25px] border-t-black/30' },
  { id: 'button', name: 'Small Dot', shape: 'w-3 h-3 rounded-full' },
  { id: 'sharp', name: 'Modern Grade', shape: 'w-2 h-6 rotate-45 skew-x-12' }
];

export const MOUTH_STYLES = [
  { id: 'line', name: 'Focused Flat', shape: 'w-8 h-1 bg-black' },
  { id: 'grin', name: 'Genius Smile', shape: 'w-10 h-5 border-b-[4px] border-black rounded-b-full' },
  { id: 'pout', name: 'Snooty Pout', shape: 'w-4 h-4 border-[3px] border-black rounded-full scale-50' },
  { id: 'shout', name: 'SHUT UP!', shape: 'w-8 h-8 border-[4px] border-black rounded-full bg-black/10' }
];

export const AGE_RANGES = [
  { id: 'child', name: 'Boy Genius', multiplier: 0.8, headScale: 1.4, posture: 'focused' },
  { id: 'adult', name: 'Research Lead', multiplier: 1.1, headScale: 1.0, posture: 'upright' }
];

export const HAIR_STYLES = [
  { id: 'atomic_quiff', name: 'The Boy Genius', icon: '⚡' },
  { id: 'tall_pigtails', name: 'Hyper Dancer', icon: '🎀' },
  { id: 'bowl_cut', name: 'The Rival', icon: '🥣' },
  { id: 'beehive', name: 'Lab Matriarch', icon: '🐝' },
  { id: 'slick_back', name: 'The Patriarch', icon: '🕶️' },
  { id: 'pompadour', name: 'The Bravo', icon: '💪' },
  { id: 'spiky', name: 'The Action Hero', icon: '🔥' }
];

export const HAIR_SHAPES = [
  { id: 'standard', name: 'Standard', scaleX: 1, scaleY: 1 },
  { id: 'wide', name: 'Wide Silhouette', scaleX: 1.25, scaleY: 0.9 },
  { id: 'slim', name: 'Sleek & Narrow', scaleX: 0.8, scaleY: 1.1 },
  { id: 'compressed', name: 'Flat Compressed', scaleX: 1.1, scaleY: 0.6 }
];

export const ITEM_CATEGORIES = [
  { id: 'hair', name: 'Hair Base' },
  { id: 'anatomy', name: 'Anatomy' },
  { id: 'outfit', name: 'Lab Coat' },
  { id: 'eyes', name: 'Spectacles' },
  { id: 'head_shape', name: 'Head Shape' }
];

export const HAIR_COLORS = [
  { id: 'orange', hex: '#FF4500', name: 'Genius Ginger' },
  { id: 'yellow', hex: '#FFFF00', name: 'Hyper Blonde' },
  { id: 'black', hex: '#000000', name: 'Rival Void' },
  { id: 'red', hex: '#D80000', name: 'Matriarch Crimson' },
  { id: 'brown', hex: '#4B2E1E', name: 'Patriarch Walnut' },
  { id: 'cyan', hex: '#00FFFF', name: 'Radioactive Cyan' }
];

export const SKIN_TONE_CHART = [
  { id: 'dex', name: 'Standard', hex: '#FFDBAC' },
  { id: 'pale', name: 'Laboratory Pale', hex: '#FFFFFF' },
  { id: 'warm', name: 'Sunset Drive', hex: '#E0AC69' }
];
