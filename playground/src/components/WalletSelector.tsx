import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  WalletItem,
  type WalletItemProps,
  useWallet,
} from '@aptos-labs/wallet-adapter-react'
import { groupAndSortWallets } from '@aptos-labs/wallet-adapter-react'

export function WalletSelector() {
  const { connected, disconnect, wallets = [] } = useWallet()
  const { aptosConnectWallets } = groupAndSortWallets(wallets)

  if (aptosConnectWallets.length === 0) {
    return <div>No wallets found</div>
  }

  return (
    <Card className="max-w-[360px]">
      <CardHeader>
        <CardTitle>Wallets</CardTitle>
        <CardDescription>
          Connect to Aptos with your favorite wallet
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2 pb-4">
          {aptosConnectWallets.map((wallet) => (
            <AptosConnectWalletRow
              key={wallet.name}
              wallet={wallet}
              onConnect={close}
              connected={connected}
            />
          ))}
        </div>
        <div className="flex justify-between gap-2 items-center">
          <Button disabled={!connected} onClick={disconnect} className="w-full">
            Disconnect
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function AptosConnectWalletRow({
  connected,
  wallet,
  onConnect,
}: WalletItemProps & { connected: boolean }) {
  return (
    <WalletItem wallet={wallet} onConnect={onConnect}>
      <WalletItem.ConnectButton asChild>
        <Button
          size="lg"
          variant="outline"
          className="w-full gap-4"
          disabled={connected}
        >
          <WalletItem.Icon className="h-5 w-5" />
          <WalletItem.Name className="text-base font-normal" />
        </Button>
      </WalletItem.ConnectButton>
    </WalletItem>
  )
}
