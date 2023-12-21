"use server";

/// imports ///
import rds from "@/database/rds";
import { revalidatePath } from "next/cache";
import s3 from "@/database/s3";
import { Upload } from "@aws-sdk/lib-storage";

/// private ///
const MAX_TAG_LENGTH = 50;
const S3_BUCKET = process.env.S3_BUCKET;

/// main ///
export default async function handleImageVideoUpload(entryData) {
  // get data
  const userId = entryData.get("user");
  const file = entryData.get("file");
  const caption = entryData.get("caption");
  const tagNames = JSON.parse(entryData.get("tags"));
  const type = file.type.startsWith("image/") ? "image" : "video";
  try {
    await rds.transaction(async function addImgVideoEntryToDatabase(t) {
      // add entry
      const entry = await rds.models.Entry.create(
        {
          type,
          content: caption.length === 0 ? null : caption,
          userId,
        },
        { transaction: t },
      );
      const entryId = entry.id;
      // add tags
      for (const tagName of tagNames) {
        const validatedTagName = tagName
          .split(" ")
          .join("")
          .slice(0, MAX_TAG_LENGTH);
        const [tag, created] = await rds.models.Tag.findOrCreate({
          where: { name: validatedTagName },
          transaction: t,
        });
        await rds.models.UserTag.findOrCreate({
          where: { userId, tagId: tag.id },
          transaction: t,
        });
        await rds.models.EntryTag.findOrCreate({
          where: {
            entryId,
            tagId: tag.id,
          },
          transaction: t,
        });
      }
      // upload file
      const key = `${userId}/${type}s/${entryId}`;
      const upload = new Upload({
        client: s3,
        params: {
          Bucket: S3_BUCKET,
          Key: key,
          ContentType: file.type,
          Body: file.stream(),
        },
      });
      upload.on("httpUploadProgress", (progress) => {
        console.log(progress);
      });
      await upload.done();
    });
    // update data
    revalidatePath("/");
    // report success
    return "success";
  } catch (error) {
    // report error
    return "error";
  }
}
