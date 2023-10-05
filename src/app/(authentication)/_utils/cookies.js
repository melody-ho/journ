/// imports ///
import { serialize } from "cookie";

/// private ///
const TOKEN_NAME = "token";

/// pubic ///
const MAX_AGE = 60 * 60 * 24 * 10; // ten days

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
export { MAX_AGE, setTokenCookie };
