"use client";

import { useContext } from "react";
import { WalletContext } from "../context/wallet";
import { motion } from "framer-motion";
import { MdOutlineLogout } from "react-icons/md";
export const DisconnectButton = () => {
  const { disconnectWallet } = useContext(WalletContext);

  return (
    <motion.button
      onClick={() => disconnectWallet()}
      className="text-gray-600 cursor-pointer"
      aria-label="Disconnect wallet"
      whileHover={{ 
        color: "#EF4444",
        scale: 1.1,
        rotate: [0, -10, 10, -10, 10, 0],
        transition: {
          rotate: {
            repeat: Infinity,
            duration: 0.5
          }
        }
      }}
      animate={{
        rotate: 0
      }}
    >
      <MdOutlineLogout className="w-8 h-8" />
    </motion.button>
  );
};
