import EditEntryForm from "@/client-components/edit-entry-form";
import { getEntryWithTags } from "@/server-actions/get-entry";
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
  const [deleted, setDeleted] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [updating, setUpdating] = useState(false);
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
      if (!entry) {
        try {
          getData();
        } catch (error) {
          // TO DO: error handling //
        }
      }
    },
    [entry, id],
  );

  // close modal on cancel if not updating or deleting //
  function handleCancel(e) {
    if (updating || deleting) {
      e.preventDefault();
    } else {
      removeModal();
    }
  }

  return (
    <dialog onCancel={handleCancel} ref={modal}>
      {updating ? (
        <p>updating...</p>
      ) : deleting ? (
        <p>deleting...</p>
      ) : deleted ? (
        <p>deleted</p>
      ) : entry ? (
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
          <EditEntryForm
            entry={entry}
            removeFromFeed={removeFromFeed}
            setDeleted={setDeleted}
            setDeleting={setDeleting}
            setEntry={setEntry}
            setUpdating={setUpdating}
            updateFeed={updateFeed}
          />
        </>
      ) : (
        <p>loading...</p>
      )}
    </dialog>
  );
}
