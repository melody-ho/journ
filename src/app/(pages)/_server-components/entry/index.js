import EditEntryForm from "../../_client-components/edit-entry-form";
import { getEntryWithTags } from "@/server-actions/get-entry";
import Image from "next/image";

export default async function Entry({ id }) {
  const entry = await getEntryWithTags(id);
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
      <EditEntryForm entry={entry} />
    </>
  );
}
