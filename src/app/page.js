/// imports ///
import Entries from "./_components/entries";
import getUserId from "./(authentication)/_helpers/get-user-id";
import { headers } from "next/headers";
import rds from "@/database/rds";
import styles from "./page.module.css";

/// private ///
async function getUser() {
  const userId = await getUserId(headers());
  try {
    return await rds.models.User.findByPk(userId, {
      attributes: { exclude: ["password", "createdAt", "updatedAt"] },
    });
  } catch (error) {
    // TO DO: error handling //
  }
}

async function getEntryTotal(userId) {
  try {
    return await rds.models.Entry.count({ where: { userId } });
  } catch (error) {
    // TO DO: error handling //
  }
}

/// main component ///
export default async function Home() {
  const user = await getUser();
  const totalEntries = await getEntryTotal(user.id);

  return (
    <main className={styles.main}>
      <h1>{`${user.firstName}`}</h1>
      <Entries userId={user.id} totalEntries={totalEntries} />
    </main>
  );
}
