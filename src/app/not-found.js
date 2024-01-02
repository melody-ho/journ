import Link from "next/link";
import styles from "./not-found.module.css";
import ThemedImage from "@/helper-components/themed-image";

export default function NotFound() {
  return (
    <div className={styles.component}>
      <header className={styles.header}>
        <ThemedImage alt="Journ logotype" imageName="logotype" />
      </header>
      <main className={styles.main}>
        <p className={styles.text}>Oops! This page is not available.</p>
        <Link className={styles.link} href="/">
          Back to home →
        </Link>
      </main>
    </div>
  );
}
