import { Accounts } from '@/components/Accounts'
import { Agents } from '@/components/Agents'
import { Transfer } from '@/components/Transfer'
import { WalletSelector } from '@/components/WalletSelector'

function App() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-xl font-bold">Aptos Account Abstraction</h1>
      <WalletSelector />
      <Accounts />
      <Agents />
      <Transfer />
    </div>
  )
}

export default App
