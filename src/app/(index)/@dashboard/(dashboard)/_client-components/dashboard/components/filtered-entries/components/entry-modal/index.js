import EditForm from "@/(dashboard)/entry/[id]/_components/entry/client-components/edit-form";
import { getEntryWithTags } from "@/(dashboard)/_helper-functions/get-entry";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function EntryModal({
  id,
  removeFromFeed,
  removeModal,
  updateFeed,
}) {
  // initialize states and refs //
  const [entry, setEntry] = useState(null);
  const modal = useRef(null);

  // open modal when rendered //
  useEffect(
    function show() {
      if (modal.current) {
        modal.current.close();
        modal.current.showModal();
      }
    },
    [modal],
  );

  // get entry data //
  useEffect(
    function getEntryData() {
      async function getData() {
        const data = await getEntryWithTags(id);
        setEntry(data);
      }
      try {
        getData();
      } catch (error) {
        // TO DO: error handling //
      }
    },
    [id],
  );

  return (
    <dialog onCancel={removeModal} ref={modal}>
      {entry ? (
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
          <EditForm
            entry={entry}
            removeFromFeed={removeFromFeed}
            updateFeed={updateFeed}
          />
        </>
      ) : (
        <p>loading...</p>
      )}
    </dialog>
  );
}
