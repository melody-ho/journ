"use server";

/// imports ///
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import rds from "@/database/rds";
import s3 from "@/database/s3";

/// private ///
const S3_BUCKET = process.env.S3_BUCKET;

/// main ///
export default async function deleteEntry(id) {
  try {
    await rds.transaction(async function deleteEntryFromDatabase(t) {
      // clean up tags
      const entryTags = await rds.models.EntryTag.findAll({
        where: { entryId: id },
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
        where: { entryId: id },
        transaction: t,
      });
      // delete entry from database
      const entryData = await rds.models.Entry.findByPk(id, { raw: true });
      await rds.models.Entry.destroy({ where: { id }, transaction: t });
      if (entryData.type !== "text") {
        const s3Key = `${entryData.userId}/${entryData.type}s/${id}`;
        const s3Params = { Bucket: S3_BUCKET, Key: s3Key };
        await s3.send(new DeleteObjectCommand(s3Params));
      }
    });
    // report success
    return "success";
  } catch (error) {
    // report error
    return "error";
  }
}
