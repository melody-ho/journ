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
    const tagMatch =
      checkedTags.length === 0
        ? []
        : [
            {
              model: rds.models.Tag,
              where: { id: checkedTags },
              attributes: [],
            },
          ];
    const tagFilter =
      checkedTags.length === 0 ? {} : { idCount: checkedTags.length };
    const entries = await rds.models.Entry.findAll({
      where: { userId },
      include: tagMatch,
      group: ["id"],
      attributes: { include: [[rds.fn("COUNT", "id"), "idCount"]] },
      having: tagFilter,
      order: [["createdAt", "ASC"]],
      offset,
      limit: PAGINATION_LIMIT,
      raw: true,
    });
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
