/// imports ///
import { getUserSession } from "@/(authentication)/_utils/sessions";
import rds from "@/database/rds";

/// main ///
export default async function getUserId(headers) {
  // get session //
  const session = await getUserSession(headers);
  if (!session) return false;
  // confirm user exists //
  const userId = session.user.id;
  const userExists = await rds.models.User.findByPk(userId);
  if (!userExists) return false;

  return userId;
}
