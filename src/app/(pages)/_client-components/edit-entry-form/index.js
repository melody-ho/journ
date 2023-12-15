"use client";

import deleteEntry from "@/server-actions/delete-entry";
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
      <form ref={formEl}>
        <textarea
          disabled={!editable}
          name="content"
          onChange={updateContent}
          ref={contentInput}
          value={content}
        ></textarea>
        {editable ? (
          <TagDropdown
            instruction="Edit tags"
            passEntryTags={getTags}
            preSelectedTags={entry.tags}
            userTags={userTags}
          />
        ) : (
          <ul>
            {tags.map((tag) => (
              <li key={uuidv4()}>{tag}</li>
            ))}
          </ul>
        )}
        {editable ? (
          <>
            <button onClick={cancelEdit} type="button">
              cancel
            </button>
            <button onClick={saveChanges} type="button">
              save
            </button>
            <button onClick={() => handleDelete(entry.id)} type="button">
              delete
            </button>
          </>
        ) : (
          <button onClick={enableEdit} type="button">
            edit
          </button>
        )}
      </form>
    </>
  );
}
