import getUser from "@/helper-functions/get-user";
import ManageAccountForm from "@/client-components/manage-account-form";
import styles from "./page.module.css";
import ThemedImage from "@/helper-components/themed-image";

export default async function ManageAccount() {
  const userData = await getUser();

  return (
    <div className={styles.page}>
      <header className={styles.logotype}>
        <ThemedImage alt="Journ Logotype" imageName="logotype" />
      </header>
      <main className={styles.main}>
        <h1 className={styles.heading}>Manage Account</h1>
        <ManageAccountForm userData={userData.dataValues} />
      </main>
    </div>
  );
}
