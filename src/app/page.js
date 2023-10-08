/// imports ///
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import getUserId from "./(authentication)/_helpers/get-user-id";
import { headers } from "next/headers";
import Image from "next/image";
import rds from "@/database/rds";
import s3 from "@/database/s3";
import styles from "./page.module.css";

/// private ///
const S3_BUCKET = process.env.S3_BUCKET;
const URL_VALID_TIME = 60;

async function getUser() {
  const userId = await getUserId(headers());
  try {
    return await rds.models.User.findByPk(userId, {
      attributes: { exclude: ["password", "createdAt", "updatedAt"] },
    });
  } catch (error) {
    // TO DO: error handling //
  }
}

async function getEntries(userId) {
  try {
    return await rds.models.Entry.findAll({ where: { userId } });
  } catch (error) {
    // TO DO: error handling //
  }
}

async function getS3Url(key) {
  const command = new GetObjectCommand({ Bucket: S3_BUCKET, Key: key });
  try {
    return await getSignedUrl(s3, command, { expiresIn: URL_VALID_TIME });
  } catch (error) {
    // TO DO: error handling //
  }
}

/// main component ///
export default async function Home() {
  const user = await getUser();
  const entries = await getEntries(user.id);
  const renderedEntries = entries.map(async (entry) => {
    const srcUrl = await getS3Url(`${user.id}/${entry.type}s/${entry.id}`);
    if (entry.type === "image") {
      return (
        <div key={entry.id}>
          <Image
            alt={
              entry.content
                ? entry.content
                : "The user did not provide a caption for this image."
            }
            height="100"
            src={srcUrl}
            width="100"
          />
          <p>{entry.content}</p>
        </div>
      );
    } else {
      return (
        <div key={entry.id}>
          <video autoPlay loop muted src={srcUrl}></video>
          <p>{entry.content}</p>
        </div>
      );
    }
  });

  return (
    <main className={styles.main}>
      <h1>{`${user.firstName}`}</h1>
      {renderedEntries}
    </main>
  );
}
