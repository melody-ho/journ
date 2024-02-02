import Dashboard from "@/client-components/dashboard";
import getUser from "@/helper-functions/get-user";
import getUserId from "@/helper-functions/get-user-id";
import getUserTags from "@/server-actions/get-user-tags";
import { headers } from "next/headers";

export default async function Home() {
  // bypass Next.js rendering unused parallel route //
  const userId = await getUserId(headers());
  if (!userId) return;

  const user = await getUser();
  const userTags = await getUserTags(user.id);

  return <Dashboard user={user.toJSON()} userTags={userTags} />;
}
