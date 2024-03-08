"use client";

/// imports ///
import EditEntryForm from "@/client-components/edit-entry-form";
import getEntry from "@/server-actions/get-entry";
import Image from "next/image";
import styles from "./index.module.css";
import ThemedImage from "@/helper-components/themed-image";
import { useEffect, useRef, useState } from "react";

/// main component ///
/**
 * Removes an entry from feed.
 * @callback removeFromFeedType
 * @param {string} entryId
 * @returns {void}
 */
/**
 * Removes modal from DOM.
 * @callback removeModalType
 * @returns {void}
 */
/**
 * Updates an entry in feed.
 * @callback updateFeedEntryType
 * @param {string} entryId
 * @returns {void}
 */
/**
 * @param {Object} props
 * @param {string} props.id Id of entry being displayed.
 * @param {removeFromFeedType} props.removeFromFeed
 * @param {removeModalType} props.removeModal
 * @param {updateFeedEntryType} props.updateFeedEntry
 * @param {Array.<{id: string, name: string}>} props.userTags
 */
export default function EntryModal({
  id,
  removeFromFeed,
  removeModal,
  updateFeedEntry,
  userTags,
}) {
  // document states //
  /**
   * @typedef {false | "fail" | "success"} deletedType Status of entry deletion, false if no deletion attempted or previous result acknowledged.
   */
  /**
   * @typedef {React.Dispatch<false | "fail" | "success">} setDeletedType Reports result of entry deletion from database, false when no deletion attempted or previous result acknowledged.
   */
  /**
   * @typedef {boolean} deletingType Indicates whether entry deletion is in progress.
   */
  /**
   * @typedef {React.Dispatch<boolean>} setDeletingType Updates whether entry deletion is in progress.
   */
  /**
   * @typedef {boolean} emptyTextType Indicates whether an empty text entry was attempted.
   */
  /**
   * @typedef {React.Dispatch<boolean>} setEmptyTextType Reports whether an empty text entry was attempted.
   */
  /**
   * @typedef {?{id: string,
   *             type: "text" | "image" | "video",
   *             content: string,
   *             createdAt: Date,
   *             updatedAt: Date,
   *             userId: string,
   *             srcUrl: string | undefined,
   *             tagIds: Array.<string>,
   *             tagNames: Array.<string>} | "error"} entryType entry data, null if not yet retrieved, "error" if error retrieving
   */
  /**
   * @typedef {React.Dispatch<?{
   *            id: string,
   *            type: "text" | "image" | "video",
   *            content: string,
   *            createdAt: Date,
   *            updatedAt: Date,
   *            userId: string,
   *            srcUrl: string | undefined,
   *            tagIds: Array.<string>,
   *            tagNames: Array.<string>} | "error">} setEntryType Updates entry data, null if not yet retrieved, "error" if error retrieving.
   */
  /**
   * @typedef {boolean} loadingType Indicates whether entry is being retrieved / rendering.
   */
  /**
   * @typedef {React.Dispatch<boolean>} setLoadingType Updates whether entry is being retrieved / rendering.
   */
  /**
   * @typedef {boolean} updateErrorType Indicates whether there was an error updating entry in database.
   */
  /**
   * @typedef {React.Dispatch<boolean>} setUpdateErrorType Reports whether there was an error updating entry in database.
   */
  /**
   * @typedef {boolean} updatingType Indicates whether entry update is in progress.
   */
  /**
   * @typedef {React.Dispatch<boolean>} setUpdatingType Updates whether entry update is in progress.
   */

  // initialize states //
  /**
   * @type {[deletedType, setDeletedType]}
   */
  const [deleted, setDeleted] = useState(false);
  /**
   * @type {[deletingType, setDeletingType]}
   */
  const [deleting, setDeleting] = useState(false);
  /**
   * @type {[emptyTextType, setEmptyTextType]}
   */
  const [emptyText, setEmptyText] = useState(false);
  /**
   * @type {[entryType, setEntryType]}
   */
  const [entry, setEntry] = useState(null);
  /**
   * @type {[loadingType, setLoadingType]}
   */
  const [loading, setLoading] = useState(true);
  /**
   * @type {[updateErrorType, setUpdateErrorType]}
   */
  const [updateError, setUpdateError] = useState(false);
  /**
   * @type {[updatingType, setUpdatingType]}
   */
  const [updating, setUpdating] = useState(false);

  // initialize refs //
  const modalRef = useRef(null);
  const modalWrapperRef = useRef(null);

  // show modal when rendered //
  useEffect(function show() {
    if (modalRef.current) {
      modalRef.current.showModal();
    }
  }, []);

  // get entry data //
  useEffect(
    function getEntryData() {
      async function getData() {
        const data = await getEntry(id);
        if (data === "error" || data.type === "text") setLoading(false);
        setEntry(data);
      }
      if (!entry) {
        getData();
      }
    },
    [entry, id],
  );
  function retryGetData() {
    setLoading(true);
    setEntry(null);
  }

  // remove loading state when image/video is rendered or an error occurs //
  function handleLoaded() {
    setLoading(false);
  }

  // close status modal after acknowledging deletion error //
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

  // close modal on cancel if not currently updating or deleting //
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

  // render //
  return (
    <dialog
      className={`${
        !entry ||
        loading ||
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
        {!entry || loading ? (
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
        ) : null}
        {entry && entry !== "error" ? (
          <div
            className={
              loading ||
              updating ||
              deleting ||
              deleted ||
              updateError ||
              emptyText
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
                    onError={handleLoaded}
                    onLoad={handleLoaded}
                    priority={true}
                    src={entry.srcUrl}
                    unoptimized
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
                    onCanPlay={handleLoaded}
                    onError={handleLoaded}
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
              setLoading={setLoading}
              setUpdateError={setUpdateError}
              setUpdating={setUpdating}
              updateFeedEntry={updateFeedEntry}
              userTags={userTags}
            />
          </div>
        ) : null}
      </div>
    </dialog>
  );
}
