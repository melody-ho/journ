/// imports ///
import { removeTokenCookie } from "@/app/(api)/(authentication)/_utils/cookies";

/// route ///
export function POST() {
  const res = new Response(null, { status: 302 });
  removeTokenCookie(res);
  res.headers.set("Location", "/");
  return res;
}
