/* eslint-disable @typescript-eslint/no-unused-vars */
import { useWallet } from '@txnlab/use-wallet-react'
import 'ldrs/bouncy'
import { useState } from 'react'
import { ASSET_INFO, ORA_ASSET_ID } from '../constants'
import { algorand } from '../algorand'
import { sendToVault } from '../api'
import Image from 'next/image'
import { FaCheckCircle } from 'react-icons/fa';


interface NFDData {
  depositAccount: string | null
  isOptedIn: boolean
}

type TransactionsArray = ['u' | 's', string][]

function encodeNFDTransactionsArray(txnsArray: TransactionsArray): Uint8Array[] {
  return txnsArray.map(([_, txn]) => base64ToByteArray(txn))
}

function base64ToByteArray(base64Str: string): Uint8Array {
  const binaryStr = atob(base64Str)
  const byteArray = new Uint8Array(binaryStr.length)

  for (let i = 0; i < binaryStr.length; i++) {
    byteArray[i] = binaryStr.charCodeAt(i)
  }

  return byteArray
}

interface TransactInterface {
  openModal: boolean
  setModalState: (value: boolean) => void
  triggerNotification: (message: string, type: 'success' | 'error' | 'info') => void
}

const Transact = ({ openModal, setModalState, triggerNotification }: TransactInterface) => {
  const [loading, setLoading] = useState(false)
  const [receiverAddress, setReceiverAddress] = useState('')
  const [amount, setAmount] = useState('')
  const [transactionStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [transactionMessage] = useState('')

  const wallet = useWallet()
  const { activeAddress, signTransactions } = wallet

  type CustomAssetHolding = {
    assetId: bigint
    amount: number
    isFrozen: boolean
  }

  const checkIfOptedInToORA = async (depositAccount: string): Promise<boolean> => {
    try {
      // Fetch account info
      const accountInfo = await algorand.account.getInformation(depositAccount)

      if (accountInfo.assets && accountInfo.assets.length > 0) {
        // Type assertion to CustomAssetHolding[]
        const assets = accountInfo.assets as unknown as CustomAssetHolding[]

        // Optionally convert bigint to number if necessary
        assets.forEach((asset) => {
          asset.amount = Number(asset.amount) // Convert from bigint to number
        })

        // Check if the account is opted into ORA
        const isOptedIn = isAccountOptedIn(assets, BigInt(ORA_ASSET_ID)) // Convert ORA_ASSET_ID to bigint
        return isOptedIn
      } else {
        return false
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return false
    }
  }

  // Helper function to check if an account is opted into a given asset
  const isAccountOptedIn = (assets: CustomAssetHolding[], assetId: bigint): boolean => {
    return assets.some((asset) => asset.assetId === assetId)
  }

  const resolveNFD = async (nfd: string): Promise<NFDData | null> => {
    try {
      const response = await fetch(`https://api.nf.domains/nfd/${nfd}`)
      const data = await response.json()

      if (!data || !data.depositAccount) {
        return null
      }

      const isOptedInToORA = await checkIfOptedInToORA(data.depositAccount)

      return {
        depositAccount: data.depositAccount,
        isOptedIn: isOptedInToORA, // Use the result from the blockchain check
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return null
    }
  }

  const sendSimpleOraTxn = async (receiver: string) => {
    try {
      // Ensure activeAddress is not null
      if (!activeAddress) {
        triggerNotification('Connect wallet first', 'error')
        return
      }

      const signer = await wallet.transactionSigner
      const result = await algorand.send.assetTransfer({
        signer,
        sender: activeAddress,
        receiver,
        assetId: BigInt(ORA_ASSET_ID),
        amount: BigInt(parseFloat(amount) * 10 ** 8),
      })

      triggerNotification(
        `Transaction Sent: <a href="https://lora.algokit.io/mainnet/transaction/${result.txIds[0]}" target="_blank">View</a>`,
        'success',
      )
      //confetti({ particleCount: 100, spread: 70 })
      setReceiverAddress('')
      setAmount('')
    } catch (e) {
      triggerNotification('Transaction failed', 'error')
    }
  }

  const handleNfdTransaction = async (nfdData: NFDData) => {
    if (!nfdData.depositAccount) {
      triggerNotification('Invalid NFD deposit account', 'error')
      return
    }

    if (!activeAddress) {
      triggerNotification('Wallet not connected', 'error')
      return
    }

    try {
      const resolvedNfdData = await resolveNFD(receiverAddress)

      if (!resolvedNfdData || !resolvedNfdData.depositAccount) {
        triggerNotification('Invalid NFD deposit account', 'error')
        return
      }

      if (nfdData.isOptedIn) {
        // If the NFD is opted in, send directly to the deposit account
        await sendSimpleOraTxn(nfdData.depositAccount)
      } else {
        // If not opted in, send to vault
        const response = await sendToVault(receiverAddress, {
          sender: activeAddress,
          assets: [ORA_ASSET_ID],
          amount: Number(parseFloat(amount) * 10 ** 8), // Convert to number
          optInOnly: false,
        })

        if (typeof response.data !== 'string') {
          throw new Error('Failed to fetch transactions from vault')
        }

        // Fetch and parse transactions
        const transactionsArray = JSON.parse(response.data)

        // Encode the transactions into a format that can be signed
        const encodedTxns = encodeNFDTransactionsArray(transactionsArray)

        // Sign the transactions
        const signedTransactions = await signTransactions(encodedTxns)

        // Remove null values as it does not accept them only UInt
        const validSignedTxns = signedTransactions.filter((txn) => txn !== null)

        // Send the transactions to the network
        const transaction = await algorand.client.algod.sendRawTransaction(validSignedTxns).do()

        // Get the txn id
        const id = transaction.txid

        const notificationMessage = `Transaction Sent: <a href="https://lora.algokit.io/mainnet/transaction/${id}" target="_blank" rel="noopener noreferrer" style="font-weight: bold; text-decoration: underline; cursor: pointer;">Explore more</a>`

        triggerNotification(notificationMessage, 'success')
      }
    } catch (error) {
      triggerNotification('Error sending to vault', 'error')
    }
  }

  const handleSubmitORA = async () => {
    if (!activeAddress) {
      triggerNotification('Connect wallet first', 'error')
      return
    }

    const isAlgorandAddress = /^[A-Z2-7]{58}$/.test(receiverAddress)
    const isNFD = receiverAddress.endsWith('.algo')

    if (!isAlgorandAddress && !isNFD) {
      triggerNotification('Invalid address', 'error')
      return
    }

    setLoading(true)

    if (isAlgorandAddress) {
      await sendSimpleOraTxn(receiverAddress)
    } else {
      const nfdData = await resolveNFD(receiverAddress)
      if (!nfdData?.depositAccount) {
        triggerNotification('NFD not found', 'error')
      } else {
        await handleNfdTransaction(nfdData)
      }
    }

    setLoading(false)
  }

  return (
    <div
      id="transact_modal"
      className={`fixed inset-0 flex items-center justify-center z-50 ${openModal ? '' : 'hidden'}`}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <form
        method="dialog"
        className="bg-white p-6 rounded-lg shadow-xl w-96 relative"
      >
        <h3 className="font-bold text-lg text-orange-500">Send ORA</h3>
  
        {transactionStatus === 'loading' ? (
          <div className="flex justify-center py-4">
            {/* Loading spinner can be placed here */}
          </div>
        ) : transactionStatus === 'success' ? (
          <div className="flex justify-center py-4 text-green-500">
            <FaCheckCircle size={40} />
          </div>
        ) : (
          <div className="flex justify-center py-4 text-red-500">
            {/* Error icon can be placed here */}
          </div>
        )}
  
        <p className="mt-2 text-center">{transactionMessage}</p>
  
        <input
          type="text"
          placeholder="Enter receiver's wallet address"
          className="input input-bordered w-full mt-4"
          value={receiverAddress}
          onChange={(e) => setReceiverAddress(e.target.value)}
        />


        <div className="w-full rounded-full shadow-xl bg-orange-400 flex flex-col gap-4 p-4 border-4 border-accent">
          <div className="flex justify-between space-x-2">

            <Image
              src={`/${ASSET_INFO[Number(ORA_ASSET_ID)].params.unitName}-logo.png`}
              alt={ASSET_INFO[Number(ORA_ASSET_ID)].params.unitName}
              width={60}
              height={60}
            />
            <input
              className="w-full rounded-full border-4 border-accent text-4xl text-orange-400 text-right px-4"

              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
        </div>
  
        <div className="flex justify-end space-x-4 mt-6">
          <button
            type="button"
            className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-md"
            onClick={() => {
              setModalState(false);
            }}
          >
            Close
          </button>
          <button
            type="button"
            className={`px-4 py-2 rounded-md text-white transition ${
              (receiverAddress.endsWith('.algo') || receiverAddress.length === 58) &&
              amount &&
              !isNaN(Number(amount))
                ? 'bg-orange-500 hover:bg-orange-600'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
            onClick={(e) => {
              e.preventDefault();
              handleSubmitORA();
            }}
            disabled={
              !(
                (receiverAddress.endsWith('.algo') || receiverAddress.length === 58) &&
                amount &&
                !isNaN(Number(amount))
              )
            }
          >
            {loading ? <span className="loading loading-spinner" /> : 'Send ORA'}
          </button>
        </div>
      </form>
    </div>
  );
}  

export default Transact
