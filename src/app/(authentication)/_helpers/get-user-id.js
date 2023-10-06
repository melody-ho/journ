import { getUserSession } from "../_utils/sessions";
import { redirect } from "next/navigation";

export default async function getUserId(headers) {
  const session = await getUserSession(headers);
  if (!session) redirect("/sign-in");
  return session.user.id;
}
