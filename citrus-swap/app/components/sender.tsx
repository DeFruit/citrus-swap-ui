/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useContext, useEffect, useState } from "react";
import { ORA_ASSET_ID, ORA_ASSET_INFO } from "../constants";
import AnimButton from "./animButton";
import { useWallet } from "@txnlab/use-wallet-react";
import { algorand } from "../algorand";
import Image from "next/image";
import { Input } from "@headlessui/react";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import { WalletContext } from "../context/wallet";
import { DisconnectButton } from "./disconnectButton";

export const Sender: React.FC = () => {
  const { activeAccount, transactionSigner } = useWallet();
  const [userBalance, setUserBalance] = useState<number>(0);
  const [amount, setAmount] = useState("");  // Changed to string
  const [error, setError] = useState<boolean>(false);
  const [address, setAddress] = useState("");
  const [addressInput, setAddressInput] = useState("");
  const [transactionLoading, setTransactionLoading] = useState(false);
  const { setDisplayWalletConnectModal } = useContext(WalletContext);

  useEffect(() => {
    async function getUserBalance() {
      if (activeAccount) {
        const userBalanceInfo = await algorand.client.algod
          .accountAssetInformation(activeAccount.address, ORA_ASSET_ID)
          .do();
        const balance =
          Number(userBalanceInfo?.assetHolding?.amount || 0) /
          10 ** Number(ORA_ASSET_INFO.params.decimals);
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
    if (value === "") {
      setAmount("");
      setError(false);
      return;
    }

    // Only allow numbers and a single decimal point
    if (!/^\d*\.?\d*$/.test(value)) {
      return;
    }
    
    // Compare as number but keep as string in state
    if (Number(value) > userBalance) {
      setError(true);
      setAmount(value);
      console.log("error", error);
      return;
    }
    setAmount(value);
    setError(false);
  }

  async function handleSendAsset() {
    if (error || amount === "" || Number(amount) === 0) {
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
        amount: BigInt(Number(amount) * 10 ** Number(ORA_ASSET_INFO.params.decimals)),
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
      <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white flex items-center justify-center gap-2">
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
            className="w-16 h-16"
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
              value={amount}
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
              className={`w-full h-full rounded-full bg-white font-fred font-bold text-2xl md:text-4xl ${
                error ? "text-red-500/60" : "text-gray-500"
              } text-right px-4`}
              placeholder="Enter address or NFD"
              value={addressInput}
              onChange={(e) => handleAddressChange(e.target.value)}
            />
          </div>
        </div>
      </div>
      {activeAccount ? (
        <div className="flex w-full mx-auto justify-center gap-2">
          <AnimButton
            disabled={error || amount === "" || Number(amount) === 0 || transactionLoading}
            onClick={() => handleSendAsset()}
          >
            {transactionLoading ? "Sending..." : "Send ORA"}
          </AnimButton>
          <DisconnectButton />
        </div>
      ) : (
        <div className="flex w-full mx-auto justify-center">
          <AnimButton onClick={() => setDisplayWalletConnectModal(true)}>
            Connect Wallet
          </AnimButton>
        </div>
      )}
    </div>
  );
};
