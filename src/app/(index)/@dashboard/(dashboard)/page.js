/// imports ///
import Dashboard from "./_client-components/dashboard";
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

  return <Dashboard user={user.toJSON()} userTags={userTags} />;
}
