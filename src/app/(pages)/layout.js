import getUserId from "@/app/(pages)/_helper-functions/get-user-id";
import { headers } from "next/headers";

export default async function IndexLayout({ dashboard, signIn }) {
  const authenticated = await getUserId(headers());
  return <>{authenticated ? dashboard : signIn}</>;
}
