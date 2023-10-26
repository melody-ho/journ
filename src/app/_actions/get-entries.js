"use server";

/// imports ///
import getS3Url from "../_helpers/get-s3-url";
import rds from "@/database/rds";

/// private ///
const PAGINATION_LIMIT = 50;

/// main ///
export default async function getEntries(userId, checkedTags, page) {
  try {
    // get entries data from RDS //
    const offset = PAGINATION_LIMIT * (page - 1);
    let entries;
    if (checkedTags.length === 0) {
      entries = await rds.models.Entry.findAll({
        where: { userId },
        order: [["createdAt", "ASC"]],
        offset,
        limit: PAGINATION_LIMIT,
        raw: true,
      });
    } else {
      const matchedEntries = await rds.models.EntryTag.findAll({
        include: { model: rds.models.Entry, where: { userId } },
        where: { tagId: checkedTags },
        group: ["entryId"],
        attributes: { include: [[rds.fn("COUNT", "id"), "matchCount"]] },
        having: { matchCount: checkedTags.length },
        order: [["createdAt", "ASC"]],
        offset,
        limit: PAGINATION_LIMIT,
      });
      entries = matchedEntries.map(
        (matchedEntry) => matchedEntry.dataValues.Entry.dataValues,
      );
    }
    // get corresponding source urls from S3 for images/videos //
    entries.forEach(async (entry) => {
      if (entry.type === "image" || entry.type === "video") {
        const key = `${userId}/${entry.type}s/${entry.id}`;
        entry.srcUrl = await getS3Url(key);
      }
    });
    return entries;
  } catch (error) {
    // TO DO: error handling //
  }
}
