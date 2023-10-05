/// imports ///
import { getUserSession } from "./(authentication)/_utils/sessions";
import { headers } from "next/headers";
import rds from "@/database/rds";
import { redirect } from "next/navigation";
import styles from "./page.module.css";

/// private ///
async function getUserId() {
  const reqHeaders = headers();
  const session = await getUserSession(reqHeaders);
  if (!session) redirect("/sign-in");
  return session.user.id;
}

async function getUserData() {
  const userId = await getUserId();
  try {
    const user = await rds.models.User.findByPk(userId, {
      attributes: { exclude: ["password", "createdAt", "updatedAt"] },
    });
    // TO DO: handle if user not found //
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
