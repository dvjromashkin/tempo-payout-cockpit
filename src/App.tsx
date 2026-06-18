import { useState } from 'react'
import './App.css'
import { ImportCard } from './features/import/ImportCard'
import { PreviewCard } from './features/preview/PreviewCard'
import { ConfirmDialog } from './features/send/ConfirmDialog'
import { ConnectButton } from './features/wallet/ConnectButton'
import { WalletCard } from './features/wallet/WalletCard'
import type { ParseResult } from './lib/csv'

const NETWORK = { name: 'Moderato', chainId: 42431 } as const

function App() {
  const [parse, setParse] = useState<ParseResult | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)

  return (
    <div className="app">
      <header className="app__header">
        <div className="brand">
          <span className="brand__mark" aria-hidden="true">
            ◇
          </span>
          <div>
            <h1 className="brand__title">Tempo Payout Cockpit</h1>
            <p className="brand__subtitle">
              Массовые стейблкоин-выплаты одним атомарным пакетом
            </p>
          </div>
        </div>

        <div className="header__right">
          <span className="net-badge" title={`chainId ${NETWORK.chainId}`}>
            {NETWORK.name} · testnet
          </span>
          <ConnectButton />
        </div>
      </header>

      <main className="app__main">
        <section className="card" aria-labelledby="s-wallet">
          <h2 id="s-wallet" className="card__title">
            1 · Кошелёк
          </h2>
          <WalletCard />
        </section>

        <section className="card" aria-labelledby="s-csv">
          <h2 id="s-csv" className="card__title">
            2 · Загрузка CSV
          </h2>
          <ImportCard
            result={parse}
            fileName={fileName}
            onResult={(r, n) => {
              setParse(r)
              setFileName(n)
            }}
          />
        </section>

        <section className="card" aria-labelledby="s-preview">
          <h2 id="s-preview" className="card__title">
            3 · Превью пакета
          </h2>
          <PreviewCard result={parse} onProceed={() => setConfirmOpen(true)} />
        </section>

        <section className="card" aria-labelledby="s-result">
          <h2 id="s-result" className="card__title">
            4 · Подтверждение и результат
          </h2>
          <p className="muted">
            Полная сводка → подпись в кошельке → квитанция и локальная история —
            Фазы 5–6.
          </p>
        </section>
      </main>

      <footer className="app__footer">
        <p>
          Non-custodial. Приватные ключи и seed не запрашиваются, не хранятся и
          не логируются. Подпись транзакций — только в вашем кошельке.
          Содержимое CSV — это данные: исполняется лишь после вашего явного
          подтверждения.
        </p>
      </footer>

      {confirmOpen && parse && (
        <ConfirmDialog result={parse} onClose={() => setConfirmOpen(false)} />
      )}
    </div>
  )
}

export default App
