"use client";

import addTextEntry from "./server-actions/add-text-entry";
import TagForm from "../helper-components/tag-form";
import { useRef } from "react";

export default function TextForm({ user }) {
  const textForm = useRef(null);

  let tags = [];
  function getData(data) {
    tags = data;
  }

  async function submitEntry(e) {
    e.preventDefault();
    const formData = new FormData(textForm.current);
    formData.append("user", user);
    formData.append("tags", JSON.stringify(tags));
    await addTextEntry(formData);
  }

  return (
    <>
      <h2>Text</h2>
      <form ref={textForm}>
        <label htmlFor="text">Text</label>
        <textarea id="text" name="text"></textarea>
        <TagForm passData={getData} />
        <button onClick={submitEntry}>Add entry</button>
      </form>
    </>
  );
}
