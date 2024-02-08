/// imports ///
import Dashboard from "@/client-components/dashboard";
import getUserData from "@/helper-functions/get-user-data";
import getUserId from "@/helper-functions/get-user-id";
import getUserTags from "@/server-actions/get-user-tags";

/// main component ///
export default async function Home() {
  // bypass Next.js rendering unused parallel route //
  const userId = await getUserId();
  if (!userId) return;

  const userData = await getUserData();
  const userTags = await getUserTags(userData.id);

  return <Dashboard userData={userData} userTags={userTags} />;
}
