/// imports ///
import getUserId from "./(authentication)/_helpers/get-user-id";
import { headers } from "next/headers";
import rds from "@/database/rds";
import styles from "./page.module.css";

/// private ///
async function getUserData() {
  const userId = await getUserId(headers());
  try {
    const user = await rds.models.User.findByPk(userId, {
      attributes: { exclude: ["password", "createdAt", "updatedAt"] },
    });
    return user;
  } catch (error) {
    // TO DO: error handling //
  }
}

/// main component ///
export default async function Home() {
  const user = await getUserData();

  return <main className={styles.main}>{`Hi, ${user.firstName}!`}</main>;
}
