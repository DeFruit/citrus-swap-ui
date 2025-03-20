"use client";

import { createContext, useState } from "react";
import { useWallet } from "@txnlab/use-wallet-react";

interface WalletContextType {
  algoBalance: number;
  setAlgoBalance: (value: number) => void;
  orangeBalance: number;
  setOrangeBalance: (value: number) => void;
  address: string;
  setAddress: (value: string) => void;
  displayWalletConnectModal: boolean;
  setDisplayWalletConnectModal: (value: boolean) => void;
  disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextType>({} as WalletContextType);

const WalletContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { wallets } = useWallet();
  const [algoBalance, setAlgoBalance] = useState<number>(0);
  const [orangeBalance, setOrangeBalance] = useState<number>(0);
  const [address, setAddress] = useState<string>("");
  const [displayWalletConnectModal, setDisplayWalletConnectModal] =
    useState<boolean>(false);

  const disconnectWallet = async () => {
    console.log("disconnecting wallet");
    await wallets[0].disconnect().then(() => {
      console.log("wallet disconnected");
      setDisplayWalletConnectModal(false);
      setAlgoBalance(0);
      setOrangeBalance(0);
      setAddress("");
    });
  };

  return (
    <WalletContext.Provider
      value={{
        algoBalance,
        setAlgoBalance,
        orangeBalance,
        setOrangeBalance,
        address,
        setAddress,

        displayWalletConnectModal,
        setDisplayWalletConnectModal,
        disconnectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export { WalletContext, WalletContextProvider };
