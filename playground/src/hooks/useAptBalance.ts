import { aptosClient } from '@/aptos'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { atom, useAtom } from 'jotai'
import { useCallback, useEffect } from 'react'

// Consider adding a timestamp to track data freshness
interface BalanceState {
  amount: number
  lastUpdated: number
  isLoading: boolean
}

const balanceAtom = atom<BalanceState>({
  amount: 0,
  lastUpdated: 0,
  isLoading: false,
})

export function useAptBalance(refreshInterval = 10000) {
  // 10 seconds default
  const { account } = useWallet()
  const [balance, setBalance] = useAtom(balanceAtom)

  const invalidate = useCallback(async () => {
    // Prevent concurrent fetches
    if (!account || balance.isLoading) return

    try {
      setBalance((prev) => ({ ...prev, isLoading: true }))
      const amount = await aptosClient.account.getAccountAPTAmount({
        accountAddress: account.address,
      })
      setBalance({ amount, lastUpdated: Date.now(), isLoading: false })
    } catch (error) {
      console.error('Failed to fetch APT balance:', error)
      setBalance((prev) => ({ ...prev, isLoading: false }))
    }
  }, [account, balance.isLoading, setBalance])

  useEffect(() => {
    // Reset balance when account changes
    if (!account) {
      setBalance({ amount: 0, lastUpdated: 0, isLoading: false })
      return
    }

    // Only fetch if data is stale
    const isStale = Date.now() - balance.lastUpdated > refreshInterval
    if (isStale) {
      invalidate()
    }
  }, [account, balance.lastUpdated, invalidate, refreshInterval, setBalance])

  return {
    balance: balance.amount,
    lastUpdated: balance.lastUpdated,
    invalidate,
    isLoading: balance.isLoading,
  }
}
