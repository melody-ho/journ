import { getUserSession } from "../_utils/sessions";
import rds from "@/database/rds";
import { redirect } from "next/navigation";

export default async function getUserId(headers) {
  // get session //
  const session = await getUserSession(headers);
  if (!session) redirect("/sign-in");
  // confirm user exists //
  const userId = session.user.id;
  const userExists = await rds.models.User.findByPk(userId);
  if (!userExists) redirect("/sign-in");

  return userId;
}
