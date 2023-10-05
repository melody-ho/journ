/// imports ///
import { getUserSession } from "./(authentication)/_utils/sessions";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import styles from "./page.module.css";

/// private ///
async function getUser() {
  const reqHeaders = headers();
  const session = await getUserSession(reqHeaders);
  if (!session) redirect("/sign-in");
  return session.user;
}

/// main component ///
export default async function Home() {
  const user = await getUser();

  return <main className={styles.main}>{user.id}</main>;
}
