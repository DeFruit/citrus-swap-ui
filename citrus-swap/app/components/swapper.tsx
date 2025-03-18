'use client'

import { ArrowsUpDownIcon } from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { ALGO_ASSET_ID, ORA_ASSET_ID } from '../constants'
import AnimButton from './animButton'
import { SwapInput } from './swapInput'
import { useSwap } from '../context/swap'

export const Swapper: React.FC = () => {
  const [isSwapped, setIsSwapped] = useState(false)

  const { switchAssets, makeSwapTransaction } = useSwap()
  const onClickSwitchAssets = () => {
    setIsSwapped((prev) => !prev)
    switchAssets()
  }

  return (
    <div>
      <div className="mx-3 flex flex-col gap-3">
        {isSwapped ? (
          <>
            {/* ALGO on top when swapped */}
            <motion.div
              layout
              key="asset-2"
              animate={{ scale: [0.9, 1.05, 1] }}
              transition={{ layout: { type: 'spring', stiffness: 700, damping: 30 }, duration: 0.3 }}
            >
              <SwapInput assetId={ALGO_ASSET_ID} />
            </motion.div>

            <motion.button
              layout
              key="arrow"
              onClick={onClickSwitchAssets}
              className="w-full flex mx-auto justify-center"
              transition={{ layout: { type: 'spring', stiffness: 300, damping: 20 }, ease: 'easeInOut' }}
            >
              <span className="w-10 h-10 p-1 text-white  bg-primary rounded-full  hover:scale-150 ease-in-out transition-all">
                <ArrowsUpDownIcon />
              </span>
            </motion.button>

            <motion.div
              layout
              key="asset-1"
              animate={{ scale: [0.9, 1.03, 1] }}
              transition={{ layout: { type: 'spring', stiffness: 700, damping: 30 }, duration: 0.3 }}
            >
              <SwapInput assetId={ORA_ASSET_ID} />
            </motion.div>
          </>
        ) : (
          <>
            {/* ORA on top when not swapped */}
            <motion.div
              layout
              key="asset-1"
              animate={{ scale: [0.9, 1.05, 1] }}
              transition={{ layout: { type: 'spring', stiffness: 700, damping: 30 }, duration: 0.3 }}
            >
              <SwapInput assetId={ORA_ASSET_ID} />
            </motion.div>

            <motion.button
              layout
              key="arrow"
              onClick={onClickSwitchAssets}
              className="w-full flex mx-auto justify-center"
              transition={{ layout: { type: 'spring', stiffness: 300, damping: 20 }, ease: 'easeInOut' }}
            >
              <span className="w-10 h-10 p-1 text-white  bg-primary rounded-full  hover:scale-150 ease-in-out transition-all">
                <ArrowsUpDownIcon />
              </span>
            </motion.button>

            <motion.div
              layout
              key="asset-2"
              animate={{ scale: [0.9, 1.05, 1] }}
              transition={{ layout: { type: 'spring', stiffness: 700, damping: 30 }, duration: 0.3 }}
            >
              <SwapInput assetId={ALGO_ASSET_ID} />
            </motion.div>
          </>
        )}

        {/* Swap Button */}
        <div className="flex w-full mx-auto justify-center">
          <AnimButton onClick={makeSwapTransaction}>Swap</AnimButton>
        </div>
      </div>
    </div>
  )
}
