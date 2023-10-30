"use server";

import cleanUpTags from "./helpers/clean-up-tags";
import rds from "@/database/rds";

export default async function deleteEntry(id) {
  await cleanUpTags(id);
  await rds.models.Entry.destroy({ where: { id } });
}
