"use server";

/// imports ///
import sequelize from "@/database/sequelize";

/// main ///
export default async function getUserTags(userId) {
  return await sequelize.models.Tag.findAll({
    include: {
      model: sequelize.models.User,
      where: { id: userId },
      attributes: [],
    },
    order: [["name", "ASC"]],
    raw: true,
  });
}
