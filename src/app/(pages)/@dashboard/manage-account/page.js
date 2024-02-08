/// imports ///
import getUserData from "@/helper-functions/get-user-data";
import Link from "next/link";
import ManageAccountForm from "@/client-components/manage-account-form";
import styles from "./page.module.css";
import ThemedImage from "@/helper-components/themed-image";

/// main component ///
export default async function ManageAccount() {
  const userData = await getUserData();

  return (
    <div className={styles.page}>
      <header className={styles.logotype}>
        <Link aria-label="Return to dashboard" href="/">
          <ThemedImage alt="Journ Logotype" imageName="logotype" />
        </Link>
      </header>
      <main className={styles.main}>
        <h1 className={styles.heading}>Manage Account</h1>
        <ManageAccountForm userData={userData} />
      </main>
    </div>
  );
}
