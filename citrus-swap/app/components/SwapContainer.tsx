"use client";
import { Swapper } from "./swapper";

export const SwapContainer: React.FC = () => {
  return (
    <div className="w-full rounded-3xl my-1 flex flex-col p-10 bg-secondary  shadow-xl ">
      <Swapper />
    </div>
  );
};
