"use server";

/// imports ///
import rds from "@/database/rds";

/// main ///
export default async function getUserTags(userId) {
  return await rds.models.Tag.findAll({
    include: {
      model: rds.models.User,
      where: { id: userId },
      attributes: [],
    },
    order: [["name", "ASC"]],
    raw: true,
  });
}
