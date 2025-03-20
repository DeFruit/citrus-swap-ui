/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useWallet } from "@txnlab/use-wallet-react";
import React, { useEffect, useState } from "react";
import NotificationModal from "./components/NotificationModal";
import { Header } from "./components/header";
import Transact from "./components/oraSimpleTxn";
import { SwapContainer } from "./components/SwapContainer";
import { TabOptionInterface, Tabs } from "./components/tabs";
import {
  ArrowsUpDownIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";
import { FaWater } from "react-icons/fa";
import Footer from "./components/footer";
import Image from "next/image";
import { WalletConnectionModal } from "./components/walletConnectModal";

const Home: React.FC = () => {
  const { activeAddress } = useWallet();

  // State to control the Transact modal
  const [openTransactModal, setOpenTransactModal] = useState<boolean>(false);

  const toggleTransactModal = () => {
    setOpenTransactModal(!openTransactModal);
  };

  // Track state changes for debugging
  useEffect(() => {}, [openTransactModal]);

  // State for the notification
  const [showNotification, setShowNotification] = useState(false); // For the notification modal
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState<
    "success" | "error" | "info"
  >("info");

  const [tabOptions] = useState([
    { label: "Send", icon: <PaperAirplaneIcon />, enabled: true },
    { label: "Swap", icon: <ArrowsUpDownIcon />, enabled: false },
    { label: "Liquidity", icon: <FaWater />, enabled: false },
  ]);
  const [selectedTab, setSelectedTab] = useState<TabOptionInterface>({
    label: "Send",
    icon: <PaperAirplaneIcon />,
    enabled: true,
  });

  const onChangeTab = (label: string) => {
    const newTab = tabOptions.find((tab) => tab.label === label);
    if (newTab) {
      setSelectedTab(newTab);
    }
  };

  // Function to trigger the notification modal
  const triggerNotification = (
    message: string,
    type: "success" | "error" | "info"
  ) => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
  };

  return (
    <div>
      {/*  <Header /> */}

      <div className="bg-primary items-center justify-items-center h-screen w-full pt-3 md:pt-1">
        <main className="row-start-2 items-center justify-start md:grid md:grid-cols-2 w-full px-3">
          <div className="col-span-1 flex justify-center items-center">
            <Image
              src="/citrus-swap-logo.svg"
              alt="Citrus Swap"
              className="h-1/2 w-1/2 md:h-full md:w-full object-cover  -rotate-12 "
              width={100}
              height={100}
            />
          </div>
          <div className="col-span-1 flex flex-col items-center justify-center w-full">
            <Tabs options={tabOptions} onClickHandler={(e) => onChangeTab(e)} />
            <SwapContainer tabSelection={selectedTab.label} />
            <Footer />
          </div>
        </main>
      </div>

      {/* Transact Modal */}
      <Transact
        openModal={openTransactModal}
        setModalState={setOpenTransactModal}
        triggerNotification={triggerNotification}
      />

      {/* Notification Modal */}
      <NotificationModal
        showNotification={showNotification}
        notificationMessage={notificationMessage}
        notificationType={notificationType}
        setShowNotification={setShowNotification}
      />
      <WalletConnectionModal />
    </div>
  );
};

export default Home;
