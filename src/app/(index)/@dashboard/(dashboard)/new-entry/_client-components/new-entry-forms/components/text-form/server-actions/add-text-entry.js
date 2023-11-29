"use server";

import rds from "@/database/rds";
import { revalidatePath } from "next/cache";

export default async function addTextEntry(formData) {
  const content = formData.get("text");
  const userId = formData.get("user");
  const tagNames = JSON.parse(formData.get("tags"));
  if (content === "") return "empty";
  try {
    const entry = await rds.models.Entry.create({
      type: "text",
      content,
      userId,
    });
    tagNames.forEach(async (tagName) => {
      const [tag, created] = await rds.models.Tag.findOrCreate({
        where: { name: tagName },
      });
      await rds.models.UserTag.findOrCreate({
        where: { userId, tagId: tag.id },
      });
      await rds.models.EntryTag.create({
        entryId: entry.id,
        tagId: tag.id,
      });
    });
    revalidatePath("/");
    return "success";
  } catch (error) {
    return "error";
    // TO DO: error handling //
  }
}
