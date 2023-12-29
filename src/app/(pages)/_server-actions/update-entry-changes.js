"use server";

/// imports ///
import { Op } from "sequelize";
import rds from "@/database/rds";

/// private ///
const MAX_TAG_LENGTH = 50;

/// main ///
export default async function updateEntryChanges(formData) {
  try {
    const updateStatus = await rds.transaction(
      async function updateEntryInDatabase(t) {
        // get ids needed //
        const userId = formData.get("userId");
        const entryId = formData.get("id");

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
        // get data
        const prevTags = JSON.parse(formData.get("prevTags"));
        const newTags = JSON.parse(formData.get("newTags"));
        // get entry tags removed/added
        const tagsRemoved = prevTags.filter(
          (prevTag) => !newTags.includes(prevTag),
        );
        const tagsAdded = newTags.filter(
          (newTag) => !prevTags.includes(newTag),
        );
        // clean up tags removed
        for (const tagRemoved of tagsRemoved) {
          const tag = await rds.models.Tag.findOne({
            attributes: ["id"],
            where: { name: tagRemoved },
            raw: true,
          });
          const tagId = tag.id;
          const userEntries = await rds.models.Entry.findAll({
            attributes: ["id"],
            where: { userId },
            raw: true,
          });
          const userEntriesIds = userEntries.map((userEntry) => userEntry.id);
          const userEntryCounts = await rds.models.EntryTag.count({
            where: { tagId, entryId: { [Op.in]: userEntriesIds } },
          });
          const userCounts = await rds.models.UserTag.count({
            where: { tagId },
          });
          if (userEntryCounts === 1) {
            await rds.models.UserTag.destroy({
              where: { userId, tagId },
              transaction: t,
            });
            if (userCounts === 1) {
              await rds.models.Tag.destroy({
                where: { id: tagId },
                transaction: t,
              });
            }
          }
          await rds.models.EntryTag.destroy({
            where: { entryId, tagId },
            transaction: t,
          });
        }
        // add tags added
        for (const tagAdded of tagsAdded) {
          const validatedTagName = tagAdded
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
          await rds.models.EntryTag.create(
            { entryId, tagId: tagData.id },
            { transaction: t },
          );
        }
        return "success";
      },
    );
    return updateStatus;
  } catch (error) {
    return "error";
  }
}
