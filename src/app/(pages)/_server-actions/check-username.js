"use server";

/// imports ///
import rds from "@/database/rds";

/// main ///
export default async function checkUsername(state, username) {
  try {
    const user = await rds.models.User.findOne({
      attributes: ["username"],
      where: { username: username },
    });
    return user ? "Username unavailable." : null;
  } catch (error) {
    return "Network error when checking availability.";
  }
}
