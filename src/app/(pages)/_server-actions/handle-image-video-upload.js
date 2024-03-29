"use server";

/// imports ///
import { revalidatePath } from "next/cache";
import s3 from "@/database/s3";
import sequelize from "@/database/sequelize";
import { Upload } from "@aws-sdk/lib-storage";

/// private ///
/**
 * Maximum character length for tags.
 */
const MAX_TAG_LENGTH = 50;
/**
 * Name of S3 bucket, needs to be provided in environment variables as S3_BUCKET.
 */
const S3_BUCKET = process.env.S3_BUCKET;

/// main ///
/**
 * Adds an image/video entry to database when given userId, file, caption, and tagNames.
 * @param {FormData} entryData includes userId, file, caption, and tagNames
 * @returns {Promise<"error" | "success">} "error" if failed to add, "success" if added successfully
 */
export default async function handleImageVideoUpload(entryData) {
  // get data
  const userId = entryData.get("userId");
  const file = entryData.get("file");
  const caption = entryData.get("caption");
  const tagNames = JSON.parse(entryData.get("tagNames"));
  const type = file.type.startsWith("image/") ? "image" : "video";
  try {
    await sequelize.transaction(async function addImgVideoEntryToDatabase(t) {
      // add entry
      const entry = await sequelize.models.Entry.create(
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
        const [tag, created] = await sequelize.models.Tag.findOrCreate({
          where: { name: validatedTagName },
          transaction: t,
        });
        await sequelize.models.UserTag.findOrCreate({
          where: { userId, tagId: tag.id },
          transaction: t,
        });
        await sequelize.models.EntryTag.findOrCreate({
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
