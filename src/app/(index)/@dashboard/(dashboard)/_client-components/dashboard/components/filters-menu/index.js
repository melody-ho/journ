"use client";

import { useRef, useState } from "react";

export default function FiltesMenu({
  passFilters,
  previousEndDate,
  previousStartDate,
  previousTags,
  previousTypes,
  userTags,
}) {
  // initialize states and refs //
  const [startDate, setStartDate] = useState(previousStartDate);
  const [endDate, setEndDate] = useState(previousEndDate);
  const [selectedTypes, setSelectedTypes] = useState([...previousTypes]);
  const [selectedTagIds, setSelectedTagIds] = useState([...previousTags]);
  const [matchedTags, setMatchedTags] = useState([...userTags]);
  const formRef = useRef(null);
  const startDateInput = useRef(null);
  const endDateInput = useRef(null);
  const tagSearchInput = useRef(null);

  // define event handlers //
  function clearFilters() {
    setStartDate(null);
    setEndDate(null);
    setSelectedTypes([]);
    setSelectedTagIds([]);
    setMatchedTags([...userTags]);
    tagSearchInput.current.value = "";
  }

  function updateStartDate() {
    setStartDate(startDateInput.current.value);
  }

  function updateEndDate() {
    setEndDate(endDateInput.current.value);
  }

  function updateSelectedTypes(e) {
    if (e.target.checked) {
      setSelectedTypes((selectedTypes) => [...selectedTypes, e.target.value]);
    } else {
      const newSelectedTypes = selectedTypes.filter(
        (selectedTypes) => selectedTypes !== e.target.value,
      );
      setSelectedTypes(newSelectedTypes);
    }
  }

  function updateSelectedTagIds(e) {
    if (e.target.checked) {
      setSelectedTagIds((selectedTagIds) => [
        ...selectedTagIds,
        e.target.value,
      ]);
    } else {
      const newSelectedTags = selectedTagIds.filter(
        (selectedTagId) => selectedTagId !== e.target.value,
      );
      setSelectedTagIds(newSelectedTags);
    }
  }

  function updateMatchedTags(e) {
    const regex = new RegExp(e.target.value, "i");
    const newMatchedTags = userTags.filter((userTag) =>
      userTag.name.match(regex),
    );
    setMatchedTags(newMatchedTags);
  }

  function applyFilters(e) {
    e.preventDefault();
    const formData = new FormData(formRef.current);
    passFilters(formData);
  }

  return (
    <form onSubmit={applyFilters} ref={formRef}>
      <h1>Filters</h1>
      <button onClick={clearFilters} type="button">
        Clear
      </button>
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
            value={startDate ? startDate : ""}
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
            value={endDate ? endDate : ""}
          />
        </div>
      </fieldset>
      <fieldset>
        <h2>Type</h2>
        <div>
          <input
            checked={selectedTypes.includes("text")}
            id="text"
            name="type"
            onChange={updateSelectedTypes}
            type="checkbox"
            value="text"
          />
          <label htmlFor="text">text</label>
        </div>
        <div>
          <input
            checked={selectedTypes.includes("image")}
            id="image"
            name="type"
            onChange={updateSelectedTypes}
            type="checkbox"
            value="image"
          />
          <label htmlFor="image">image</label>
        </div>
        <div>
          <input
            checked={selectedTypes.includes("video")}
            id="video"
            name="type"
            onChange={updateSelectedTypes}
            type="checkbox"
            value="video"
          />
          <label htmlFor="video">video</label>
        </div>
      </fieldset>
      <fieldset>
        <h2>Tags</h2>
        <div>
          <h3>Selected Tags</h3>
          {userTags.map((userTag) => {
            if (selectedTagIds.includes(userTag.id)) {
              return (
                <div key={userTag.id}>
                  <input
                    checked
                    id={userTag.id}
                    name="tags"
                    onChange={updateSelectedTagIds}
                    type="checkbox"
                    value={userTag.id}
                  />
                  <label htmlFor={userTag.id}>{userTag.name}</label>
                </div>
              );
            }
          })}
        </div>
        <div>
          <h3>Other Tags</h3>
          <div>
            <label htmlFor="tagSearch">Search tags:</label>
            <input
              id="tagSearch"
              onChange={updateMatchedTags}
              ref={tagSearchInput}
              type="search"
            />
          </div>
          {matchedTags.map((matchedTag) => {
            if (!selectedTagIds.includes(matchedTag.id)) {
              return (
                <div key={matchedTag.id}>
                  <input
                    id={matchedTag.id}
                    name="tags"
                    onChange={updateSelectedTagIds}
                    type="checkbox"
                    value={matchedTag.id}
                  />
                  <label htmlFor={matchedTag.id}>{matchedTag.name}</label>
                </div>
              );
            }
          })}
        </div>
      </fieldset>
      <button>Apply Filters</button>
    </form>
  );
}
