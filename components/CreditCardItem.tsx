
import React from 'react';
import { CreditCard } from '../types';

interface CreditCardItemProps {
  card: CreditCard;
}

const CreditCardItem: React.FC<CreditCardItemProps> = ({ card }) => {
  const usagePercentage = Math.min((card.balance / card.limit) * 100, 100);
  
  return (
    <div className={`${card.color} rounded-2xl p-6 text-white shadow-lg relative overflow-hidden h-48 flex flex-col justify-between`}>
      <div className="absolute -right-4 -top-4 w-32 h-32 bg-white opacity-10 rounded-full"></div>
      
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs opacity-80 uppercase tracking-widest font-semibold">{card.name}</p>
          <p className="text-lg font-mono mt-1">•••• •••• •••• {card.lastFour}</p>
        </div>
        <div className="h-8 w-12 bg-amber-400/20 rounded-md backdrop-blur-sm border border-white/20"></div>
      </div>
      
      <div>
        <div className="flex justify-between items-end mb-2">
          <div>
            <p className="text-xs opacity-80">Current Balance</p>
            <p className="text-xl font-bold">${card.balance.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] opacity-80">Limit: ${card.limit.toLocaleString()}</p>
          </div>
        </div>
        <div className="w-full bg-white/20 rounded-full h-1.5">
          <div 
            className="bg-white h-1.5 rounded-full transition-all" 
            style={{ width: `${usagePercentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default CreditCardItem;
