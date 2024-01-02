import getUserId from "@/helper-functions/get-user-id";
import { headers } from "next/headers";
import Loading from "./loading";
import { Suspense } from "react";

export default async function IndexLayout({ dashboard, signIn }) {
  const authenticated = await getUserId(headers());
  return (
    <Suspense fallback={<Loading />}>
      {authenticated ? dashboard : signIn}
    </Suspense>
  );
}
