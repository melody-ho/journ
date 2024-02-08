/// imports ///
import Iron from "@hapi/iron";
import { getTokenCookie, MAX_AGE, setTokenCookie } from "./cookies";

/// private ///
/**
 * Secret for encrypting/decrypting authentication token, needs to be provided in environment variables as TOKEN_SECRET.
 */
const TOKEN_SECRET = process.env.TOKEN_SECRET;

/// public ///
/**
 * Gets user session from request headers.
 * @param {ReadonlyHeaders} headers request headers
 * @returns {Promise<{user: {id: string}, createdAt: Date, maxAge: number}>} session object
 */
async function getUserSession(headers) {
  const token = getTokenCookie(headers);
  if (!token) return false;
  const session = await Iron.unseal(token, TOKEN_SECRET, Iron.defaults);
  const expiration = session.createdAt + session.maxAge * 1000;
  if (Date.now() > expiration) return false;
  return session;
}

/**
 * Sets user session given response object and user id.
 * @param {Response} res response object
 * @param {string} userId user id
 */
async function setUserSession(res, userId) {
  const createdAt = Date.now();
  const obj = { user: { id: userId }, createdAt, maxAge: MAX_AGE };
  const token = await Iron.seal(obj, TOKEN_SECRET, Iron.defaults);

  setTokenCookie(res, token);
}

/// exports ///
export { getUserSession, setUserSession };
