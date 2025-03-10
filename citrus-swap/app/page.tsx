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
    { label: "Swap",  },
    { label: "Send", icon: <PaperAirplaneIcon /> },
    { label: "Liquidity", icon: <FaWater /> },
  ]);
  const [selectedTab, setSelectedTab] = useState<TabOptionInterface>({
    label: "Swap",
    icon: <ArrowsUpDownIcon />
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
      <Header />

      <div className="bg-gradient-to-br from-lime-300 to-amber-400 items-center justify-items-center min-h-screen w-full ">
        <div className="flex flex-col w-full items-center bg-gradient-to-b from-orange-500 to-orange-400 p-4 ">
          <h1 className=" text-4xl sm:text-6xl text-lime-400 font-bari">
            Welcome to Citrus Swap
          </h1>
          <h2 className="font-Bari text-2xl sm:text-4xl text-lime-300 font-bari">
            The ORA micro-DEX
          </h2>
        </div>
        <main className="flex flex-col row-start-2 items-center justify-start mt-10 ">
          <Tabs
            options={tabOptions}
            onClickHandler={(e) => onChangeTab(e)}
          />
          <SwapContainer />
        </main>
      </div>

      {/* Send Algo Button at Bottom Right */}
      {activeAddress && (
        <button
          onClick={(event) => {
            event.preventDefault();
            toggleTransactModal();
          }}
          className="fixed bottom-4 right-4 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-full shadow-lg"
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
      <Footer />
    </div>
  );
};

export default Home;
