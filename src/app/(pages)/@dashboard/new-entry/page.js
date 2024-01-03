import getUserId from "@/helper-functions/get-user-id";
import getUserTags from "@/server-actions/get-user-tags";
import { headers } from "next/headers";
import Link from "next/link";
import NewEntryForms from "@/client-components/new-entry-forms";
import styles from "./page.module.css";
import ThemedImage from "@/helper-components/themed-image";

export default async function NewEntry() {
  const user = await getUserId(headers());
  const userTags = await getUserTags(user);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link aria-label="Return to dashboard" className={styles.logo} href="/">
          <ThemedImage alt="Journ Logo" imageName="logo" />
        </Link>
        <h1 className={styles.heading}>New Entry</h1>
      </header>
      <main className={styles.main}>
        <NewEntryForms user={user} userTags={userTags} />
      </main>
    </div>
  );
}
