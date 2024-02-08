/// imports ///
import { parse, serialize } from "cookie";

/// private ///
/**
 * name of authentication token
 */
const TOKEN_NAME = "token";

/**
 * Gets cookie from request header.
 * @param {ReadonlyHeaders} headers request headers
 * @returns {Record<string, string>} parsed cookies
 */
function parseCookies(headers) {
  const cookies = headers.get("cookie");
  return parse(cookies || "");
}

/// pubic ///
/**
 * Valid duration for authentication token, in seconds.
 */
const MAX_AGE = 60 * 60 * 24 * 10; // ten days

/**
 * Gets authentication token from cookie in request header.
 * @param {ReadonlyHeaders} headers request headers
 * @returns {string} authentication token
 */
function getTokenCookie(headers) {
  const cookies = parseCookies(headers);
  return cookies[TOKEN_NAME];
}

/**
 * Removes authentication token from cookie.
 * @param {Response} res response object
 */
function removeTokenCookie(res) {
  const cookie = serialize(TOKEN_NAME, "", {
    maxAge: -1,
    path: "/",
  });

  res.headers.set("Set-Cookie", cookie);
}

/**
 * Adds authentication token to cookie.
 * @param {Response} res response object
 * @param {string} token authentication token
 */
function setTokenCookie(res, token) {
  const cookie = serialize(TOKEN_NAME, token, {
    expires: new Date(Date.now() + MAX_AGE * 1000),
    httpOnly: true,
    maxAge: MAX_AGE,
    path: "/",
  });

  res.headers.set("Set-Cookie", cookie);
}

/// exports ///
export { getTokenCookie, MAX_AGE, removeTokenCookie, setTokenCookie };
