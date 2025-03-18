/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { ALGO_ASSET_ID, ORA_ASSET_ID } from "../constants";
import { getQuote } from "../deflex/quotes";
import { useWallet } from "@txnlab/use-wallet-react";
import { algorand } from "../algorand";

interface SwapContextType {
  fromAsset: number;
  toAsset: number;
  fromAmount: number;
  toAmount: number;
  quote: {
    price: number | null;
    profit: number | null;
    fee: number | null;
    minimumAmountOut: number | null;
    transactionPayload: any | null;
  } | null;
  updateFromAsset: (assetId: number) => void;
  updateToAsset: (assetId: number) => void;
  updateFromAmount: (amount: number) => void;
  updateToAmount: (amount: number) => void;
  switchAssets: () => void;
  makeSwapTransaction: () => Promise<void>;
}

const SwapContext = createContext<SwapContextType | undefined>(undefined);

export function SwapProvider({ children }: { children: ReactNode }) {
  const { activeAccount, signTransactions, transactionSigner } = useWallet();
  const [fromAsset, setFromAsset] = useState<number>(ORA_ASSET_ID);
  const [toAsset, setToAsset] = useState<number>(ALGO_ASSET_ID);
  const [fromAmount, setFromAmount] = useState<number>(0);
  const [toAmount, setToAmount] = useState<number>(0);
  const [quote, setQuote] = useState<SwapContextType["quote"]>(null);

  // Fetch quote whenever relevant values change
  useEffect(() => {
    const fetchQuote = async () => {
      if (fromAmount > 0) {
        console.log(
          `Fetching quote for ${fromAmount} ${fromAsset} to ${toAsset}`
        );
        const quoteResult = await getQuote(fromAsset, toAsset, fromAmount);
        if (quoteResult) {
          setQuote({
            minimumAmountOut: Number(quoteResult.quote),
            profit: Number(quoteResult.profitAmount),

            fee: Number(quoteResult.protocolFees),
            price: Number(quoteResult.quote),
            transactionPayload: quoteResult.transactionPayload,
          });
          setToAmount(Number(quoteResult.quote));
        } else {
          setQuote(null);
          setToAmount(0);
        }
      } else {
        setQuote(null);
        setToAmount(0);
      }
    };

    fetchQuote();
  }, [fromAsset, toAsset, fromAmount]);

  const updateFromAsset = (assetId: number) => {
    setFromAsset(assetId);
  };

  const updateToAsset = (assetId: number) => {
    setToAsset(assetId);
  };

  const updateFromAmount = (amount: number) => {
    setFromAmount(amount);
  };

  const updateToAmount = (amount: number) => {
    setToAmount(amount);
  };

  const switchAssets = () => {
    const tempFromAsset = fromAsset;
    const tempFromAmount = fromAmount;
    setFromAsset(toAsset);
    setFromAmount(toAmount);
    setToAsset(tempFromAsset);
    setToAmount(tempFromAmount);
  };

  const makeSwapTransaction = async () => {
    console.log(activeAccount, quote?.transactionPayload);
    if (activeAccount && quote?.transactionPayload) {
      algorand.setSigner(activeAccount.address, transactionSigner);
      const signedTxns = await signTransactions([
        quote.transactionPayload.data,
      ]);
      console.log(signedTxns);
    }
  };

  const value = {
    fromAsset,
    toAsset,
    fromAmount,
    toAmount,
    quote,
    updateFromAsset,
    updateToAsset,
    updateFromAmount,
    updateToAmount,
    switchAssets,
    makeSwapTransaction,
  };

  return <SwapContext.Provider value={value}>{children}</SwapContext.Provider>;
}

export function useSwap() {
  const context = useContext(SwapContext);
  if (context === undefined) {
    throw new Error("useSwap must be used within a SwapProvider");
  }
  return context;
}
