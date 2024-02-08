"use server";

/// imports ///
import argon2 from "argon2";
import sequelize from "@/database/sequelize";

/// main ///
/**
 * Authorizes credentials given username and password.
 * @param {*} formState created from useFormState and will be set to return value of this function
 * @param {FormData} formData includes username and password
 * @returns {Promise<"invalid" | "error" | "success">} "invalid" if invalid credentials, "error" if an error occurs, "success" if successful authentication
 */
export default async function authCredentials(formState, formData) {
  const username = formData.get("username");
  const password = formData.get("password");
  try {
    const user = await sequelize.models.User.findOne({
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
