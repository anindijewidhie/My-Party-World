import React, { useState } from 'react';
import { CNButton, CNCard, CNHeading, CNInput } from './UIElements';
import { User } from '../types';

interface AuthScreenProps {
  onLogin: (user: User) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [step, setStep] = useState<'methods' | 'age'>('methods');
  const [selectedProvider, setSelectedProvider] = useState<User['provider']>(null);
  const [username, setUsername] = useState('');
  const [age, setAge] = useState<number>(18);
  const [phone, setPhone] = useState('');

  const handleProviderSelect = (p: User['provider']) => {
    setSelectedProvider(p);
    setStep('age');
  };

  const isUsernameValid = username.length >= 1 && username.length <= 30;

  const handleFinalize = () => {
    if (age < 5) {
      alert("My Party World protocol requires a minimum age of 5.");
      return;
    }
    if (!isUsernameValid) {
      alert("DNA Signature must be 1-30 characters.");
      return;
    }

    onLogin({
      id: Math.random().toString(36).substr(2, 9),
      name: username,
      age,
      isLoggedIn: true,
      provider: selectedProvider,
      parentalControlActive: age < 18
    });
  };

  return (
    <div className="max-w-2xl w-full fade-in">
      <CNCard className="w-full bg-white border-[12px] border-black shadow-[30px_30px_0px_0px_rgba(0,0,0,1)]">
        {step === 'methods' ? (
          <div className="space-y-12 text-center py-10">
            <CNHeading className="text-7xl italic border-b-[8px] border-cyan pb-8 text-black drop-shadow-none">UPLINK_PROTOCOL</CNHeading>
            <p className="text-black font-brand uppercase tracking-[0.4em] text-xs font-bold opacity-40">CHOOSE ACCESS AUTHENTICATION</p>
            
            <div className="grid grid-cols-1 gap-8">
              <CNButton variant="magenta" className="flex items-center justify-center gap-10 text-4xl py-12 border-[8px] border-black" onClick={() => handleProviderSelect('steam')}>
                <span className="text-7xl">🎮</span> STEAM_SYNC
              </CNButton>
              <CNButton variant="cyan" className="flex items-center justify-center gap-10 text-4xl py-12 border-[8px] border-black" onClick={() => handleProviderSelect('google')}>
                <span className="text-7xl">G</span> NEURAL_AUTH
              </CNButton>
              <CNButton variant="white" className="flex items-center justify-center gap-10 text-4xl py-12 border-[8px] border-black" onClick={() => handleProviderSelect('apple')}>
                <span className="text-7xl"></span> CLOUD_VERIFY
              </CNButton>
              
              <div className="relative py-8">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t-[6px] border-black border-dashed opacity-20"></span></div>
                <div className="relative flex justify-center text-sm uppercase font-brand"><span className="bg-white px-6 font-bold text-black/40 italic">OR MOBILE_UPLINK</span></div>
              </div>

              <div className="space-y-6">
                <CNInput 
                  type="tel" 
                  placeholder="+00-PHONELINE" 
                  className="h-28 text-5xl text-center border-[8px]"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <CNButton className="w-full h-24 text-3xl border-[8px] border-black" onClick={() => handleProviderSelect('phone')} disabled={!phone}>
                  CONNECT_NODE
                </CNButton>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-12 text-center py-10">
            <CNHeading className="text-7xl italic border-b-[8px] border-magenta pb-8 text-black drop-shadow-none">DNA_IDENTITY</CNHeading>
            
            <div className="space-y-12 px-6">
              <div className="space-y-6">
                <p className="text-left font-brand text-sm uppercase text-black/40 tracking-widest font-bold italic">GENETIC SIGNATURE (USERNAME)</p>
                <CNInput 
                  type="text" 
                  maxLength={30}
                  placeholder="ID_GENIUS_721" 
                  className={`text-3xl border-[8px] ${username.length > 0 && !isUsernameValid ? 'border-red-600' : 'border-black'}`}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <div className="flex justify-end">
                   <span className={`font-brand text-[10px] font-bold ${username.length > 30 ? 'text-red-600' : 'text-black/30'}`}>
                     {username.length}/30 BIT_ALLOCATION
                   </span>
                </div>
              </div>

              <div className="space-y-6">
                <p className="text-left font-brand text-sm uppercase text-black/40 tracking-widest font-bold italic">DEVELOPMENTAL CYCLE (AGE)</p>
                <div className="flex flex-col items-center gap-10 p-10 border-[8px] border-black border-dashed bg-black/5 shadow-inner">
                  <div className="text-[12rem] font-brand text-magenta leading-none italic drop-shadow-[6px_6px_0px_black]">{age}</div>
                  <input 
                    type="range" min="5" max="99" 
                    value={age} 
                    onChange={(e) => setAge(parseInt(e.target.value))}
                    className="w-full h-12 appearance-none cursor-pointer accent-magenta bg-black border-[6px] border-black"
                  />
                </div>
              </div>
            </div>

            {age < 18 && (
              <div className="mx-6 p-6 bg-sun-yellow border-[8px] border-black text-black text-xs font-brand uppercase shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center gap-6">
                <span className="text-4xl">⚠️</span>
                <span className="text-left leading-tight">SAFE_MODE_ENGAGED: PARENTAL DNA PIN REQUIRED FOR EXTERNAL PAYOUTS</span>
              </div>
            )}

            <div className="px-6 space-y-8">
                <CNButton 
                    variant="magenta" 
                    className="w-full py-14 text-6xl border-[10px] border-black shadow-[15px_15px_0px_0px_rgba(0,0,0,1)]" 
                    onClick={handleFinalize}
                    disabled={!isUsernameValid}
                >
                    INITIATE DNA
                </CNButton>
                
                <button 
                    onClick={() => setStep('methods')} 
                    className="text-xs font-brand uppercase tracking-tighter text-black/40 hover:text-black transition-colors border-b-[4px] border-black/10 hover:border-black pb-2"
                >
                    RESET_AUTH_PROTOCOL
                </button>
            </div>
          </div>
        )}
      </CNCard>
    </div>
  );
};