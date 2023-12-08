"use server";

import getS3Url from "@/helper-functions/get-s3-url";
import rds from "@/database/rds";

export async function getEntryWithoutTags(id) {
  const entry = await rds.models.Entry.findByPk(id, { raw: true });
  if (entry.type === "image" || entry.type === "video") {
    const key = `${entry.userId}/${entry.type}s/${entry.id}`;
    entry.srcUrl = await getS3Url(key);
  }
  return entry;
}

export async function getEntryWithTags(id) {
  const entry = await getEntryWithoutTags(id);
  const tagDataList = await rds.models.EntryTag.findAll({
    where: { entryId: id },
    attributes: [],
    include: { model: rds.models.Tag, attributes: ["name"] },
    raw: true,
  });
  entry.tags = tagDataList.map((tagData) => tagData["Tag.name"]);
  return entry;
}
