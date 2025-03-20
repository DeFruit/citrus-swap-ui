"use client";
import { Sender } from "./sender";
import { Swapper } from "./swapper";

export interface SwapContainerProps {
  tabSelection: string;
}

export const SwapContainer: React.FC<SwapContainerProps> = ({
  tabSelection,
}) => {
  return (
    <div className="w-full my-1 flex flex-col p-10 bg-secondary shadow-xl min-w-min" style={{borderRadius: "70px"}}>
      {tabSelection === "Swap" && <Swapper />}
      {tabSelection === "Send" && <Sender />}
    </div>
  );
};
