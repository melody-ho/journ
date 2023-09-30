import { S3Client } from "@aws-sdk/client-s3";

const config = {
  REGION: process.env.S3_REGION,
  ACCESS_KEY: process.env.S3_ACCESS_KEY,
  SECRET: process.env.S3_SECRET,
};

const s3 = new S3Client({
  region: config.REGION,
  credentials: {
    accessKeyId: config.ACCESS_KEY,
    secretAccessKey: config.SECRET,
  },
});

export default s3;
