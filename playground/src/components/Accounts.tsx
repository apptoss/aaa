import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useAptBalance } from '@/hooks/useAptBalance'
import { formatAddress } from '@/lib/utils'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { useEffect, useState } from 'react'

export function Accounts() {
  const { connected, account } = useWallet()
  const { balance } = useAptBalance()
  const [isHighlighted, setIsHighlighted] = useState(false)
  const [previousBalance, setPreviousBalance] = useState(balance)

  useEffect(() => {
    if (balance !== previousBalance) {
      setIsHighlighted(true)
      setPreviousBalance(balance)

      setTimeout(() => {
        setIsHighlighted(false)
      }, 1000)
    }
  }, [balance, previousBalance])

  return (
    <Card className="max-w-[360px]">
      <CardHeader>
        <CardTitle>Accounts</CardTitle>
        <CardDescription>Main wallet account</CardDescription>
      </CardHeader>
      <CardContent>
        {connected ? (
          <div className="flex justify-between">
            <p className="font-mono">{formatAddress(account?.address || '')}</p>
            <p>
              <span
                className={`font-mono transition-colors duration-300 ${
                  isHighlighted ? 'bg-red-500/20 rounded px-1' : ''
                }`}
              >
                {balance}
              </span>{' '}
              Octas
            </p>
          </div>
        ) : (
          'No account connected'
        )}
      </CardContent>
    </Card>
  )
}
