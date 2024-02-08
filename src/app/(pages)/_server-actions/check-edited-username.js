"use server";

/// imports ///
import sequelize from "@/database/sequelize";

/// main ///
/**
 * Checks availability of edited username.
 * @param {*} state created from useFormState and will be set to return value of this function
 * @param {Object} usernames
 * @param {string} usernames.newUsername new username
 * @param {string} usernames.oldUsername current username
 * @returns {Promise<"Username unavailable." | "Network error when checking availability." | null>} message indicating result, null if no change or available
 */
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
