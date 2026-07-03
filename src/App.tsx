import { useState } from 'react'
import './App.css'
import { HistoryCard } from './features/history/HistoryCard'
import { ImportCard } from './features/import/ImportCard'
import { PreviewCard } from './features/preview/PreviewCard'
import { ConfirmDialog } from './features/send/ConfirmDialog'
import { ConnectButton } from './features/wallet/ConnectButton'
import { WalletCard } from './features/wallet/WalletCard'
import { BUILD_LABEL } from './lib/buildInfo'
import type { ParseResult } from './lib/csv'
import { type RunRecord, clearRuns, loadRuns, saveRun } from './lib/history'
import { PUBLIC_LINKS, safeExternalLinkProps } from './lib/publicLinks'
import { HOW_IT_WORKS_STEPS, PUBLIC_STATUS, SAFETY_NOTICE } from './lib/publicMvp'

const NETWORK = { name: 'Moderato', chainId: 42431 } as const

function App() {
  const [parse, setParse] = useState<ParseResult | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [runs, setRuns] = useState<RunRecord[]>(() => loadRuns(localStorage))

  return (
    <div className="app">
      <header className="app__header">
        <div className="brand">
          <span className="brand__mark" aria-hidden="true">
            &#9671;
          </span>
          <div>
            <h1 className="brand__title">Tempo Payout Cockpit</h1>
            <div
              className="testnet-status"
              role="status"
              aria-label={PUBLIC_STATUS.ariaLabel}
            >
              <strong>{PUBLIC_STATUS.label}</strong>
              <span>{PUBLIC_STATUS.supporting}</span>
            </div>
            <p className="brand__subtitle">
              Mass stablecoin payouts in one Atomic batch.
            </p>
          </div>
        </div>

        <div className="header__right">
          <span className="net-badge" title={`chainId ${NETWORK.chainId}`}>
            {NETWORK.name} testnet
          </span>
          <ConnectButton />
        </div>
      </header>

      <section className="notice" aria-labelledby="notice-title">
        <div>
          <h2 id="notice-title">{SAFETY_NOTICE.title}</h2>
          <p>{SAFETY_NOTICE.lead}</p>
        </div>
        <ul>
          {SAFETY_NOTICE.points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </section>

      <section className="how-it-works" aria-labelledby="how-title">
        <h2 id="how-title">How it works</h2>
        <ol>
          {HOW_IT_WORKS_STEPS.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <main className="app__main">
        <section className="card" aria-labelledby="s-wallet">
          <h2 id="s-wallet" className="card__title">
            1. Wallet
          </h2>
          <WalletCard />
        </section>

        <section className="card" aria-labelledby="s-csv">
          <h2 id="s-csv" className="card__title">
            2. Upload CSV
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
            3. Package preview
          </h2>
          <PreviewCard result={parse} onProceed={() => setConfirmOpen(true)} />
        </section>

        <section className="card" aria-labelledby="s-result">
          <h2 id="s-result" className="card__title">
            4. Run history
          </h2>
          <HistoryCard
            runs={runs}
            onClear={() => {
              clearRuns(localStorage)
              setRuns([])
            }}
          />
        </section>
      </main>

      <footer className="app__footer">
        <div>
          <p>
            Unofficial, independent community project. Not affiliated with Tempo.
          </p>
          <p>
            Non-custodial browser-only MVP for Moderato testnet AlphaUSD. Not suitable
            for real funds.
          </p>
        </div>
        <nav className="footer-links" aria-label="Public resources">
          <a href={PUBLIC_LINKS.github} {...safeExternalLinkProps('Open GitHub repository')}>
            GitHub
          </a>
          <a href={PUBLIC_LINKS.sampleCsv} download aria-label="Download sample CSV">
            Sample CSV
          </a>
          <a
            href={PUBLIC_LINKS.explorer}
            {...safeExternalLinkProps('Open Tempo Moderato explorer')}
          >
            Moderato explorer
          </a>
          <a href={PUBLIC_LINKS.docs} {...safeExternalLinkProps('Open Tempo documentation')}>
            Tempo docs
          </a>
        </nav>
        <span className="build-label" aria-label={BUILD_LABEL}>
          {BUILD_LABEL}
        </span>
      </footer>

      {confirmOpen && parse && (
        <ConfirmDialog
          result={parse}
          onClose={() => setConfirmOpen(false)}
          onSuccess={(run) => setRuns(saveRun(localStorage, run))}
        />
      )}
    </div>
  )
}

export default App
