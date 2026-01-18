import React, { useState, useEffect, useRef } from 'react';
import { View, Character, WalletState, PartySession, User } from './types';
import { COLORS, THEMES, PROVIDERS, BODY_TYPES, HAIR_STYLES, ITEM_CATEGORIES, LOCATIONS, SKIN_TONE_CHART, UNDERTOTES, AGE_RANGES, CAPTURE_CONFIG } from './constants';
import { CNButton, CNCard, CNHeading, ProgressBar } from './components/UIElements';
import { CharacterPreview } from './components/CharacterPreview';
import { AuthScreen } from './components/AuthScreen';
import { getPartyEvent, generateCustomItem } from './services/geminiService';

const CNTicker: React.FC<{ text: string }> = ({ text }) => (
  <div className="bg-black text-white overflow-hidden py-3 border-y-4 border-black dark:border-white">
    <div className="flex whitespace-nowrap animate-marquee">
      {[...Array(5)].map((_, i) => (
        <span key={i} className="font-brand text-sm tracking-widest mx-12">
          {text} • {text} • {text}
        </span>
      ))}
    </div>
  </div>
);

const ConfettiLogo: React.FC<{ size?: 'sm' | 'lg' }> = ({ size = 'sm' }) => {
  const containerClass = size === 'lg' ? 'w-24 h-24 md:w-32 md:h-32' : 'w-10 h-10';
  const textClass = size === 'lg' ? 'text-5xl md:text-7xl' : 'text-xl';
  return (
    <div className={`${containerClass} bg-white dark:bg-[#111111] cn-border relative overflow-hidden flex items-center justify-center shrink-0 transition-colors duration-300`}>
      <div className="absolute top-[-2px] left-1 w-2 h-5 bg-magenta rotate-12" />
      <div className="absolute top-4 right-1 w-4 h-2 bg-olive -rotate-45" />
      <div className="absolute bottom-1 left-3 w-3 h-3 bg-cyan rotate-90" />
      <div className="absolute top-2 right-5 w-2 h-2 bg-magenta-light rotate-45" />
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
  
  const [characters, setCharacters] = useState<Character[]>(() => {
    const saved = localStorage.getItem('party-world-characters');
    return saved ? JSON.parse(saved) : [{
      id: 'char_1',
      name: 'Host Prime',
      ageRange: 'teenager',
      bodyType: 'standard',
      outfit: COLORS.CYAN,
      skinColor: '#FFF5E6',
      hairStyle: 'short',
      headwear: 'none',
      footwear: '#333',
      jewelry: 'none',
      accessory: 'none',
      handItem: 'none'
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
  const [donationAmount, setDonationAmount] = useState<string>('');
  
  // Capture States
  const [activeCaptureMode, setActiveCaptureMode] = useState<'photo' | 'video'>('photo');
  const [selectedRatio, setSelectedRatio] = useState(CAPTURE_CONFIG.ASPECT_RATIOS[0]);
  const [selectedResolution, setSelectedResolution] = useState(CAPTURE_CONFIG.RESOLUTIONS[1]);
  const [selectedFilter, setSelectedFilter] = useState(CAPTURE_CONFIG.FILTERS[0]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [captureHistory, setCaptureHistory] = useState<{id: number, type: string, amount: number, timestamp: string, ratio: string}[]>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const GAMEPLAY_RATE_SEC = 5 / (10 * 60); 
  const STREAMING_RATE_SEC = 50 / 3600;   

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
    stopCamera();
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
        const currentRate = GAMEPLAY_RATE_SEC + (activeParty.isStreaming ? STREAMING_RATE_SEC : 0);
        setWallet(prev => {
          const newBalance = prev.balance + currentRate;
          if (prev.isLinked && prev.autoWithdraw && newBalance >= 20) {
             return { ...prev, balance: 0 };
          }
          return { ...prev, balance: newBalance };
        });
        setActiveParty(prev => prev ? ({ ...prev, earned: prev.earned + currentRate }) : null);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeParty?.isStreaming, activeParty === null, user]);

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

  const toggleStream = () => {
    if (!activeParty) return;
    const nowLive = !activeParty.isStreaming;
    setActiveParty({ 
      ...activeParty, 
      isStreaming: nowLive,
      streamStartTime: nowLive ? Date.now() : undefined
    });
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

  const startCamera = async () => {
    if (streamRef.current) stopCamera();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: selectedResolution.w }, 
          height: { ideal: selectedResolution.h },
          facingMode: 'user'
        }, 
        audio: true 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsCapturing(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const [wRatio, hRatio] = selectedRatio.id.split(':').map(Number);
    const targetWidth = selectedResolution.w;
    const targetHeight = (selectedResolution.w * hRatio) / wRatio;
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    if (ctx) {
      ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
      setTimeout(() => {
        setWallet(prev => ({ ...prev, balance: prev.balance + 1 }));
        setCaptureHistory(prev => [{ 
          id: Date.now(), 
          type: 'Photo', 
          amount: 1, 
          timestamp: new Date().toLocaleTimeString(),
          ratio: selectedRatio.id
        }, ...prev].slice(0, 5));
        setIsCapturing(false);
      }, 300);
    }
  };

  const toggleRecording = () => {
    if (!isRecording) {
      if (!streamRef.current) return;
      try {
        const recorder = new MediaRecorder(streamRef.current, { mimeType: 'video/webm' });
        recorder.start();
        mediaRecorderRef.current = recorder;
        setIsRecording(true);
        setRecordTime(0);
      } catch (err) { setIsRecording(true); }
    } else {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
      setWallet(prev => ({ ...prev, balance: prev.balance + 2 }));
      setCaptureHistory(prev => [{ 
        id: Date.now(), 
        type: 'Video', 
        amount: 2, 
        timestamp: new Date().toLocaleTimeString(),
        ratio: selectedRatio.id
      }, ...prev].slice(0, 5));
    }
  };

  useEffect(() => {
    let timer: any;
    if (isRecording) { timer = setInterval(() => setRecordTime(t => t + 1), 1000); }
    return () => clearInterval(timer);
  }, [isRecording]);

  const handleCustomization = async () => {
    if (!customPrompt) return;
    setIsGenerating(true);
    try {
      const item = await generateCustomItem(customPrompt);
      const slot = item.type.toLowerCase() as keyof Character;
      const characterKeys: (keyof Character)[] = ['outfit', 'headwear', 'footwear', 'jewelry', 'accessory', 'handItem'];
      if (characterKeys.includes(slot)) {
        updateActiveCharacter({ [slot]: slot === 'outfit' || slot === 'footwear' ? item.color : item.id || item.name });
      } else {
        updateActiveCharacter({ outfit: item.color });
      }
      setCustomPrompt('');
    } catch (e) { console.error(e); }
    finally { setIsGenerating(false); }
  };

  const updateActiveCharacter = (updates: Partial<Character>) => {
    setCharacters(prev => prev.map(c => c.id === activeCharacterId ? { ...c, ...updates } : c));
  };

  const addNewCharacter = () => {
    const newId = `char_${Date.now()}`;
    const newChar: Character = {
      id: newId,
      name: `Host ${characters.length + 1}`,
      ageRange: 'teenager',
      bodyType: 'standard',
      outfit: COLORS.MAGENTA,
      skinColor: '#FFF5E6',
      hairStyle: 'short',
      headwear: 'none',
      footwear: '#333',
      jewelry: 'none',
      accessory: 'none',
      handItem: 'none'
    };
    setCharacters(prev => [...prev, newChar]);
    setActiveCharacterId(newId);
    setView(View.CUSTOMIZE);
  };

  const handleWithdrawal = () => {
    if (user?.parentalControlActive) {
      const pin = prompt("Please enter Parental PIN to authorize withdrawal:");
      if (pin !== '1234') { alert("Incorrect PIN."); return; }
    }
    alert(`Withdrawal of $${wallet.balance.toFixed(2)} successful!`);
    setWallet(prev => ({ ...prev, balance: 0 }));
  };

  const handleDonation = (amount: number) => {
    alert(`Thank you for donating $${amount}! This funding goes directly to paying players, maintenance, and keeping the show running on air.`);
    setDonationAmount('');
  };

  const renderLanding = () => (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black relative overflow-x-hidden fade-in">
      {/* Top Navigation / Ticker */}
      <div className="fixed top-0 left-0 w-full z-50">
        <CNTicker text="HOST PARTIES • GET PAID REAL CASH • 90s TOON VIBES • NO SUBSCRIPTION • LIVE NOW" />
        <div className="bg-white/90 dark:bg-black/90 backdrop-blur-md border-b-4 border-black dark:border-white px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <ConfettiLogo size="sm" />
            <h1 className="font-brand text-2xl tracking-tighter hidden sm:block">MY PARTY <span className="text-cyan">WORLD</span></h1>
          </div>
          <div className="flex gap-4">
             <button onClick={() => setDarkMode(!darkMode)} className="w-12 h-12 flex items-center justify-center bg-white dark:bg-black cn-border transition-all hover:scale-110 active:scale-95 text-xl">
               {darkMode ? '🌞' : '🌙'}
             </button>
             <CNButton variant="magenta" className="px-6 text-sm" onClick={() => setView(View.AUTH)}>START NOW</CNButton>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-48 pb-24 px-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center min-h-[90vh]">
        <div className="lg:col-span-7 space-y-10 text-center lg:text-left">
          <div className="inline-block bg-magenta text-white font-brand text-sm px-6 py-2 cn-border -rotate-2 animate-pulse mb-4">
            NEW: EARN $5.00 EVERY 10 MINS
          </div>
          
          <h2 className="font-brand text-7xl md:text-8xl xl:text-9xl leading-[0.85] text-black dark:text-white uppercase tracking-tighter">
            YOUR PARTY.<br />
            <span className="text-magenta italic">YOUR PAYOUT.</span>
          </h2>
          
          <p className="font-bold text-2xl md:text-3xl text-gray-700 dark:text-gray-300 max-w-2xl leading-tight">
            The world's first party hosting sim that pays <span className="text-cyan font-brand">Real Money</span> for your creativity. Build your toon, host legendary events, and cash out instantly.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start pt-4">
            <CNButton variant="magenta" className="text-4xl px-12 py-8 hover:scale-105 active:scale-95" onClick={() => setView(View.AUTH)}>
              JOIN THE NETWORK
            </CNButton>
            <CNButton variant="olive" className="text-2xl px-10 py-6" onClick={() => setView(View.DONATE)}>
              DONATION HUB
            </CNButton>
          </div>
          
          <div className="flex flex-wrap gap-4 justify-center lg:justify-start opacity-60 grayscale hover:grayscale-0 transition-all pt-8">
            <span className="font-brand text-xs">NO ADS</span>
            <span className="font-brand text-xs">NO DATA MINING</span>
            <span className="font-brand text-xs">NO BULLSH*T</span>
          </div>
        </div>

        <div className="lg:col-span-5 flex justify-center lg:justify-end relative">
          {/* TV Bumper Frame */}
          <div className="relative p-8 md:p-12 bg-white dark:bg-gray-900 cn-border rotate-2 group transition-transform hover:rotate-0">
            <div className="absolute inset-0 bg-cyan -z-10 translate-x-4 translate-y-4 cn-border border-none opacity-20" />
            <CharacterPreview character={activeCharacter} scale={3} />
            
            {/* Overlay Badges */}
            <div className="absolute -top-6 -right-6 bg-yellow-400 text-black font-brand px-6 py-2 cn-border rotate-12 shadow-xl z-20">
              CASH OUT FAST
            </div>
            <div className="absolute bottom-4 left-4 bg-black text-white font-brand px-4 py-1 text-xs cn-border -rotate-3 z-20">
              BROADCAST READY
            </div>
          </div>
          
          {/* Floating Accents */}
          <div className="absolute -top-10 left-0 w-20 h-20 bg-magenta/10 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-cyan/10 rounded-full blur-3xl -z-10" />
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="bg-black dark:bg-[#111] py-24 border-y-8 border-black">
        <div className="max-w-7xl mx-auto px-8">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {[
                { title: "Host & Earn", icon: "💸", color: "text-green-400", desc: "Earn $5.00 every 10 minutes of active gameplay. Funded by community donations and network ads." },
                { title: "Deep Style", icon: "🎨", color: "text-magenta-light", desc: "Infinite customization using 90s-inspired assets or AI-crafted unique props." },
                { title: "Go Viral", icon: "📸", color: "text-cyan-light", desc: "Capture high-vibe snapshots and videos in the Capture Studio for extra bonuses." }
              ].map((f, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 p-10 cn-border flex flex-col items-center text-center space-y-6 hover:-translate-y-2 transition-transform">
                  <span className="text-7xl">{f.icon}</span>
                  <h3 className={`font-brand text-3xl uppercase ${f.color}`}>{f.title}</h3>
                  <p className="font-bold text-gray-600 dark:text-gray-400">{f.desc}</p>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* Donation Awareness Section */}
      <section className="py-24 px-8 max-w-5xl mx-auto text-center space-y-12">
        <CNHeading className="text-5xl md:text-7xl">FULLY FUNDED BY YOU</CNHeading>
        <p className="font-bold text-2xl md:text-3xl text-gray-700 dark:text-gray-300 leading-relaxed">
          My Party World operates as a community-driven network. 100% of donations go directly to the Player Payout Pool, server upkeep, and creator support.
        </p>
        <div className="flex flex-wrap justify-center gap-12 pt-8">
          <div className="flex flex-col items-center gap-2">
            <span className="text-5xl">🏦</span>
            <span className="font-brand text-xs">GLOBAL BANKS</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="text-5xl">📱</span>
            <span className="font-brand text-xs">E-WALLETS</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="text-5xl">✨</span>
            <span className="font-brand text-xs">ALL CURRENCIES</span>
          </div>
        </div>
        <CNButton variant="olive" className="text-2xl px-16 py-8" onClick={() => setView(View.DONATE)}>VIEW FUNDING STATS</CNButton>
      </section>

      {/* Footer Ticker */}
      <div className="w-full mt-auto">
        <CNTicker text="90s RETRO REVIVAL • MY PARTY WORLD • EARN WHILE YOU HOST • SUPPORT THE SHOW" />
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="animate-fade-in space-y-12 pb-32 pt-8 fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Bumper */}
        <CNCard className="lg:col-span-2 flex flex-col md:flex-row items-center gap-16 bg-white dark:bg-gray-900">
          <div className="bg-gray-50 dark:bg-gray-800 p-12 cn-border shrink-0">
            <CharacterPreview character={activeCharacter} scale={1.8} />
          </div>
          <div className="flex-1 space-y-6 text-center md:text-left">
            <div className="inline-block px-6 py-2 bg-black text-white font-brand text-sm">STATUS: ON-AIR READY</div>
            <h1 className="font-brand text-6xl uppercase text-magenta dark:text-magenta-light leading-none">{activeCharacter.name}</h1>
            <p className="font-bold text-2xl opacity-70 uppercase tracking-widest text-black dark:text-white">
              LIFESTAGE: {AGE_RANGES.find(a => a.id === activeCharacter.ageRange)?.name}
            </p>
            <div className="flex flex-wrap gap-6 pt-6 justify-center md:justify-start">
              <CNButton variant="magenta" className="px-8" onClick={() => setView(View.CHARACTER_GALLERY)}>SWITCH TOON</CNButton>
              <CNButton variant="olive" className="px-8" onClick={() => setView(View.CUSTOMIZE)}>STYLE SHOP</CNButton>
              <CNButton className="px-16 text-2xl" onClick={initiateHostParty}>HOST NOW</CNButton>
            </div>
          </div>
        </CNCard>

        {/* High Score / Wallet Stats */}
        <CNCard className="lg:col-span-1 flex flex-col items-center justify-center space-y-8 bg-olive-light dark:bg-olive text-white border-none shadow-none ring-4 ring-black">
          <h3 className="font-brand text-3xl uppercase border-b-4 border-white pb-4 w-full text-center">EARNINGS</h3>
          <div className="text-8xl font-brand text-black dark:text-white">${wallet.balance.toFixed(2)}</div>
          <div className="w-full space-y-4 text-sm font-bold uppercase tracking-widest opacity-90 px-4">
            <div className="flex justify-between border-b-2 border-white/30 pb-2"><span>Current Payout:</span> <span>$0.00</span></div>
            <div className="flex justify-between border-b-2 border-white/30 pb-2"><span>Session Time:</span> <span>0m</span></div>
            <div className="flex justify-between border-b-2 border-white/30 pb-2"><span>Game Multiplier:</span> <span>1.0x</span></div>
          </div>
          <CNButton variant="magenta" className="w-full text-white bg-black border-white text-2xl py-6" onClick={() => setView(View.WALLET)}>WITHDRAW NOW</CNButton>
        </CNCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {[
          { icon: "📸", title: "SNAP STUDIO", desc: "Snap high-vibe photos and earn $1.00 each instantly.", action: () => setView(View.CAPTURE) },
          { icon: "🎁", title: "SUPPORT SHOW", desc: "Donate to keep the network running and pay players.", action: () => setView(View.DONATE) },
          { icon: "🌍", title: "TOON MAP", desc: "Explore iconic 90s locations from the Cul-de-sac to Townsville.", action: () => setView(View.LOCATION_PICKER) },
          { icon: "💸", title: "CASH HUB", desc: "Manage your bank link and setup automatic withdrawals.", action: () => setView(View.WALLET) }
        ].map((tool, idx) => (
          <CNCard key={idx} className="flex flex-col items-center text-center space-y-6 hover:-translate-y-3 transition-transform cursor-pointer bg-white dark:bg-gray-900" onClick={tool.action}>
            <div className="text-7xl">{tool.icon}</div>
            <h4 className="font-brand text-2xl uppercase">{tool.title}</h4>
            <p className="text-sm font-bold text-gray-600 dark:text-gray-400 leading-snug">{tool.desc}</p>
          </CNCard>
        ))}
      </div>
    </div>
  );

  const renderDonate = () => (
    <div className="max-w-4xl mx-auto space-y-12 pt-8 fade-in">
      <CNCard className="bg-white dark:bg-gray-900 p-12 text-center space-y-8">
        <CNHeading className="text-6xl">DONATION STATION</CNHeading>
        <div className="space-y-4 max-w-2xl mx-auto">
          <p className="font-bold text-xl uppercase tracking-widest text-magenta">Keep the Magic Alive!</p>
          <p className="text-lg text-gray-600 dark:text-gray-300 font-bold leading-relaxed">
            Your donations go directly to funding player payouts ($5/10min), maintaining our toon servers, 
            continuing development, and supporting the network's creators.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {[1, 2, 5, 10, 20, 50, 100].map(amt => (
            <CNButton key={amt} variant="magenta" className="text-3xl py-6" onClick={() => handleDonation(amt)}>${amt}</CNButton>
          ))}
        </div>

        <div className="space-y-4 pt-8">
          <p className="font-brand text-sm uppercase text-gray-500">Custom Amount (All Currencies & Wallets Supported)</p>
          <div className="flex gap-4 max-w-md mx-auto">
             <input 
               type="number" 
               placeholder="Enter Amount" 
               className="flex-1 p-5 cn-border font-bold bg-white dark:bg-black text-black dark:text-white text-2xl"
               value={donationAmount}
               onChange={(e) => setDonationAmount(e.target.value)}
             />
             <CNButton className="px-12 text-xl" onClick={() => handleDonation(Number(donationAmount))} disabled={!donationAmount}>FUND</CNButton>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-12 border-t-4 border-black/10">
          <div className="space-y-4">
             <h4 className="font-brand text-xl text-olive">E-WALLETS</h4>
             <div className="flex flex-wrap justify-center gap-4 text-3xl">
               <span>📱</span> <span>💳</span> <span>🅿️</span> <span>💸</span>
             </div>
             <p className="text-[10px] font-bold uppercase text-gray-500">Instant Global Payouts</p>
          </div>
          <div className="space-y-4">
             <h4 className="font-brand text-xl text-cyan">BANKS</h4>
             <div className="flex flex-wrap justify-center gap-4 text-3xl">
               <span>🏦</span> <span>🏛️</span> <span>💰</span> <span>✨</span>
             </div>
             <p className="text-[10px] font-bold uppercase text-gray-500">All International Providers</p>
          </div>
        </div>

        <CNButton variant="olive" className="w-full text-xl py-6" onClick={() => setView(View.DASHBOARD)}>BACK TO SHOW</CNButton>
      </CNCard>
    </div>
  );

  const renderCapture = () => (
    <div className="animate-fade-in flex flex-col items-center gap-12 pt-8 fade-in">
      <CNHeading className="text-5xl text-center w-full">CAPTURE STUDIO</CNHeading>
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-4 gap-12">
        <CNCard className="lg:col-span-3 flex flex-col items-center relative bg-white dark:bg-gray-900">
          <div className={`relative w-full overflow-hidden cn-border bg-black transition-all duration-500 ${selectedRatio.class}`}>
            <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover transition-all ${selectedFilter.css} ${isCapturing ? 'brightness-150 scale-105' : ''}`} />
            {isRecording && (
              <div className="absolute top-6 left-6 bg-red-600 text-white font-brand px-4 py-2 cn-border-sm animate-pulse z-20 text-xl">
                REC {Math.floor(recordTime/60)}:{(recordTime%60).toString().padStart(2, '0')}
              </div>
            )}
          </div>
          <div className="mt-12 flex flex-col items-center gap-8 w-full">
            <div className="flex gap-12 items-center">
              <button onClick={() => setActiveCaptureMode('photo')} className={`p-8 rounded-full cn-border transition-all ${activeCaptureMode === 'photo' ? 'bg-cyan text-white scale-110 shadow-none ring-4 ring-cyan/30' : 'bg-gray-200 dark:bg-gray-800 opacity-50'}`}><span className="text-4xl">📸</span></button>
              <button onClick={activeCaptureMode === 'photo' ? takePhoto : toggleRecording} className={`w-32 h-32 rounded-full cn-border flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-20 ${isRecording ? 'bg-red-600 animate-pulse' : 'bg-white'}`}>
                <div className={`transition-all duration-300 ${isRecording ? 'w-12 h-12 rounded-none' : 'w-20 h-20 rounded-full'} ${activeCaptureMode === 'photo' ? 'bg-cyan' : 'bg-red-500'}`} />
              </button>
              <button onClick={() => setActiveCaptureMode('video')} className={`p-8 rounded-full cn-border transition-all ${activeCaptureMode === 'video' ? 'bg-red-600 text-white scale-110 shadow-none ring-4 ring-red-600/30' : 'bg-gray-200 dark:bg-gray-800 opacity-50'}`}><span className="text-4xl">🎥</span></button>
            </div>
            <div className="flex gap-8">
              <CNButton variant="cyan" onClick={takePhoto} className="px-12 py-6 text-2xl" disabled={isRecording}>SNAP {selectedRatio.id} ($1)</CNButton>
              <CNButton variant="magenta" onClick={toggleRecording} className="px-12 py-6 text-2xl">{isRecording ? 'STOP' : `START VIDEO ($2)`}</CNButton>
            </div>
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </CNCard>
        <div className="space-y-8 lg:col-span-1">
          <CNCard><p className="font-brand text-xs uppercase mb-4 tracking-widest text-gray-500">Aspect Ratio</p><div className="grid grid-cols-2 gap-3">{CAPTURE_CONFIG.ASPECT_RATIOS.map(r => (<button key={r.id} onClick={() => setSelectedRatio(r)} className={`p-3 text-xs font-bold cn-border-sm transition-all ${selectedRatio.id === r.id ? 'bg-black text-white' : 'bg-gray-100 dark:bg-gray-800'}`}>{r.id}</button>))}</div></CNCard>
          <CNCard className="bg-green-50 dark:bg-green-900/10 text-center"><p className="font-brand text-xs uppercase mb-2 tracking-widest">Total Earnings</p><div className="text-4xl font-brand text-green-600">${wallet.balance.toFixed(2)}</div></CNCard>
          <CNButton variant="olive" className="w-full text-xl py-6" onClick={() => { stopCamera(); setView(View.DASHBOARD); }}>EXIT STUDIO</CNButton>
        </div>
      </div>
    </div>
  );

  const renderCharacterGallery = () => (
    <div className="space-y-12 animate-fade-in pt-8 fade-in">
      <div className="flex justify-between items-center"><CNHeading className="text-5xl">HOST GALLERY</CNHeading><CNButton variant="cyan" className="text-xl px-8" onClick={addNewCharacter}>+ NEW HOST</CNButton></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {characters.map(char => (
          <CNCard key={char.id} className={`flex flex-col items-center transition-all bg-white dark:bg-gray-900 p-10 ${char.id === activeCharacterId ? 'ring-12 ring-magenta/10 border-magenta border-4' : ''}`}>
             <p className="font-brand text-3xl mb-4 text-black dark:text-white">{char.name}</p>
             <div className="h-64 flex items-center justify-center mb-10"><CharacterPreview character={char} scale={1.2} /></div>
             <div className="flex gap-4 w-full mt-auto">
               <CNButton variant={char.id === activeCharacterId ? 'olive' : 'cyan'} className="flex-1 text-lg py-4" onClick={() => { setActiveCharacterId(char.id); setView(View.DASHBOARD); }}>{char.id === activeCharacterId ? 'ACTIVE' : 'SELECT'}</CNButton>
               <CNButton variant="magenta" className="flex-1 text-lg py-4" onClick={() => { setActiveCharacterId(char.id); setView(View.CUSTOMIZE); }}>EDIT STYLE</CNButton>
             </div>
          </CNCard>
        ))}
      </div>
      <div className="flex justify-center pt-8"><CNButton variant="olive" className="px-12 text-xl" onClick={() => setView(View.DASHBOARD)}>BACK TO DASHBOARD</CNButton></div>
    </div>
  );

  const renderCustomize = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 animate-fade-in pt-8 fade-in">
      <CNCard className="lg:col-span-1 flex flex-col items-center sticky top-32 h-fit bg-white dark:bg-gray-900 p-10">
        <CNHeading className="text-3xl">STYLE PREVIEW</CNHeading>
        <input type="text" className="bg-gray-50 dark:bg-black font-brand text-3xl text-center border-b-8 border-black focus:border-magenta outline-none py-4 mb-12 w-full dark:text-white" value={activeCharacter.name} onChange={(e) => updateActiveCharacter({ name: e.target.value })} />
        <div className="py-20"><CharacterPreview character={activeCharacter} scale={2.2} /></div>
      </CNCard>
      <CNCard className="lg:col-span-2 space-y-12 bg-white dark:bg-gray-900 p-12">
        <div className="flex flex-wrap gap-4 border-b-8 border-black pb-8">
          {['life', 'skin', ...ITEM_CATEGORIES.map(c => c.id)].map(tab => (
            <button key={tab} onClick={() => setSelectedCategoryTab(tab)} className={`px-6 py-3 font-brand text-sm uppercase cn-border-sm transition-all ${selectedCategoryTab === tab ? 'bg-black text-white' : 'bg-gray-100 dark:bg-gray-800 dark:text-gray-400'}`}>{tab}</button>
          ))}
        </div>
        {selectedCategoryTab === 'life' && (
          <div className="space-y-8 animate-fade-in"><h3 className="font-brand text-2xl text-olive uppercase tracking-widest">Life Stages</h3><div className="grid grid-cols-2 sm:grid-cols-4 gap-4">{AGE_RANGES.map((age) => (<button key={age.id} onClick={() => updateActiveCharacter({ ageRange: age.id })} className={`p-6 cn-border-sm text-sm font-bold uppercase ${activeCharacter.ageRange === age.id ? 'bg-black text-white' : 'bg-gray-100 dark:bg-gray-800'}`}><div>{age.name}</div></button>))}</div></div>
        )}
        {ITEM_CATEGORIES.map(cat => (selectedCategoryTab === cat.id && (
          <div key={cat.id} className="grid grid-cols-2 sm:grid-cols-3 gap-6 animate-fade-in">{cat.items.map(item => (<button key={item.id} onClick={() => updateActiveCharacter({ [cat.id]: (cat.id === 'outfit' || cat.id === 'footwear') ? item.hex : item.id })} className={`p-8 cn-border flex flex-col items-center gap-4 ${activeCharacter[cat.id as keyof Character] === (cat.id === 'outfit' || cat.id === 'footwear' ? item.hex : item.id) ? 'bg-black text-white' : 'bg-white text-black dark:bg-gray-800 dark:text-white'}`}><div className="w-16 h-16 cn-border-sm" style={{ backgroundColor: item.hex }} /><span className="text-xs font-brand uppercase tracking-tighter">{item.name}</span></button>))}</div>
        )))}
        <div className="bg-gray-50 dark:bg-black p-8 cn-border border-dashed mt-12">
          <p className="font-brand text-2xl text-magenta mb-4">STYLE CRAFT AI</p>
          <div className="flex gap-4"><input type="text" placeholder="Describe a unique 90s item..." className="flex-1 p-5 cn-border font-bold bg-white dark:bg-gray-800 text-black dark:text-white text-xl" value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} /><CNButton className="px-12 text-xl" onClick={handleCustomization} disabled={isGenerating}>{isGenerating ? 'WAIT...' : 'CRAFT'}</CNButton></div>
          <p className="text-xs font-bold text-gray-500 mt-4 uppercase tracking-widest">Example: "Dexter's giant orange lab boots" or "Dee Dee's pink tutu"</p>
        </div>
        <div className="flex justify-end pt-8"><CNButton variant="magenta" className="text-2xl px-16 py-6" onClick={() => setView(View.DASHBOARD)}>SAVE ALL STYLES</CNButton></div>
      </CNCard>
    </div>
  );

  const renderLocationPicker = () => (
    <div className="space-y-12 animate-fade-in pt-8 fade-in">
      <CNHeading className="text-6xl text-center">VENUE SELECT</CNHeading>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-10">{LOCATIONS.map(loc => (<button key={loc.id} onClick={() => startParty(loc.id)} className={`group relative overflow-hidden cn-border p-12 ${loc.style} transition-all hover:-translate-y-4 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]`}><div className="text-9xl mb-8 group-hover:animate-bounce">{loc.icon}</div><div className="font-brand text-white text-4xl uppercase">{loc.name}</div></button>))}</div>
      <div className="flex justify-center"><CNButton variant="olive" className="px-16 text-xl" onClick={() => setView(View.DASHBOARD)}>CANCEL</CNButton></div>
    </div>
  );

  const renderParty = () => {
    const loc = LOCATIONS.find(l => l.id === activeParty?.location) || LOCATIONS[0];
    const partyHost = characters.find(c => c.id === activeParty?.characterId) || activeCharacter;
    return (
      <div className="space-y-12 animate-fade-in pt-4 fade-in">
        <CNCard className={`relative overflow-hidden min-h-[700px] ${loc.style} border-none ring-8 ring-black`}>
          <div className="absolute top-8 left-8 z-40 flex gap-4"><CNButton variant="cyan" className="text-xl py-3 px-8" onClick={() => { setView(View.CAPTURE); startCamera(); }}>📸 SNAP PHOTO</CNButton></div>
          {activeParty?.isStreaming && (<div className="absolute top-24 left-8 bg-red-600 text-white font-brand px-6 py-3 cn-border-sm animate-pulse z-50 text-2xl">LIVE ON-AIR</div>)}
          <div className="relative z-10 flex flex-col items-center justify-center h-full p-12 text-white space-y-20">
            <div className="text-center"><div className="inline-block px-8 py-3 bg-black text-white cn-border-sm text-sm font-bold mb-8 uppercase tracking-[0.2em]">{loc.name}</div><h1 className="font-brand text-8xl md:text-10xl leading-none">{activeParty?.theme}</h1></div>
            <div className="animate-bounce-subtle"><CharacterPreview character={partyHost} scale={2.5} /></div>
          </div>
        </CNCard>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <CNCard className="md:col-span-1 flex flex-col justify-center items-center p-8 bg-white dark:bg-gray-900"><CNHeading className="text-xl">VIBE LEVEL</CNHeading><ProgressBar value={activeParty?.vibe || 0} color={loc.color} /></CNCard>
          <CNCard className="md:col-span-1 flex flex-col justify-center items-center p-8 bg-white dark:bg-gray-900"><CNHeading className="text-xl">LIVE EARNED</CNHeading><p className="text-5xl font-brand text-green-600">${activeParty?.earned.toFixed(2)}</p></CNCard>
          <CNCard className="md:col-span-2 flex gap-6 bg-white dark:bg-gray-900 p-8"><CNButton variant={activeParty?.isStreaming ? 'magenta' : 'cyan'} className="flex-1 text-2xl" onClick={toggleStream}>{activeParty?.isStreaming ? 'STOP BROADCAST' : 'GO LIVE BROADCAST'}</CNButton><CNButton variant="olive" className="flex-1 text-2xl" onClick={triggerEvent} disabled={isGenerating}>TOON EVENT</CNButton><CNButton variant="magenta" className="text-2xl px-12" onClick={endParty}>END SHOW</CNButton></CNCard>
        </div>
      </div>
    );
  };

  const renderWallet = () => (
    <CNCard className="max-w-3xl mx-auto animate-fade-in space-y-12 bg-white dark:bg-gray-900 p-16 pt-12 fade-in">
      <CNHeading className="text-5xl text-center">PAYOUT HUB</CNHeading>
      <div className="p-12 bg-black text-green-500 cn-border flex justify-between items-center"><div className="font-brand text-7xl">${wallet.balance.toFixed(2)}</div><CNButton variant="magenta" className="bg-green-600 border-white text-white text-3xl px-12 py-8" onClick={handleWithdrawal}>WITHDRAW CASH</CNButton></div>
      <div className="space-y-8"><h3 className="font-brand text-2xl uppercase border-b-8 border-black pb-4 text-black dark:text-white">Withdrawal Settings</h3><div className="flex items-center justify-between p-8 bg-gray-50 dark:bg-black cn-border-sm"><div><p className="font-bold text-xl text-black dark:text-white">Auto-Withdraw every $20.00</p><p className="text-sm text-gray-500 font-bold uppercase">Linked to: {wallet.provider}</p></div><button onClick={() => setWallet(prev => ({ ...prev, autoWithdraw: !prev.autoWithdraw }))} className={`w-20 h-10 cn-border-sm rounded-full relative transition-colors ${wallet.autoWithdraw ? 'bg-green-500' : 'bg-gray-300'}`}><div className={`absolute top-1.5 w-6 h-6 bg-white rounded-full transition-all ${wallet.autoWithdraw ? 'left-11' : 'left-2'}`} /></button></div></div>
      <div className="pt-8 flex flex-col gap-4">
        <CNButton variant="olive" className="w-full py-6 text-xl" onClick={() => setView(View.DONATE)}>FUND THE NETWORK</CNButton>
        <CNButton variant="cyan" className="w-full py-4 text-sm" onClick={() => setView(View.DASHBOARD)}>RETURN TO DASHBOARD</CNButton>
      </div>
    </CNCard>
  );

  if (view === View.LANDING) return renderLanding();

  if (!user || view === View.AUTH) return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-white dark:bg-black fade-in">
      <div className="fixed top-8 right-8 z-[100]"><button onClick={() => setDarkMode(!darkMode)} className="w-16 h-16 flex items-center justify-center bg-white dark:bg-black cn-border transition-all hover:scale-110 active:scale-95 shadow-2xl">{darkMode ? '🌞' : '🌙'}</button></div>
      <AuthScreen onLogin={handleLogin} />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black transition-colors duration-300">
      <header className="bg-black text-white p-8 border-b-8 border-black dark:border-white flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-6 cursor-pointer" onClick={() => { stopCamera(); setView(View.DASHBOARD); }}>
          <ConfettiLogo size="sm" /><h1 className="font-brand text-3xl tracking-tighter">MY PARTY <span className="text-cyan-light">WORLD</span></h1>
        </div>
        <div className="flex items-center gap-10">
          <div className="font-brand text-4xl text-green-500">${wallet.balance.toFixed(2)}</div>
          <button onClick={handleLogout} className="bg-magenta-light px-8 py-3 cn-border-sm font-brand text-sm hover:scale-105 transition-transform">LOGOUT</button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-16 max-w-7xl flex-1">
        {view === View.DASHBOARD && renderDashboard()}
        {view === View.CHARACTER_GALLERY && renderCharacterGallery()}
        {view === View.LOCATION_PICKER && renderLocationPicker()}
        {view === View.CUSTOMIZE && renderCustomize()}
        {view === View.PARTY && renderParty()}
        {view === View.WALLET && renderWallet()}
        {view === View.CAPTURE && renderCapture()}
        {view === View.DONATE && renderDonate()}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 p-8 flex justify-center pointer-events-none z-50">
        <div className="flex gap-6 pointer-events-auto bg-white dark:bg-black p-4 cn-border border-b-0 rounded-t-3xl shadow-[0_-8px_24px_rgba(0,0,0,0.15)]">
          <NavIcon icon="👥" label="Hosts" active={view === View.CHARACTER_GALLERY} onClick={() => { stopCamera(); setView(View.CHARACTER_GALLERY); }} />
          <NavIcon icon="🏠" label="Home" active={view === View.DASHBOARD} onClick={() => { stopCamera(); setView(View.DASHBOARD); }} />
          <NavIcon icon="📸" label="Snap" active={view === View.CAPTURE} onClick={() => { startCamera(); setView(View.CAPTURE); }} />
          <NavIcon icon="🎁" label="Fund" active={view === View.DONATE} onClick={() => { stopCamera(); setView(View.DONATE); }} />
          <NavIcon icon="💸" label="Cash" active={view === View.WALLET} onClick={() => { stopCamera(); setView(View.WALLET); }} />
        </div>
      </footer>
    </div>
  );
};

const NavIcon: React.FC<{ icon: string; label: string; active: boolean; onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`px-6 py-3 w-24 rounded-2xl flex flex-col items-center gap-1 transition-all ${active ? 'bg-black text-white dark:bg-white dark:text-black scale-110' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400'}`}>
    <span className="text-3xl">{icon}</span>
    <span className="text-[10px] font-brand uppercase tracking-tighter leading-none">{label}</span>
  </button>
);

export default App;