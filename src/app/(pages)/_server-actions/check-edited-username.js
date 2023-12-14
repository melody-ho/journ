"use server";

import rds from "@/database/rds";

export default async function checkEditedUsername(
  state,
  { newUsername, oldUsername },
) {
  if (newUsername === oldUsername) {
    return null;
  } else {
    const user = await rds.models.User.findOne({
      attributes: ["username"],
      where: { username: newUsername },
    });
    return user ? "Username unavailable." : null;
  }
}
