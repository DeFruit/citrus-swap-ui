'use client'
import { Swapper } from "./swapper";

export const SwapContainer: React.FC = () => {
  return (
    <div className="w-full  flex flex-col p-10 bg-orange-400 border-4 border-lime-300 shadow-xl"
    style={{ borderRadius: "8%" }}>
      <Swapper />
    </div>
  );
};
