import Dashboard from "../_client-components/dashboard";
import getUser from "../_helper-functions/get-user";
import getUserTags from "../_server-actions/get-user-tags";

export default async function Home() {
  const user = await getUser();
  const userTags = await getUserTags(user.id);

  return <Dashboard user={user.toJSON()} userTags={userTags} />;
}
