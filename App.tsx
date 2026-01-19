
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Character, WalletState, PartySession, User, AppearanceSlot } from './types';
import { COLORS, THEMES, PROVIDERS, BODY_TYPES, HAIR_STYLES, ITEM_CATEGORIES, LOCATIONS, SKIN_TONE_CHART, UNDERTOTES, AGE_RANGES, CAPTURE_CONFIG, MATERIALS, TEXTURES } from './constants';
import { CNButton, CNCard, CNHeading, ProgressBar } from './components/UIElements';
import { CharacterPreview } from './components/CharacterPreview';
import { AuthScreen } from './components/AuthScreen';
import { getPartyEvent, generateCustomItem } from './services/geminiService';

const CNTicker: React.FC<{ text: string; donors?: string[]; isGoalMet?: boolean }> = ({ text, donors = [], isGoalMet = false }) => {
  const donorText = donors.length > 0 ? ` • THANKS TO DONORS: ${donors.join(', ')}` : '';
  const goalStatus = isGoalMet ? " • !!! COMMUNITY GOAL MET: +15% PAYOUTS ACTIVE !!!" : "";
  const content = `${text}${donorText}${goalStatus} • `.repeat(4);
  return (
    <div className={`bg-black text-white overflow-hidden py-3 border-y-[6px] ${isGoalMet ? 'border-magenta shadow-[0_0_20px_rgba(139,0,139,0.5)]' : 'border-black dark:border-white'} relative z-50 flex items-center shadow-[0_4px_0_rgba(0,0,0,0.3)]`}>
      <div className="flex whitespace-nowrap animate-marquee shrink-0">
        <span className={`font-brand text-[10px] sm:text-xs tracking-[0.3em] px-2 uppercase ${isGoalMet ? 'text-magenta-light' : ''}`}>
          {content}
        </span>
        <span className={`font-brand text-[10px] sm:text-xs tracking-[0.3em] px-2 uppercase ${isGoalMet ? 'text-magenta-light' : ''}`}>
          {content}
        </span>
      </div>
    </div>
  );
};

const ConfettiRain: React.FC<{ count?: number; isContained?: boolean; isStatic?: boolean }> = ({ count = 30, isContained = false, isStatic = false }) => {
  const brandColors = [COLORS.MAGENTA, COLORS.OLIVE, COLORS.CYAN];
  
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(count)].map((_, i) => {
        const color = brandColors[i % brandColors.length];
        
        let left: number;
        let top: string;
        let rotation: number;
        let sizeWidth: number;
        let sizeHeight: number;
        
        if (isStatic) {
          const cols = 6; 
          const col = i % cols;
          const row = Math.floor(i / cols);
          left = (col / (cols - 1 || 1)) * 100;
          const rowHeight = 100 / (Math.ceil(count / cols) || 1);
          const topVal = (row * rowHeight) + (col % 2 === 0 ? rowHeight / 2 : 0);
          top = `${topVal}%`;
          rotation = 15; 
          sizeWidth = 2; 
          sizeHeight = 5; 
        } else {
          left = (i / count) * 100;
          top = '-20px';
          rotation = Math.random() * 360;
          sizeWidth = 6 + Math.random() * 4;
          sizeHeight = sizeWidth * 1.5;
        }
        
        const delay = Math.random() * 5;
        const duration = 2 + Math.random() * 3;
        
        const animation = isStatic ? 'none' : (isContained 
                ? `confetti-fall-contained ${duration}s linear infinite` 
                : `confetti-fall ${duration}s linear infinite`);

        return (
          <div
            key={i}
            className="confetti-piece"
            style={{
              left: `${left}%`,
              backgroundColor: color,
              width: `${sizeWidth}px`,
              height: `${sizeHeight}px`,
              top: top,
              animation: animation,
              animationDelay: isStatic ? '0s' : `-${delay}s`,
              transform: `rotate(${rotation}deg)`,
              opacity: isStatic ? 0.7 : 1,
              boxShadow: isStatic ? 'none' : '1px 1px 0px rgba(0,0,0,0.1)'
            }}
          />
        );
      })}
    </div>
  );
};

