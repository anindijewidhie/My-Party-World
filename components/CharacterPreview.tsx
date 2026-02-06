import React from 'react';
import { Character, AppearanceSlot } from '../types';
import { BODY_TYPES, AGE_RANGES, MATERIALS, TEXTURES, EYE_STYLES, NOSE_STYLES, MOUTH_STYLES, HAIR_SHAPES, HEAD_SHAPES } from '../constants';

const SlotRenderer: React.FC<{ 
  slot: AppearanceSlot; 
  className?: string; 
  style?: React.CSSProperties; 
  children?: React.ReactNode 
}> = ({ slot, className = '', style = {}, children }) => {
  const material = MATERIALS.find(m => m.id === slot.material) || MATERIALS[0];
  const textureObj = TEXTURES.find(t => t.id === slot.texture);
  
  const pattern = textureObj ? textureObj.pattern : (slot.texture === 'none' ? 'none' : slot.texture);
  const size = textureObj ? textureObj.size : (slot.textureSize || '20px 20px');

  const combinedStyle: React.CSSProperties = {
    ...style,
    backgroundColor: slot.color === 'transparent' ? undefined : slot.color,
    backgroundImage: pattern && pattern !== 'none' ? pattern : undefined,
    backgroundSize: size,
  };

  return (
    <div 
      className={`${className} ${material.css} border-[4px] border-black relative transition-all duration-300`} 
      style={combinedStyle}
    >
      {children}
    </div>
  );
};

interface CharacterPreviewProps {
  character: Character;
  scale?: number;
  previewHairStyle?: string | null;
}

