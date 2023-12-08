import getUserId from "./get-user-id";
import { headers } from "next/headers";
import rds from "@/database/rds";

export default async function getUser() {
  const userId = await getUserId(headers());
  try {
    return await rds.models.User.findByPk(userId, {
      attributes: { exclude: ["password", "createdAt", "updatedAt"] },
    });
  } catch (error) {
    // TO DO: error handling //
  }
}
