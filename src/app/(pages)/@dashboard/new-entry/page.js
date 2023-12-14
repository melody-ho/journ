import getUserId from "@/helper-functions/get-user-id";
import getUserTags from "@/server-actions/get-user-tags";
import { headers } from "next/headers";
import NewEntryForms from "@/client-components/new-entry-forms";
import styles from "./page.module.css";
import ThemedImage from "@/helper-components/themed-image";

export default async function NewEntry() {
  const user = await getUserId(headers());
  const userTags = await getUserTags(user);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <ThemedImage alt="Journ Logo" imageName="logo" />
        </div>
        <h1 className={styles.heading}>New Entry</h1>
      </header>
      <main className={styles.main}>
        <NewEntryForms user={user} userTags={userTags} />
      </main>
    </div>
  );
}