export const CharacterPreview: React.FC<CharacterPreviewProps> = ({ character, scale = 1, previewHairStyle = null }) => {
  const bodyConfig = BODY_TYPES.find(b => b.id === character.bodyType) || BODY_TYPES[0];
  const ageConfig = AGE_RANGES.find(a => a.id === character.ageRange) || AGE_RANGES[1];
  const headShapeConfig = HEAD_SHAPES.find(h => h.id === character.headShape) || HEAD_SHAPES[0];
  
  const finalScale = scale * ageConfig.multiplier;
  const headScale = ageConfig.headScale || 1.0;

  const renderFace = () => {
    const eyeStyle = EYE_STYLES.find(s => s.id === character.eyes.id) || EYE_STYLES[0];
    const noseStyle = NOSE_STYLES.find(s => s.id === character.nose.id) || NOSE_STYLES[0];
    const mouthStyle = MOUTH_STYLES.find(s => s.id === character.mouth.id) || MOUTH_STYLES[0];

    return (
      <div className="absolute inset-0 flex flex-col items-center justify-start pt-6 z-30">
        <div className="flex gap-1 mb-2">
          {[0, 1].map((i) => (
            <div key={i} className={`w-12 h-12 bg-white flex items-center justify-center relative overflow-hidden ${eyeStyle.radius}`}>
               <div 
                  className="w-4 h-4 rounded-full flex items-center justify-center" 
                  style={{ backgroundColor: character.eyes.color }}
               >
                  <div className="w-1.5 h-1.5 bg-black rounded-full" />
               </div>
            </div>
          ))}
        </div>
        <div className="relative mb-2">
          <div className={`${noseStyle.shape}`} />
        </div>
        <div className="relative flex justify-center mt-2">
          <div className={`${mouthStyle.shape}`} style={{ borderColor: character.mouth.id === 'grin' ? 'black' : 'transparent' }} />
        </div>
      </div>
    );
  };

  const getHairElement = (styleId: string, isPreview: boolean = false) => {
    if (styleId === 'none') return null;
    
    const textureObj = TEXTURES.find(t => t.id === character.hair.texture);
    const pattern = textureObj ? textureObj.pattern : (character.hair.texture === 'none' ? 'none' : character.hair.texture);
    const patternSize = textureObj ? textureObj.size : (character.hair.textureSize || '20px 20px');

    const shapeConfig = HAIR_SHAPES.find(s => s.id === character.hairShape) || HAIR_SHAPES[0];
    
    const hairBaseStyle: React.CSSProperties = {
      backgroundColor: isPreview ? 'rgba(0, 255, 255, 0.4)' : character.hair.color,
      backgroundImage: isPreview ? 'linear-gradient(rgba(0,255,255,0.2) 1px, transparent 1px)' : (pattern && pattern !== 'none' ? pattern : undefined),
      backgroundSize: isPreview ? '100% 4px' : patternSize,
      transform: `scale(${character.hairVolume}) scaleX(${shapeConfig.scaleX}) scaleY(${shapeConfig.scaleY}) skewX(${character.hairWarp || 0}deg)`,
      border: isPreview ? '4px dashed rgba(0, 255, 255, 0.8)' : '4px solid black',
      filter: isPreview ? 'drop-shadow(0 0 15px rgba(0, 255, 255, 0.6))' : 'none',
      zIndex: isPreview ? 25 : 20,
    };

    const previewAnim = isPreview ? "animate-pulse" : "";

    switch (styleId) {
      case 'atomic_quiff':
        return (
          <div className={`absolute -top-[70px] w-full flex flex-col items-center pointer-events-none ${isPreview ? 'z-25' : 'z-20'}`}>
            <div 
              className={`w-36 h-28 relative ${previewAnim}`}
              style={{ 
                ...hairBaseStyle,
                clipPath: "polygon(0% 100%, 5% 70%, 15% 40%, 40% 10%, 65% 0%, 95% 30%, 100% 100%)",
                top: '15px'
              }}
            >
                {!isPreview && <div className="absolute top-2 left-4 w-12 h-6 bg-white/30 rounded-full blur-[1px] rotate-[-10deg]" />}
            </div>
          </div>
        );
      case 'tall_pigtails':
        return (
          <div className={`absolute -top-24 w-full flex justify-between px-[-40px] pointer-events-none ${isPreview ? 'z-25' : 'z-20'}`}>
            <div className={`flex flex-col items-center -rotate-[25deg] translate-x-[-20px] origin-bottom ${previewAnim}`}>
               <div className={`w-4 h-16 ${isPreview ? 'bg-cyan/40' : 'bg-black'}`} />
               <div className="w-20 h-20 rounded-full" style={hairBaseStyle}>
                  {!isPreview && <div className="w-6 h-6 bg-black rounded-full absolute -top-2 -right-2" />}
               </div>
            </div>
            <div className={`flex flex-col items-center rotate-[25deg] translate-x-[20px] origin-bottom ${previewAnim}`}>
               <div className={`w-4 h-16 ${isPreview ? 'bg-cyan/40' : 'bg-black'}`} />
               <div className="w-20 h-20 rounded-full" style={hairBaseStyle}>
                  {!isPreview && <div className="w-6 h-6 bg-black rounded-full absolute -top-2 -left-2" />}
               </div>
            </div>
          </div>
        );
      case 'bowl_cut':
        return (
          <div 
            className={`absolute -top-6 w-[115%] h-20 pointer-events-none ${isPreview ? 'z-25' : 'z-20'} ${previewAnim}`}
            style={{ 
              ...hairBaseStyle,
              clipPath: "polygon(0% 100%, 0% 0%, 100% 0%, 100% 100%, 85% 90%, 70% 100%, 50% 90%, 30% 100%, 15% 90%)",
              borderRadius: "0 0 1rem 1rem"
            }}
          />
        );
      case 'beehive':
        return (
          <div 
            className={`absolute -top-[100px] w-32 h-40 pointer-events-none ${isPreview ? 'z-25' : 'z-20'} ${previewAnim}`}
            style={{ 
              ...hairBaseStyle,
              borderRadius: "50% 50% 15% 15% / 100% 100% 15% 15%",
              boxShadow: !isPreview ? 'inset -8px -8px 0 rgba(0,0,0,0.1)' : 'none'
            }}
          />
        );
      case 'slick_back':
        return (
          <div 
            className={`absolute -top-12 w-36 h-16 pointer-events-none ${isPreview ? 'z-25' : 'z-20'} ${previewAnim}`}
            style={{ 
              ...hairBaseStyle,
              borderRadius: "3rem 3rem 1rem 1rem"
            }}
          >
             {!isPreview && (
               <>
                 <div className="w-full h-[4px] bg-black/20 absolute top-4 left-0" />
                 <div className="w-full h-[4px] bg-black/20 absolute top-8 left-0" />
               </>
             )}
          </div>
        );
      case 'pompadour':
        return (
          <div className={`absolute -top-[90px] w-full flex flex-col items-center pointer-events-none ${isPreview ? 'z-25' : 'z-20'}`}>
            <div 
              className={`w-40 h-32 relative ${previewAnim}`}
              style={{ 
                ...hairBaseStyle,
                clipPath: "polygon(0% 100%, 10% 20%, 50% 0%, 90% 20%, 100% 100%)",
                borderRadius: "50% 50% 0 0"
              }}
            >
              {!isPreview && <div className="absolute top-4 left-6 w-20 h-8 bg-white/10 rounded-full" />}
            </div>
          </div>
        );
      case 'spiky':
        return (
          <div className={`absolute -top-16 w-full flex flex-col items-center pointer-events-none ${isPreview ? 'z-25' : 'z-20'}`}>
            <div 
              className={`w-36 h-20 relative ${previewAnim}`}
              style={{ 
                ...hairBaseStyle,
                clipPath: "polygon(0% 100%, 10% 20%, 25% 60%, 40% 0%, 55% 60%, 70% 0%, 85% 60%, 100% 100%)"
              }}
            />
          </div>
        );
      default:
        return (
          <div 
            className={`absolute -top-10 w-32 h-20 rounded-t-[5rem] pointer-events-none ${isPreview ? 'z-25' : 'z-20'} ${previewAnim}`}
            style={hairBaseStyle}
          />
        );
    }
  };

  const renderBody = () => {
    const torsoStyle: React.CSSProperties = character.bodyType === 'triangle' 
      ? { clipPath: 'polygon(0% 0%, 100% 0%, 75% 100%, 25% 100%)' }
      : {};

    return (
      <div className="relative flex flex-col items-center">
        <div className="absolute -left-12 top-2 flex flex-col items-center origin-top -rotate-12">
           <SlotRenderer slot={character.arms} className={`${bodyConfig.limbW} h-32 rounded-none border-t-0`}>
             <div className="absolute bottom-0 w-10 h-10 bg-white border-[4px] border-black rounded-full -left-3" />
           </SlotRenderer>
        </div>
        <div className="absolute -right-12 top-2 flex flex-col items-center origin-top rotate-12">
           <SlotRenderer slot={character.arms} className={`${bodyConfig.limbW} h-32 rounded-none border-t-0`}>
              <div className="absolute bottom-0 w-10 h-10 bg-white border-[4px] border-black rounded-full -right-3" />
           </SlotRenderer>
        </div>
        <SlotRenderer 
          slot={character.torso} 
          className={`${bodyConfig.chestW} ${bodyConfig.torsoH} rounded-none relative z-30`}
          style={torsoStyle}
        >
           <SlotRenderer slot={character.outfit} className="absolute inset-0 opacity-100 flex flex-col items-center">
              <div className="w-[4px] h-full bg-black/20" />
           </SlotRenderer>
        </SlotRenderer>
        <div className="flex gap-8 -mt-1 relative z-10">
          <div className="flex flex-col items-center">
            <SlotRenderer slot={character.legs} className={`${bodyConfig.limbW} h-12 rounded-none border-t-0`} />
            <SlotRenderer slot={character.footwear} className="w-12 h-6 rounded-none -mt-1 bg-black" />
          </div>
          <div className="flex flex-col items-center">
            <SlotRenderer slot={character.legs} className={`${bodyConfig.limbW} h-12 rounded-none border-t-0`} />
            <SlotRenderer slot={character.footwear} className="w-12 h-6 rounded-none -mt-1 bg-black" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div 
      className="relative flex flex-col items-center justify-center transition-all duration-700 select-none character-preview-container"
      style={{ transform: `scale(${finalScale})`, transformOrigin: 'center center' }}
    >
      <div className="relative z-50 mb-[-10px]" style={{ transform: `scale(${headScale})` }}>
        {getHairElement(character.hairStyle, false)}
        {previewHairStyle && previewHairStyle !== character.hairStyle && getHairElement(previewHairStyle, true)}
        <SlotRenderer 
          slot={character.head} 
          className={`w-28 h-28 shadow-xl ${headShapeConfig.css}`}
        >
          {renderFace()}
        </SlotRenderer>
      </div>
      {renderBody()}
    </div>
  );
};
