import Link from "next/link";
import SignInForm from "./_client-components/sign-in-form";
import styles from "./page.module.css";
import ThemedImage from "@/app/_helper-components/themed-image";

export default function SignIn() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.logotypeImageContainer}>
          <ThemedImage alt="Journ" imageName="logotype" position="left" />
        </div>
      </header>
      <main className={styles.main}>
        <section className={styles.taglineSection}>
          <p className={styles.tagline}>Your journal. Your journey.</p>
        </section>
        <section className={styles.signInSection}>
          <div className={styles.signInBox}>
            <h1 className={styles.signInHeading}>Sign In</h1>
            <SignInForm />
            <p className={styles.newAccount}>
              New to Journ?
              <Link className={styles.newAccountLink} href="./new-account">
                Sign up
              </Link>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
