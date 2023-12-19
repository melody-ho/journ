/// imports ///
import rds from "@/database/rds";

/// main ///
export default async function cleanUpTags(entryId) {
  const entryTags = await rds.models.EntryTag.findAll({
    where: { entryId },
    raw: true,
  });
  for (const entryTag of entryTags) {
    const tagId = entryTag.tagId;
    const entryCounts = await rds.models.EntryTag.count({ where: { tagId } });
    if (entryCounts === 1) {
      await rds.models.UserTag.destroy({ where: { tagId } });
      await rds.models.Tag.destroy({ where: { id: tagId } });
    }
  }
  await rds.models.EntryTag.destroy({ where: { entryId } });
}
