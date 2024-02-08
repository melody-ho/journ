"use server";

/// imports ///
import sequelize from "@/database/sequelize";

/// main ///
/**
 * Checks username availability.
 * @param {*} state created from useFormState and will be set to return value of this function
 * @param {string} username
 * @returns {Promise<"Username unavailable." | "Network error when checking availability." | null>} message indicating result, null if available
 */
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
