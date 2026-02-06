import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, Character, WalletState, PartySession, User, AppearanceSlot, PartyEvent, PartyEnvironment } from './types';
import { COLORS, THEMES, PROVIDERS, BODY_TYPES, HAIR_STYLES, HAIR_SHAPES, HEAD_SHAPES, ITEM_CATEGORIES, LOCATIONS, SKIN_TONE_CHART, AGE_RANGES, MATERIALS, TEXTURES, CURRENCIES, EYE_STYLES, NOSE_STYLES, MOUTH_STYLES, QUESTS, HAIR_COLORS } from './constants';
import { CNButton, CNCard, CNHeading, ProgressBar, CNInput, Badge } from './components/UIElements';
import { CharacterPreview } from './components/CharacterPreview';
import { AuthScreen } from './components/AuthScreen';
import { getPartyEvent, generateCustomItem, synthesizeEnvironment, generateHairTexture } from './services/geminiService';

const SectionHeader: React.FC<{ badge: string; title: string; desc?: string; inverted?: boolean }> = ({ badge, title, desc, inverted }) => (
  <div className={`space-y-4 ${inverted ? 'text-white' : 'text-black dark:text-white'}`}>
    <div className="mb-2">
      <Badge variant={inverted ? 'magenta' : 'black'}>{badge}</Badge>
    </div>
    <CNHeading size="md">{title}</CNHeading>
    {desc && <p className="max-w-xl font-bold uppercase tracking-widest text-xs sm:text-sm opacity-50 leading-relaxed">{desc}</p>}
  </div>
);

const GlobalTicker: React.FC = () => (
  <div className="w-full bg-black dark:bg-neutral-900 flex items-center h-10 relative overflow-hidden shrink-0 border-y-[2px] border-black dark:border-white/10">
    <div className="flex whitespace-nowrap animate-marquee h-full items-center">
      <span className="font-brand text-[10px] sm:text-xs text-white px-12 tracking-[0.5em] uppercase font-bold">
        $5.00 PER 10 MINS • LIVE NODES: 4,021 • CROSS-PLATFORM SYNC ACTIVE • NEW DNA TRAITS UNLOCKED • INSTANT BANK WITHDRAWALS • SUPPORT THE NETWORK AT DONATION STATION • 
      </span>
      <span className="font-brand text-[10px] sm:text-xs text-white px-12 tracking-[0.5em] uppercase font-bold">
        $5.00 PER 10 MINS • LIVE NODES: 4,021 • CROSS-PLATFORM SYNC ACTIVE • NEW DNA TRAITS UNLOCKED • INSTANT BANK WITHDRAWALS • SUPPORT THE NETWORK AT DONATION STATION • 
      </span>
    </div>
  </div>
);

