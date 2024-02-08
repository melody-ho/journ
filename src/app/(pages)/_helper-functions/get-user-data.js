/// imports ///
import getUserId from "./get-user-id";
import sequelize from "@/database/sequelize";

/// main ///
/**
 * Retrieves user data.
 * @returns {Promise<{id: string, username: string, firstName: string, lastName: string}>}
 */
export default async function getUserData() {
  const userId = await getUserId();
  return await sequelize.models.User.findByPk(userId, {
    attributes: { exclude: ["password", "createdAt", "updatedAt"] },
    raw: true,
  });
}
