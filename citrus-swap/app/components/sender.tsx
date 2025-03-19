/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { ORA_ASSET_ID, ORA_ASSET_INFO } from "../constants";
import AnimButton from "./animButton";
import { useWallet } from "@txnlab/use-wallet-react";
import { algorand } from "../algorand";
import Image from "next/image";
import { Input } from "@headlessui/react";

export const Sender: React.FC = () => {
  const { activeAccount } = useWallet();
  const [userBalance, setUserBalance] = useState<number>(0);
  const [amount, setAmount] = useState(0n);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    async function getUserBalance() {
      if (activeAccount) {
        const userBalanceInfo = await algorand.client.algod
          .accountAssetInformation(activeAccount.address, ORA_ASSET_ID)
          .do();
        const balance =
          (userBalanceInfo?.assetHolding?.amount || 0n) /
          10n ** ORA_ASSET_INFO.params.decimals;
        console.log(balance);
        setUserBalance(Number(balance));
      }
    }
    getUserBalance();
  }, [activeAccount]);

  async function handleAmountChange(value: string) {
    //validate amount
    if (Number(value) > userBalance) {
      setError(true);
      setAmount(BigInt(Number(value)));
      console.log("error", error);  
      return;
    }
    setAmount(BigInt(Number(value)));
    setError(false);
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 w-full ">
      <div className="text-3xl font-bold text-white flex items-center justify-center gap-2">
        Your ORA balance: {Number(userBalance).toFixed(2)}
        <Image
          src={`/ORA-logo.png`}
          className=""
          alt={"$ORA"}
          width={50}
          height={50}
        />
      </div>
      <div className="w-full rounded-full shadow-xl bg-primary flex flex-col gap-4 p-4 ">
        <div className="flex justify-between space-x-2">
          <Image
            src={`/ORA-logo.png`}
            className=""
            alt={"$ORA"}
            width={100}
            height={100}
          />
          <div className="relative w-full">
            <Input
              className={`w-full h-full rounded-full bg-white font-fred font-bold text-4xl ${error ? 'text-red-500/60' : 'text-gray-500'} text-right px-4`}
              placeholder="0.00"
              value={amount.toString()}
              onChange={(e: any) => handleAmountChange(e.target.value)}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
        </div>
      </div>
      <AnimButton disabled={error} onClick={() => {}}>
        Send ORA
      </AnimButton>
    </div>
  );
};
