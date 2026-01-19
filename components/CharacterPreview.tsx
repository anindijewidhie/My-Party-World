import React from 'react';
import { Character, AppearanceSlot } from '../types';
import { BODY_TYPES, AGE_RANGES, MATERIALS, TEXTURES } from '../constants';

const SlotRenderer: React.FC<{ 
  slot: AppearanceSlot; 
  className?: string; 
  style?: React.CSSProperties; 
  children?: React.ReactNode 
}> = ({ slot, className = '', style = {}, children }) => {
  const material = MATERIALS.find(m => m.id === slot.material) || MATERIALS[0];
  const texture = TEXTURES.find(t => t.id === slot.texture) || TEXTURES[0];

  const combinedStyle: React.CSSProperties = {
    ...style,
    backgroundColor: slot.color,
    backgroundImage: texture.pattern !== 'none' ? texture.pattern : undefined,
    backgroundSize: texture.size,
  };

  return (
    <div 
      className={`${className} ${material.css} relative overflow-hidden transition-all duration-300`} 
      style={combinedStyle}
    >
      {/* Signature 2000s 'Ink-Splat' depth shadow */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_-8px_-8px_0px_rgba(0,0,0,0.15)]" />
      {children}
    </div>
  );
};

export const CharacterPreview: React.FC<{ character: Character; scale?: number }> = ({ character, scale = 1 }) => {
  const bodyConfig = BODY_TYPES.find(b => b.id === character.bodyType) || BODY_TYPES[0];
  const ageConfig = AGE_RANGES.find(a => a.id === character.ageRange) || AGE_RANGES[2];
  
  const finalScale = scale * ageConfig.multiplier;
  const hairVol = character.hairVolume || 1.0;

  // Aesthetic constants: Extra Bold black ink lines (Typical 2000s CN)
  const BOLD_LINE = "border-[8px] border-black";
  const MEDIUM_LINE = "border-[6px] border-black";

  // Geometric torso adjustments based on body type
  const getTorsoRadius = (id: string) => {
    switch(id) {
      case 'standard': return 'rounded-[2rem]';
      case 'round': return 'rounded-[3rem]';
      case 'boxy': return 'rounded-md';
      case 'bean': return 'rounded-[4rem]';
      case 'triangle': return 'rounded-t-[5rem] rounded-b-xl';
      case 'teardrop': return 'rounded-b-[5rem] rounded-t-xl';
      default: return 'rounded-3xl';
    }
  };

  return (
    <div 
      className="relative flex flex-col items-center justify-center"
      style={{ 
        transform: `scale(${finalScale})`, 
        transition: 'transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        filter: 'drop-shadow(0 25px 20px rgba(0,0,0,0.2))'
      }}
    >
      {/* 2D Flat Shadow - Classic Retro Look */}
      <div className="absolute -bottom-12 w-48 h-5 bg-black/20 rounded-[100%] blur-[2px]" />

      {/* Accessories / Back Layer */}
      {character.accessory.id !== 'none' && (
        <div className="absolute -z-20 top-28">
          {character.accessory.id === 'wings' ? (
            <div className="flex gap-28">
              <SlotRenderer slot={character.accessory} className={`w-36 h-72 ${BOLD_LINE} rounded-[100%_15%_100%_15%] -rotate-[35deg]`} />
              <SlotRenderer slot={character.accessory} className={`w-36 h-72 ${BOLD_LINE} rounded-[15%_100%_15%_100%] rotate-[35deg]`} />
            </div>
          ) : (
             <SlotRenderer slot={character.accessory} className={`w-44 h-80 ${BOLD_LINE} rounded-b-[45%] animate-pulse origin-top scale-x-110`} />
          )}
        </div>
      )}

      {/* Human-Proportioned Head - Reduced relative size (approx 1/4 to 1/5 of height) */}
      <SlotRenderer slot={character.head} className={`w-28 h-32 ${BOLD_LINE} rounded-[3rem] relative z-20 overflow-visible shadow-lg`}>
        
        {/* Dynamic Hair Volume Silhouette */}
        {character.hairStyle !== 'none' && (
          <SlotRenderer 
            slot={character.hair} 
            className={`absolute -inset-3 -top-5 ${MEDIUM_LINE} rounded-t-[4rem] -z-10`} 
            style={{ 
              height: `${22 * hairVol}px`,
              transform: `translateY(${(1 - hairVol) * 10}px) scaleX(${Math.min(hairVol, 1.4)})`,
              transformOrigin: 'bottom center'
            }}
          />
        )}

        {/* 'Powerpuff' Expressive Eyes - Slightly smaller for humanoid scale */}
        <div className="absolute top-8 left-0 right-0 flex justify-center gap-1 px-0.5">
          <div className={`w-11 h-13 bg-white ${MEDIUM_LINE} rounded-full relative overflow-hidden`}>
            <SlotRenderer slot={character.eyes} className="absolute top-2 left-2 w-6 h-8 rounded-full">
              <div className="absolute top-0.5 left-0.5 w-2 h-2 bg-white rounded-full opacity-90" />
            </SlotRenderer>
          </div>
          <div className={`w-11 h-13 bg-white ${MEDIUM_LINE} rounded-full relative overflow-hidden`}>
            <SlotRenderer slot={character.eyes} className="absolute top-2 right-2 w-6 h-8 rounded-full">
              <div className="absolute top-0.5 right-0.5 w-2 h-2 bg-white rounded-full opacity-90" />
            </SlotRenderer>
          </div>
        </div>

        {/* Mouth - Stylized humanoid ink stroke */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-8 h-2 bg-black rounded-full opacity-80" />

        {/* Bangs / Hair Detail */}
        {character.hairStyle === 'spiky' && (
          <div className="absolute -top-10 left-0 right-0 flex justify-center gap-1" style={{ transform: `scale(${hairVol})`, transformOrigin: 'bottom center' }}>
             <SlotRenderer slot={character.hair} className="w-6 h-12 border-[5px] border-black rotate-[-20deg] rounded-full" />
             <SlotRenderer slot={character.hair} className="w-6 h-14 border-[5px] border-black rounded-full" />
             <SlotRenderer slot={character.hair} className="w-6 h-12 border-[5px] border-black rotate-[20deg] rounded-full" />
          </div>
        )}

        {/* Headwear */}
        {character.headwear.id !== 'none' && (
          <SlotRenderer slot={character.headwear} className={`absolute -top-14 left-1/2 -translate-x-1/2 w-24 h-16 ${MEDIUM_LINE} z-40 rounded-t-[1.5rem]`} />
        )}
      </SlotRenderer>

      {/* Humanoid Neck */}
      <div className="relative z-10 -mt-1">
        <SlotRenderer slot={character.head} className="w-8 h-8 border-x-[8px] border-black mx-auto" />
        {character.jewelry.id !== 'none' && (
          <SlotRenderer slot={character.jewelry} className={`absolute top-0 left-1/2 -translate-x-1/2 w-20 h-6 ${MEDIUM_LINE} rounded-full`} />
        )}
      </div>

      {/* Body & Humanoid Limbs */}
      <div className="relative flex items-start -mt-2">
        {/* Left Arm - Lengthened for humanoid proportion */}
        <SlotRenderer slot={character.arms} className={`w-8 h-40 ${MEDIUM_LINE} rounded-full -rotate-[20deg] origin-top translate-y-4 -mr-4`} />

        {/* Humanoid Torso - Significantly taller than the head */}
        <div className="relative z-10">
          <SlotRenderer 
            slot={character.torso} 
            className={`${bodyConfig.width} ${bodyConfig.height} ${BOLD_LINE} ${getTorsoRadius(bodyConfig.id)} relative overflow-visible`}
          >
             {/* Clothing Layers */}
             <SlotRenderer slot={character.outfit} className="absolute inset-x-0 bottom-0 h-[75%] border-t-[8px] border-black/20 opacity-95" />
          </SlotRenderer>
        </div>

        {/* Right Arm & Hand Prop */}
        <SlotRenderer slot={character.arms} className={`w-8 h-40 ${MEDIUM_LINE} rounded-full rotate-[20deg] origin-top translate-y-4 -ml-4 flex flex-col items-center`}>
           {character.handItem.id !== 'none' && (
             <SlotRenderer slot={character.handItem} className={`w-20 h-24 ${BOLD_LINE} rounded-2xl -mt-4 translate-y-36 rotate-[-5deg] shadow-xl flex items-center justify-center font-brand text-[10px] text-white`}>
                <div className="bg-black/20 w-full h-full flex items-center justify-center uppercase">
                  {character.handItem.id.slice(0, 3)}
                </div>
             </SlotRenderer>
           )}
        </SlotRenderer>
      </div>

      {/* Lengthened Legs & Shoes */}
      <div className="flex gap-14 -mt-6 relative z-0">
        <div className="relative">
          <SlotRenderer slot={character.legs} className={`w-12 h-44 ${MEDIUM_LINE} rounded-b-xl`}>
            {/* Realistic humanoid leg proportions */}
            <SlotRenderer slot={character.footwear} className={`absolute bottom-0 inset-x-0 h-14 border-t-[8px] border-black rounded-b-lg`} />
          </SlotRenderer>
        </div>
        <div className="relative">
          <SlotRenderer slot={character.legs} className={`w-12 h-44 ${MEDIUM_LINE} rounded-b-xl`}>
            <SlotRenderer slot={character.footwear} className={`absolute bottom-0 inset-x-0 h-14 border-t-[8px] border-black rounded-b-lg`} />
          </SlotRenderer>
        </div>
      </div>
    </div>
  );
};