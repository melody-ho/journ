"use client";

import deleteEntry from "@/server-actions/delete-entry";
import styles from "./index.module.css";
import TagDropdown from "../tag-dropdown";
import updateEntryChanges from "@/server-actions/update-entry-changes";
import { v4 as uuidv4 } from "uuid";
import { useCallback, useRef, useState } from "react";

export default function EditEntryForm({
  entry,
  removeFromFeed,
  setDeleted,
  setDeleting,
  setEntry,
  setUpdating,
  updateFeed,
  userTags,
}) {
  const [editable, setEditable] = useState(false);
  const [content, setContent] = useState(entry.content);
  const [tags, setTags] = useState([...entry.tags]);
  const formEl = useRef(null);
  const contentInput = useRef(null);

  function enableEdit() {
    setEditable(true);
  }

  function cancelEdit() {
    setContent(entry.content);
    setTags([...entry.tags]);
    setEditable(false);
  }

  function updateContent() {
    setContent(contentInput.current.value);
  }

  const getTags = useCallback(function updateTags(passedTags) {
    setTags([...passedTags]);
  }, []);

  async function saveChanges(e) {
    setUpdating(true);
    e.preventDefault();
    const formData = new FormData(formEl.current);
    formData.append("id", entry.id);
    formData.append("userId", entry.userId);
    formData.append("tags", JSON.stringify(tags));
    await updateEntryChanges(formData);
    if (updateFeed) updateFeed(entry.id);
    setEntry(null);
    setUpdating(false);
  }

  async function handleDelete(id) {
    setDeleting(true);
    await deleteEntry(id);
    if (removeFromFeed) removeFromFeed(entry.id);
    setDeleted(true);
    setDeleting(false);
  }

  return (
    <>
      <form
        className={`${styles.component} ${
          entry.type === "text" ? styles.text : styles.imgVideo
        }`}
        ref={formEl}
      >
        <textarea
          className={
            entry.type === "text" ? styles.contentField : styles.captionField
          }
          disabled={!editable}
          name="content"
          onChange={updateContent}
          placeholder={
            entry.type === "text" ? "Write something..." : "no caption"
          }
          ref={contentInput}
          value={content === null ? "" : content}
        ></textarea>
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
                onClick={saveChanges}
                type="button"
              >
                save
              </button>
            </div>
            <div className={styles.deleteActions}>
              <button
                className={`${styles.deleteBtn} ${styles.secondaryBtn}`}
                onClick={() => handleDelete(entry.id)}
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
