import { useWallet } from '@txnlab/use-wallet-react'
import React, { useContext } from 'react'
import { RxCross1 } from 'react-icons/rx'
import { LoadingContext } from '../context/loading'
import { WalletContext } from '../context/wallet'
import AnimButton from './animButton'
import Image from 'next/image'

export const WalletConnectionModal: React.FC = () => {
  const { wallets } = useWallet()
  const { setLoading, setTitle } = useContext(LoadingContext)
  const { displayWalletConnectModal, setDisplayWalletConnectModal } = useContext(WalletContext)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function handleOnConnect(wallet: any) {
    setTitle('Connecting Wallet...')
    setLoading(true)
    wallet.connect().then(async () => {
      setDisplayWalletConnectModal(false)
    })
  }

  return displayWalletConnectModal ? (
    <div className="relative z-50" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="fixed inset-0 z-50 flex items-center justify-center" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div className="fixed inset-0 bg-transparent "></div>
        <div className="relative z-50 w-full max-w-lg p-4">
          <div className="flex justify-center items-center transform overflow-hidden rounded-xl text-left shadow-2xl transition-all bg-gradient-to-br from-amber-300 to-yellow-500 dark:text-white">
            <div className="w-full p-4">
              <div className="flex justify-end">
                <RxCross1
                  className="cursor-pointer dark:text-white font-bold"
                  size={16}
                  onClick={async () => {
                    setDisplayWalletConnectModal(false)
                  }}
                />
              </div>
              <div className="flex items-center justify-center gap-2">
                <h3 className="text-4xl text-white">Connect Wallet</h3>
              </div>

              <br />
              <div className=" grid grid-cols-2 cursor-pointer ">
                {wallets?.map((wallet) => (
                  <div
                    key={`wallet-${wallet.metadata.name}`}
                    className="flex gap-4 p-4  rounded-full text-fred hover:font-bold hover:scale-105 transition-all justify-center items-center"
                    onClick={() => handleOnConnect(wallet)}
                  >
                    <div className=" items-center justify-center">
                      <div className="rounded-full h-16 w-16 overflow-hidden bg-transparent">
                        <Image src={wallet.metadata.icon} alt="wallet-logo" className="h-16 w-16" width={16} height={16} />
                      </div>
                      <div className="text-2xl font-bold ">
                        <div>{wallet.metadata.name}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-center">
                <AnimButton onClick={() => setDisplayWalletConnectModal(false)}>Close</AnimButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : null
}
