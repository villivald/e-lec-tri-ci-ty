import styles from './App.module.css';

export const App = () => (
  <main className={styles.mainContent}>
    <section className={styles.header} aria-labelledby="page-title">
      <p className={styles.decorativeText}>Energy statistics</p>
      <h1 className={styles.title}>E-Lec-Tri-Ci-Ty</h1>
      <p className={styles.intro}>
        Daily production, consumption, and electricity price statistics.
      </p>
    </section>
  </main>
);
