/// imports ///
import argon2 from "argon2";
import sequelize from "@/database/sequelize";
import { setUserSession } from "@/app/(api)/(authentication)/_utils/sessions";

/// route ///
export async function POST(req) {
  // get form data //
  const formData = await req.formData();
  const username = formData.get("username");
  const password = formData.get("password");
  try {
    // confirm authentication //
    const user = await sequelize.models.User.findOne({
      where: { username: username },
    });
    if (!user) throw new Error("invalid credentials");
    const authorized = await argon2.verify(user.password, password);
    if (!authorized) throw new Error("invalid credentials");
    // respond to successful authentication //
    const res = new Response(null, { status: 302 });
    await setUserSession(res, user.id);
    res.headers.set("Location", "/");
    return res;
  } catch (error) {
    // handle errors //
    if (error.message === "invalid credentials") {
      return new Response("invalid credentials", { status: 401 });
    } else {
      return new Response("server error", { status: 500 });
    }
  }
}
