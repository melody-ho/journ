"use client";

/// imports ///
import deleteEntry from "@/server-actions/delete-entry";
import styles from "./index.module.css";
import TagDropdown from "../tag-dropdown";
import updateEntryChanges from "@/server-actions/update-entry-changes";
import { v4 as uuidv4 } from "uuid";
import { useCallback, useRef, useState } from "react";

/// main component ///
/**
 * Removes an entry from feed.
 * @callback removeFromFeedType
 * @param {string} entryId
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
 * @param {{id: string,
 *          type: "text" | "image" | "video",
 *          content: string,
 *          createdAt: Date,
 *          updatedAt: Date,
 *          userId: string,
 *          srcUrl: string | undefined,
 *          tagIds: Array.<string>,
 *          tagNames: Array.<string>}} props.entry entry data
 * @param {removeFromFeedType} props.removeFromFeed
 * @param {React.Dispatch<false | "success" | "fail">} props.setDeleted Reports result of entry deletion from database, false when no deletion attempted or previous result acknowledged.
 * @param {React.Dispatch<boolean>} props.setDeleting Updates whether entry deletion is in progress.
 * @param {React.Dispatch<boolean>} props.setEmptyText Reports whether an empty text entry was attempted.
 * @param {React.Dispatch<
 *        ?{id: string,
 *         type: "text" | "image" | "video",
 *         content: string,
 *         createdAt: Date,
 *         updatedAt: Date,
 *         userId: string,
 *         srcUrl: string | undefined,
 *         tagIds: Array.<string>,
 *         tagNames: Array.<string>}>} props.setEntry Refetches entry when changed from containing data to null.
 * @param {React.Dispatch<boolean>} props.setLoading Updates whether entry is being retrieved / rendering.
 * @param {React.Dispatch<boolean>} props.setUpdateError Reports whether there was an error updating entry in database.
 * @param {React.Dispatch<boolean>} props.setUpdating Updates whether entry update is in progress.
 * @param {updateFeedEntryType} props.updateFeedEntry
 * @param {Array.<{id: string, name: string}>} props.userTags
 */
