"use client";

import { useEffect, useRef, useState } from "react";

export default function TagForm({ passData }) {
  const [tags, setTags] = useState([]);
  const inputRef = useRef(null);

  useEffect(
    function updateTags() {
      passData(tags);
    },
    [passData, tags],
  );

  function addTag() {
    const newTag = inputRef.current.value;
    setTags((tags) => [...tags, newTag]);
    inputRef.current.value = "";
  }

  return (
    <>
      <label htmlFor="tag">Tag</label>
      <input id="tag" ref={inputRef} type="text"></input>
      <button onClick={addTag} type="button">
        Add
      </button>
    </>
  );
}
