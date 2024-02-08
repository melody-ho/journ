/// imports ///
import { getUserSession } from "@/(authentication)/_utils/sessions";
import { headers } from "next/headers";
import sequelize from "@/database/sequelize";

/// main ///
/**
 * Retrieves user id.
 * @returns {Promise<string>}
 */
export default async function getUserId() {
  // get session //
  const session = await getUserSession(headers());
  if (!session) return false;
  // confirm user exists //
  const userId = session.user.id;
  const userExists = await sequelize.models.User.findByPk(userId);
  if (!userExists) return false;

  return userId;
}
