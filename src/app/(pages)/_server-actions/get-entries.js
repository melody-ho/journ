"use server";

/// imports ///
import getS3Url from "@/helper-functions/get-s3-url";
import { Op } from "sequelize";
import sequelize from "@/database/sequelize";

/// private ///
/**
 * Number of entries per page.
 */
const PAGINATION_LIMIT = 16;

/// main ///
/**
 * Retrieves entries given filters and page number.
 * @param {string} userId
 * @param {Date} startDate
 * @param {Date} endDate
 * @param {Array.<"text" | "image" | "video">} types
 * @param {Array.<string>} tagIds
 * @param {number} page
 * @returns {Promise<"error" | Array.<{id: string, type: "text" | "image" | "video", content: string, createdAt: Date, updatedAt: Date, srcUrl: string | undefined}>>} "error" if failed to retrieve
 */
export default async function getEntries(
  userId,
  startDate,
  endDate,
  types,
  tagIds,
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
        sequelize.where(
          sequelize.fn("date", sequelize.col("Entry.createdAt")),
          ">=",
          startDate,
        ),
      );
    if (endDate)
      entriesDateFn.push(
        sequelize.where(
          sequelize.fn("date", sequelize.col("Entry.createdAt")),
          "<=",
          endDate,
        ),
      );
    if (entriesDateFn.length !== 0) entryWhere[Op.and] = entriesDateFn;
    if (types.length !== 0) entryWhere.type = types;
    // run query
    if (tagIds.length === 0) {
      entries = await sequelize.models.Entry.findAll({
        where: entryWhere,
        order: [["createdAt", "ASC"]],
        offset,
        limit: PAGINATION_LIMIT,
        raw: true,
      });
    } else {
      const matchedEntries = await sequelize.models.EntryTag.findAll({
        include: { model: sequelize.models.Entry, where: entryWhere },
        where: { tagId: tagIds },
        group: ["entryId"],
        attributes: { include: [[sequelize.fn("COUNT", "id"), "matchCount"]] },
        having: { matchCount: tagIds.length },
        offset,
        limit: PAGINATION_LIMIT,
      });
      entries = matchedEntries.map(
        (matchedEntry) => matchedEntry.dataValues.Entry.dataValues,
      );
      entries.sort((a, b) => a.createdAt - b.createdAt);
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
