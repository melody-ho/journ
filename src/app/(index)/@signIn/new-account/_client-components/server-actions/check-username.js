"use server";

import rds from "@/database/rds";

export default async function checkUsername(state, username) {
  const user = await rds.models.User.findOne({
    attributes: ["username"],
    where: { username: username },
  });
  return user ? "Username unavailable." : null;
}
