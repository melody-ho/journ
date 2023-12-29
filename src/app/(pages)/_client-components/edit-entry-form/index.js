"use client";

/// imports ///
import deleteEntry from "@/server-actions/delete-entry";
import styles from "./index.module.css";
import TagDropdown from "../tag-dropdown";
import updateEntryChanges from "@/server-actions/update-entry-changes";
import { v4 as uuidv4 } from "uuid";
import { useCallback, useRef, useState } from "react";

/// main component ///
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
  updateFeed,
  userTags,
}) {
  // initialize states and refs //
  // states
  const [content, setContent] = useState(entry.content);
  const [editable, setEditable] = useState(false);
  const [tags, setTags] = useState([...entry.tags]);
  // refs
  const formRef = useRef(null);
  const contentInputRef = useRef(null);

  // handle enable/disable edit //
  function enableEdit() {
    setEditable(true);
  }
  function cancelEdit() {
    setContent(entry.content);
    setTags([...entry.tags]);
    setEditable(false);
  }

  // manage input data //
  function updateContent() {
    setContent(contentInputRef.current.value);
  }
  const getTags = useCallback(function updateTags(passedTags) {
    setTags([...passedTags]);
  }, []);

  // handle saving changes //
  async function saveChanges(e) {
    setUpdating(true);
    e.preventDefault();
    const formData = new FormData(formRef.current);
    formData.append("userId", entry.userId);
    formData.append("id", entry.id);
    formData.append("prevTags", JSON.stringify(entry.tags));
    formData.append("newTags", JSON.stringify(tags));
    const updateStatus = await updateEntryChanges(formData);
    if (updateStatus === "success") {
      updateFeed(entry.id);
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
            passEntryTags={getTags}
            preSelectedTags={entry.tags}
            userTags={userTags}
          />
        ) : tags.length > 0 ? (
          <ul className={styles.tags}>
            {tags.map((tag) => (
              <li className={styles.tag} key={uuidv4()}>
                {tag}
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
                onClick={() => handleDelete(entry.userId, entry.id)}
                type="button"
              >
                delete entry
              </button>
            </div>
          </>
        ) : (
          <button
            className={`${styles.enableEditBtn} ${styles.secondaryBtn}`}
            onClick={enableEdit}
            type="button"
          >
            edit
          </button>
        )}
      </form>
    </>
  );
}
