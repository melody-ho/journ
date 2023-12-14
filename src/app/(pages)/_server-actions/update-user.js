"use server";

/// Imports ///
import argon2 from "argon2";
import rds from "@/database/rds";
import { revalidatePath } from "next/cache";
import z from "zod";

/// Private ///
async function authorize(user, password) {
  try {
    if (!user) return "error";
    const authorized = await argon2.verify(user.password, password);
    if (!authorized) return "invalid";
    return "success";
  } catch (error) {
    return "error";
  }
}

/// Main ///
export default async function updateUser(formData) {
  // get user
  const userId = formData.get("userId");
  const user = await rds.models.User.findByPk(userId);
  // authorize with current password
  const currentPassword = formData.get("currentPassword");
  const authStatus = await authorize(user, currentPassword);
  if (authStatus === "success") {
    // declare validation schema
    const userSchema = z.object({
      username: z
        .string()
        .min(6)
        .max(255)
        .regex(new RegExp("^[a-z0-9][a-z0-9_.]+[a-z0-9]$")),
      firstName: z.string().min(1),
      lastName: z.string(),
    });
    try {
      // validate form data
      const validatedData = userSchema.parse({
        username: formData.get("username"),
        firstName: formData.get("firstName"),
        lastName: formData.get("lastName"),
      });
      // update user
      user.firstName = validatedData.firstName;
      user.lastName = validatedData.lastName;
      user.username = validatedData.username;

      if (formData.get("newPassword")) {
        //validate password
        const confirmPasswordSchema = z.literal(formData.get("newPassword"));
        const passwordSchema = z.string().min(6).max(255);
        const password = confirmPasswordSchema.parse(
          formData.get("confirmNewPassword"),
        );
        const validatedPassword = passwordSchema.parse(password);
        // hash password
        const passwordHash = await argon2.hash(validatedPassword);
        // update password
        user.password = passwordHash;
      }
      // apply changes
      await user.save();
      revalidatePath("/");
      return "success";
    } catch (error) {
      // handle update errors
      return "error";
    }
  } else {
    // handle authorization errors
    return authStatus;
  }
}
