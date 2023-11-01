"use client";

import deleteEntry from "./server-actions/delete-entry";
import updateChanges from "./server-actions/update-changes";
import { useRef, useState } from "react";

export default function EditForm({ entry }) {
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

  function saveChanges(e) {
    e.preventDefault();
    const formData = new FormData(formEl.current);
    formData.append("id", entry.id);
    formData.append("userId", entry.userId);
    formData.append("tags", JSON.stringify(tags));
    updateChanges(formData);
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
            <li key={crypto.randomUUID()}>
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
      <button onClick={() => deleteEntry(entry.id)} type="button">
        delete
      </button>
    </>
  );
}