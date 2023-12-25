"use client";

/// imports ///
import EditEntryForm from "@/client-components/edit-entry-form";
import { getEntryWithTags } from "@/server-actions/get-entry";
import Image from "next/image";
import styles from "./index.module.css";
import ThemedImage from "@/helper-components/themed-image";
import { useEffect, useRef, useState } from "react";

/// main component ///
export default function EntryModal({
  id,
  removeFromFeed,
  removeModal,
  updateFeed,
  userTags,
}) {
  // initialize states and refs //
  // states
  const [deleted, setDeleted] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [emptyText, setEmptyText] = useState(false);
  const [entry, setEntry] = useState(null);
  const [updateError, setUpdateError] = useState(false);
  const [updating, setUpdating] = useState(false);
  // refs
  const modalRef = useRef(null);
  const modalWrapperRef = useRef(null);

  // open modal when rendered //
  useEffect(
    function show() {
      if (modalRef.current) {
        modalRef.current.showModal();
      }
    },
    [modalRef],
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
  function retryGetData() {
    setEntry(null);
  }

  // close status modal after acknowledging delete error //
  function acknowledgeDeleteError() {
    setDeleted(false);
  }

  // close status modal after acknowledging update error //
  function acknowledgeUpdateError() {
    setUpdateError(false);
  }

  // go back to form after attempting to submit empty text entry //
  function acknowledgeEmptyTextAlert() {
    setEmptyText(false);
  }

  // close modal on cancel if not updating or deleting //
  function handleClickOut(e) {
    if (
      modalWrapperRef.current &&
      !modalWrapperRef.current.contains(e.target) &&
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
        !entry ||
        entry === "error" ||
        updating ||
        deleting ||
        deleted ||
        updateError ||
        emptyText
          ? styles.statusModal
          : styles.entryModal
      }`}
      onCancel={handleCancel}
      onClick={handleClickOut}
      onClose={removeModal}
      onKeyDown={handleEsc}
      ref={modalRef}
    >
      <div
        aria-live="polite"
        className={styles.modalWrapper}
        ref={modalWrapperRef}
      >
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
        ) : updateError ? (
          <div className={styles.statusModalContent}>
            <div className={styles.errorIconContainer}>
              <ThemedImage alt="sad face icon" imageName="sad-icon" />
            </div>
            <p className={styles.statusMessage}>Failed to save changes.</p>
            <button
              className={styles.statusCta}
              onClick={acknowledgeUpdateError}
              type="button"
            >
              Try again.
            </button>
          </div>
        ) : deleting ? (
          <div className={styles.statusModalContent}>
            <div className={styles.deletingSpinner}></div>
            <p className={styles.statusMessage}>Deleting entry...</p>
          </div>
        ) : deleted === "fail" ? (
          <div className={styles.statusModalContent}>
            <div className={styles.errorIconContainer}>
              <ThemedImage alt="sad face icon" imageName="sad-icon" />
            </div>
            <p className={styles.statusMessage}>Failed to delete.</p>
            <button
              className={styles.statusCta}
              onClick={acknowledgeDeleteError}
              type="button"
            >
              Try again.
            </button>
          </div>
        ) : deleted === "success" ? (
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
        {!entry ? (
          <div className={styles.statusModalContent}>
            <div className={styles.loadingSpinner}></div>
            <p className={styles.statusMessage}>Loading...</p>
          </div>
        ) : entry === "error" ? (
          <div className={styles.statusModalContent}>
            <div className={styles.errorIconContainer}>
              <ThemedImage alt="sad face icon" imageName="sad-icon" />
            </div>
            <p className={styles.statusMessage}>Failed to load.</p>
            <button
              className={styles.statusCta}
              onClick={retryGetData}
              type="button"
            >
              Retry
            </button>
          </div>
        ) : (
          <div
            className={
              updating || deleting || deleted || updateError || emptyText
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
              Close entry popup
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
              setUpdateError={setUpdateError}
              setUpdating={setUpdating}
              updateFeed={updateFeed}
              userTags={userTags}
            />
          </div>
        )}
      </div>
    </dialog>
  );
}
