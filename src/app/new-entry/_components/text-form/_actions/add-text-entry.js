"use server";

import rds from "@/database/rds";

export default async function addTextEntry(formData) {
  const content = formData.get("text");
  const userId = formData.get("user");
  try {
    await rds.models.Entry.create({
      type: "text",
      content,
      userId,
    });
  } catch (error) {
    // TO DO: error handling //
  }
}
