import NewAccountForm from "./_client-components/new-account-form";
import styles from "./page.module.css";
import ThemedImage from "@/app/_helper-components/themed-image";

export default function NewAccount() {
  return (
    <div className={styles.page}>
      <header className={styles.logotype}>
        <ThemedImage
          alt="Journ Logotype"
          imageName="logotype"
          position="left"
        />
      </header>
      <main className={styles.main}>
        <h1 className={styles.heading}>New Account</h1>
        <NewAccountForm />
      </main>
    </div>
  );
}
