"use server";

/// imports ///
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { Op } from "sequelize";
import rds from "@/database/rds";
import s3 from "@/database/s3";

/// private ///
const S3_BUCKET = process.env.S3_BUCKET;

/// main ///
export default async function deleteEntry(userId, entryId) {
  try {
    await rds.transaction(async function deleteEntryFromDatabase(t) {
      // clean up tags
      const entryTags = await rds.models.EntryTag.findAll({
        where: { entryId },
        raw: true,
      });
      for (const entryTag of entryTags) {
        const tagId = entryTag.tagId;
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
      // delete entry from database
      const entryData = await rds.models.Entry.findByPk(entryId, { raw: true });
      await rds.models.Entry.destroy({
        where: { id: entryId },
        transaction: t,
      });
      if (entryData.type !== "text") {
        const s3Key = `${userId}/${entryData.type}s/${entryId}`;
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
