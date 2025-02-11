import { aptosClient } from '@/aptos'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useAptBalance } from '@/hooks/useAptBalance'
import { useSession } from '@/hooks/useSession'
import { formatAddress } from '@/lib/utils'
import { AbstractedAccount, AccountAddress } from '@aptos-labs/ts-sdk'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { useState } from 'react'
import { toast } from 'sonner'

const formatHash = (hash: string) => {
  if (!hash) return ''
  const start = hash.slice(0, 6)
  const end = hash.slice(-4)
  return `${start}...${end}`
}

export function Transfer() {
  const [session] = useSession()
  const { account } = useWallet()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { invalidate } = useAptBalance()

  const transfer = async () => {
    if (!account) return
    if (!session) return

    setIsSubmitting(true)

    const aa = AbstractedAccount.fromPermissionedSigner({
      signer: session,
      accountAddress: AccountAddress.fromString(account.address),
    })

    const txn = await aptosClient.transaction.build.simple({
      sender: account.address,
      data: {
        function: '0x1::primary_fungible_store::transfer',
        typeArguments: ['0x1::fungible_asset::Metadata'],
        functionArguments: [
          '0xa',
          '2fe53680c4d9ba13dd17adaed75a88c6b11a320c74437a071b84662c9aa1fb4b',
          '100000',
        ],
      },
    })

    const senderAuthenticator = aptosClient.transaction.sign({
      signer: aa,
      transaction: txn,
    })
    const pendingTxn = await aptosClient.transaction.submit.simple({
      transaction: txn,
      senderAuthenticator,
    })

    const promise = aptosClient
      .waitForTransaction({
        transactionHash: pendingTxn.hash,
      })
      .finally(() => {
        invalidate()
        setIsSubmitting(false)
      })

    toast.promise(promise, {
      loading: `Transferring ${formatHash(pendingTxn.hash)}`,
      success: (data) => {
        return `Transferred ${formatHash(data.hash)}`
      },
      error: (error) => {
        console.error(error)
        return `Failed to transfer ${formatHash(pendingTxn.hash)}`
      },
    })
  }

  return (
    <Card className="max-w-[360px]">
      <CardHeader>
        <CardTitle>Transfer</CardTitle>
      </CardHeader>
      <CardContent>
        Send 100 Octas to{' '}
        <span className="font-mono">
          {formatAddress(
            '0x2fe53680c4d9ba13dd17adaed75a88c6b11a320c74437a071b84662c9aa1fb4b',
          )}
        </span>{' '}
        on behalf of the main account
      </CardContent>
      <CardFooter>
        <div className="flex items-center gap-4">
          <Button disabled={isSubmitting || !session} onClick={transfer}>
            Transfer
          </Button>
          <p className="text-sm text-muted-foreground">
            Auto-execute - No prompt
          </p>
        </div>
      </CardFooter>
    </Card>
  )
}
