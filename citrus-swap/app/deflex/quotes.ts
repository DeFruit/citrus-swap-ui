// src/deflex/quotes.ts

import { ALGO_ASSET_ID, ORA_ASSET_ID, ORA_ASSET_INFO } from "../constants";
import { deflexRouterClient } from "./client";

export async function getQuote(
  assetIdFrom: number,
  assetIdTo: number,
  amount: number
) {
  try {
    // Use constants for ORA and ALGO as default asset IDs
    const fromAsset = assetIdFrom || ORA_ASSET_ID;
    const toAsset = assetIdTo || ALGO_ASSET_ID;
    // Scale amount based on asset decimals
    const fromAssetDecimals =
      assetIdFrom === ALGO_ASSET_ID
        ? 6
        : Number(ORA_ASSET_INFO.params.decimals);
    const scaledAmount = amount * Math.pow(10, fromAssetDecimals);

    const deflexQuote = await deflexRouterClient.getFixedInputSwapQuote(
      fromAsset,
      toAsset,
      scaledAmount
    );

    // Scale down quote based on asset decimals
    const toAssetDecimals =
      assetIdTo === ALGO_ASSET_ID ? 6 : Number(ORA_ASSET_INFO.params.decimals);
    const scaledQuote =
      Number(deflexQuote.quote) / Math.pow(10, toAssetDecimals);
    console.log(deflexQuote.txnPayload);
    return {
      quote: scaledQuote,
      profitAmount: deflexQuote.profitAmount,
      protocolFees: deflexQuote.protocolFees,
      transactionPayload: deflexQuote.txnPayload,
      deflexQuote: deflexQuote,
    };
  } catch (error) {
    console.error("Error fetching quote:", error);
    return null;
  }
}

