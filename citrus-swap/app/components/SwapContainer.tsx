'use client'
import { Swapper } from "./swapper";

export const SwapContainer: React.FC = () => {
  return (
    <div className="w-full rounded-3xl mb-10 flex flex-col p-10 bg-orange-400 border-4 border-lime-300 shadow-xl">      
      <Swapper />
    </div>
  );
};
