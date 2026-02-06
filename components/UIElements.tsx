import React from 'react';

interface ButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  variant?: 'magenta' | 'olive' | 'cyan' | 'black' | 'green' | 'white' | 'yellow';
  className?: string;
  disabled?: boolean;
}

export const CNButton: React.FC<ButtonProps> = ({ onClick, children, variant = 'cyan', className = '', disabled }) => {
  const bgColors = {
    magenta: 'bg-magenta',
    olive: 'bg-olive',
    cyan: 'bg-cyan',
    black: 'bg-black dark:bg-white',
    green: 'bg-nuclear-green',
    white: 'bg-white dark:bg-black',
    yellow: 'bg-sun-yellow'
  };

  const textColors = {
    magenta: 'text-white',
    olive: 'text-white',
    cyan: 'text-black',
    black: 'text-white dark:text-black',
    green: 'text-black',
    white: 'text-black dark:text-white',
    yellow: 'text-black'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative px-4 sm:px-6 py-2.5 sm:py-3.5 font-brand uppercase tracking-tighter
        border-[3px] sm:border-[4px] border-black dark:border-white transition-all duration-75 
        active:translate-x-[2px] active:translate-y-[2px] active:shadow-none
        disabled:opacity-20 disabled:grayscale
        flex items-center justify-center gap-2 sm:gap-3
        shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]
        ${bgColors[variant]} ${textColors[variant]}
        ${className}
      `}
    >
      {children}
    </button>
  );
};

export const CNCard: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className = '', onClick }) => (
  <div 
    onClick={onClick}
    className={`
      bg-white dark:bg-neutral-900 p-5 sm:p-8 lg:p-10
      border-[4px] border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)]
      ${className}
    `}
  >
    {children}
  </div>
);

export const CNInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input 
    {...props}
    className={`
      w-full p-4 sm:p-5 font-brand text-lg sm:text-xl border-[3px] sm:border-[4px] border-black dark:border-white 
      bg-white dark:bg-neutral-900 text-black dark:text-white focus:bg-cyan/10
      focus:outline-none transition-all uppercase
      placeholder:opacity-30
      ${props.className}
    `}
  />
);

export const CNHeading: React.FC<{ children: React.ReactNode; className?: string; color?: string; size?: 'sm' | 'md' | 'lg' }> = ({ children, className = '', color, size = 'md' }) => {
  const sizes = {
    sm: 'text-3xl sm:text-4xl lg:text-5xl',
    md: 'text-4xl sm:text-6xl lg:text-7xl',
    lg: 'text-5xl sm:text-8xl lg:text-[8rem]'
  };
  return (
    <h2 
      className={`font-brand ${sizes[size]} tracking-tighter uppercase leading-[0.9] break-words ${className}`}
      style={{ color: color }}
    >
      {children}
    </h2>
  );
};

export const ProgressBar: React.FC<{ value: number; color: string; label?: string }> = ({ value, color, label }) => (
  <div className="space-y-2 w-full">
    {label && <p className="font-brand text-[10px] uppercase tracking-widest text-black dark:text-white font-bold opacity-60">{label}</p>}
    <div className="w-full h-7 sm:h-9 bg-white dark:bg-neutral-800 border-[3px] border-black dark:border-white relative overflow-hidden">
      <div 
        className="h-full transition-all duration-700 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, value))}%`, backgroundColor: color }}
      />
      <div className="absolute inset-0 flex items-center justify-center font-brand text-[10px] sm:text-xs text-black mix-blend-difference">
        {Math.round(value)}%
      </div>
    </div>
  </div>
);

export const Badge: React.FC<{ children: React.ReactNode; variant?: 'cyan' | 'magenta' | 'green' | 'black' | 'white' | 'yellow' }> = ({ children, variant = 'cyan' }) => {
  const colors = {
    cyan: 'bg-cyan text-black',
    magenta: 'bg-magenta text-white',
    green: 'bg-nuclear-green text-black',
    black: 'bg-black dark:bg-white text-white dark:text-black',
    white: 'bg-white dark:bg-black text-black dark:text-white',
    yellow: 'bg-sun-yellow text-black'
  };
  return (
    <span className={`px-2.5 py-1 font-brand text-[9px] sm:text-[11px] uppercase tracking-widest ${colors[variant]} border-[2px] border-black dark:border-white whitespace-nowrap inline-block`}>
      {children}
    </span>
  );
};