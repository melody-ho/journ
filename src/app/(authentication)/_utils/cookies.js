/// imports ///
import { parse, serialize } from "cookie";

/// private ///
const TOKEN_NAME = "token";

function parseCookies(headers) {
  const cookies = headers.get("cookie");
  return parse(cookies || "");
}

/// pubic ///
const MAX_AGE = 60 * 60 * 24 * 10; // ten days

function getTokenCookie(headers) {
  const cookies = parseCookies(headers);
  return cookies[TOKEN_NAME];
}

function removeTokenCookie(res) {
  const cookie = serialize(TOKEN_NAME, "", {
    maxAge: -1,
    path: "/",
  });

  res.headers.set("Set-Cookie", cookie);
}

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
