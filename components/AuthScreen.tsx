import React, { useState } from 'react';
import { CNButton, CNCard, CNHeading } from './UIElements';
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
      alert("My Party World is for ages 5 and above!");
      return;
    }
    if (!isUsernameValid) {
      alert("Username must be between 1 and 30 characters!");
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
    <div className="max-w-md w-full animate-bounce-subtle fade-in">
      <CNCard className="w-full bg-white dark:bg-gray-900 border-none ring-8 ring-black">
        {step === 'methods' ? (
          <div className="space-y-10 text-center py-4">
            <CNHeading className="text-4xl">SIGN IN HOST</CNHeading>
            <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-[0.2em] text-xs leading-none">Choose Your Broadcast ID</p>
            
            <div className="grid grid-cols-1 gap-6">
              <CNButton variant="magenta" className="flex items-center justify-center gap-6 text-3xl h-20" onClick={() => handleProviderSelect('steam')}>
                <span className="text-5xl">🎮</span> STEAM
              </CNButton>
              <CNButton variant="cyan" className="flex items-center justify-center gap-6 text-3xl h-20" onClick={() => handleProviderSelect('google')}>
                <span className="text-5xl">G</span> GOOGLE
              </CNButton>
              <CNButton variant="olive" className="flex items-center justify-center gap-6 text-3xl h-20" onClick={() => handleProviderSelect('apple')}>
                <span className="text-5xl"></span> APPLE
              </CNButton>
              
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t-4 border-black dark:border-white border-dashed opacity-20"></span></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-white dark:bg-gray-900 px-4 font-bold text-gray-500">OR MOBILE</span></div>
              </div>

              <div className="space-y-4">
                <input 
                  type="tel" 
                  placeholder="Enter Phone #" 
                  className="w-full p-6 cn-border font-brand bg-white dark:bg-black text-black dark:text-white focus:outline-none h-20 text-2xl text-center"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <CNButton className="w-full h-20 text-2xl" onClick={() => handleProviderSelect('phone')} disabled={!phone}>
                  CONNECT PHONE
                </CNButton>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-10 text-center py-4">
            <CNHeading className="text-4xl">HOST IDENTITY</CNHeading>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-left font-brand text-xs uppercase text-gray-500">Player Username (1-30 Chars)</p>
                <input 
                  type="text" 
                  maxLength={30}
                  placeholder="Enter Username" 
                  className={`w-full p-4 cn-border font-brand bg-white dark:bg-black text-black dark:text-white focus:outline-none text-xl ${username.length > 0 && !isUsernameValid ? 'border-red-500' : ''}`}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <div className="flex justify-end">
                   <span className={`text-[10px] font-bold ${username.length > 30 ? 'text-red-500' : 'text-gray-400'}`}>
                     {username.length}/30
                   </span>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-left font-brand text-xs uppercase text-gray-500">Broadcast Lifestage</p>
                <div className="flex flex-col items-center gap-6">
                  <div className="text-7xl font-brand text-magenta dark:text-magenta-light leading-none">{age}</div>
                  <input 
                    type="range" 
                    min="1" 
                    max="99" 
                    value={age} 
                    onChange={(e) => setAge(parseInt(e.target.value))}
                    className="w-full h-8 bg-gray-200 dark:bg-gray-800 appearance-none cursor-pointer accent-magenta dark:accent-magenta-light cn-border"
                  />
                </div>
              </div>
            </div>

            {age < 18 && (
              <div className="p-4 bg-yellow-400 cn-border text-black text-[10px] font-brand uppercase ring-4 ring-black/10">
                Kid Mode Enabled (PIN Required for Cash)
              </div>
            )}

            <CNButton 
              variant="magenta" 
              className="w-full py-8 text-3xl" 
              onClick={handleFinalize}
              disabled={!isUsernameValid}
            >
              GO LIVE!
            </CNButton>
            
            <button 
              onClick={() => setStep('methods')} 
              className="text-xs font-brand uppercase tracking-tighter text-black dark:text-white hover:opacity-70 transition-opacity border-b-2 border-black dark:border-white"
            >
              Wrong Method? Go Back
            </button>
          </div>
        )}
      </CNCard>
    </div>
  );
};