"use client";

/// imports ///
import "./globals.css";
import fonts from "./_fonts";
import styles from "./global-error.module.css";
import ThemedImage from "@/helper-components/themed-image";

/// metadata ///
export const metadata = {
  title: "Journ",
  description: "Your journal. Your journey.",
};

/// fonts ///
const fontVariables = [];
for (const font of Object.values(fonts)) {
  fontVariables.push(font.variable);
}
const fontVariablesString = fontVariables.join(" ");

/// main component ///
export default function GlobalError({ error, reset }) {
  return (
    <html className={fontVariablesString} lang="en">
      <body className={styles.body}>
        <header className={styles.header}>
          <ThemedImage alt="Journ logotype" imageName="logotype" />
        </header>
        <main className={styles.main}>
          <p className={styles.text}>Oh no! Something went wrong.</p>
          <button className={styles.button} onClick={() => reset()}>
            Retry
          </button>
        </main>
      </body>
    </html>
  );
}
