"use server";

/// imports ///
import sequelize from "@/database/sequelize";

/// main ///
/**
 * Retrieves user's tags.
 * @param {string} userId
 * @returns {Promise<Array.<{id: string, name: string}>>}
 */
export default async function getUserTags(userId) {
  return await sequelize.models.Tag.findAll({
    attributes: ["id", "name"],
    include: {
      model: sequelize.models.User,
      where: { id: userId },
      attributes: [],
    },
    order: [["name", "ASC"]],
    raw: true,
  });
}
