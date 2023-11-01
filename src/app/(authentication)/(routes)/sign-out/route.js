import { removeTokenCookie } from "@/(authentication)/_utils/cookies";

export function POST() {
  const res = new Response(null, { status: 302 });
  removeTokenCookie(res);
  res.headers.set("Location", "/");
  return res;
}