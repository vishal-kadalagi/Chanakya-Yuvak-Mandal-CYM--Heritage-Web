import React from 'react';

interface RoyalDividerProps {
  className?: string;
  symbol?: string;
}

export const RoyalDivider: React.FC<RoyalDividerProps> = ({ 
  className = "my-4", 
  symbol = "•",
}) => {
  return (
    <div className={`flex items-center justify-center space-x-2 select-none ${className}`}>
      <div className="h-[1px] w-8 sm:w-12 bg-gray-200" />
      <span className="text-[#E87A1E] text-xs font-bold">{symbol}</span>
      <div className="h-[1px] w-8 sm:w-12 bg-gray-200" />
    </div>
  );
};
