import EditEntryForm from "@/client-components/edit-entry-form";
import { getEntryWithTags } from "@/server-actions/get-entry";
import Image from "next/image";
import styles from "./index.module.css";
import ThemedImage from "@/helper-components/themed-image";
import { useEffect, useRef, useState } from "react";

export default function EntryModal({
  id,
  removeFromFeed,
  removeModal,
  updateFeed,
  userTags,
}) {
  // initialize states and refs //
  const [entry, setEntry] = useState(null);
  const [deleted, setDeleted] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [emptyText, setEmptyText] = useState(false);
  const [updating, setUpdating] = useState(false);
  const modal = useRef(null);
  const modalWrapper = useRef(null);

  // open modal when rendered //
  useEffect(
    function show() {
      if (modal.current) {
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

  // go back to form //
  function acknowledgeEmptyTextAlert() {
    setEmptyText(false);
  }

  // close modal on cancel if not updating or deleting //
  function handleClickOut(e) {
    if (
      modalWrapper.current &&
      !modalWrapper.current.contains(e.target) &&
      !updating &&
      !deleting
    ) {
      removeModal();
    }
  }
  function handleCancel(e) {
    if (updating || deleting) {
      e.preventDefault();
    }
  }
  function handleEsc(e) {
    if (e.key === "Escape" && (updating || deleting)) {
      e.preventDefault();
    }
  }

  return (
    <dialog
      className={`${
        !entry || updating || emptyText || deleting || deleted
          ? styles.statusModal
          : styles.entryModal
      }`}
      onCancel={handleCancel}
      onClick={handleClickOut}
      onClose={removeModal}
      onKeyDown={handleEsc}
      ref={modal}
    >
      <div className={styles.modalWrapper} ref={modalWrapper}>
        {updating ? (
          <div className={styles.statusModalContent}>
            <div className={styles.updatingSpinner}></div>
            <p className={styles.statusMessage}>Updating entry...</p>
          </div>
        ) : emptyText ? (
          <div>
            <div className={styles.statusModalContent}>
              <div className={styles.alertIconContainer}>
                <ThemedImage alt="alert icon" imageName="alert-icon" />
              </div>
              <p className={styles.statusMessage}>
                Entry content cannot be empty.
              </p>
              <button
                className={styles.statusCta}
                onClick={acknowledgeEmptyTextAlert}
                type="button"
              >
                Go back
              </button>
            </div>
          </div>
        ) : deleting ? (
          <div className={styles.statusModalContent}>
            <div className={styles.deletingSpinner}></div>
            <p className={styles.statusMessage}>Deleting entry...</p>
          </div>
        ) : deleted ? (
          <div className={styles.statusModalContent}>
            <div className={styles.successIconContainer}>
              <ThemedImage alt="success icon" imageName="success-icon" />
            </div>
            <p className={styles.statusMessage}>Entry deleted!</p>
            <button
              className={styles.statusCta}
              onClick={removeModal}
              type="button"
            >
              Back to feed
            </button>
          </div>
        ) : null}
        {entry ? (
          <div
            className={
              updating || emptyText || deleting || deleted
                ? styles.hidden
                : null
            }
          >
            <button
              className={styles.imgBtn}
              onClick={removeModal}
              type="button"
            >
              <ThemedImage alt="close icon" imageName="close-icon" />
              Close
            </button>
            {entry.type === "text" ? (
              <div className={styles.textEntryIconContainer}>
                <ThemedImage alt="text entry icon" imageName="quote-icon" />
              </div>
            ) : entry.type === "image" ? (
              <div className={styles.imageWrapper}>
                <div className={styles.imageContainer}>
                  <Image
                    alt={
                      entry.content
                        ? entry.content
                        : "The user did not provide a caption for this image."
                    }
                    className={styles.image}
                    fill={true}
                    src={entry.srcUrl}
                  />
                </div>
              </div>
            ) : entry.type === "video" ? (
              <div className={styles.videoWrapper}>
                <div className={styles.videoContainer}>
                  <video
                    autoPlay
                    className={styles.video}
                    controls
                    loop
                    muted
                    src={entry.srcUrl}
                  ></video>
                </div>
              </div>
            ) : null}
            <EditEntryForm
              entry={entry}
              removeFromFeed={removeFromFeed}
              setDeleted={setDeleted}
              setDeleting={setDeleting}
              setEmptyText={setEmptyText}
              setEntry={setEntry}
              setUpdating={setUpdating}
              updateFeed={updateFeed}
              userTags={userTags}
            />
          </div>
        ) : (
          <div className={styles.statusModalContent}>
            <div className={styles.loadingSpinner}></div>
            <p className={styles.statusMessage}>Loading...</p>
          </div>
        )}
      </div>
    </dialog>
  );
}
