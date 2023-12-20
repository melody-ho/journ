"use server";

/// imports ///
import rds from "@/database/rds";

/// private ///
const MAX_TAG_LENGTH = 50;

/// main ///
export default async function updateEntryChanges(formData) {
  try {
    const updateStatus = await rds.transaction(
      async function updateEntryInDatabase(t) {
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
        await entry.save({ transaction: t });

        // update entry tags //
        const tags = JSON.parse(formData.get("tags"));
        // clean up tags
        const entryTags = await rds.models.EntryTag.findAll({
          where: { entryId },
          raw: true,
        });
        for (const entryTag of entryTags) {
          const tagId = entryTag.tagId;
          const entryCounts = await rds.models.EntryTag.count({
            where: { tagId },
          });
          if (entryCounts === 1) {
            await rds.models.UserTag.destroy({
              where: { tagId },
              transaction: t,
            });
            await rds.models.Tag.destroy({
              where: { id: tagId },
              transaction: t,
            });
          }
        }
        await rds.models.EntryTag.destroy({
          where: { entryId },
          transaction: t,
        });
        // add tags
        for (const tag of tags) {
          const validatedTagName = tag
            .split(" ")
            .join("")
            .slice(0, MAX_TAG_LENGTH);
          const [tagData, created] = await rds.models.Tag.findOrCreate({
            where: { name: validatedTagName },
            transaction: t,
          });
          await rds.models.UserTag.findOrCreate({
            where: { userId, tagId: tagData.id },
            transaction: t,
          });
          await rds.models.EntryTag.findOrCreate({
            where: {
              entryId,
              tagId: tagData.id,
            },
            transaction: t,
          });
        }
        return "success";
      },
    );
    return updateStatus;
  } catch (error) {
    return "error";
  }
}
