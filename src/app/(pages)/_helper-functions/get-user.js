/// imports ///
import getUserId from "./get-user-id";
import { headers } from "next/headers";
import sequelize from "@/database/sequelize";

/// main ///
export default async function getUser() {
  const userId = await getUserId(headers());
  return await sequelize.models.User.findByPk(userId, {
    attributes: { exclude: ["password", "createdAt", "updatedAt"] },
  });
}
