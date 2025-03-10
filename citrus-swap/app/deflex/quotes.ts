// src/deflex/quotes.ts

import axios from "axios";
import { ALGO_ASSET_ID, ORA_ASSET_ID, ENV } from "../constants";
import { deflexRouterClient, generateSecret } from "./client";

export async function getQuote(
  assetIdFrom: number,
  assetIdTo: number,
  amount: number
) {
  try {
    // Use constants for ORA and ALGO as default asset IDs
    const fromAsset = assetIdFrom || ORA_ASSET_ID;
    const toAsset = assetIdTo || ALGO_ASSET_ID;

    // Fetch the swap quote
    /* const response = await axios.get(`${ENV.SWAP_API_URL}/assetPrice`, {
      params: {
        chain: "mainnet",
        fromASAID: fromAsset,
        toASAID: toAsset,
        atomicOnly: true,
        amount: amount,
        type: "fixed-input",
        disabledProtocols: "",
        secret: generateSecret(),
        referrerAddress:
          "AMXVXVAGVZ4WS7C4MG434QAMBRLYDQD76CWPBTHEWV6CNMRU2UJVNO76MA",
      },
    });
    const swapQuote = response.data;
    console.log(swapQuote); */
    const quote = await deflexRouterClient.getFixedInputSwapQuote(fromAsset, toAsset, amount)
    console.log(quote); 
    return quote;
  } catch (error) {
    console.error("Error fetching quote:", error);
    return null;
  }
}