export default function EditEntryForm({
  entry,
  removeFromFeed,
  setDeleted,
  setDeleting,
  setEmptyText,
  setEntry,
  setLoading,
  setUpdateError,
  setUpdating,
  updateFeedEntry,
  userTags,
}) {
  // document states //
  /**
   * @typedef {string} contentType Content currently displayed in form.
   */
  /**
   * @typedef {React.Dispatch<string>} setContentType Updates content currently displayed in form.
   */
  /**
   * @typedef {boolean} deleteConfirmationType Indicates whether delete confimation dialog is displayed.
   */
  /**
   * @typedef {React.Dispatch<boolean>} setDeleteConfirmationType Toggles delete confirmation dialog.
   */
  /**
   * @typedef {boolean} editableType Indicates whether form is currently editable or read-only.
   */
  /**
   * @typedef {React.Dispatch<boolean>} setEditableType Toggles form between editable and read-only states.
   */
  /**
   * @typedef {Array.<string>} tagNamesType Tag names attached to entry.
   */
  /**
   * @typedef {React.Dispatch<Array.<string>>} setTagNamesType Update tag names attached to entry.
   */

  // initialize states //
  /**
   * @type {[contentType, setContentType]}
   */
  const [content, setContent] = useState(entry.content);
  /**
   * @type {[deleteConfirmationType, setDeleteConfirmationType]}
   */
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);
  /**
   * @type {[editableType, setEditableType]}
   */
  const [editable, setEditable] = useState(false);
  /**
   * @type {[tagNamesType, setTagNamesType]}
   */
  const [tagNames, setTagNames] = useState([...entry.tagNames]);

  // initialize refs //
  const formRef = useRef(null);
  const contentInputRef = useRef(null);

  // handle enable/disable edit //
  function enableEdit() {
    setEditable(true);
  }
  function cancelEdit() {
    setContent(entry.content);
    setTagNames([...entry.tagNames]);
    setEditable(false);
  }

  // manage input data //
  function updateContent() {
    setContent(contentInputRef.current.value);
  }
  const getTagNames = useCallback(function updateTagNames(passedTagNames) {
    setTagNames([...passedTagNames]);
  }, []);

  // handle saving changes //
  async function saveChanges(e) {
    setUpdating(true);
    e.preventDefault();
    const formData = new FormData(formRef.current);
    formData.append("userId", entry.userId);
    formData.append("id", entry.id);
    formData.append("prevTags", JSON.stringify(entry.tagNames));
    formData.append("newTags", JSON.stringify(tagNames));
    const updateStatus = await updateEntryChanges(formData);
    if (updateStatus === "success") {
      updateFeedEntry(entry.id);
      setEntry(null);
      setLoading(true);
    } else if (updateStatus === "empty") {
      setEmptyText(true);
    } else {
      setUpdateError(true);
    }
    setUpdating(false);
  }

  // handle deleting entry //
  function displayDeleteConfirmation() {
    setEditable(false);
    setDeleteConfirmation(true);
  }
  function cancelDelete() {
    setEditable(true);
    setDeleteConfirmation(false);
  }
  async function handleDelete(userId, entryId) {
    setDeleting(true);
    const deleteStatus = await deleteEntry(userId, entryId);
    if (deleteStatus === "success") {
      removeFromFeed(entryId);
      setDeleted("success");
    } else {
      setDeleted("fail");
    }
    setDeleting(false);
  }

  // render //
  return (
    <>
      <form
        className={`${styles.component} ${
          entry.type === "text" ? styles.text : styles.imgVideo
        }`}
        ref={formRef}
      >
        <div
          className={
            entry.type === "text" ? styles.contentField : styles.captionField
          }
        >
          <textarea
            className={
              entry.type === "text" ? styles.contentInput : styles.captionInput
            }
            disabled={!editable}
            name="content"
            onChange={updateContent}
            placeholder={
              entry.type === "text" ? "Write something..." : "no caption"
            }
            ref={contentInputRef}
            required={entry.type === "text"}
            value={content === null ? "" : content}
          ></textarea>
          {entry.type === "text" && editable ? (
            <p className={styles.requiredIndicator}>required</p>
          ) : null}
        </div>
        {editable ? (
          <TagDropdown
            instruction="Edit tags"
            passEntryTagNames={getTagNames}
            preSelectedTagNames={entry.tagNames}
            userTags={userTags}
          />
        ) : tagNames.length > 0 ? (
          <ul className={styles.tags}>
            {tagNames.map((tagName) => (
              <li className={styles.tag} key={uuidv4()}>
                {tagName}
              </li>
            ))}
          </ul>
        ) : null}
        {editable ? (
          <>
            <div className={styles.editActions}>
              <button
                className={`${styles.tertiaryBtn}`}
                onClick={cancelEdit}
                type="button"
              >
                cancel
              </button>
              <button
                className={`${styles.primaryBtn} ${styles.saveBtn}`}
                disabled={
                  entry.type === "text" && contentInputRef.current.value === ""
                }
                onClick={saveChanges}
                type="button"
              >
                save
              </button>
            </div>
            <div className={styles.deleteActions}>
              <button
                className={`${styles.deleteBtn} ${styles.secondaryBtn}`}
                onClick={displayDeleteConfirmation}
                type="button"
              >
                delete entry
              </button>
            </div>
          </>
        ) : (
          <button
            className={`${styles.enableEditBtn} ${styles.secondaryBtn}`}
            disabled={deleteConfirmation}
            onClick={enableEdit}
            type="button"
          >
            edit
          </button>
        )}
        {deleteConfirmation ? (
          <div className={styles.deleteConfirmation}>
            <div>
              <p className={styles.deleteConfirmationMainText}>
                Delete this entry?
              </p>
              <p className={styles.deleteConfirmationSecondaryText}>
                This action cannot be undone.
              </p>
            </div>
            <div>
              <button
                className={styles.deleteConfirmationPrimaryBtn}
                onClick={() => handleDelete(entry.userId, entry.id)}
                type="button"
              >
                Yes
              </button>
              <button
                className={styles.deleteConfirmationSecondaryBtn}
                onClick={cancelDelete}
                type="button"
              >
                No
              </button>
            </div>
          </div>
        ) : null}
      </form>
    </>
  );
}
