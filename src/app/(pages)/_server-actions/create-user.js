"use server";

/// imports ///
import argon2 from "argon2";
import sequelize from "@/database/sequelize";
import z from "zod";

/// main ///
/**
 * Creates new user in database given firstName, lastName, username, password, and confirmPassword.
 * @param {FormData} formData includes firstName, lastName, username, password, and confirmPassword
 * @returns {Promise<"error" | "success">} "error" if failed to create, "success" if created successfully
 */
export default async function createUser(formData) {
  // define form validation schemas
  const confirmPasswordSchema = z.literal(formData.get("password"));
  const userSchema = z.object({
    username: z
      .string()
      .min(6)
      .max(255)
      .regex(new RegExp("^[a-z0-9][a-z0-9_.]+[a-z0-9]$")),
    password: z.string().min(6).max(255),
    firstName: z.string().min(1),
    lastName: z.string(),
  });
  try {
    // validate form
    const password = confirmPasswordSchema.parse(
      formData.get("confirmPassword"),
    );
    const validatedData = userSchema.parse({
      username: formData.get("username"),
      password: password,
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
    });
    // hash password
    const passwordHash = await argon2.hash(validatedData.password);
    // add user to database
    const newUser = sequelize.models.User.build({
      username: validatedData.username,
      password: passwordHash,
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
    });
    await newUser.save();
    return "success";
  } catch (error) {
    return "error";
  }
}
