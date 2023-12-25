"use server";

/// imports ///
import getS3Url from "@/helper-functions/get-s3-url";
import rds from "@/database/rds";

/// main ///
export async function getEntryWithoutTags(id) {
  try {
    const entry = await rds.models.Entry.findByPk(id, { raw: true });
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

export async function getEntryWithTags(id) {
  try {
    const entry = await getEntryWithoutTags(id);
    if (entry === "error") {
      return "error";
    }
    const tagDataList = await rds.models.EntryTag.findAll({
      where: { entryId: id },
      attributes: [],
      include: { model: rds.models.Tag, attributes: ["name"] },
      raw: true,
    });
    entry.tags = tagDataList.map((tagData) => tagData["Tag.name"]).sort();
    return entry;
  } catch {
    return "error";
  }
}
