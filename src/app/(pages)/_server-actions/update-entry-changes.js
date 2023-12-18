"use server";

import cleanUpTags from "./clean-up-tags";
import rds from "@/database/rds";

export default async function updateEntryChanges(formData) {
  try {
    // get ids needed //
    const entryId = formData.get("id");
    const userId = formData.get("userId");

    // get entry //
    const entry = await rds.models.Entry.findByPk(entryId);

    // check for empty text entry //
    if (entry.type === "text" && formData.get("content") === "") {
      return "empty";
    }

    // udpate entry content //
    entry.content = formData.get("content");
    await entry.save();

    // update entry tags //
    const tags = JSON.parse(formData.get("tags"));
    await cleanUpTags(entryId);
    for (const tag of tags) {
      const [tagData, created] = await rds.models.Tag.findOrCreate({
        where: { name: tag },
      });
      await rds.models.UserTag.findOrCreate({
        where: { userId, tagId: tagData.id },
      });
      await rds.models.EntryTag.create({
        entryId,
        tagId: tagData.id,
      });
    }

    return "success";
  } catch (error) {
    // TO DO: error handling //
  }
}
