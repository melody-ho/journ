"use server";

/// imports ///
import rds from "@/database/rds";
import { revalidatePath } from "next/cache";
import s3 from "@/database/s3";
import { Upload } from "@aws-sdk/lib-storage";

/// private ///
const s3Bucket = process.env.S3_BUCKET;

async function addEntry(userId, type, caption) {
  const entry = await rds.models.Entry.create({
    type,
    content: caption.length === 0 ? null : caption,
    userId,
  });
  return entry.id;
}

/// main ///
export default async function handleImageVideoUpload(entryData) {
  const userId = entryData.get("user");
  const file = entryData.get("file");
  const caption = entryData.get("caption");
  const tagNames = JSON.parse(entryData.get("tags"));
  const type = file.type.startsWith("image/") ? "image" : "video";
  try {
    const entryId = await addEntry(userId, type, caption);
    for (const tagName of tagNames) {
      const [tag, created] = await rds.models.Tag.findOrCreate({
        where: { name: tagName },
      });
      await rds.models.UserTag.findOrCreate({
        where: { userId, tagId: tag.id },
      });
      await rds.models.EntryTag.create({
        entryId,
        tagId: tag.id,
      });
    }
    const key = `${userId}/${type}s/${entryId}`;
    const upload = new Upload({
      client: s3,
      params: {
        Bucket: s3Bucket,
        Key: key,
        ContentType: file.type,
        Body: file.stream(),
      },
    });
    upload.on("httpUploadProgress", (progress) => {
      console.log(progress);
    });
    await upload.done();
    revalidatePath("/");
    return "success";
  } catch (error) {
    // TO DO: error handling //
    return "error";
  }
}
