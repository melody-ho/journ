/// imports ///
import Entries from "./_client-components/entries";
import getUserId from "@/(authentication)/_helpers/get-user-id";
import { headers } from "next/headers";
import rds from "@/database/rds";

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

async function getUserTags(userId) {
  try {
    return await rds.models.Tag.findAll({
      include: {
        model: rds.models.User,
        where: { id: userId },
        attributes: [],
      },
      raw: true,
    });
  } catch (error) {
    // TO DO: error handling //
  }
}

/// main component ///
export default async function Home() {
  const user = await getUser();
  const userTags = await getUserTags(user.id);

  return (
    <main>
      <h1>{`${user.firstName}`}</h1>
      <form action="./sign-out" method="post">
        <button>Sign out</button>
      </form>
      <Entries userId={user.id} userTags={userTags} />
    </main>
  );
}
