"use server";

/// imports ///
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import rds from "@/database/rds";
import s3 from "@/database/s3";

/// private ///
const PAGINATION_LIMIT = 50;
const S3_BUCKET = process.env.S3_BUCKET;
const URL_VALID_TIME = 60;

async function getS3Url(key) {
  const command = new GetObjectCommand({ Bucket: S3_BUCKET, Key: key });
  try {
    return await getSignedUrl(s3, command, { expiresIn: URL_VALID_TIME });
  } catch (error) {
    // TO DO: error handling //
  }
}

/// main ///
export default async function getEntries(userId, page) {
  try {
    // get entries data from RDS //
    const offset = PAGINATION_LIMIT * (page - 1);
    const entries = await rds.models.Entry.findAll({
      where: { userId },
      order: [["createdAt", "ASC"]],
      offset,
      limit: PAGINATION_LIMIT,
      raw: true,
    });
    // get corresponding source urls from S3 for images/videos //
    entries.forEach(async (entry) => {
      if (entry.type === "image" || entry.type === "video") {
        const key = `${userId}/${entry.type}s/${entry.id}`;
        entry.srcUrl = await getS3Url(key);
      }
    });
    return entries;
  } catch (error) {
    // TO DO: error handling //
  }
}
