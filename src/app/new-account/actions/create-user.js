"use server";

import argon2 from "argon2";
import rds from "@/database/rds";

export default async function createUser(formData) {
  // TO DO: server-side validation of form data //
  try {
    const passwordHash = await argon2.hash(formData.get("password"));
    const newUser = rds.models.User.build({
      username: formData.get("username"),
      password: passwordHash,
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
    });
    await newUser.save();
  } catch (error) {
    // TO DO: handle errors //
  }
}
