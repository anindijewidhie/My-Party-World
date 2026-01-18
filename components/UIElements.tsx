import React from 'react';
import { COLORS } from '../constants';

interface ButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  variant?: 'magenta' | 'olive' | 'cyan';
  className?: string;
  disabled?: boolean;
}

export const CNButton: React.FC<ButtonProps> = ({ onClick, children, variant = 'cyan', className = '', disabled }) => {
  const bgColor = {
    magenta: COLORS.MAGENTA,
    olive: COLORS.OLIVE,
    cyan: COLORS.CYAN
  }[variant];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative px-6 py-3 font-brand text-white 
        border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
        transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]
        active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      style={{ backgroundColor: bgColor }}
    >
      {children}
    </button>
  );
};

export const CNCard: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className = '', onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-white dark:bg-[#111111] p-6 border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] ${className}`}
  >
    {children}
  </div>
);

export const CNHeading: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <h2 className={`font-brand text-3xl mb-4 tracking-tighter text-black dark:text-white uppercase ${className}`}>
    {children}
  </h2>
);

export const ProgressBar: React.FC<{ value: number; color: string }> = ({ value, color }) => (
  <div className="w-full h-8 bg-gray-200 dark:bg-gray-900 border-[4px] border-black overflow-hidden relative">
    <div 
      className="h-full transition-all duration-500"
      style={{ width: `${value}%`, backgroundColor: color }}
    />
    <div className="absolute inset-0 halftone-overlay opacity-20 pointer-events-none" />
  </div>
);