"use server";

/// imports ///
import rds from "@/database/rds";

/// private ///
async function cleanUpTags(entryTags) {
  for (const entryTag of entryTags) {
    const tagId = entryTag.tagId;
    const entryCounts = await rds.models.EntryTag.count({ where: { tagId } });
    if (entryCounts === 1) {
      await rds.models.UserTag.destroy({ where: { tagId } });
      await rds.models.Tag.destroy({ where: { id: tagId } });
    }
  }
}

/// main ///
export default async function updateChanges(formData) {
  try {
    // get ids needed //
    const entryId = formData.get("id");
    const userId = formData.get("userId");

    // update entry content //
    const entry = await rds.models.Entry.findByPk(entryId);
    entry.content = formData.get("content");
    await entry.save();

    // update entry tags //
    const tags = JSON.parse(formData.get("tags"));
    const oldEntryTags = await rds.models.EntryTag.findAll({
      where: { entryId },
      raw: true,
    });
    await cleanUpTags(oldEntryTags);
    await rds.models.EntryTag.destroy({ where: { entryId } });
    tags.forEach(async (tag) => {
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
    });
  } catch (error) {
    // TO DO: error handling //
  }
}
