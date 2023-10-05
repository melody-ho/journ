/// imports ///
import Iron from "@hapi/iron";
import { getTokenCookie, MAX_AGE, setTokenCookie } from "./cookies";

/// private ///
const TOKEN_SECRET = process.env.TOKEN_SECRET;

/// public ///
async function getUserSession(headers) {
  const token = getTokenCookie(headers);
  if (!token) return false;
  const session = await Iron.unseal(token, TOKEN_SECRET, Iron.defaults);
  const expiration = session.createdAt + session.maxAge * 1000;
  if (Date.now() > expiration) return false;
  return session;
}

async function setUserSession(res, user) {
  const createdAt = Date.now();
  const obj = { user: { id: user.id }, createdAt, maxAge: MAX_AGE };
  const token = await Iron.seal(obj, TOKEN_SECRET, Iron.defaults);

  setTokenCookie(res, token);
}

/// exports ///
export { getUserSession, setUserSession };
