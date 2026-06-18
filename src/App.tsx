import './App.css'

const NETWORK = { name: 'Moderato', chainId: 42431 } as const

function App() {
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
          {/* Phase 2: real Connect button wired to the Tempo Wallet connector. */}
          <button className="btn btn--primary" disabled>
            Подключить кошелёк
          </button>
        </div>
      </header>

      <main className="app__main">
        <section className="card" aria-labelledby="s-wallet">
          <h2 id="s-wallet" className="card__title">
            1 · Кошелёк
          </h2>
          <p className="muted">
            Подключение Tempo Wallet и балансы стейблов — Фаза 2.
          </p>
        </section>

        <section className="card" aria-labelledby="s-csv">
          <h2 id="s-csv" className="card__title">
            2 · Загрузка CSV
          </h2>
          <p className="muted">
            Колонки address, amount, memo с построчной валидацией — Фаза 3.
          </p>
        </section>

        <section className="card" aria-labelledby="s-preview">
          <h2 id="s-preview" className="card__title">
            3 · Превью пакета
          </h2>
          <p className="muted">
            Получатели, итоги, число выплат, оценка комиссии, fee token — Фаза 4.
          </p>
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
    </div>
  )
}

export default App
