"use client";

import { useRef } from "react";

export default function FiltesMenu({ passFilters, userTags }) {
  const formRef = useRef(null);

  function updateFilters() {
    const formData = new FormData(formRef.current);
    passFilters(formData);
  }

  return (
    <form ref={formRef}>
      <h2>Filters</h2>
      <h3>Tags</h3>
      {userTags.map((userTag) => (
        <div key={userTag.id}>
          <input
            id={userTag.id}
            name="tags"
            onChange={updateFilters}
            type="checkbox"
            value={userTag.id}
          ></input>
          <label htmlFor={userTag.id}>{userTag.name}</label>
        </div>
      ))}
    </form>
  );
}
