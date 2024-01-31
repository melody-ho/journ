"use server";

/// imports ///
import sequelize from "@/database/sequelize";

/// main ///
export default async function checkEditedUsername(
  state,
  { newUsername, oldUsername },
) {
  if (newUsername === oldUsername) {
    return null;
  } else {
    try {
      const user = await sequelize.models.User.findOne({
        attributes: ["username"],
        where: { username: newUsername },
      });
      return user ? "Username unavailable." : null;
    } catch (error) {
      return "Network error when checking availability.";
    }
  }
}
