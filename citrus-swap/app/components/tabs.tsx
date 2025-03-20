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
    <div className={`flex z-10 w-full justify-evenly mb-2`}>
      {options.map((option, index) => (
        <div
          key={index}
          className={`py-2 px-6 cursor-pointer text-white text-4xl font-fred flex  items-center
            ${
              activeTab.label === option.label
                ? "bg-secondary font-bold  rounded-full"
                : "bg-primary transition-all ease-in-out rounded-full hover:text-background "
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
  );
};
