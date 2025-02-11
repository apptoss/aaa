import { Network } from '@aptos-labs/ts-sdk'
import type { Wallet } from '@aptos-labs/wallet-adapter-react'
import { AptosWalletAdapterProvider } from '@aptos-labs/wallet-adapter-react'
import type { PropsWithChildren } from 'react'

export const WalletProvider = ({ children }: PropsWithChildren) => {
  const wallets: Wallet[] = []

  return (
    <AptosWalletAdapterProvider
      plugins={wallets}
      autoConnect={true}
      dappConfig={{
        network: Network.DEVNET,
      }}
      onError={(error) => {
        throw error
      }}
    >
      {children}
    </AptosWalletAdapterProvider>
  )
}
