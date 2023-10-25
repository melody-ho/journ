import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import s3 from "@/database/s3";

const S3_BUCKET = process.env.S3_BUCKET;
const URL_VALID_TIME = 60;

export default async function getS3Url(key) {
  const command = new GetObjectCommand({ Bucket: S3_BUCKET, Key: key });
  try {
    return await getSignedUrl(s3, command, { expiresIn: URL_VALID_TIME });
  } catch (error) {
    // TO DO: error handling //
  }
}