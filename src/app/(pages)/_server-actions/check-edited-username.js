"use server";

/// imports ///
import rds from "@/database/rds";

/// main ///
export default async function checkEditedUsername(
  state,
  { newUsername, oldUsername },
) {
  if (newUsername === oldUsername) {
    return null;
  } else {
    try {
      const user = await rds.models.User.findOne({
        attributes: ["username"],
        where: { username: newUsername },
      });
      return user ? "Username unavailable." : null;
    } catch (error) {
      return "Network error when checking availability.";
    }
  }
}
