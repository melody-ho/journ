"use server";

/// imports ///
import getS3Url from "@/helper-functions/get-s3-url";
import sequelize from "@/database/sequelize";

/// private ///
async function getEntryWithoutTags(id) {
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
    return entry;
  } catch {
    return "error";
  }
}

/// main ///
export async function getEntryWithTags(id) {
  try {
    const entry = await getEntryWithoutTags(id);
    if (entry === "error") {
      return "error";
    }
    const tagDataList = await sequelize.models.EntryTag.findAll({
      where: { entryId: id },
      attributes: [],
      include: { model: sequelize.models.Tag, attributes: ["name"] },
      raw: true,
    });
    entry.tags = tagDataList.map((tagData) => tagData["Tag.name"]).sort();
    return entry;
  } catch {
    return "error";
  }
}

export async function getEntryWithTagIds(id) {
  try {
    const entry = await getEntryWithoutTags(id);
    if (entry === "error") {
      return "error";
    }
    const tagDataList = await sequelize.models.EntryTag.findAll({
      where: { entryId: id },
      attributes: [],
      include: { model: sequelize.models.Tag, attributes: ["id"] },
      raw: true,
    });
    entry.tags = tagDataList.map((tagData) => tagData["Tag.id"]);
    return entry;
  } catch {
    return "error";
  }
}
