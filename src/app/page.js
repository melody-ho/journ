// Imports //
import { HeadBucketCommand } from "@aws-sdk/client-s3";
import rds from "@/database/config/rds";
import s3 from "@/database/config/s3";
import styles from "./page.module.css";

// Private //
async function testRDS() {
  try {
    await rds.authenticate();
    return "Connection to RDS has been established successfully.";
  } catch (error) {
    return `Unable to connect to RDS: ${error}`;
  }
}

async function testS3() {
  const input = {
    Bucket: process.env.S3_BUCKET,
    ExpectedBucketOwner: process.env.S3_BUCKET_OWNER,
  };
  const headBucket = new HeadBucketCommand(input);

  try {
    await s3.send(headBucket);
    return "Connection to S3 has been established successfully.";
  } catch (error) {
    return `Unable to connect to S3: ${error}`;
  }
}

// Public //
export default async function Home() {
  const rdsStatus = await testRDS();
  const s3Status = await testS3();
  return (
    <main className={styles.main}>
      <h1>Database Connections</h1>
      <h2>RDS</h2>
      <p>{rdsStatus}</p>
      <h2>S3</h2>
      <p>{s3Status}</p>
    </main>
  );
}
