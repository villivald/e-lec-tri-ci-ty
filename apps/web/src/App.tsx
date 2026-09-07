import styles from './App.module.css';
import { DailyStatistics } from './features/daily-statistics/DailyStatistics';

export const App = () => (
  <div className={styles.mainPage}>
    <a className={styles.skipLink} href="#statistics">
      Skip to daily statistics
    </a>

    <header className={styles.topBar}>
      <div className={styles.brand}>
        <span className={styles.brandLogo} aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" width="24" height="24">
            <path
              d="M14 2 5 14h6l-1 8 9-12h-6l1-8Z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span>E-Lec-Tri-Ci-Ty</span>
      </div>

      <span className={styles.archiveLabel}>
        Solita · Dev Academy Exercise · 09/2026
      </span>
    </header>

    <main className={styles.mainContent}>
      <section className={styles.header} aria-labelledby="page-title">
        <h1 id="page-title" className={styles.title}>
          Energy <span>statistics</span>
        </h1>
        <p className={styles.intro}>
          Daily production, consumption, and electricity price statistics.
        </p>
      </section>
      <DailyStatistics />
    </main>

    <footer className={styles.footer}>
      <span>
        Solita Dev Academy Exercise: Autumn 2026 - Electricity Data App
      </span>
      <span>
        Sources:{' '}
        <a
          href="https://www.fingrid.fi/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Fingrid
        </a>{' '}
        &amp;{' '}
        <a
          href="https://www.porssisahko.net/api"
          target="_blank"
          rel="noopener noreferrer"
        >
          Pörssisähkö.net
        </a>
      </span>
    </footer>
  </div>
);
