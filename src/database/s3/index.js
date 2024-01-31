import { S3Client } from "@aws-sdk/client-s3";

const config =
  process.env.NODE_ENV === "production"
    ? { region: process.env.S3_REGION }
    : {
        region: process.env.S3_REGION,
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY,
          secretAccessKey: process.env.S3_SECRET,
        },
      };

const s3 = new S3Client(config);

export default s3;
