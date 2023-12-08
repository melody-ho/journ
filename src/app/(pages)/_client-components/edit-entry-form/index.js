"use client";

import deleteEntry from "@/server-actions/delete-entry";
import updateEntryChanges from "@/server-actions/update-entry-changes";
import { v4 as uuidv4 } from "uuid";
import { useRef, useState } from "react";

export default function EditEntryForm({
  entry,
  removeFromFeed,
  setDeleted,
  setDeleting,
  setEntry,
  setUpdating,
  updateFeed,
}) {
  const [editable, setEditable] = useState(false);
  const [content, setContent] = useState(entry.content);
  const [tags, setTags] = useState([...entry.tags]);
  const formEl = useRef(null);
  const contentInput = useRef(null);
  const tagInput = useRef(null);

  function enableEdit() {
    setEditable(true);
  }

  function updateContent() {
    setContent(contentInput.current.value);
  }

  function addTag() {
    const newTag = tagInput.current.value;
    setTags((tags) => [...tags, newTag]);
    tagInput.current.value = "";
  }

  function deleteTag(deleted) {
    setTags((tags) => tags.filter((tag) => tag !== deleted));
  }

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
        <div hidden={!editable}>
          <label htmlFor="tag">Add tag:</label>
          <input id="tag" ref={tagInput} type="text"></input>
          <button onClick={addTag} type="button">
            Add
          </button>
        </div>
        <ul>
          {tags.map((tag) => (
            <li key={uuidv4()}>
              {tag}
              <button
                hidden={!editable}
                onClick={() => deleteTag(tag)}
                type="button"
              >
                x
              </button>
            </li>
          ))}
        </ul>
        <button hidden={!editable} onClick={saveChanges}>
          save
        </button>
      </form>
      <button onClick={enableEdit} type="button">
        edit
      </button>
      <button onClick={() => handleDelete(entry.id)} type="button">
        delete
      </button>
    </>
  );
}
