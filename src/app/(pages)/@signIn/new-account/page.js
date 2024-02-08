/// imports ///
import Link from "next/link";
import NewAccountForm from "@/client-components/new-account-form";
import styles from "./page.module.css";
import ThemedImage from "@/helper-components/themed-image";

/// main component ///
export default function NewAccount() {
  return (
    <div className={styles.page}>
      <header className={styles.logotype}>
        <Link aria-label="Return to sign-in page" href="/">
          <ThemedImage alt="Journ Logotype" imageName="logotype" />
        </Link>
      </header>
      <main className={styles.main}>
        <h1 className={styles.heading}>New Account</h1>
        <NewAccountForm />
      </main>
    </div>
  );
}
