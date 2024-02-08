/// imports ///
import getUserId from "@/helper-functions/get-user-id";
import Loading from "./loading";
import { Suspense } from "react";

/// main component ///
export default async function IndexLayout({ dashboard, signIn }) {
  const authenticated = await getUserId();
  return (
    <Suspense fallback={<Loading />}>
      {authenticated ? dashboard : signIn}
    </Suspense>
  );
}
