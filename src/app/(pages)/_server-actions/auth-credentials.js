"use server";

/// imports ///
import argon2 from "argon2";
import rds from "@/database/rds";

/// main ///
export default async function authCredentials(formState, formData) {
  const username = formData.get("username");
  const password = formData.get("password");
  try {
    const user = await rds.models.User.findOne({
      where: { username: username },
    });
    if (!user) return "invalid";
    const authorized = await argon2.verify(user.password, password);
    if (!authorized) return "invalid";
    return "success";
  } catch (error) {
    return "error";
  }
}
