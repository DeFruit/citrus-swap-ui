"use client";

import React, { ReactNode, useState } from "react";

export interface TabOptionInterface {
  label: string;
  icon?: ReactNode;
}
interface TabsPropsInterface {
  options: TabOptionInterface[];
  onClickHandler?: (value: string) => void;
  classes?: string;
}

export const Tabs: React.FC<TabsPropsInterface> = ({
  options,
  onClickHandler,
}) => {
  const [activeTab, setActiveTab] = useState<TabOptionInterface>({
    label: options[0].label,
  });

  return (
    <div className={`flex ml-10 overflow-hidden z-10 w-full `}>
      <div
        className="flex items-center overflow-hidden"
      >
        {options.map((option, index) => (
          <div
            key={index}
            className={`py-2 px-4 cursor-pointer text-white text-4xl font-bari flex  items-center
            ${
              activeTab.label === option.label
                ? "bg-orange-400 font-bold  rounded-t-xl"
                : "bg-lime-400 transition-all ease-in-out rounded-t-xl hover:text-orange-400 "
            }`}
            onClick={() => {
              setActiveTab(option);
              if (onClickHandler) {
                onClickHandler(option.label);
              }
            }}
          >
            <h2>{option.label}</h2>
            
          </div>
        ))}
      </div>
    </div>
  );
};