const ConfettiLogo: React.FC<{ size?: 'sm' | 'lg' }> = ({ size = 'sm' }) => {
  const containerClass = size === 'lg' ? 'w-24 h-24 md:w-32 md:h-32' : 'w-10 h-10';
  const textClass = size === 'lg' ? 'text-5xl md:text-7xl' : 'text-xl';
  return (
    <div className={`${containerClass} bg-white dark:bg-[#111111] cn-border-sm relative overflow-hidden flex items-center justify-center shrink-0 transition-colors duration-300`}>
      <ConfettiRain count={48} isContained={true} isStatic={true} />
      <span className={`relative z-10 font-brand text-black dark:text-white ${textClass}`}>M</span>
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<View>(View.LANDING);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('party-world-dark-mode') === 'true';
  });
  const [donors, setDonors] = useState<string[]>(['RetroRick', 'ToonQueen', 'GamerX']);
  const [poolBalance, setPoolBalance] = useState<number>(750);
  const poolGoal = 1000;
  const isGoalMet = poolBalance >= poolGoal;
  
  const createDefaultSlot = (color: string): AppearanceSlot => ({
    id: 'default',
    color,
    material: 'matte',
    texture: 'none'
  });

  const [characters, setCharacters] = useState<Character[]>(() => {
    const saved = localStorage.getItem('party-world-characters');
    return saved ? JSON.parse(saved) : [{
      id: 'dex_1',
      name: 'Host Dexter',
      ageRange: 'child',
      bodyType: 'standard',
      head: createDefaultSlot('#FFF5E6'),
      torso: createDefaultSlot('#FFF5E6'),
      arms: createDefaultSlot('#FFF5E6'),
      legs: createDefaultSlot('#FFF5E6'),
      eyes: createDefaultSlot('#000000'),
      outfit: createDefaultSlot('#FFFFFF'),
      headwear: createDefaultSlot('#000000'),
      footwear: createDefaultSlot('#000000'),
      jewelry: createDefaultSlot('transparent'),
      accessory: createDefaultSlot('transparent'),
      handItem: createDefaultSlot('#808080'),
      hair: createDefaultSlot('#FF4500'),
      hairStyle: 'spiky',
      hairVolume: 1.2
    }];
  });
  
  const [activeCharacterId, setActiveCharacterId] = useState<string>(characters[0].id);

  const activeCharacter = characters.find(c => c.id === activeCharacterId) || characters[0];

  const [wallet, setWallet] = useState<WalletState>({
    balance: 10.00,
    isLinked: false,
    currency: 'USD',
    provider: PROVIDERS[0],
    autoWithdraw: false
  });
  const [activeParty, setActiveParty] = useState<PartySession | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>('outfit');
  const [selectedUndertone, setSelectedUndertone] = useState<string>('Warm');
  
  const earningMultiplier = useMemo(() => {
    let m = 1 + (characters.length * 0.1);
    if (isGoalMet) m *= 1.15;
    return m;
  }, [characters.length, isGoalMet]);

  const baseRateSec = 5 / (10 * 60); 
  const currentEarningRateSec = baseRateSec * earningMultiplier;

  useEffect(() => {
    localStorage.setItem('party-world-characters', JSON.stringify(characters));
  }, [characters]);

  const handleLogin = (loggedUser: User) => {
    setUser(loggedUser);
    setView(View.DASHBOARD);
  };

  const handleLogout = () => {
    setUser(null);
    setView(View.LANDING);
    setActiveParty(null);
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('party-world-dark-mode', darkMode.toString());
  }, [darkMode]);

  useEffect(() => {
    let interval: any;
    if (activeParty && user) {
      interval = setInterval(() => {
        setWallet(prev => ({ ...prev, balance: prev.balance + currentEarningRateSec }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeParty, user, currentEarningRateSec]);

  const initiateHostParty = () => setView(View.LOCATION_PICKER);

  const startParty = (locationId: string) => {
    setActiveParty({
      theme: THEMES[Math.floor(Math.random() * THEMES.length)],
      location: locationId,
      vibe: 80,
      startTime: Date.now(),
      earned: 0,
      guests: Math.floor(Math.random() * 10) + 5,
      isStreaming: false,
      characterId: activeCharacterId
    });
    setView(View.PARTY);
  };

  const endParty = () => {
    setActiveParty(null);
    setView(View.DASHBOARD);
  };

  const triggerEvent = async () => {
    if (!activeParty) return;
    setIsGenerating(true);
    try {
      const result = await getPartyEvent(activeParty.theme);
      alert(`${result.event}`);
      setActiveParty(prev => prev ? ({
        ...prev,
        vibe: Math.max(0, Math.min(100, prev.vibe + result.vibeImpact))
      }) : null);
    } catch (e) { console.error(e); }
    finally { setIsGenerating(false); }
  };

  const handleCustomization = async () => {
    if (!customPrompt) return;
    setIsGenerating(true);
    try {
      const item = await generateCustomItem(customPrompt);
      const slotName = item.type.toLowerCase();
      
      const charKeys: (keyof Character)[] = ['outfit', 'headwear', 'footwear', 'jewelry', 'accessory', 'handItem', 'hair', 'head', 'torso', 'arms', 'legs', 'eyes'];
      if (charKeys.includes(slotName as any)) {
         updateActiveCharacter({ 
           [slotName]: { 
             id: item.id || 'ai_gen', 
             color: item.color, 
             material: item.material || 'matte', 
             texture: item.texture || 'none' 
           } 
         });
      } else {
        updateActiveCharacter({ outfit: { ...activeCharacter.outfit, color: item.color } });
      }
      setCustomPrompt('');
    } catch (e) { console.error(e); }
    finally { setIsGenerating(false); }
  };

  const updateActiveCharacter = (updates: Partial<Character>) => {
    setCharacters(prev => prev.map(c => c.id === activeCharacterId ? { ...c, ...updates } : c));
  };

  const updateActiveSlot = (slotKey: keyof Character, updates: Partial<AppearanceSlot>) => {
    const currentSlot = activeCharacter[slotKey] as AppearanceSlot;
    if (!currentSlot) return;
    updateActiveCharacter({ [slotKey]: { ...currentSlot, ...updates } });
  };

  const handleDonation = (amount: number) => {
    const name = prompt("Enter your Broadcast Name for the ticker:") || (user?.name || "Anonymous Donor");
    alert(`Thank you ${name} for donating $${amount}! JAGO 107863277869 | PP dhea_wasisto@yahoo.com | +62 856 7239 000`);
    setDonors(prev => [name, ...prev].slice(0, 10));
    setPoolBalance(prev => prev + amount);
  };

  const handleWithdrawal = () => {
    if (wallet.balance < 5.00) {
      alert("Minimum withdrawal is $5.00!");
      return;
    }
    alert(`Success! Withdrawal of $${wallet.balance.toFixed(2)} processing.`);
    setWallet(prev => ({ ...prev, balance: 0 }));
  };

  const adoptCharacter = (char: Character) => {
    const newChar = { ...char, id: `adopted_${Date.now()}`, isCommunity: false, ownerId: user?.id, ownerName: user?.name };
    setCharacters(prev => [...prev, newChar]);
    alert(`${char.name} added to your roster! Your payout rate has increased by 10%.`);
    setView(View.CHARACTER_GALLERY);
  };

  const communityCharacters: Character[] = [
    {
      id: 'c1', name: 'Vintage Vinny', ageRange: 'adult', bodyType: 'tall', ownerName: 'RetroPlayer', isCommunity: true,
      head: createDefaultSlot('#FFD39B'), torso: createDefaultSlot('#FFD39B'), arms: createDefaultSlot('#FFD39B'), legs: createDefaultSlot('#FFD39B'), eyes: createDefaultSlot('#000'),
      outfit: createDefaultSlot('#FF4500'), headwear: createDefaultSlot('#000'), footwear: createDefaultSlot('#333'),
      jewelry: createDefaultSlot('transparent'), accessory: createDefaultSlot('transparent'), handItem: createDefaultSlot('transparent'),
      hair: createDefaultSlot('#8B4513'), hairStyle: 'short', hairVolume: 1.0
    },
    {
      id: 'c2', name: 'Cyber Z', ageRange: 'teenager', bodyType: 'slim', ownerName: 'FutureHost', isCommunity: true,
      head: createDefaultSlot('#FDF5E6'), torso: createDefaultSlot('#FDF5E6'), arms: createDefaultSlot('#FDF5E6'), legs: createDefaultSlot('#FDF5E6'), eyes: { id: 'e1', color: '#FFF', material: 'glossy', texture: 'none' },
      outfit: { id: 'o1', color: '#00FFFF', material: 'holographic', texture: 'grid' }, headwear: createDefaultSlot('transparent'), footwear: createDefaultSlot('#000'),
      jewelry: createDefaultSlot('#FFF'), accessory: { id: 'a1', color: '#ff00ff', material: 'glossy', texture: 'stripes' }, handItem: createDefaultSlot('transparent'),
      hair: createDefaultSlot('#FF00FF'), hairStyle: 'long', hairVolume: 1.0
    }
  ];

  const renderLanding = () => (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black relative overflow-x-hidden fade-in text-center">
      <ConfettiRain count={50} />
      
      <div className="fixed top-0 left-0 w-full z-50">
        <CNTicker text="HOST PARTIES • GET PAID REAL CASH • 90s TOON VIBES • PLAY CHARACTERS FROM OTHERS • LIVE NOW" donors={donors} isGoalMet={isGoalMet} />
        <nav className="bg-white/95 dark:bg-black/95 backdrop-blur-sm border-b-4 border-black dark:border-white px-6 py-3 flex justify-between items-center shadow-xl transition-colors">
          <div className="flex items-center gap-4">
            <ConfettiLogo size="sm" />
            <h1 className="font-brand text-xl sm:text-2xl tracking-tighter hidden sm:block">MY PARTY <span className="text-cyan">WORLD</span></h1>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={() => setDarkMode(!darkMode)} className="w-10 h-10 flex items-center justify-center bg-white dark:bg-black cn-border-sm transition-all hover:scale-110 active:scale-95 text-lg">
               {darkMode ? '🌞' : '🌙'}
             </button>
             <CNButton variant="magenta" className="px-5 py-2 text-xs" onClick={() => setView(View.AUTH)}>JOIN BROADCAST</CNButton>
          </div>
        </nav>
      </div>

      <main className="flex-1 flex flex-col items-center justify-start pt-52 lg:pt-60">
        <section className="relative px-6 max-w-5xl mx-auto w-full flex flex-col items-center z-10 pb-20">
          
          <div className="mb-14 flex justify-center">
            <div className="relative w-fit h-fit p-4 md:p-6 bg-white dark:bg-gray-900 border-[8px] border-black dark:border-white shadow-[12px_12px_0px_0px_rgba(139,0,139,1)] transition-transform hover:rotate-2 duration-500 flex items-center justify-center">
               <div className="w-[120px] h-[180px] sm:w-[160px] sm:h-[240px] flex items-center justify-center overflow-visible">
                  <CharacterPreview character={activeCharacter} scale={0.4} />
               </div>
              <div className="absolute -bottom-5 -right-5 bg-black text-white px-5 py-2 font-brand text-[10px] sm:text-xs">HOST #001</div>
            </div>
          </div>

          <div className="space-y-10 max-w-3xl">
            <div className={`inline-block text-white font-brand text-[10px] sm:text-xs px-8 py-3 cn-border -rotate-2 animate-pulse mb-2 ${isGoalMet ? 'bg-magenta shadow-[0_0_15px_magenta]' : 'bg-magenta'}`}>
              {isGoalMet ? 'COMMUNITY GOAL REACHED: +15% PAYOUT MULTIPLIER ACTIVE' : 'RECRUITING HOSTS: +10% MULTIPLIER ACTIVE'}
            </div>
            <h2 className="font-brand text-4xl md:text-7xl lg:text-9xl leading-[0.85] text-black dark:text-white uppercase tracking-tighter">
              THE SHOW IS <span className="text-magenta italic underline decoration-black dark:decoration-white decoration-4 sm:decoration-8">YOURS.</span>
            </h2>
            <p className="font-bold text-lg md:text-2xl text-gray-700 dark:text-gray-300 leading-snug">
              Host high-energy digital parties, collect unique 90s-inspired characters, and earn <span className="text-cyan font-brand">$5 every 10 minutes</span> of active gameplay.
            </p>
            <div className="flex flex-col sm:flex-row gap-8 justify-center pt-6">
              <CNButton variant="magenta" className="text-2xl md:text-4xl px-14 py-10 hover:scale-105 transition-all shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-[12px_12px_0px_0px_rgba(255,255,255,0.2)]" onClick={() => setView(View.AUTH)}>
                GO LIVE NOW
              </CNButton>
              <CNButton variant="olive" className="text-xl md:text-2xl px-12 py-8" onClick={() => setView(View.DONATE)}>
                SUPPORT POOL
              </CNButton>
            </div>
          </div>
          
        </section>
      </main>

      <div className="w-full relative z-20">
        <CNTicker text="90s RETRO AESTHETIC • $5 PAYOUTS • NO HIDDEN FEES • COMMUNITY ROSTER • UNLIMITED STYLES" donors={donors} isGoalMet={isGoalMet} />
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="animate-fade-in space-y-12 pb-32 pt-8 fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <CNCard className="lg:col-span-2 flex flex-col md:flex-row items-center gap-16 bg-white dark:bg-gray-900 relative overflow-hidden">
          <ConfettiRain count={15} isContained={true} />
          <div className="bg-gray-50 dark:bg-gray-800 p-12 cn-border shrink-0 z-10">
            <CharacterPreview character={activeCharacter} scale={1.1} />
          </div>
          <div className="flex-1 space-y-6 text-center md:text-left z-10">
            <div className="inline-block px-4 py-1 bg-black text-white font-brand text-[10px] tracking-widest uppercase">Network Multiplier: x{earningMultiplier.toFixed(1)}</div>
            <h1 className="font-brand text-6xl uppercase text-magenta dark:text-magenta-light leading-none">{activeCharacter.name}</h1>
            <div className="flex flex-wrap gap-4 pt-4 justify-center md:justify-start">
              <CNButton variant="cyan" className="px-6 text-sm" onClick={() => setView(View.CHARACTER_GALLERY)}>MY TOONS</CNButton>
              <CNButton variant="olive" className="px-6 text-sm" onClick={() => setView(View.COMMUNITY_GALLERY)}>DISCOVER</CNButton>
              <CNButton className="px-10 text-xl" onClick={initiateHostParty}>HOST NOW</CNButton>
            </div>
          </div>
        </CNCard>
        <CNCard className="lg:col-span-1 flex flex-col items-center justify-center space-y-8 bg-olive-light dark:bg-olive text-white ring-4 ring-black relative overflow-hidden">
          <ConfettiRain count={10} isContained={true} />
          <h3 className="font-brand text-3xl uppercase z-10">EARNINGS</h3>
          <div className="text-8xl font-brand z-10">${wallet.balance.toFixed(2)}</div>
          <p className="text-[10px] font-bold uppercase opacity-80 tracking-widest z-10">Payout Rate: ${(currentEarningRateSec * 60).toFixed(2)} / min</p>
          <CNButton variant="magenta" className="w-full text-white bg-black border-white text-2xl py-6 z-10" onClick={() => setView(View.WALLET)}>WITHDRAW</CNButton>
        </CNCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { icon: '🎨', title: 'Body Lab', desc: 'Refine every stylized 90s limb.', view: View.CUSTOMIZE },
          { icon: '👥', title: 'Network', desc: 'Adopt characters from other hosts.', view: View.COMMUNITY_GALLERY },
          { icon: '🎁', title: 'Support', desc: 'Donate to keep the payouts high.', view: View.DONATE },
          { icon: '🏠', title: 'Roster', desc: 'Manage your personal fleet of toons.', view: View.CHARACTER_GALLERY }
        ].map((feat, i) => (
          <CNCard key={i} className="flex flex-col items-center text-center space-y-4 hover:scale-105 transition-transform cursor-pointer" onClick={() => setView(feat.view)}>
            <span className="text-5xl">{feat.icon}</span>
            <h4 className="font-brand text-xl">{feat.title}</h4>
            <p className="text-xs font-bold opacity-60 uppercase">{feat.desc}</p>
          </CNCard>
        ))}
      </div>
    </div>
  );

  const renderDonate = () => (
    <div className="max-w-5xl mx-auto space-y-12 pt-8 pb-32 fade-in">
      <CNCard className="bg-white dark:bg-gray-900 p-16 text-center space-y-12 relative overflow-hidden">
        <ConfettiRain count={20} isContained={true} />
        <CNHeading className="text-7xl z-10">DONATION STATION</CNHeading>
        
        <div className={`bg-black/5 dark:bg-white/5 p-8 cn-border space-y-6 z-10 transition-all ${isGoalMet ? 'ring-8 ring-magenta ring-offset-4' : ''}`}>
          <div className="flex justify-between items-end">
            <h3 className="font-brand text-xl uppercase">Community Payout Pool</h3>
            <span className={`font-brand text-4xl ${isGoalMet ? 'text-magenta-light' : 'text-magenta'}`}>
              ${poolBalance} / ${poolGoal}
            </span>
          </div>
          <ProgressBar value={Math.min(100, (poolBalance / poolGoal) * 100)} color={isGoalMet ? COLORS.MAGENTA_LIGHT : COLORS.MAGENTA} />
          <p className="font-bold text-[10px] uppercase tracking-widest opacity-60 italic text-left">
            {isGoalMet 
              ? '!!! GOAL MET !!! ALL HOST PAYOUTS INCREASED BY 15% FOR 24 HOURS!' 
              : `When the $${poolGoal} goal is met, all host payouts increase by 15% for 24 hours!`}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-6 z-10">
          {[1, 2, 5, 10, 20, 50, 100].map(amt => (
            <CNButton key={amt} variant="magenta" className="text-3xl py-6" onClick={() => handleDonation(amt)}>${amt}</CNButton>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-16 z-10">
          <div className="space-y-8 text-left">
            <CNHeading className="text-4xl">DONOR WALL</CNHeading>
            <div className="grid grid-cols-2 gap-4">
              {donors.map((d, i) => (
                <div key={i} className="bg-white dark:bg-black p-4 cn-border-sm font-brand text-xs uppercase animate-pulse">
                  {d}
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-8 text-left">
            <CNHeading className="text-4xl">DIRECT SUPPORT</CNHeading>
            <div className="space-y-4">
              <div className="bg-olive/10 border-olive border-2 p-6 flex justify-between items-center">
                <span className="font-brand text-xs uppercase">BANK JAGO</span>
                <p className="font-brand text-sm">107863277869</p>
              </div>
              <div className="bg-cyan/10 border-cyan border-2 p-6 flex justify-between items-center">
                <span className="font-brand text-xs uppercase">PAYPAL</span>
                <p className="font-brand text-[10px]">dhea_wasisto@yahoo.com</p>
              </div>
              <div className="bg-magenta/10 border-magenta border-2 p-6 flex justify-between items-center">
                <span className="font-brand text-xs uppercase">E-WALLETS</span>
                <p className="font-brand text-sm">+62 856 7239 000</p>
              </div>
            </div>
          </div>
        </div>

        <CNButton variant="olive" className="w-full text-2xl py-8 z-10" onClick={() => user ? setView(View.DASHBOARD) : setView(View.LANDING)}>RETURN</CNButton>
      </CNCard>
    </div>
  );

  // Customization Screen Render
  const renderCustomize = () => (
    <div className="space-y-12 animate-fade-in pt-8 pb-32 fade-in">
      <div className="flex justify-between items-center">
        <CNHeading className="text-6xl">TOON LAB</CNHeading>
        <CNButton variant="cyan" onClick={() => setView(View.CHARACTER_GALLERY)}>MY ROSTER</CNButton>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <CNCard className="flex items-center justify-center min-h-[500px] bg-gray-50 dark:bg-gray-800">
           <CharacterPreview character={activeCharacter} scale={1.5} />
        </CNCard>

        <div className="space-y-8">
          <CNCard className="space-y-6">
            <h3 className="font-brand text-xl uppercase">AI Style Injection</h3>
            <div className="flex gap-4">
              <input 
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="e.g. 'Cyberpunk Ninja Outfit' or 'Flaming Spikes'"
                className="flex-1 p-4 cn-border font-brand text-sm bg-white dark:bg-black text-black dark:text-white"
              />
              <CNButton onClick={handleCustomization} disabled={isGenerating || !customPrompt}>
                {isGenerating ? 'GEN...' : 'INJECT'}
              </CNButton>
            </div>
          </CNCard>

          <CNCard className="p-0 overflow-hidden">
             <div className="flex bg-black text-white">
                {['outfit', 'head', 'arms', 'legs', 'hair'].map(tab => (
                  <button 
                    key={tab}
                    onClick={() => setSelectedCategoryTab(tab)}
                    className={`flex-1 py-4 font-brand text-[10px] uppercase tracking-widest ${selectedCategoryTab === tab ? 'bg-magenta' : 'hover:bg-gray-800'}`}
                  >
                    {tab}
                  </button>
                ))}
             </div>
             <div className="p-6 space-y-6">
                <div className="space-y-2">
                   <p className="font-brand text-[10px] uppercase opacity-60">Base Material</p>
                   <div className="flex flex-wrap gap-2">
                      {MATERIALS.map(m => (
                        <button 
                          key={m.id}
                          onClick={() => updateActiveSlot(selectedCategoryTab as keyof Character, { material: m.id })}
                          className={`px-3 py-1 border-2 font-brand text-[10px] uppercase ${activeCharacter[selectedCategoryTab as keyof Character]?.material === m.id ? 'bg-black text-white' : 'border-black text-black dark:text-white dark:border-white'}`}
                        >
                          {m.name}
                        </button>
                      ))}
                   </div>
                </div>

                <div className="space-y-2">
                   <p className="font-brand text-[10px] uppercase opacity-60">Surface Texture</p>
                   <div className="flex flex-wrap gap-2">
                      {TEXTURES.map(t => (
                        <button 
                          key={t.id}
                          onClick={() => updateActiveSlot(selectedCategoryTab as keyof Character, { texture: t.id })}
                          className={`px-3 py-1 border-2 font-brand text-[10px] uppercase ${activeCharacter[selectedCategoryTab as keyof Character]?.texture === t.id ? 'bg-black text-white' : 'border-black text-black dark:text-white dark:border-white'}`}
                        >
                          {t.name}
                        </button>
                      ))}
                   </div>
                </div>

                {selectedCategoryTab === 'hair' && (
                  <div className="space-y-4">
                    <p className="font-brand text-[10px] uppercase opacity-60">Hair Volume</p>
                    <input 
                      type="range" min="0.5" max="2.5" step="0.1"
                      value={activeCharacter.hairVolume}
                      onChange={(e) => updateActiveCharacter({ hairVolume: parseFloat(e.target.value) })}
                      className="w-full accent-magenta"
                    />
                  </div>
                )}
             </div>
          </CNCard>
        </div>
      </div>
    </div>
  );

  // Wallet Screen Render
  const renderWallet = () => (
    <div className="max-w-2xl mx-auto space-y-8 pt-8 pb-32 fade-in">
      <CNHeading className="text-6xl text-center">WALLET</CNHeading>
      <CNCard className="bg-white dark:bg-gray-900 p-12 text-center space-y-8">
        <div className="space-y-2">
          <p className="font-brand text-xs uppercase opacity-60">Current Earnings</p>
          <div className="text-8xl font-brand text-green-500">${wallet.balance.toFixed(2)}</div>
        </div>
        
        <div className="space-y-4 border-t-4 border-black dark:border-white pt-8">
           <div className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 p-4 cn-border-sm">
              <span className="font-brand text-xs uppercase">Provider</span>
              <span className="font-bold">{wallet.provider}</span>
           </div>
           <CNButton variant="magenta" className="w-full text-2xl py-6" onClick={handleWithdrawal}>WITHDRAW TO BANK</CNButton>
           <p className="text-[10px] font-bold uppercase opacity-60">Minimum withdrawal: $5.00</p>
        </div>

        <div className="bg-cyan/10 border-cyan border-2 p-6 text-left space-y-2">
          <h4 className="font-brand text-sm uppercase">Host Reward Program</h4>
          <p className="text-[10px] font-bold uppercase">You earn $5.00 every 10 minutes of active hosting. Keep the party vibe above 50 to maintain your stream status!</p>
        </div>

        <CNButton variant="olive" className="w-full" onClick={() => setView(View.DASHBOARD)}>RETURN</CNButton>
      </CNCard>
    </div>
  );

  // Location Picker Screen Render
  const renderLocationPicker = () => (
    <div className="space-y-12 pt-8 pb-32 fade-in">
      <div className="text-center space-y-4">
        <CNHeading className="text-7xl">SELECT VENUE</CNHeading>
        <p className="font-bold text-xl uppercase tracking-widest opacity-70">Where is {activeCharacter.name} hosting today?</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {LOCATIONS.map(loc => (
          <CNCard 
            key={loc.id} 
            className={`${loc.style} cursor-pointer hover:scale-105 transition-transform group relative overflow-hidden h-80 flex flex-col items-center justify-center`}
            onClick={() => startParty(loc.id)}
          >
            <div className="absolute inset-0 halftone-overlay opacity-10 group-hover:opacity-20 transition-opacity" />
            <span className="text-8xl mb-6 relative z-10 group-hover:animate-bounce">{loc.icon}</span>
            <h3 className="font-brand text-3xl text-white relative z-10 uppercase drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">{loc.name}</h3>
          </CNCard>
        ))}
      </div>
      <CNButton variant="magenta" className="w-full py-6 text-2xl" onClick={() => setView(View.DASHBOARD)}>CANCEL BROADCAST</CNButton>
    </div>
  );

  // Party Screen Render
  const renderParty = () => {
    if (!activeParty) return null;
    const location = LOCATIONS.find(l => l.id === activeParty.location) || LOCATIONS[0];
    
    return (
      <div className={`min-h-[80vh] flex flex-col space-y-8 fade-in relative overflow-hidden p-8 cn-border ${location.style}`}>
        <div className="absolute inset-0 halftone-overlay opacity-5 pointer-events-none" />
        
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 relative z-10">
          <CNCard className="bg-black/80 text-white border-white flex-1 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-brand text-2xl uppercase tracking-tighter text-cyan-light">LIVE BROADCAST</h3>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
                <span className="font-brand text-xs uppercase tracking-widest">ON AIR</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] uppercase opacity-60">Theme</p>
                <p className="font-brand text-sm">{activeParty.theme}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase opacity-60">Guests</p>
                <p className="font-brand text-sm">{activeParty.guests} Toons</p>
              </div>
            </div>
          </CNCard>

          <CNCard className="bg-magenta text-white border-black w-full md:w-80 space-y-4">
            <h4 className="font-brand text-xl uppercase">PARTY VIBE</h4>
            <ProgressBar value={activeParty.vibe} color={COLORS.CYAN_LIGHT} />
            <p className="text-[10px] font-bold text-center uppercase">Vibe determines network bonuses!</p>
          </CNCard>
        </div>

        <div className="flex-1 flex items-center justify-center py-12">
          <div className="relative group">
            <div className="absolute -inset-20 bg-cyan/20 blur-3xl rounded-full animate-pulse" />
            <CharacterPreview character={activeCharacter} scale={1.8} />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 relative z-10">
          <CNButton 
            variant="cyan" 
            className="flex-1 py-8 text-2xl" 
            onClick={triggerEvent}
            disabled={isGenerating}
          >
            {isGenerating ? 'AI NARRATING...' : 'TRIGGER EVENT'}
          </CNButton>
          <CNButton 
            variant="magenta" 
            className="flex-1 py-8 text-2xl" 
            onClick={endParty}
          >
            END BROADCAST
          </CNButton>
        </div>
      </div>
    );
  };

  const renderHeader = () => (
    <header className="bg-black text-white border-b-8 border-black dark:border-white sticky top-0 z-50 transition-colors">
      <CNTicker text="HOST PARTIES • GET PAID REAL CASH • 90s TOON VIBES • PLAY CHARACTERS FROM OTHERS • LIVE NOW" donors={donors} isGoalMet={isGoalMet} />
      <div className="p-6 flex justify-between items-center bg-black">
        <div className="flex items-center gap-6 cursor-pointer" onClick={() => setView(user ? View.DASHBOARD : View.LANDING)}>
          <ConfettiLogo size="sm" /><h1 className="font-brand text-2xl sm:text-3xl tracking-tighter uppercase leading-none text-white">MY PARTY <span className="text-cyan-light">WORLD</span></h1>
        </div>
        <div className="flex items-center gap-4 sm:gap-10">
          <button onClick={() => setDarkMode(!darkMode)} className="w-10 h-10 flex items-center justify-center bg-white dark:bg-black cn-border-sm transition-all hover:scale-110 active:scale-95 text-lg">
             {darkMode ? '🌞' : '🌙'}
          </button>
          {user ? (
            <>
              <div className="font-brand text-2xl sm:text-4xl text-green-500">${wallet.balance.toFixed(2)}</div>
              <button onClick={handleLogout} className="bg-magenta-light px-4 sm:px-8 py-2 sm:py-3 cn-border-sm font-brand text-[10px] sm:text-sm hover:scale-105 transition-transform text-white border-white">LOGOUT</button>
            </>
          ) : (
            <CNButton variant="magenta" className="px-5 py-2 text-xs" onClick={() => setView(View.AUTH)}>JOIN BROADCAST</CNButton>
          )}
        </div>
      </div>
    </header>
  );

  if (view === View.LANDING) return renderLanding();

  // Unified rendering for Donate and Auth screen when no user
  if (!user && view !== View.DONATE && view !== View.AUTH) {
    setView(View.LANDING);
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black transition-colors duration-300 relative overflow-x-hidden">
      {renderHeader()}
      <main className="container mx-auto px-6 py-16 max-w-7xl flex-1 relative z-10">
        {view === View.DASHBOARD && renderDashboard()}
        {view === View.CHARACTER_GALLERY && characters && (
          <div className="space-y-12 animate-fade-in pt-8 pb-32 fade-in">
            <div className="flex justify-between items-center">
              <CNHeading className="text-6xl">HOST ROSTER</CNHeading>
              <div className="flex gap-4">
                <CNButton variant="olive" onClick={() => setView(View.COMMUNITY_GALLERY)}>ADOPT TOONS</CNButton>
                <CNButton variant="cyan" onClick={() => {
                   const newId = `char_${Date.now()}`;
                   const newChar = { ...characters[0], id: newId, name: `Toon #${characters.length + 1}` };
                   setCharacters(prev => [...prev, newChar]);
                   setActiveCharacterId(newId);
                   setView(View.CUSTOMIZE);
                }}>+ NEW TOON</CNButton>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
              {characters.map(char => (
                <CNCard key={char.id} className={`flex flex-col items-center transition-all ${char.id === activeCharacterId ? 'ring-8 ring-magenta' : 'hover:scale-105'}`}>
                   <h3 className="font-brand text-2xl mb-4">{char.name}</h3>
                   <div className="h-72 flex items-center justify-center mb-8"><CharacterPreview character={char} scale={0.8} /></div>
                   <div className="flex gap-4 w-full">
                     <CNButton variant={char.id === activeCharacterId ? 'olive' : 'cyan'} className="flex-1" onClick={() => { setActiveCharacterId(char.id); setView(View.DASHBOARD); }}>{char.id === activeCharacterId ? 'ACTIVE' : 'SELECT'}</CNButton>
                     <CNButton variant="magenta" className="flex-1" onClick={() => { setActiveCharacterId(char.id); setView(View.CUSTOMIZE); }}>LAB</CNButton>
                   </div>
                </CNCard>
              ))}
            </div>
          </div>
        )}
        {view === View.COMMUNITY_GALLERY && (
          <div className="space-y-12 animate-fade-in pt-8 pb-32 fade-in">
            <div className="flex justify-between items-center">
              <CNHeading className="text-6xl">COMMUNITY FEED</CNHeading>
              <CNButton variant="cyan" onClick={() => setView(View.DASHBOARD)}>DASHBOARD</CNButton>
            </div>
            <p className="font-bold text-xl uppercase tracking-widest text-center opacity-70">
              Playing community toons boosts your total character count and network value!
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
              {communityCharacters.map(char => (
                <CNCard key={char.id} className="flex flex-col items-center hover:scale-105 transition-transform">
                   <div className="w-full flex justify-between items-start mb-4">
                     <h3 className="font-brand text-2xl">{char.name}</h3>
                     <span className="bg-black text-white px-2 py-1 text-[8px] font-brand uppercase">HOST: {char.ownerName}</span>
                   </div>
                   <div className="h-72 flex items-center justify-center mb-8"><CharacterPreview character={char} scale={0.8} /></div>
                   <CNButton variant="magenta" className="w-full" onClick={() => adoptCharacter(char)}>ADOPT & BROADCAST</CNButton>
                </CNCard>
              ))}
            </div>
          </div>
        )}
        {view === View.CUSTOMIZE && renderCustomize()}
        {view === View.DONATE && renderDonate()}
        {view === View.WALLET && renderWallet()}
        {view === View.LOCATION_PICKER && renderLocationPicker()}
        {view === View.PARTY && renderParty()}
        {view === View.AUTH && (
          <div className="flex items-center justify-center py-10">
            <AuthScreen onLogin={handleLogin} />
          </div>
        )}
      </main>
      {user && (
        <footer className="fixed bottom-0 left-0 right-0 p-8 flex justify-center pointer-events-none z-50">
          <div className="flex gap-6 pointer-events-auto bg-white dark:bg-black p-4 cn-border border-b-0 rounded-t-3xl shadow-xl transition-colors">
            <NavIcon icon="🏠" label="Home" active={view === View.DASHBOARD} onClick={() => setView(View.DASHBOARD)} />
            <NavIcon icon="👥" label="Toons" active={view === View.CHARACTER_GALLERY || view === View.COMMUNITY_GALLERY} onClick={() => setView(View.CHARACTER_GALLERY)} />
            <NavIcon icon="🎨" label="Style" active={view === View.CUSTOMIZE} onClick={() => setView(View.CUSTOMIZE)} />
            <NavIcon icon="🎁" label="Fund" active={view === View.DONATE} onClick={() => setView(View.DONATE)} />
            <NavIcon icon="💸" label="Cash" active={view === View.WALLET} onClick={() => setView(View.WALLET)} />
          </div>
        </footer>
      )}
    </div>
  );
};

const NavIcon: React.FC<{ icon: string; label: string; active: boolean; onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`px-6 py-3 w-24 rounded-2xl flex flex-col items-center gap-1 transition-all ${active ? 'bg-black text-white dark:bg-white dark:text-black scale-110' : 'text-gray-400 hover:text-black dark:hover:text-white'}`}>
    <span className="text-3xl">{icon}</span>
    <span className="text-[10px] font-brand uppercase tracking-tighter">{label}</span>
  </button>
);

export default App;
