import React from 'react';

interface LogoProps {
  variant?: 'small' | 'large';
}

const Logo: React.FC<LogoProps> = ({ variant = 'large' }) => {
  const isSmall = variant === 'small';

  return (
    <div className={`flex ${isSmall ? 'items-center' : 'items-center justify-center'} py-1`}>
      <img
        src="/logo.png"
        alt="ConcertaAi Logo"
        className={`${isSmall ? 'h-10 w-auto' : 'h-24 w-auto'} object-contain transition-transform hover:scale-105`}
      />
    </div>
  );
};

export default Logo;
