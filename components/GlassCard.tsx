
import React, { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  onClick,
  hoverEffect = false
}) => {
  return (
    <div 
      onClick={onClick}
      className={`
        relative
        bg-white/60 dark:bg-white/[0.01]
        backdrop-blur-[40px] 
        border border-black/[0.05] dark:border-white/[0.08]
        rounded-[2.5rem]
        shadow-[0_25px_60px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)]
        transition-all duration-700 cubic-bezier(0.2, 0.8, 0.2, 1)
        group
        ${hoverEffect ? 'hover:bg-white/80 dark:hover:bg-white/[0.04] hover:border-black/10 dark:hover:border-white/20 hover:scale-[1.01] hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] cursor-pointer' : ''}
        ${className}
      `}
      style={{
        WebkitMaskImage: '-webkit-radial-gradient(white, black)', // Fix for some browsers to keep corners rounded even without overflow hidden
      }}
    >
      {/* Specular highlights restricted to the card bounds */}
      <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-[50%] bg-gradient-to-b from-white/40 to-transparent dark:from-white/[0.08] opacity-60 transition-opacity duration-1000 group-hover:opacity-100" />
        <div className="absolute top-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-black/10 dark:via-white/30 to-transparent" />
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
      </div>

      <div className="relative z-10 h-full">
        {children}
      </div>
    </div>
  );
};
