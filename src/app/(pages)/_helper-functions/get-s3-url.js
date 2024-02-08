/// imports ///
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import s3 from "@/database/s3";

/// private ///
/**
 * Name of S3 bucket, needs to be provided in environment variables as S3_BUCKET.
 */
const S3_BUCKET = process.env.S3_BUCKET;
/**
 * Valid duration for presigned URL, in seconds.
 */
const URL_VALID_TIME = 60;

/// main ///
/**
 * Retrieves a presigned URL for an S3 object given its key.
 * @param {string} key key of S3 object
 * @returns {Promise<string | "error">} presigned URL or "error" on error
 */
export default async function getS3Url(key) {
  const command = new GetObjectCommand({ Bucket: S3_BUCKET, Key: key });
  try {
    return await getSignedUrl(s3, command, { expiresIn: URL_VALID_TIME });
  } catch (error) {
    return "error";
  }
}
