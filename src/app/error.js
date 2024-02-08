"use client";

/// imports ///
import styles from "./error.module.css";
import ThemedImage from "@/helper-components/themed-image";

/// main component ///
export default function Error({ error, reset }) {
  return (
    <div className={styles.component}>
      <header className={styles.header}>
        <ThemedImage alt="Journ logotype" imageName="logotype" />
      </header>
      <main className={styles.main}>
        <p className={styles.text}>Oh no! Something went wrong.</p>
        <button className={styles.button} onClick={() => reset()}>
          Retry
        </button>
      </main>
    </div>
  );
}
