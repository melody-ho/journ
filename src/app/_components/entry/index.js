import EditForm from "./_client-components/edit-form";
import getS3Url from "@/app/_helpers/get-s3-url";
import Image from "next/image";
import rds from "@/database/rds";

async function getEntry(id) {
  const entry = await rds.models.Entry.findByPk(id, { raw: true });
  const tagDataList = await rds.models.EntryTag.findAll({
    where: { entryId: id },
    attributes: [],
    include: { model: rds.models.Tag, attributes: ["name"] },
    raw: true,
  });
  entry.tags = tagDataList.map((tagData) => tagData["Tag.name"]);
  if (entry.type === "image" || entry.type === "video") {
    const key = `${entry.userId}/${entry.type}s/${entry.id}`;
    entry.srcUrl = await getS3Url(key);
  }
  return entry;
}

export default async function Entry({ id }) {
  const entry = await getEntry(id);
  return (
    <>
      {entry.type === "image" ? (
        <Image
          alt={
            entry.content
              ? entry.content
              : "The user did not provide a caption for this image."
          }
          height="100"
          src={entry.srcUrl}
          width="100"
        />
      ) : entry.type === "video" ? (
        <video autoPlay loop muted src={entry.srcUrl}></video>
      ) : null}
      <EditForm entry={entry} />
    </>
  );
}
