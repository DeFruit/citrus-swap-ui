"use client";
/* eslint-disable react-hooks/exhaustive-deps */
import { Dialog } from "@headlessui/react";
import { useWallet } from "@txnlab/use-wallet-react";
import { useSnackbar } from "notistack";
import { useContext, useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { ORA_ASSET_ID, ORA_ASSET_INFO } from "../constants";
import { WalletContext } from "../context/wallet";

import { LoadingContext } from "../context/loading";
import AnimButton from "./animButton";
import { algorand } from "../algorand";
import Image from "next/image";
import { WalletConnectionModal } from "./walletConnectModal";

// Navigation links
const navigation = [
  { name: "Docs", href: "#" },
  { name: "Liquidity", href: "#" },
  { name: "Join Our Community", href: "https://discord.gg/CCC22er4DQ" },
];

export function Header() {
  const { loading, setLoading } = useContext(LoadingContext);
  const { enqueueSnackbar } = useSnackbar();
  // State for managing mobile menu visibility
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { activeAccount, transactionSigner } = useWallet();

  // Wallet information
  const { activeAddress, wallets } = useWallet();

  const checkIfOptedIn = async () => {
    if (!activeAddress) {
      return false;
    }

    try {
      // Get the account's asset holdings
      const accountInfo = await algorand.account.getInformation(activeAddress);
      const holdings = accountInfo.assets || [];

      // Check if the address has opted in to the ORA asset by checking assetId
      const hasOptedIn = holdings.some(
        (asset: { assetId: bigint }) => asset.assetId == BigInt(ORA_ASSET_ID)
      );
      return hasOptedIn;
    } catch (error) {
      enqueueSnackbar("Failed to check asset holdings", { variant: "error" });
      console.log(error);
      return false;
    }
  };

  // State for managing whether the wallet has opted into ORA
  const [hasOptedIn, setHasOptedIn] = useState(false);

  // On wallet address change or when component mounts, check if the address has opted in
  useEffect(() => {
    const fetchOptInStatus = async () => {
      const optedIn = await checkIfOptedIn();
      setHasOptedIn(optedIn);
    };

    if (activeAddress) {
      fetchOptInStatus();
    }
  }, [activeAddress]); // Run when activeAddress changes

  // Opt-in to the asset
  const optInOra = async () => {
    if (!transactionSigner || !activeAddress) {
      enqueueSnackbar("Please connect your wallet first", {
        variant: "warning",
      });
      return;
    }

    setLoading(true);
    try {
      enqueueSnackbar("Opting into ORA...", { variant: "info" });

      // Send the opt-in transaction
      const result = await algorand.send.assetTransfer({
        signer: transactionSigner,
        sender: activeAddress,
        receiver: activeAddress, // Opt-in to the asset by sending to the same address
        assetId: BigInt(ORA_ASSET_ID),
        amount: BigInt(0), // Zero amount for opt-in
      });

      enqueueSnackbar(`Opt-in successful: ${result.txIds[0]}`, {
        variant: "success",
      });
      window.location.reload(); // refresh the page
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      enqueueSnackbar("Failed to opt into ORA", { variant: "error" });
    }

    setLoading(false);
  };

  const {
    setDisplayWalletConnectModal,
    displayWalletConnectModal,
    setAddress,
    setAlgoBalance,
    setOrangeBalance,
  } = useContext(WalletContext);
  // Toggle functions
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  const disconnectWallet = () => {
    if (wallets) {
      for (const wallet of wallets) {
        if (wallet.isActive && wallet.isConnected) {
          wallet.disconnect();
        }
      }
    }
  };
  async function fetchWalletInfo(address: string) {
    const accountInfo = await algorand.account.getInformation(address);
    const assetBalance = await algorand.asset.getAccountInformation(
      address,
      BigInt(ORA_ASSET_ID)
    );
    setAlgoBalance(Number(accountInfo.balance.algos));
    setOrangeBalance(
      Number(
        (assetBalance.balance || 0n) / 10n ** ORA_ASSET_INFO.params.decimals
      )
    );
    setAddress(address);
  }

  useEffect(() => {
    async function fetchWallet(address: string) {
      await fetchWalletInfo(address);
    }
    if (activeAccount) {
      fetchWallet(activeAccount.address).then(() => {
        setLoading(false);
      });
    }
  }, [displayWalletConnectModal]);

  return (
    <header className="bg-primary">
      {/* Desktop and Mobile Navigation */}
      <nav
        aria-label="Global"
        className="mx-auto flex max-w-7xl items-center justify-between p-4"
      >
        {/* Left side: Logo and Navigation Links */}
        <div className="flex items-center gap-x-6">
          {/* Logo */}
          <a href="#" className="">
            <span className="sr-only">Citrus Swap</span>
            
          </a>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex lg:gap-x-12 items-center">
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              target={item.name === "Join Our Community" ? "_blank" : "_self"}
              className="text-lg font-fred text-orange-400 hover:text-orange-600"
            >
              {item.name}
            </a>
          ))}

          {/* Opt-In Button */}
          {activeAddress && !hasOptedIn && (
            <div className="flex justify-center w-full">
              <button
                onClick={optInOra}
                disabled={loading}
                className={`${
                  loading ? "bg-gray-400" : "bg-lime-400"
                } rounded-full text-orange-700 px-6 py-2 text-2xl font-semibold shadow-lg hover:bg-lime-500`}
              >
                {loading ? (
                  <span className="loading loading-spinner" />
                ) : (
                  "Opt-In ORA"
                )}
              </button>
            </div>
          )}

          {/* Connect Wallet Button */}
          {activeAccount ? (
            <AnimButton
              data-test-id="connect-wallet"
              onClick={disconnectWallet}
            >
              Disconnect
            </AnimButton>
          ) : (
            <AnimButton
              data-test-id="connect-wallet"
              onClick={() => setDisplayWalletConnectModal(true)}
            >
              Connect
            </AnimButton>
          )}
        </div>
      </nav>

      {/* Mobile Menu */}
      <Dialog
        open={mobileMenuOpen}
        onClose={toggleMobileMenu}
        className=""
      >
        <div className="fixed inset-0 z-10" />
        <div className="fixed inset-y-0 right-0 z-20 w-full overflow-y-auto bg-white px-3 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          {/* Header of Mobile Menu */}
          <div className="flex items-center justify-between p-4">
            <a href="#">
              <span className="sr-only">Citrus Swap</span>
              <Image
                src="/Citrus Swap.svg"
                alt="Citrus Swap Logo"
                width={300}
                height={100}
              />
            </a>
            <button
              type="button"
              onClick={toggleMobileMenu}
              className="text-black h-20 w-20"
            >
              <span className="sr-only">Close menu</span>
              <FaTimes className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          {/* Mobile Navigation Links */}
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              {/* Navigation Links */}
              <div className="space-y-2 py-6">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    target={item.name === "Social" ? "_blank" : "_self"} // Opens 'Social' link in a new tab
                    className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold text-gray-900 hover:bg-gray-50"
                  >
                    {item.name}
                  </a>
                ))}
              </div>
              {/* Wallet Button */}
              <div className="py-6">
                {!activeAccount ? (
                  <button
                    onClick={() => setDisplayWalletConnectModal(true)}
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold text-gray-900 hover:bg-gray-50"
                  >
                    Connect
                  </button>
                ) : (
                  <button
                    onClick={disconnectWallet}
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold text-gray-900 hover:bg-gray-50"
                  >
                    Disconnect
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </Dialog>
      <WalletConnectionModal />
    </header>
  );
}
