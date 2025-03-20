/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { ORA_ASSET_ID, ORA_ASSET_INFO } from "../constants";
import AnimButton from "./animButton";
import { useWallet } from "@txnlab/use-wallet-react";
import { algorand } from "../algorand";
import Image from "next/image";
import { Input } from "@headlessui/react";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";

export const Sender: React.FC = () => {
  const { activeAccount, transactionSigner } = useWallet();
  const [userBalance, setUserBalance] = useState<number>(0);
  const [amount, setAmount] = useState(0n);
  const [error, setError] = useState<boolean>(false);
  const [address, setAddress] = useState("");
  const [addressInput, setAddressInput] = useState("");
  const [transactionLoading, setTransactionLoading] = useState(false);

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
  const handleAddressChange = async (value: string) => {
    if (value.length > 0) {
      setAddressInput(value);
      await validateAddress(value).then((address: string) => {
        console.log("address", address);
        if (address !== "") {
          checkIfOptedInToORA(address);
        }
      });
    } else {
      setAddressInput("");
      setAddress("");
      setError(false);
    }
  };

  const validateAddress = async (value: string) => {
    const pattern = /^([a-z0-9]{1,27}\.){0,1}([a-z0-9]{1,27})(\.algo)/;
    const nameForUse = value.toLowerCase();
    console.log(nameForUse);
    if (pattern.test(nameForUse)) {
      const response = await axios.get(
        `https://api.nf.domains/nfd/${nameForUse}?view=full`
      );
      console.log(response.data);
      if (response.data.depositAccount) {
        setAddress(response.data.depositAccount);
        setError(false);
        return response.data.depositAccount;
      }
    }
    if (value.length !== 58 && value.length > 0) {
      setError(true);
      return "";
    }
    setAddress(value);
    setError(false);
    return value;
  };

  async function checkIfOptedInToORA(depositAccount: string): Promise<boolean> {
    try {
      // Fetch account info
      const accountAssetInfo = await algorand.client.algod
        .accountAssetInformation(depositAccount, ORA_ASSET_ID)
        .do();
      if (accountAssetInfo.assetHolding) {
        return true;
      }
      return false;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

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

  async function handleSendAsset() {
    if (error || amount === 0n) {
      return;
    }
    if (!activeAccount) {
      return;
    }
    algorand.setDefaultSigner(transactionSigner);
    setTransactionLoading(true);
    await algorand.send
      .assetTransfer({
        sender: activeAccount.address,
        receiver: address,
        amount: amount * 10n ** ORA_ASSET_INFO.params.decimals,
        assetId: BigInt(ORA_ASSET_ID),
      })
      .then((txn) => {
        console.log(txn);
        setTransactionLoading(false);

      })
      .catch((error) => {
        console.error(error);
        setTransactionLoading(false);

      });
  }
  
  return (
    <div className="flex flex-col items-center justify-center gap-4 w-full ">
      <div className="text-2xl md:text-3xl font-bold text-white flex items-center justify-center gap-2">
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
              className={`w-full h-full rounded-full bg-white font-fred font-bold text-4xl ${
                error ? "text-red-500/60" : "text-gray-500"
              } text-right px-4`}
              placeholder="0.00"
              value={amount.toString()}
              onChange={(e: any) => handleAmountChange(e.target.value)}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
        </div>
      </div>
      <div className="w-full rounded-full shadow-xl bg-primary flex flex-col gap-4 p-4 ">
        <div className="flex justify-between space-x-2">
          <div className="relative w-full">
            <Input
              className={`w-full h-full rounded-full bg-white font-fred font-bold text-4xl ${
                error ? "text-red-500/60" : "text-gray-500"
              } text-right px-4`}
              placeholder="Enter address or NFD"
              value={addressInput}
              onChange={(e) => handleAddressChange(e.target.value)}
            />
          </div>
        </div>
      </div>
      <AnimButton
        disabled={error || amount === 0n || transactionLoading}
        onClick={() => handleSendAsset()}
      >
        {transactionLoading ? "Sending..." : "Send ORA"}
      </AnimButton>
    </div>
  );
};
