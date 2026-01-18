import React from 'react';
import { Character } from '../types';
import { BODY_TYPES, AGE_RANGES } from '../constants';

export const CharacterPreview: React.FC<{ character: Character; scale?: number }> = ({ character, scale = 1 }) => {
  const bodyConfig = BODY_TYPES.find(b => b.id === character.bodyType) || BODY_TYPES[0];
  const ageConfig = AGE_RANGES.find(a => a.id === character.ageRange) || AGE_RANGES[2]; // Default to Teenager
  
  const finalScale = scale * ageConfig.multiplier;

  return (
    <div 
      className="relative flex flex-col items-center justify-center animate-bounce-subtle"
      style={{ transform: `scale(${finalScale})`, transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}
    >
      {/* Cartoon Shadow */}
      <div className="absolute -bottom-4 w-24 h-6 bg-black/20 rounded-full blur-[2px]" />

      {/* Back Accessories */}
      {character.accessory === 'wings' && (
        <div className="absolute -z-10 flex gap-12">
          <div className="w-20 h-32 bg-white/90 border-[6px] border-black rounded-full -rotate-12" />
          <div className="w-20 h-32 bg-white/90 border-[6px] border-black rounded-full rotate-12" />
        </div>
      )}
      {character.accessory === 'cape' && (
        <div className="absolute top-20 -z-10 w-24 h-40 bg-red-600 border-[6px] border-black rounded-b-xl animate-pulse" />
      )}

      {/* Head - Classic Flat Toon Style */}
      <div 
        className="w-24 h-24 border-[6px] border-black rounded-2xl relative z-20 overflow-visible"
        style={{ backgroundColor: character.skinColor }}
      >
        {/* Hair Styles */}
        {character.hairStyle === 'short' && (
          <div className="absolute -top-2 -left-1 w-[105%] h-8 bg-black border-[5px] border-black rounded-t-xl z-30" />
        )}
        {character.hairStyle === 'pompadour' && (
          <div className="absolute -top-12 -left-1 w-[110%] h-14 bg-black border-[5px] border-black rounded-t-[40px] z-30" />
        )}
        {character.hairStyle === 'long' && (
          <div className="absolute -top-4 -left-4 w-[130%] h-24 bg-black border-[5px] border-black rounded-t-3xl -z-10" />
        )}
        {character.hairStyle === 'spiky' && (
          <div className="absolute -top-8 left-0 flex gap-1 z-30">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="w-6 h-10 bg-black border-[5px] border-black" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
            ))}
          </div>
        )}
        {character.hairStyle === 'pigtails' && (
          <div className="absolute -top-2 left-0 w-full flex justify-between z-30">
             <div className="w-10 h-10 bg-black border-[5px] border-black rounded-full -translate-x-6" />
             <div className="w-10 h-10 bg-black border-[5px] border-black rounded-full translate-x-6" />
          </div>
        )}

        {/* Headwear - Specific CN Styles */}
        {character.headwear === 'genius_glasses' && (
          <div className="absolute top-6 -left-2 w-[115%] h-12 flex gap-1 z-40">
             <div className="w-1/2 h-full bg-cyan-100 border-[5px] border-black rounded-lg" />
             <div className="w-1/2 h-full bg-cyan-100 border-[5px] border-black rounded-lg" />
          </div>
        )}
        {character.headwear === 'pink_ribbon' && (
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-16 h-8 bg-pink-400 border-[5px] border-black rounded-full z-40 flex items-center justify-center">
             <div className="w-4 h-4 bg-pink-600 rounded-full" />
          </div>
        )}
        {character.headwear === 'bravo_shades' && (
          <div className="absolute top-8 -left-2 w-[115%] h-6 bg-black border-[2px] border-gray-600 z-50 rounded-full" />
        )}
        {character.headwear === 'wizard' && (
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-20 h-24 bg-indigo-600 border-[5px] border-black z-40" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
        )}

        {/* Eyes (if not covered by glasses) */}
        {(!['genius_glasses', 'bravo_shades'].includes(character.headwear)) && (
          <>
            <div className="absolute top-8 left-3 w-7 h-8 bg-white border-[4px] border-black rounded-full overflow-hidden">
              <div className="absolute top-2 left-1 w-3 h-3 bg-black rounded-full" />
            </div>
            <div className="absolute top-8 right-3 w-7 h-8 bg-white border-[4px] border-black rounded-full overflow-hidden">
              <div className="absolute top-2 right-1 w-3 h-3 bg-black rounded-full" />
            </div>
          </>
        )}
        
        {/* Mouth */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-6 h-1 bg-black rounded-full" />
      </div>

      {/* Jewelry */}
      {character.jewelry === 'gold_chain' && (
        <div className="absolute top-24 w-16 h-8 border-b-[8px] border-yellow-500 rounded-full z-40" />
      )}

      {/* Body & Props */}
      <div className="relative flex items-center">
        {/* Left Hand Prop */}
        <div className="w-5 h-12 border-[5px] border-black rotate-[-45deg] origin-top translate-y-4" style={{ backgroundColor: character.skinColor }}>
          {character.handItem === 'mallet' && <div className="absolute bottom-0 w-8 h-24 bg-orange-900 border-[5px] border-black -translate-x-1 translate-y-24 rotate-[45deg] flex items-end justify-center"><div className="w-20 h-16 bg-gray-400 border-[5px] border-black rounded-lg" /></div>}
          {character.handItem === 'microphone' && <div className="absolute bottom-0 w-6 h-12 bg-black border-[5px] border-black translate-y-12 rotate-[45deg]"><div className="w-10 h-10 bg-gray-300 border-[4px] border-black rounded-full -translate-x-2 -translate-y-4" /></div>}
        </div>

        {/* Torso */}
        <div 
          className={`${bodyConfig.width} ${bodyConfig.height} border-[6px] border-black -mt-4 z-10 relative overflow-hidden`}
          style={{ backgroundColor: character.outfit }}
        >
          {/* Outfit Decorations (Stripes, Logos) */}
          {character.outfit === '#FFD700' && <div className="absolute inset-x-0 top-1/2 h-4 bg-red-600 border-y-[2px] border-black" />}
          {character.outfit === '#FFFFFF' && <div className="absolute right-2 top-4 w-4 h-6 bg-black/10 rounded" />}
        </div>

        {/* Right Hand Prop */}
        <div className="w-5 h-12 border-[5px] border-black rotate-[45deg] origin-top translate-y-4" style={{ backgroundColor: character.skinColor }}>
          {character.handItem === 'phone' && <div className="absolute bottom-0 w-10 h-14 bg-pink-500 border-[5px] border-black translate-y-14" />}
          {character.handItem === 'anvil' && <div className="absolute bottom-0 w-20 h-16 bg-gray-700 border-[5px] border-black rounded-t-xl translate-y-16" />}
        </div>
      </div>

      {/* Legs & Shoes */}
      <div className="flex gap-4 -mt-2">
        <div className="w-8 h-12 border-[6px] border-black relative overflow-hidden" style={{ backgroundColor: character.skinColor }}>
          <div className="absolute bottom-0 w-full h-5 border-t-[4px] border-black" style={{ backgroundColor: character.footwear !== 'transparent' ? character.footwear : '#111' }} />
        </div>
        <div className="w-8 h-12 border-[6px] border-black relative overflow-hidden" style={{ backgroundColor: character.skinColor }}>
           <div className="absolute bottom-0 w-full h-5 border-t-[4px] border-black" style={{ backgroundColor: character.footwear !== 'transparent' ? character.footwear : '#111' }} />
        </div>
      </div>
    </div>
  );
};
