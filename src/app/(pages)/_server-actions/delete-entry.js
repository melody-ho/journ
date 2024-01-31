"use server";

/// imports ///
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { Op } from "sequelize";
import s3 from "@/database/s3";
import sequelize from "@/database/sequelize";

/// private ///
const S3_BUCKET = process.env.S3_BUCKET;

/// main ///
export default async function deleteEntry(userId, entryId) {
  try {
    await sequelize.transaction(async function deleteEntryFromDatabase(t) {
      // clean up tags
      const entryTags = await sequelize.models.EntryTag.findAll({
        where: { entryId },
        raw: true,
      });
      for (const entryTag of entryTags) {
        const tagId = entryTag.tagId;
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
      // delete entry from database
      const entryData = await sequelize.models.Entry.findByPk(entryId, {
        raw: true,
      });
      await sequelize.models.Entry.destroy({
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
