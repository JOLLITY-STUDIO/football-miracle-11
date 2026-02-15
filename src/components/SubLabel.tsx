import React from 'react';

interface SubLabelProps {
  subNum: number;
  isAi?: boolean;
  id?: string;
}

export const SubLabel: React.FC<SubLabelProps> = ({ subNum, isAi = false, id }) => {
  const backgroundColor = isAi ? '#D43D2A' : '#B02314';
  const textRotation = isAi ? 'rotate-180' : '';
  const subNumber = subNum < 10 ? `0${subNum}` : subNum;

  return (
    <div 
      id={id}
      className="px-2 py-1.5 rounded-l-md border-y border-l border-white/20 shadow-[-2px_0_5px_rgba(0,0,0,0.3)]"
      style={{ backgroundColor }}
    >
      <span className={`text-[7px] text-white font-black ${textRotation} block whitespace-nowrap`}>
        SUB {subNumber}
      </span>
    </div>
  );
};