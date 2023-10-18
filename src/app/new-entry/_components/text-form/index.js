"use client";

import addTextEntry from "./_actions/add-text-entry";
import { useRef } from "react";

export default function TextForm({ user }) {
  const textForm = useRef(null);

  async function submitEntry(e) {
    e.preventDefault();
    const formData = new FormData(textForm.current);
    formData.append("user", user);
    await addTextEntry(formData);
  }

  return (
    <>
      <h2>Text</h2>
      <form ref={textForm}>
        <label htmlFor="text">Text</label>
        <textarea id="text" name="text"></textarea>
        <button onClick={submitEntry}>Add entry</button>
      </form>
    </>
  );
}
