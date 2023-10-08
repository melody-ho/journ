"use server";

/// imports ///
import rds from "@/database/rds";
import s3 from "@/database/s3";
import { Upload } from "@aws-sdk/lib-storage";

/// private ///
const s3Bucket = process.env.S3_BUCKET;

async function addEntry(user, type, caption) {
  const entry = await rds.models.Entry.create({
    type,
    content: caption.length === 0 ? null : caption,
    userId: user,
  });
  return entry.id;
}

/// main ///
export default async function handleUpload(formData) {
  const user = formData.get("user");
  const indexes = formData.get("indexes").split(",");
  for (let i = 0; i < indexes.length; i += 1) {
    const file = formData.get(`files[${indexes[i]}]`);
    const caption = formData.get(`captions[${indexes[i]}]`);
    const type = file.type.startsWith("image/") ? "image" : "video";
    try {
      const id = await addEntry(user, type, caption);
      const key = `${user}/${type}s/${id}`;
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
    } catch (error) {
      // TO DO: error handling //
    }
  }
}
