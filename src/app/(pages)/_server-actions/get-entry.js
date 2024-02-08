"use server";

/// imports ///
import getS3Url from "@/helper-functions/get-s3-url";
import sequelize from "@/database/sequelize";

/// main ///
/**
 * Retrieves an entry.
 * @param {string} id entry id
 * @returns {Promise<"error" | {id: string, type: "text" | "image" | "video", content: string, createdAt: Date, updatedAt: Date, srcUrl: string | undefined, tagIds: Array.<string>, tagNames: Array.<string>}>} "error" if failed to retrieve
 */
export default async function getEntry(id) {
  try {
    const entry = await sequelize.models.Entry.findByPk(id, { raw: true });
    if (entry.type === "image" || entry.type === "video") {
      const key = `${entry.userId}/${entry.type}s/${entry.id}`;
      const srcUrl = await getS3Url(key);
      if (srcUrl === "error") {
        return "error";
      }
      entry.srcUrl = srcUrl;
    }
    const tagDataList = await sequelize.models.EntryTag.findAll({
      where: { entryId: id },
      attributes: [],
      include: { model: sequelize.models.Tag, attributes: ["id", "name"] },
      raw: true,
    });
    entry.tagIds = tagDataList.map((tagData) => tagData["Tag.id"]);
    entry.tagNames = tagDataList.map((tagData) => tagData["Tag.name"]).sort();
    return entry;
  } catch {
    return "error";
  }
}
