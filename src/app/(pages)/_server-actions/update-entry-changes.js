"use server";

/// imports ///
import { Op } from "sequelize";
import sequelize from "@/database/sequelize";

/// private ///
/**
 * Maximum character length for tags.
 */
const MAX_TAG_LENGTH = 50;

/// main ///
/**
 * Updates entry in database given userId, id, content, prevTags, and newTags.
 * @param {FormData} formData includes userId, id, content, prevTags, and newTags
 * @returns {Promise<"empty" | "error" | "success">} "empty" if attempted empty text entry, "error" if failed to update, "success" if updated successfully
 */
export default async function updateEntryChanges(formData) {
  try {
    const updateStatus = await sequelize.transaction(
      async function updateEntryInDatabase(t) {
        // get ids needed //
        const userId = formData.get("userId");
        const entryId = formData.get("id");

        // get entry //
        const entry = await sequelize.models.Entry.findByPk(entryId);

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
          const tag = await sequelize.models.Tag.findOne({
            attributes: ["id"],
            where: { name: tagRemoved },
            raw: true,
          });
          const tagId = tag.id;
          const userEntries = await sequelize.models.Entry.findAll({
            attributes: ["id"],
            where: { userId },
            raw: true,
          });
          const userEntriesIds = userEntries.map((userEntry) => userEntry.id);
          const userEntryCounts = await sequelize.models.EntryTag.count({
            where: { tagId, entryId: { [Op.in]: userEntriesIds } },
          });
          const userCounts = await sequelize.models.UserTag.count({
            where: { tagId },
          });
          await sequelize.models.EntryTag.destroy({
            where: { entryId, tagId },
            transaction: t,
          });
          if (userEntryCounts === 1) {
            await sequelize.models.UserTag.destroy({
              where: { userId, tagId },
              transaction: t,
            });
            if (userCounts === 1) {
              await sequelize.models.Tag.destroy({
                where: { id: tagId },
                transaction: t,
              });
            }
          }
        }
        // add tags added
        for (const tagAdded of tagsAdded) {
          const validatedTagName = tagAdded
            .split(" ")
            .join("")
            .slice(0, MAX_TAG_LENGTH);
          const [tagData, created] = await sequelize.models.Tag.findOrCreate({
            where: { name: validatedTagName },
            transaction: t,
          });
          await sequelize.models.UserTag.findOrCreate({
            where: { userId, tagId: tagData.id },
            transaction: t,
          });
          await sequelize.models.EntryTag.create(
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
