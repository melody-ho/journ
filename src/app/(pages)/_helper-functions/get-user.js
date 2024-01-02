/// imports ///
import getUserId from "./get-user-id";
import { headers } from "next/headers";
import rds from "@/database/rds";

/// main ///
export default async function getUser() {
  const userId = await getUserId(headers());
  return await rds.models.User.findByPk(userId, {
    attributes: { exclude: ["password", "createdAt", "updatedAt"] },
  });
}
