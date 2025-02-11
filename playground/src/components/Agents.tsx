import { addPermissionDelegationScriptBytecode, aptosClient } from '@/aptos'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useAptBalance } from '@/hooks/useAptBalance'
import { useSession } from '@/hooks/useSession'
import { formatAddress } from '@/lib/utils'
import { Ed25519Account, MoveVector } from '@aptos-labs/ts-sdk'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { useCallback, useEffect, useState } from 'react'
import { Button } from './ui/button'

export function Agents() {
  const {
    connected,
    account,
    signAndSubmitTransaction,
    signTransaction,
    submitTransaction,
  } = useWallet()
  const [session, setSession] = useSession()
  const { invalidate: invalidateBalance } = useAptBalance()
  const [delegationEnabled, setDelegationEnabled] = useState(false)

  const createSession = async () => {
    if (!account) return
    const agent = Ed25519Account.generate()

    const pendingTxn = await signAndSubmitTransaction({
      sender: account.address,
      data: {
        bytecode: addPermissionDelegationScriptBytecode,
        functionArguments: [MoveVector.U8(agent.publicKey.toUint8Array())],
      },
    })
    await aptosClient.waitForTransaction({ transactionHash: pendingTxn.hash })
    invalidateBalance()

    setSession(agent)
  }

  const delegate = async () => {
    if (!account) return

    const transaction =
      await aptosClient.abstraction.enableAccountAbstractionTransaction({
        accountAddress: account.address,
        authenticationFunction: '0x1::permissioned_delegation::authenticate',
      })

    const senderAuthenticator = await signTransaction(transaction)
    const pendingTxn = await submitTransaction({
      transaction,
      senderAuthenticator,
    })
    await aptosClient.waitForTransaction({ transactionHash: pendingTxn.hash })
    invalidateDelegation()
    invalidateBalance()
  }

  const reset = async () => {
    if (!account) return
    const transaction =
      await aptosClient.abstraction.disableAccountAbstractionTransaction({
        accountAddress: account.address,
      })

    const senderAuthenticator = await signTransaction(transaction)
    const pendingTxn = await submitTransaction({
      transaction,
      senderAuthenticator,
    })
    await aptosClient.waitForTransaction({ transactionHash: pendingTxn.hash })
    invalidateDelegation()
    invalidateBalance()
    setSession(null)
  }

  const invalidateDelegation = useCallback(async () => {
    if (!account) return
    const enabled = await aptosClient.abstraction.isAccountAbstractionEnabled({
      accountAddress: account.address,
      authenticationFunction: '0x1::permissioned_delegation::authenticate',
    })
    setDelegationEnabled(enabled)
  }, [account])

  useEffect(() => {
    if (!account) return
    invalidateDelegation()
  }, [account, invalidateDelegation])

  return (
    <Card className="max-w-[360px]">
      <CardHeader>
        <CardTitle>Agents</CardTitle>
        <CardDescription>
          Delegate permissions to agents for automation
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!connected && <p>No account connected</p>}
        {connected && !delegationEnabled && <p>Delegation not enabled</p>}
        {connected && delegationEnabled && !session && <p>No agent created</p>}
        {session && (
          <p className="font-mono">
            {formatAddress(session.accountAddress.toString())}
          </p>
        )}
      </CardContent>
      <CardFooter className="gap-2">
        {!delegationEnabled && (
          <Button
            disabled={!connected || !!session}
            variant="outline"
            className="w-full"
            onClick={delegate}
          >
            Enable Delegation
          </Button>
        )}
        {delegationEnabled && (
          <Button variant="destructive" className="w-full" onClick={reset}>
            Reset Delegation
          </Button>
        )}
        <Button
          disabled={!connected || !delegationEnabled || !!session}
          onClick={createSession}
        >
          Create Agent
        </Button>
      </CardFooter>
    </Card>
  )
}
