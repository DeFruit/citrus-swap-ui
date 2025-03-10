import { Input } from "@headlessui/react";
import { ASSET_INFO } from "../constants";
import Image from "next/image";
import { useSwap } from "../context/swap";
import { useEffect, useState } from "react";

export interface SwapInputProps {
  assetId: number;
}

export const SwapInput: React.FC<SwapInputProps> = ({ assetId }) => {
  const {
    fromAsset,
    fromAmount,
    toAmount,
    quote,
    updateFromAmount,
    updateToAmount,
  } = useSwap();

  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const isFromInput = assetId === fromAsset;

  // Update local state when context values change
  useEffect(() => {
    if (isFromInput) {
      if (fromAmount !== Number(amount)) {
        setAmount(fromAmount ? fromAmount.toString() : "");
      }
    } else {
      // For "to" input, use quote amount if available
      if (quote?.minimumAmountOut) {
        setIsLoading(false);
        setAmount(quote.minimumAmountOut.toString());
      } else {
        setAmount(toAmount ? toAmount.toString() : "");
      }
    }
  }, [isFromInput, fromAmount, toAmount, amount, quote]);

  const handleAmountChange = async (value: string) => {
    setAmount(value);
    const numValue = value ? Number(value) : 0;
    if (isFromInput) {
      if (numValue > 0) {
        setIsLoading(true);
      }
      updateFromAmount(numValue);
    } else {
      updateToAmount(numValue);
    }
  };

  return (
    <div className="w-full rounded-full shadow-xl bg-orange-400 flex flex-col gap-4 p-4 border-4 border-lime-300">
      <div className="flex justify-between space-x-2">
        <Image
          src={`/${ASSET_INFO[assetId].params.unitName}-logo.png`}
          className=""
          alt={ASSET_INFO[assetId].params.unitName}
          width={100}
          height={100}
        />
        <div className="relative w-full">
          {!isFromInput && isLoading ? (
            <div className="w-full h-full flex items-center justify-end pr-10">
              <div className="animate-spin h-8 w-8 border-4 border-lime-300 rounded-full border-t-transparent" />
            </div>
          ) : (
            <Input
              className="w-full h-full rounded-full border-4 border-lime-300 bg-white font-bari text-4xl text-gray-500 text-right px-4"
              placeholder="0.00"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              readOnly={!isFromInput}
            />
          )}
        </div>
      </div>
    </div>
  );
};
