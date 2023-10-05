/// imports ///
import Iron from "@hapi/iron";
import { MAX_AGE, setTokenCookie } from "./cookies";

/// private ///
const TOKEN_SECRET = process.env.TOKEN_SECRET;

/// public ///
async function setUserSession(res, user) {
  const createdAt = Date.now();
  const obj = { user: { ...user }, createdAt, maxAge: MAX_AGE };
  const token = await Iron.seal(obj, TOKEN_SECRET, Iron.defaults);

  setTokenCookie(res, token);
}

/// exports ///
export { setUserSession };
