"use server";

/// imports ///
import rds from "@/database/rds";
import { revalidatePath } from "next/cache";

/// private ///
const MAX_TAG_LENGTH = 50;

/// main ///
export default async function addTextEntry(formData) {
  // get data
  const content = formData.get("text");
  const userId = formData.get("user");
  const tagNames = JSON.parse(formData.get("tags"));
  // check for empty input
  if (content === "") return "empty";
  try {
    // add entry to database
    const entry = await rds.models.Entry.create({
      type: "text",
      content,
      userId,
    });
    for (const tagName of tagNames) {
      const validatedTagName = tagName
        .split(" ")
        .join("")
        .slice(0, MAX_TAG_LENGTH);
      const [tag, created] = await rds.models.Tag.findOrCreate({
        where: { name: validatedTagName },
      });
      await rds.models.UserTag.findOrCreate({
        where: { userId, tagId: tag.id },
      });
      await rds.models.EntryTag.findOrCreate({
        where: { entryId: entry.id, tagId: tag.id },
      });
    }
    revalidatePath("/");
    return "success";
  } catch (error) {
    return "error";
    // TO DO: error handling //
  }
}
