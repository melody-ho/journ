"use server";

/// imports ///
import getS3Url from "@/helper-functions/get-s3-url";
import { Op } from "sequelize";
import rds from "@/database/rds";

/// private ///
const PAGINATION_LIMIT = 16;

/// main ///
export default async function getEntries(
  userId,
  startDate,
  endDate,
  types,
  tags,
  page,
) {
  try {
    // get entries data from RDS //
    let entries;
    // determine offset
    const offset = PAGINATION_LIMIT * (page - 1);
    // determine where clauses
    const entryWhere = { userId };
    const entriesDateFn = [];
    if (startDate)
      entriesDateFn.push(
        rds.where(rds.fn("date", rds.col("Entry.createdAt")), ">=", startDate),
      );
    if (endDate)
      entriesDateFn.push(
        rds.where(rds.fn("date", rds.col("Entry.createdAt")), "<=", endDate),
      );
    if (entriesDateFn.length !== 0) entryWhere[Op.and] = entriesDateFn;
    if (types.length !== 0) entryWhere.type = types;
    // run query
    if (tags.length === 0) {
      entries = await rds.models.Entry.findAll({
        where: entryWhere,
        order: [["createdAt", "ASC"]],
        offset,
        limit: PAGINATION_LIMIT,
        raw: true,
      });
    } else {
      const matchedEntries = await rds.models.EntryTag.findAll({
        include: { model: rds.models.Entry, where: entryWhere },
        where: { tagId: tags },
        group: ["entryId"],
        attributes: { include: [[rds.fn("COUNT", "id"), "matchCount"]] },
        having: { matchCount: tags.length },
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
    return "error";
  }
}
