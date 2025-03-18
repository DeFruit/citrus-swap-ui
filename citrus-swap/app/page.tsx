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
    { label: "Swap" },
    { label: "Send", icon: <PaperAirplaneIcon /> },
    { label: "Liquidity", icon: <FaWater /> },
  ]);
  const [selectedTab, setSelectedTab] = useState<TabOptionInterface>({
    label: "Swap",
    icon: <ArrowsUpDownIcon />,
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

      <div className="bg-primary items-center justify-items-center h-screen w-full ">
        <main className="row-start-2 items-center justify-start grid grid-cols-1 md:grid-cols-2">
          <div className="col-span-1">
            <Image
              src="/citrus-swap-logo.svg"
              alt="Citrus Swap"
              className="w-full h-full object-cover scale-90 -rotate-12 hidden md:block"
              width={80}
              height={80}
            />
          </div>
          <div className="col-span-1">
            <Tabs options={tabOptions} onClickHandler={(e) => onChangeTab(e)} />
            <SwapContainer />
            <Footer />
          </div>
        </main>
      </div>

      {/* Send Algo Button at Bottom Right */}
      {activeAddress && (
        <button
          onClick={(event) => {
            event.preventDefault();
            toggleTransactModal();
          }}
          className="fixed bottom-4 right-4 bg-secondary hover:bg-accent text-button-text font-bold py-2 px-4 rounded-full shadow-lg"
        >
          🎁 Send a friend some $ORA!
        </button>
      )}

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
    </div>
  );
};

export default Home;
