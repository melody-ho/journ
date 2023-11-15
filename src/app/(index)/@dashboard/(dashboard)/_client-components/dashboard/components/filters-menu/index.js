"use client";

import { useRef, useState } from "react";

export default function FiltesMenu({ passFilters, userTags }) {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const formRef = useRef(null);
  const startDateInput = useRef(null);
  const endDateInput = useRef(null);

  function updateStartDate() {
    setStartDate(startDateInput.current.value);
  }

  function updateEndDate() {
    setEndDate(endDateInput.current.value);
  }

  function applyFilters(e) {
    e.preventDefault();
    const formData = new FormData(formRef.current);
    passFilters(formData);
  }

  return (
    <form onSubmit={applyFilters} ref={formRef}>
      <h1>Filters</h1>
      <fieldset>
        <h2>Date</h2>
        <div>
          <label htmlFor="startDate">start</label>
          <input
            id="startDate"
            max={endDate}
            name="startDate"
            onChange={updateStartDate}
            ref={startDateInput}
            type="date"
          />
        </div>
        <div>
          <label htmlFor="endDate">end</label>
          <input
            id="endDate"
            min={startDate}
            name="endDate"
            onChange={updateEndDate}
            ref={endDateInput}
            type="date"
          />
        </div>
      </fieldset>
      <fieldset>
        <h2>Type</h2>
        <div>
          <input id="text" name="type" type="checkbox" value="text" />
          <label htmlFor="text">text</label>
        </div>
        <div>
          <input id="image" name="type" type="checkbox" value="image" />
          <label htmlFor="image">image</label>
        </div>
        <div>
          <input id="video" name="type" type="checkbox" value="video" />
          <label htmlFor="video">video</label>
        </div>
      </fieldset>
      <fieldset>
        <h2>Tags</h2>
        {userTags.map((userTag) => (
          <div key={userTag.id}>
            <input
              id={userTag.id}
              name="tags"
              type="checkbox"
              value={userTag.id}
            ></input>
            <label htmlFor={userTag.id}>{userTag.name}</label>
          </div>
        ))}
      </fieldset>
      <button>Apply Filters</button>
    </form>
  );
}
