"use server";

/// imports ///
import sequelize from "@/database/sequelize";

/// main ///
export default async function checkUsername(state, username) {
  try {
    const user = await sequelize.models.User.findOne({
      attributes: ["username"],
      where: { username: username },
    });
    return user ? "Username unavailable." : null;
  } catch (error) {
    return "Network error when checking availability.";
  }
}
