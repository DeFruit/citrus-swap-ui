import { Input } from '@headlessui/react'
import { ASSET_INFO } from '../constants'
import Image from 'next/image'

export interface SwapInputProps {
  assetId: number
}

export const SwapInput: React.FC<SwapInputProps> = ({ assetId }) => {
  return (
    <div className="w-full  rounded-full shadow-xl bg-orange-400 flex flex-col gap-4 p-4 border-4 border-lime-300">
      <div className="flex justify-between space-x-2">
        <Image
          src={`/${ASSET_INFO[assetId].params.unitName}-logo.png`}
          className=""
          alt={ASSET_INFO[assetId].params.unitName}
          width={100}
          height={100}
        />
        <Input
          className="w-full rounded-full border-4 border-lime-300 text-4xl text-gray-500 text-right px-4"
          placeholder="0.00"
        />
      </div>
    </div>
  )
}