const GameHUD: React.FC<{ 
  user: User | null; 
  balance: number; 
  setView: (v: View) => void; 
  currentView: View;
  toggleDarkMode: () => void;
  isDark: boolean;
}> = ({ user, balance, setView, currentView, toggleDarkMode, isDark }) => (
  <header className="w-full h-16 sm:h-20 bg-white dark:bg-black border-b-[4px] border-black dark:border-white flex justify-between items-center z-[200] px-4 sm:px-10 sticky top-0 shrink-0">
    <div className="flex items-center gap-3 sm:gap-6 cursor-pointer group" onClick={() => setView(View.LANDING)}>
      <div className="bg-black dark:bg-white p-1.5 sm:p-2">
        <div className="w-4 h-4 bg-white dark:bg-black rotate-45" />
      </div>
      <h1 className="font-brand text-lg sm:text-xl lg:text-2xl tracking-tighter text-black dark:text-white leading-none">MY PARTY WORLD</h1>
    </div>
    
    <div className="flex items-center gap-3 sm:gap-8 h-full">
      <nav className="hidden lg:flex items-center gap-6 h-full mr-4">
        <button onClick={() => setView(View.DONATE)} className={`font-brand text-[10px] uppercase tracking-widest font-bold transition-colors ${currentView === View.DONATE ? 'text-magenta' : 'text-black dark:text-white hover:text-magenta'}`}>DONATE</button>
        <button className="font-brand text-[10px] text-black dark:text-white hover:text-magenta transition-colors uppercase tracking-widest font-bold">REWARDS</button>
      </nav>

      <div className="flex items-center gap-3">
        <button 
          onClick={toggleDarkMode}
          className="px-2 py-1 border-[2px] border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all font-brand text-[9px] sm:text-[10px]"
        >
          {isDark ? 'LIGHT' : 'DARK'}
        </button>

        {user ? (
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex flex-col items-end hidden md:flex">
              <span className="font-brand text-[8px] text-black/40 dark:text-white/40 uppercase font-bold">Yield</span>
              <span className="font-brand text-lg lg:text-xl leading-none text-black dark:text-white tracking-tighter">${balance.toFixed(2)}</span>
            </div>
            <CNButton variant="black" className="text-[9px] sm:text-[10px] px-3 py-1.5" onClick={() => setView(View.DASHBOARD)}>STATION</CNButton>
          </div>
        ) : (
          <CNButton variant="black" className="text-[9px] sm:text-[10px] px-3 sm:px-5 py-2" onClick={() => setView(View.AUTH)}>LOGIN</CNButton>
        )}
      </div>
    </div>
  </header>
);

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<View>(View.LANDING);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [wallet, setWallet] = useState<WalletState>({ balance: 0, isLinked: false, currency: 'USD', provider: PROVIDERS[0], autoWithdraw: false });
  const [activeParty, setActiveParty] = useState<PartySession | null>(null);
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>('hair');
  const [poolBalance, setPoolBalance] = useState(125420.75);
  const [previewHairStyle, setPreviewHairStyle] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains('dark') || localStorage.getItem('theme') === 'dark';
  });
  
  // Donation specific states
  const [donationAmount, setDonationAmount] = useState<string>('5');
  const [customDonation, setCustomDonation] = useState<string>('');

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const [characters, setCharacters] = useState<Character[]>([{
    id: 'h_01', name: 'ICON_CN', ageRange: 'child', bodyType: 'boxy', headShape: 'geometric',
    head: { id: 'default', color: '#FFDBAC', material: 'matte', texture: 'none' },
    torso: { id: 'default', color: '#FFFFFF', material: 'matte', texture: 'none' },
    arms: { id: 'default', color: '#FFFFFF', material: 'matte', texture: 'none' },
    legs: { id: 'default', color: '#2E008B', material: 'matte', texture: 'none' },
    eyes: { id: 'glasses', color: '#00FFFF', material: 'matte', texture: 'none' },
    nose: { id: 'pointy', color: '#FFDBAC', material: 'matte', texture: 'none' },
    mouth: { id: 'grin', color: '#000000', material: 'matte', texture: 'none' },
    outfit: { id: 'default', color: '#FFFFFF', material: 'matte', texture: 'none' },
    headwear: { id: 'none', color: 'transparent', material: 'matte', texture: 'none' },
    footwear: { id: 'default', color: '#000000', material: 'matte', texture: 'none' },
    jewelry: { id: 'none', color: 'transparent', material: 'matte', texture: 'none' },
    accessory: { id: 'none', color: 'transparent', material: 'matte', texture: 'none' },
    handItem: { id: 'none', color: 'none', material: 'matte', texture: 'none' },
    hair: { id: 'default', color: '#FF4500', material: 'matte', texture: 'none' },
    hairStyle: 'atomic_quiff', hairVolume: 1.0, hairShape: 'standard', hairWarp: 0
  }]);

  const activeCharacter = characters[0];

  useEffect(() => {
    if (activeParty && user) {
      const ratePerSecond = 5 / (10 * 60);
      const interval = setInterval(() => {
        setWallet(prev => ({ ...prev, balance: prev.balance + ratePerSecond }));
        setActiveParty(prev => prev ? { ...prev, earnedInSession: prev.earnedInSession + ratePerSecond } : null);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [activeParty, user]);

  const handleLogin = (u: User) => { setUser(u); setView(View.DASHBOARD); };

  const handleGenerateItem = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    try {
      if (selectedCategoryTab === 'hair_mod') {
        const result = await generateHairTexture(aiPrompt);
        setCharacters(prev => {
          const newChars = [...prev];
          const char = { ...newChars[0] };
          char.hair = { ...char.hair, texture: result.pattern, textureSize: result.size };
          newChars[0] = char;
          return newChars;
        });
      } else {
        const result = await generateCustomItem(aiPrompt, selectedCategoryTab);
        setCharacters(prev => {
          const newChars = [...prev];
          const char = { ...newChars[0] };
          const categoryToPropertyMap: Record<string, string> = {
            'outfit': 'outfit', 'head': 'head', 'eyes': 'eyes', 'nose': 'nose', 'mouth': 'mouth',
            'hair': 'hair', 'anatomy': 'torso'
          };
          const propName = categoryToPropertyMap[selectedCategoryTab];
          if (propName) {
            (char as any)[propName] = { ...(char as any)[propName], color: result.color, material: result.material, texture: result.texture };
          }
          newChars[0] = char;
          return newChars;
        });
      }
      setAiPrompt('');
    } catch (e) { console.error(e); } finally { setIsGenerating(false); }
  };

  const startParty = async (locId: string) => {
    setIsGenerating(true);
    try {
      const synth = await synthesizeEnvironment(locId);
      setActiveParty({
        theme: THEMES[Math.floor(Math.random() * THEMES.length)],
        location: locId,
        vibe: 100,
        startTime: Date.now(),
        earnedInSession: 0,
        guests: 150,
        isStreaming: true,
        characterId: activeCharacter.id,
        activeEvents: [],
        env: { music: synth.music, lighting: synth.lighting, decor: synth.decor, specialEffect: synth.effect }
      });
      setView(View.PARTY);
    } catch (e) {
      setActiveParty({
        theme: THEMES[0], location: locId, vibe: 90, startTime: Date.now(), earnedInSession: 0, guests: 5, isStreaming: true, characterId: activeCharacter.id, activeEvents: [],
        env: { music: 'Atomic Pulse', lighting: 'High-Energy Red', decor: 'Quantum Hub', specialEffect: 'Static Leak' }
      });
      setView(View.PARTY);
    } finally { setIsGenerating(false); }
  };

  const updateCharacterProperty = (prop: string, value: any) => {
    setCharacters(prev => {
        const newChars = [...prev];
        const char = { ...newChars[0] };
        (char as any)[prop] = value;
        newChars[0] = char;
        return newChars;
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(`COPIED: ${text}`);
  };

  const renderLanding = () => (
    <div className="flex-1 flex flex-col fade-in overflow-y-auto custom-scrollbar bg-white dark:bg-black">
      <section className="relative w-full flex flex-col justify-center px-6 sm:px-16 lg:px-24 py-16 sm:py-32 border-b-[8px] border-black dark:border-white">
        <div className="absolute inset-0 bg-[radial-gradient(#ddd_1px,transparent_0)] dark:bg-[radial-gradient(#222_1px,transparent_0)] [background-size:24px_24px] opacity-40"></div>
        <div className="max-w-[1400px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 sm:gap-16 items-center relative z-10">
          <div className="space-y-10 lg:col-span-7 order-2 lg:order-1 text-center lg:text-left">
            <div className="space-y-6">
              <CNHeading size="lg">
                EARN<br/>WHILE<br/><span className="text-magenta">PARTYING.</span>
              </CNHeading>
              <p className="font-bold text-lg sm:text-2xl lg:text-3xl uppercase tracking-[0.15em] text-black dark:text-white max-w-xl mx-auto lg:mx-0 leading-relaxed">
                THE DECENTRALIZED SIMULATION PROTOCOL. $5.00 YIELD EVERY 10 MINUTES OF HOST TIME.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-8">
              <CNButton variant="black" className="w-full sm:w-auto text-2xl sm:text-4xl py-8 sm:py-10 px-10 sm:px-16 shadow-[10px_10px_0px_0px_#FF00FF]" onClick={() => setView(View.AUTH)}>
                INITIATE_UPLINK
              </CNButton>
              <div className="flex flex-col gap-1.5 items-center lg:items-start opacity-70">
                 <span className="font-brand text-[9px] text-black dark:text-white uppercase tracking-widest font-bold">4,208 Nodes Live</span>
                 <p className="font-brand text-[9px] text-black dark:text-white uppercase tracking-[0.1em] font-bold">iOS • Android • HarmonyOS • Web</p>
              </div>
            </div>
          </div>
          <div className="lg:col-span-5 relative flex items-center justify-center order-1 lg:order-2 h-[280px] sm:h-[400px]">
            <div className="absolute w-[90%] h-[90%] bg-magenta/5 dark:bg-magenta/10 blur-[50px] pointer-events-none"></div>
            <div className="character-preview-container scale-[2.2] sm:scale-[3.2] animate-float relative z-10 drop-shadow-[15px_15px_0px_rgba(0,0,0,0.4)]">
              <CharacterPreview character={activeCharacter} scale={1} />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-black py-12 sm:py-20 px-6 sm:px-12 border-b-[8px] border-black dark:border-white">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-10">
            {[
                { label: 'Reserve Pool', val: `$${poolBalance.toLocaleString()}`, col: 'text-black dark:text-white' },
                { label: 'Host Yield', val: '$30.00/hr', col: 'text-magenta' },
                { label: 'Sync Status', val: 'OPTIMIZED', col: 'text-cyan' }
            ].map((s, i) => (
                <div key={i} className="flex flex-col items-center gap-2 border-[4px] border-black dark:border-white p-8 sm:p-10 bg-white dark:bg-black hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all cursor-default shadow-[6px_6px_0px_0px_currentColor]">
                    <span className="font-brand text-[9px] sm:text-[10px] uppercase tracking-widest font-bold opacity-40">{s.label}</span>
                    <span className={`font-brand text-3xl sm:text-5xl ${s.col} transition-colors italic tracking-tighter`}>{s.val}</span>
                </div>
            ))}
        </div>
      </section>

      <footer className="bg-black text-white py-20 sm:py-32 px-6 lg:px-12 border-t-[8px] border-magenta">
        <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row justify-between gap-16">
           <div className="lg:max-w-md space-y-10">
              <CNHeading size="sm">MY PARTY WORLD</CNHeading>
              <p className="font-brand text-[11px] text-white/40 uppercase tracking-widest leading-loose font-bold italic">
                A decentralized simulation network. Payouts processed every 10 minutes of active gameplay.
              </p>
              <CNButton variant="white" className="text-[10px] py-4" onClick={() => setView(View.DONATE)}>DONATION_STATION</CNButton>
           </div>
           <div className="grid grid-cols-2 sm:grid-cols-3 gap-10 sm:gap-20">
              {[
                  { h: 'Systems', l: ['Satellite', 'Nodes', 'Engine'] },
                  { h: 'Info', l: ['Protocol', 'Rewards', 'Legal'] },
                  { h: 'Support', l: ['Uplink', 'API', 'Log'] }
              ].map(cat => (
                <div key={cat.h} className="space-y-6">
                    <h4 className="font-brand text-[10px] text-magenta uppercase tracking-widest font-bold opacity-80">{cat.h}</h4>
                    <ul className="space-y-3 font-brand text-[9px] text-white/30 uppercase tracking-widest font-bold">
                        {cat.l.map(link => <li key={link} className="hover:text-white cursor-pointer transition-colors">{link}</li>)}
                    </ul>
                </div>
              ))}
           </div>
        </div>
      </footer>
    </div>
  );

  const renderDashboard = () => (
    <div className="flex-1 p-6 sm:p-12 space-y-10 sm:space-y-12 overflow-y-auto custom-scrollbar h-full bg-white dark:bg-black">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b-[4px] border-black dark:border-white pb-10 gap-6">
        <div className="space-y-3">
          <Badge variant="black">NETWORK_UP</Badge>
          <CNHeading size="sm">CONTROL_HUB</CNHeading>
        </div>
        <div className="flex gap-4">
            <Badge variant="magenta">MASTER_SYNC</Badge>
            <CNButton variant="white" className="text-[9px] py-2" onClick={() => setView(View.DONATE)}>DONATE</CNButton>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8 sm:gap-12">
        <div className="col-span-12 lg:col-span-4 space-y-10">
          <div className="p-8 sm:p-10 flex flex-col items-center relative border-[4px] border-black dark:border-white shadow-[10px_10px_0px_0px_#FF00FF] bg-white dark:bg-neutral-900">
            <div className="character-preview-container scale-[0.8] sm:scale-[1.1] my-8 sm:my-10 h-[280px] sm:h-[350px] flex items-center justify-center">
              <CharacterPreview character={activeCharacter} scale={1} />
            </div>
            <div className="w-full space-y-6 mt-6 sm:mt-10">
              <ProgressBar value={75} color={COLORS.CYAN} label="UPLINK STABILITY" />
              <ProgressBar value={100} color={COLORS.NUCLEAR_GREEN} label="YIELD FLOW" />
            </div>
            <div className="grid grid-cols-2 gap-4 w-full mt-10">
              <CNButton variant="magenta" className="text-[9px] sm:text-[10px] py-5 font-bold" onClick={() => setView(View.CUSTOMIZE)}>DNA_RECODE</CNButton>
              <CNButton variant="white" className="text-[9px] sm:text-[10px] py-5 font-bold" onClick={() => setView(View.WALLET)}>WITHDRAW</CNButton>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-8 space-y-10">
            <div className="p-8 sm:p-10 border-[4px] border-black dark:border-white shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] dark:shadow-[10px_10px_0px_0px_rgba(255,255,255,0.05)] bg-white dark:bg-neutral-900">
                <div className="flex justify-between items-center mb-8 border-b-[4px] border-black dark:border-white pb-6">
                    <h2 className="font-brand text-2xl sm:text-3xl italic uppercase tracking-tighter text-black dark:text-white">Active Tasks</h2>
                    <Badge variant="magenta">PRIORITY:S</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {QUESTS.map(q => (
                        <div key={q.id} className="border-[4px] border-black dark:border-white p-6 sm:p-8 group cursor-pointer hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="font-brand text-lg italic">{q.title}</h3>
                                <span className="text-magenta font-brand text-lg font-bold group-hover:text-cyan transition-colors">+${q.reward.toFixed(2)}</span>
                            </div>
                            <p className="text-[9px] sm:text-[10px] font-bold uppercase opacity-40 group-hover:opacity-100 leading-relaxed mb-6">{q.desc}</p>
                            <ProgressBar value={0} color={COLORS.CYAN} />
                        </div>
                    ))}
                </div>
            </div>

            <button 
                onClick={() => setView(View.LOCATION_PICKER)}
                className="group relative bg-nuclear-green h-48 sm:h-64 w-full border-[4px] border-black dark:border-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-[12px_12px_0px_0px_rgba(255,255,255,0.1)] cursor-pointer overflow-hidden flex flex-col items-center justify-center gap-2 transition-all active:translate-x-1 active:translate-y-1 active:shadow-none"
            >
                <span className="font-brand text-3xl sm:text-6xl text-black italic tracking-tighter group-hover:scale-110 transition-transform leading-none drop-shadow-[2px_2px_0px_white]">INITIATE_UPLINK</span>
                <span className="font-brand text-[10px] sm:text-[11px] text-black/40 uppercase tracking-widest font-bold">Broadcast Yield: $5.00 / 10 MIN</span>
            </button>
        </div>
      </div>
    </div>
  );

  const renderWallet = () => (
    <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 fade-in h-full bg-white dark:bg-black overflow-y-auto">
      <div className="max-w-4xl w-full p-8 sm:p-16 space-y-12 sm:space-y-16 text-center border-[8px] border-black dark:border-white bg-white dark:bg-neutral-900 shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] dark:shadow-[20px_20px_0px_0px_rgba(255,255,255,0.05)]">
        <div className="space-y-4">
            <CNHeading size="sm">LIQUIDITY_PORTAL</CNHeading>
            <p className="font-brand text-[10px] text-black/40 dark:text-white/40 uppercase tracking-widest font-bold">Direct Financial Settlement</p>
        </div>
        
        <div className="p-10 sm:p-14 border-[4px] border-black dark:border-white border-dashed flex flex-col items-center bg-black/5 dark:bg-white/5">
            <p className="font-brand text-6xl sm:text-[9rem] leading-none text-black dark:text-white tracking-tighter italic drop-shadow-[6px_6px_0px_#FF00FF]">
              ${wallet.balance.toFixed(2)}
            </p>
            <Badge variant="black">REDEEMABLE_CREDITS</Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-left items-center">
          <div className="space-y-6">
            <h4 className="font-brand text-lg sm:text-xl uppercase border-b-4 border-black dark:border-white pb-2 font-bold">Methods</h4>
            <ul className="space-y-4 font-brand text-[9px] sm:text-[10px] text-black/60 dark:text-white/60 uppercase font-bold">
              <li className="flex items-center gap-3"><div className="w-2 h-2 bg-black dark:bg-white" /> Local Bank (Swift)</li>
              <li className="flex items-center gap-3"><div className="w-2 h-2 bg-black dark:bg-white" /> Digital Wallets (PayPal)</li>
              <li className="flex items-center gap-3"><div className="w-2 h-2 bg-black dark:bg-white" /> Satellite Payout</li>
            </ul>
          </div>
          <div className="flex flex-col gap-5">
            <CNButton variant="magenta" className="py-8 text-2xl sm:text-3xl font-bold" onClick={() => { 
                if(wallet.balance < 10) return alert("MINIMUM $10.00 REQUIRED FOR SETTLEMENT");
                alert("FINANCIAL UPLINK INITIATED"); setWallet(p => ({...p, balance: 0}));
            }}>WITHDRAW_NOW</CNButton>
            <button onClick={() => setView(View.DASHBOARD)} className="font-brand text-[9px] sm:text-[10px] uppercase text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors tracking-widest font-bold underline underline-offset-4">RETURN_TO_BASE</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDonate = () => (
    <div className="flex-1 p-4 sm:p-12 lg:p-20 overflow-y-auto custom-scrollbar h-full bg-white dark:bg-black">
      <div className="max-w-6xl mx-auto space-y-12 pb-24">
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-6 border-b-[8px] border-black dark:border-white pb-12">
          <Badge variant="magenta">GLOBAL_FINANCE_UPLINK</Badge>
          <CNHeading size="sm" className="drop-shadow-[6px_6px_0px_#FF00FF]">DONATION STATION</CNHeading>
          <p className="max-w-3xl font-brand text-xs sm:text-lg text-black/40 dark:text-white/40 uppercase tracking-[0.4em] font-bold leading-relaxed">
            Support the node expansion protocol. All contributions fuel the decentralized simulation network.
          </p>
        </div>

        {/* Allocation Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4 space-y-8">
            <CNCard className="h-full border-[6px] border-black dark:border-white shadow-[12px_12px_0px_0px_#FFD700]">
              <h3 className="font-brand text-2xl italic mb-6 text-black dark:text-white underline decoration-magenta decoration-4 underline-offset-8">ALLOCATION PROTOCOL</h3>
              <div className="space-y-6">
                {[
                  { label: 'PLAYERS_POOL', val: 40, col: COLORS.CYAN, desc: 'Directly funds player gameplay yields.' },
                  { label: 'MAINTENANCE', val: 20, col: COLORS.MAGENTA, desc: 'Server uptime and node stability.' },
                  { label: 'DEVELOPMENT', val: 20, col: COLORS.NUCLEAR_GREEN, desc: 'New DNA traits and locations.' },
                  { label: 'OWNER_RESERVE', val: 20, col: COLORS.BLACK, desc: 'Sustainability and protocol management.' }
                ].map(item => (
                  <div key={item.label} className="space-y-2">
                    <div className="flex justify-between items-end">
                      <span className="font-brand text-[10px] font-bold">{item.label}</span>
                      <span className="font-brand text-xl italic">{item.val}%</span>
                    </div>
                    <div className="h-4 border-[2px] border-black dark:border-white bg-white/10 relative overflow-hidden">
                      <div className="h-full transition-all duration-1000" style={{ width: `${item.val}%`, backgroundColor: item.col }} />
                    </div>
                    <p className="font-brand text-[8px] uppercase opacity-40 font-bold">{item.desc}</p>
                  </div>
                ))}
              </div>
            </CNCard>
          </div>

          <div className="lg:col-span-8 space-y-10">
            {/* Amount Selector */}
            <CNCard className="border-[6px] border-black dark:border-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-[12px_12px_0px_0px_rgba(255,255,255,0.05)]">
              <h3 className="font-brand text-2xl italic mb-8 uppercase tracking-tighter">SELECT_CONTRIBUTION</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                {['1', '2', '5', '10', '20', '50', '100'].map(amt => (
                  <button 
                    key={amt}
                    onClick={() => { setDonationAmount(amt); setCustomDonation(''); }}
                    className={`p-6 font-brand text-3xl italic border-[4px] transition-all active:scale-95 ${donationAmount === amt && !customDonation ? 'bg-magenta text-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'bg-white dark:bg-neutral-800 text-black/40 border-black hover:border-magenta'}`}
                  >
                    ${amt}
                  </button>
                ))}
                <div className="relative">
                   <CNInput 
                    type="number"
                    placeholder="CUSTOM"
                    value={customDonation}
                    onChange={(e) => { setCustomDonation(e.target.value); setDonationAmount(''); }}
                    className="h-full text-center text-xl p-0 font-bold"
                   />
                   <div className="absolute top-0 right-2 font-brand text-[8px] opacity-30 pointer-events-none h-full flex items-center">USD</div>
                </div>
              </div>
              <p className="font-brand text-[9px] text-center uppercase tracking-widest font-bold opacity-30">Supports all global currencies, banks, and e-wallet providers.</p>
            </CNCard>

            {/* Payment Nodes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <Badge variant="magenta" className="w-full text-center">BANK_NODE</Badge>
                <div className="p-6 border-[4px] border-black dark:border-white bg-white dark:bg-neutral-900 group cursor-pointer hover:bg-magenta hover:text-white transition-all shadow-[6px_6px_0px_0px_currentColor]" onClick={() => copyToClipboard('107863277869')}>
                  <p className="font-brand text-[9px] uppercase font-bold mb-2 opacity-40 group-hover:opacity-100">BANK_JAGO</p>
                  <p className="font-brand text-2xl tracking-tighter break-all">107863277869</p>
                </div>
              </div>
              <div className="space-y-4">
                <Badge variant="cyan" className="w-full text-center">PAYPAL_NODE</Badge>
                <a href="https://paypal.me/anindijewidhie" target="_blank" rel="noopener noreferrer" className="block p-6 border-[4px] border-black dark:border-white bg-white dark:bg-neutral-900 group hover:bg-cyan hover:text-black transition-all shadow-[6px_6px_0px_0px_currentColor]">
                  <p className="font-brand text-[9px] uppercase font-bold mb-2 opacity-40 group-hover:opacity-100">PAYPAL_ID</p>
                  <p className="font-brand text-lg tracking-tighter break-all italic">anindijewidhie</p>
                </a>
              </div>
              <div className="space-y-4">
                <Badge variant="green" className="w-full text-center">E-WALLET_NODE</Badge>
                <div className="p-6 border-[4px] border-black dark:border-white bg-white dark:bg-neutral-900 group cursor-pointer hover:bg-nuclear-green hover:text-black transition-all shadow-[6px_6px_0px_0px_currentColor]" onClick={() => copyToClipboard('+628567239000')}>
                  <p className="font-brand text-[9px] uppercase font-bold mb-2 opacity-40 group-hover:opacity-100">+62_NETWORK</p>
                  <p className="font-brand text-xl tracking-tighter">8567239000</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col items-center pt-12 space-y-8">
          <CNButton 
            variant="black" 
            className="w-full max-w-2xl py-12 text-4xl font-bold shadow-[12px_12px_0px_0px_#FF00FF] active:translate-x-1 active:translate-y-1" 
            onClick={() => {
              const finalAmount = customDonation || donationAmount;
              if (!finalAmount || parseFloat(finalAmount) <= 0) return alert("SELECT A CONTRIBUTION AMOUNT");
              alert(`UPLINK INITIATED FOR $${finalAmount}. PLEASE COMPLETE PAYMENT VIA THE SELECTED NODE.`);
              setView(View.LANDING);
            }}
          >
            CONFIRM_CONTRIBUTION
          </CNButton>
          <button onClick={() => setView(View.LANDING)} className="font-brand text-[10px] uppercase text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors tracking-widest font-bold underline underline-offset-8 decoration-2 decoration-black/10">DISCONNECT_STATION</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden bg-white dark:bg-black h-screen">
      <GameHUD 
        user={user} 
        balance={wallet.balance} 
        setView={setView} 
        currentView={view} 
        toggleDarkMode={() => setIsDark(!isDark)}
        isDark={isDark}
      />
      
      {view === View.LANDING && <GlobalTicker />}
      
      {isGenerating && (
        <div className="fixed inset-0 z-[600] bg-white/95 dark:bg-black/95 flex flex-col items-center justify-center p-8 text-center bg-white/95 dark:bg-black/95">
          <div className="animate-spin-slow mb-12 border-[10px] border-black dark:border-white p-6 bg-white dark:bg-black">
            <div className="w-12 h-12 bg-magenta rotate-45" />
          </div>
          <h2 className="font-brand text-4xl sm:text-7xl text-black dark:text-white italic animate-pulse tracking-tighter drop-shadow-[6px_6px_0px_cyan]">SYNTHESIZING...</h2>
        </div>
      )}

      <main className="flex-1 flex flex-col overflow-hidden relative">
        {view === View.LANDING && renderLanding()}
        {view === View.AUTH && <div className="flex-1 flex items-center justify-center p-4 sm:p-12 bg-black/5 dark:bg-white/5 overflow-y-auto"><AuthScreen onLogin={handleLogin} /></div>}
        {view === View.DONATE && renderDonate()}
        {user && (
          <>
            {view === View.DASHBOARD && renderDashboard()}
            {view === View.WALLET && renderWallet()}
            {view === View.LOCATION_PICKER && (
                <div className="flex-1 p-6 sm:p-16 fade-in overflow-y-auto custom-scrollbar h-full bg-white dark:bg-black">
                    <div className="flex flex-col items-center mb-16 text-center">
                        <CNHeading size="sm">SATELLITE_NODES</CNHeading>
                        <p className="font-brand text-xs sm:text-lg text-black/40 dark:text-white/40 uppercase tracking-[0.4em] font-bold">Target Vector Selection</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-[1400px] mx-auto pb-24 px-4">
                        {LOCATIONS.map(loc => (
                            <div key={loc.id} className="p-8 border-[4px] border-black dark:border-white flex flex-col justify-between h-[450px] sm:h-[480px] cursor-pointer hover:bg-magenta hover:text-white transition-all group bg-white dark:bg-neutral-900 shadow-[8px_8px_0px_0px_currentColor]" onClick={() => startParty(loc.id)}>
                                <div className="text-[10rem] sm:text-[12rem] text-center mb-6 group-hover:scale-110 transition-transform drop-shadow-[4px_4px_0px_rgba(0,0,0,0.1)]">{loc.icon}</div>
                                <div className="text-center">
                                    <h3 className="font-brand text-2xl sm:text-3xl italic mb-3 leading-none">{loc.name}</h3>
                                    <Badge variant="black">YIELD: 1.5X</Badge>
                                </div>
                                <CNButton variant="black" className="w-full mt-8 py-5 text-xl font-bold group-hover:bg-white dark:group-hover:bg-black group-hover:text-black dark:group-hover:text-white">INITIATE</CNButton>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {view === View.PARTY && activeParty && (
                <div className="flex-1 flex flex-col p-4 sm:p-12 space-y-8 fade-in h-full relative bg-white dark:bg-black overflow-y-auto">
                    <div className="grid grid-cols-12 gap-8 h-full relative z-10 max-w-[1600px] mx-auto w-full">
                        <div className="col-span-12 lg:col-span-9 flex flex-col gap-8">
                            <div className="flex-1 flex flex-col items-center justify-center border-[8px] border-black dark:border-white shadow-[12px_12px_0px_0px_currentColor] relative overflow-hidden bg-black/5 dark:bg-white/5 min-h-[400px]">
                                <div className="absolute top-6 left-6 flex flex-col gap-4 z-30">
                                    <div className="bg-magenta text-white font-brand text-xl sm:text-2xl px-5 py-3 animate-pulse border-[4px] border-black dark:border-white">
                                        LIVE_BROADCAST
                                    </div>
                                    <Badge variant="black">UPLINK_STABLE</Badge>
                                </div>
                                <div className="scale-[1.2] sm:scale-[2.2] relative z-20"><CharacterPreview character={activeCharacter} scale={1} /></div>
                                <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end z-20">
                                    <div className="space-y-2">
                                        <h2 className="font-brand text-3xl sm:text-6xl italic text-black dark:text-white uppercase tracking-tighter drop-shadow-[3px_3px_0px_white] dark:drop-shadow-[3px_3px_0px_black]">{activeParty.env.decor}</h2>
                                        <p className="font-brand text-[9px] sm:text-base text-black/40 dark:text-white/40 uppercase tracking-widest font-bold">{activeParty.env.music}</p>
                                    </div>
                                    <Badge variant="magenta">{activeParty.env.specialEffect}</Badge>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
                                <CNCard className="flex flex-col items-center py-8">
                                    <span className="font-brand text-[9px] text-black/30 dark:text-white/30 uppercase mb-2 font-bold tracking-widest">Sync Level</span>
                                    <span className="font-brand text-5xl sm:text-6xl text-black dark:text-white italic">{Math.round(activeParty.vibe)}%</span>
                                </CNCard>
                                <CNCard className="flex flex-col items-center py-8">
                                    <span className="font-brand text-[9px] text-black/30 dark:text-white/30 uppercase mb-2 font-bold tracking-widest">Node Traffic</span>
                                    <span className="font-brand text-5xl sm:text-6xl text-magenta italic">{activeParty.guests}K</span>
                                </CNCard>
                                <CNCard className="flex flex-col items-center py-8">
                                    <span className="font-brand text-[9px] text-black/30 dark:text-white/30 uppercase mb-2 font-bold tracking-widest">Accrued</span>
                                    <span className="font-brand text-5xl sm:text-6xl text-cyan italic">${activeParty.earnedInSession.toFixed(2)}</span>
                                </CNCard>
                            </div>
                        </div>
                        <div className="col-span-12 lg:col-span-3 flex flex-col gap-8">
                            <div className="flex-1 border-[6px] border-black dark:border-white p-6 sm:p-8 flex flex-col gap-6 sm:gap-8 bg-white dark:bg-neutral-900 shadow-[10px_10px_0px_0px_currentColor] min-h-[300px]">
                                <h3 className="font-brand text-2xl sm:text-3xl italic border-b-[4px] border-black dark:border-white pb-4 uppercase font-bold text-black dark:text-white">Telemetry</h3>
                                <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2 min-h-[150px]">
                                    {activeParty.activeEvents.map(e => (
                                        <div key={e.id} className="p-4 border-[2px] border-black dark:border-white bg-black/5 dark:bg-white/5 animate-fadeIn">
                                            <p className="font-brand text-[9px] uppercase italic text-black dark:text-white font-bold leading-relaxed">{e.text}</p>
                                        </div>
                                    ))}
                                    {activeParty.activeEvents.length === 0 && (
                                        <div className="flex flex-col items-center justify-center h-full opacity-10 gap-4">
                                            <span className="text-5xl text-black dark:text-white">📡</span>
                                            <p className="font-brand text-[8px] uppercase tracking-widest font-bold text-black dark:text-white">Scanning Spectrum...</p>
                                        </div>
                                    )}
                                </div>
                                <CNButton variant="magenta" className="w-full py-6 sm:py-8 text-2xl font-bold" onClick={async () => {
                                    setIsGenerating(true);
                                    try {
                                        const eventData = await getPartyEvent(activeParty.theme);
                                        const newEvent: PartyEvent = {
                                            id: Math.random().toString(),
                                            text: eventData.event,
                                            impact: eventData.vibeImpact,
                                            type: eventData.vibeImpact >= 0 ? 'bonus' : 'hazard'
                                        };
                                        setActiveParty(prev => prev ? {
                                            ...prev,
                                            vibe: Math.min(100, Math.max(0, prev.vibe + eventData.vibeImpact)),
                                            activeEvents: [newEvent, ...prev.activeEvents].slice(0, 10)
                                        } : null);
                                    } catch (e) {} finally { setIsGenerating(false); }
                                }}>TRIGGER_EVENT</CNButton>
                            </div>
                            <CNButton variant="black" className="w-full py-6 text-xl font-bold" onClick={() => { setActiveParty(null); setView(View.DASHBOARD); }}>TERMINATE</CNButton>
                        </div>
                    </div>
                </div>
            )}
            {view === View.CUSTOMIZE && (
              <div className="flex-1 grid grid-cols-12 gap-8 sm:gap-12 p-6 sm:p-12 overflow-hidden h-full bg-white dark:bg-black">
                <div className="col-span-12 lg:col-span-5 flex items-center justify-center relative border-[10px] border-black dark:border-white bg-black/5 dark:bg-white/5 shadow-[20px_20px_0px_0px_currentColor] h-[350px] lg:h-full">
                  <div className="scale-[1.8] sm:scale-[2.6] character-preview-container transition-transform duration-700">
                    <CharacterPreview character={activeCharacter} scale={1} previewHairStyle={previewHairStyle} />
                  </div>
                  <div className="absolute top-8 left-8">
                    <Badge variant="black">DNA_RESEQUENCER</Badge>
                  </div>
                </div>
                <div className="col-span-12 lg:col-span-7 flex flex-col gap-8 sm:gap-10 overflow-y-auto custom-scrollbar pr-4">
                  <div className="flex items-center justify-between border-b-[6px] border-black dark:border-white pb-6">
                    <CNHeading size="sm">ID_LAB_STATION</CNHeading>
                    <button onClick={() => setView(View.DASHBOARD)} className="font-brand text-[10px] sm:text-xs hover:text-magenta transition-colors opacity-30 hover:opacity-100 uppercase tracking-widest font-bold text-black dark:text-white underline underline-offset-4">EXIT</button>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {ITEM_CATEGORIES.map(cat => (
                      <button 
                        key={cat.id} 
                        onClick={() => setSelectedCategoryTab(cat.id)} 
                        className={`p-4 font-brand text-[9px] sm:text-[10px] border-[4px] border-black dark:border-white transition-all font-bold ${selectedCategoryTab === cat.id ? 'bg-black dark:bg-white text-white dark:text-black scale-105' : 'bg-white dark:bg-neutral-900 text-black/40 dark:text-white/40 hover:border-magenta'}`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>

                  <div className="p-8 sm:p-10 space-y-10 border-[6px] border-black dark:border-white bg-white dark:bg-neutral-900 shadow-[10px_10px_0px_0px_currentColor]">
                    {selectedCategoryTab === 'hair' && (
                        <div className="space-y-8 animate-fadeIn">
                             <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {HAIR_STYLES.map(style => (
                                    <button 
                                        key={style.id}
                                        onMouseEnter={() => setPreviewHairStyle(style.id)}
                                        onMouseLeave={() => setPreviewHairStyle(null)}
                                        onClick={() => {
                                          updateCharacterProperty('hairStyle', style.id);
                                          setPreviewHairStyle(null);
                                        }}
                                        className={`p-6 flex flex-col items-center gap-4 border-[3px] border-black dark:border-white transition-all ${activeCharacter.hairStyle === style.id ? 'bg-magenta text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'bg-white dark:bg-neutral-800 text-black/40 dark:text-white/40 hover:bg-black/5'}`}
                                    >
                                        <span className="text-4xl">{style.icon}</span>
                                        <span className="font-brand text-[9px] sm:text-[10px] uppercase italic text-center leading-none font-bold">{style.name}</span>
                                    </button>
                                ))}
                             </div>
                        </div>
                    )}

                    <div className="space-y-6">
                        <p className="font-brand text-[10px] sm:text-sm text-black/30 dark:text-white/30 uppercase tracking-[0.4em] font-bold">Neural Prompt directive</p>
                        <CNInput 
                            placeholder={`Describe modifications for ${selectedCategoryTab}...`} 
                            value={aiPrompt} 
                            onChange={e => setAiPrompt(e.target.value)} 
                            className="text-xl italic border-[4px]"
                        />
                        <CNButton variant="black" className="w-full py-8 sm:py-10 text-2xl sm:text-4xl font-bold" onClick={handleGenerateItem} disabled={isGenerating}>COMMIT_MODS</CNButton>
                    </div>
                  </div>
                  
                  <CNButton variant="magenta" className="w-full text-3xl sm:text-5xl py-10 sm:py-14 mt-4 mb-10 font-bold" onClick={() => setView(View.DASHBOARD)}>SAVE_GENOME_STATE</CNButton>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default App;