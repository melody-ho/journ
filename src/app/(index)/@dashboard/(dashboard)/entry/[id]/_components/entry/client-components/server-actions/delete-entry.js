"use server";

/// imports ///
import cleanUpTags from "./helpers/clean-up-tags";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import rds from "@/database/rds";
import s3 from "@/database/s3";

/// private ///
const s3Bucket = process.env.S3_BUCKET;

/// main ///
export default async function deleteEntry(id) {
  await cleanUpTags(id);
  const entryData = await rds.models.Entry.findByPk(id, { raw: true });
  if (entryData.type !== "text") {
    const s3Key = `${entryData.userId}/${entryData.type}s/${id}`;
    const s3Params = { Bucket: s3Bucket, Key: s3Key };
    await s3.send(new DeleteObjectCommand(s3Params));
  }
  await rds.models.Entry.destroy({ where: { id } });
}
