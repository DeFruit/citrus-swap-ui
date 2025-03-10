import { DeflexOrderRouterClient } from "@deflex/deflex-sdk-js";
import { ENV } from "../constants";

export const deflexRouterClient = DeflexOrderRouterClient.fetchMainnetClient(
  ENV.ALGOD_API_URL,
  "",
  "",
  "AMXVXVAGVZ4WS7C4MG434QAMBRLYDQD76CWPBTHEWV6CNMRU2UJVNO76MA",
  undefined,
  ENV.DEFLEX_API_KEY //! Make a new api key for the frontend
);

export function generateSecret() {
  return Buffer.from(
    encryptStringWithKey(String(Date.now() / 1000), ENC_KEY)
  ).toString("base64");
}
export const ENC_KEY = "lakjdklasjdoiwej";

export function encryptStringWithKey(str: string, key: string) {
  let result = "";
  let keyIndex = 0;

  // Iterate through each character
  for (let i = 0; i < str.length; i++) {
    // Get the ASCII code for the character and the key character
    const code = str.charCodeAt(i);
    const keyChar = key.charCodeAt(keyIndex);

    // Apply the key to the character using modular arithmetic
    const shiftedCode = ((code - 32 + keyChar - 32) % 95) + 32;

    // Convert the shifted code back to a character and append it to the result
    result += String.fromCharCode(shiftedCode);

    // Move to the next key character, wrapping around if necessary
    keyIndex = (keyIndex + 1) % key.length;
  }

  // Return the encrypted string
  return result;
}
