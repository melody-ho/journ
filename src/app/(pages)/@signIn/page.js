/// imports ///
import Link from "next/link";
import SignInForm from "@/client-components/sign-in-form";
import styles from "./page.module.css";
import ThemedImage from "@/helper-components/themed-image";

/// main component ///
export default function SignIn() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={`${styles.logotypeContainer} ${styles.desktopOnly}`}>
          <ThemedImage alt="Journ" imageName="logotype" />
        </div>
        <div className={`${styles.logotypeContainer} ${styles.mobileOnly}`}>
          <ThemedImage alt="Journ" imageName="logotype" />
        </div>
      </header>
      <main className={styles.main}>
        <section className={`${styles.taglineSection} ${styles.desktopOnly}`}>
          <p className={styles.tagline}>Your journal. Your journey.</p>
        </section>
        <section className={styles.signInSection}>
          <div className={styles.signInBox}>
            <h1 className={styles.signInHeading}>Sign In</h1>
            <SignInForm />
            <p className={styles.newAccountCta}>
              New to Journ?
              <Link className={styles.newAccountLink} href="./new-account">
                Sign up
              </Link>
            </p>
          </div>
        </section>
        <section className={`${styles.taglineSection} ${styles.mobileOnly}`}>
          <p className={styles.tagline}>Your journal. Your journey.</p>
        </section>
      </main>
    </div>
  );
}
