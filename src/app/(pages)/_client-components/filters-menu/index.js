"use client";

/// imports ///
import styles from "./index.module.css";
import ThemedImage from "@/helper-components/themed-image";
import { useEffect, useRef, useState } from "react";

/// children components ///
function Checkbox({ checked }) {
  return (
    <div className={styles.checkboxIcon}>
      <ThemedImage
        alt={checked ? "checked icon" : "unchecked icon"}
        imageName={checked ? "checked-icon" : "unchecked-icon"}
      />
    </div>
  );
}

/// main component ///
export default function FiltesMenu({
  passFilters,
  previousEndDate,
  previousStartDate,
  previousTags,
  previousTypes,
  userTags,
}) {
  // initialize states and refs //
  // states
  const [endDate, setEndDate] = useState(previousEndDate);
  const [filteredMatchedTags, setFilteredMatchedTags] = useState(null);
  const [matchedTags, setMatchedTags] = useState([...userTags]);
  const [moreTagsSection, setMoreTagsSection] = useState(false);
  const [selectedTagIds, setSelectedTagIds] = useState([...previousTags]);
  const [selectedTagsSection, setSelectedTagsSection] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState([...previousTypes]);
  const [startDate, setStartDate] = useState(previousStartDate);
  // refs
  const endDateInputRef = useRef(null);
  const formRef = useRef(null);
  const startDateInputRef = useRef(null);
  const tagSearchInputRef = useRef(null);

  // update filtered matched tags when matched tags or selected tags change //
  useEffect(
    function filterMatchedTags() {
      const filtered = matchedTags.filter(
        (matchedTag) => !selectedTagIds.includes(matchedTag.id),
      );
      setFilteredMatchedTags([...filtered]);
    },
    [matchedTags, selectedTagIds],
  );

  // declare event handlers //
  function clearFilters() {
    setStartDate(null);
    setEndDate(null);
    setSelectedTypes([]);
    setSelectedTagIds([]);
    setMatchedTags([...userTags]);
    tagSearchInputRef.current.value = "";
  }

  function updateStartDate() {
    setStartDate(startDateInputRef.current.value);
  }

  function updateEndDate() {
    setEndDate(endDateInputRef.current.value);
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

  function toggleSelectedTagsSection() {
    setSelectedTagsSection(!selectedTagsSection);
  }

  function toggleMoreTagsSection() {
    setMoreTagsSection(!moreTagsSection);
  }

  function applyFilters(e) {
    e.preventDefault();
    const formData = new FormData(formRef.current);
    passFilters(formData);
  }

  return (
    <form className={styles.component} onSubmit={applyFilters} ref={formRef}>
      <h1 className={styles.mainHeading}>Filters</h1>
      <button className={styles.clearBtn} onClick={clearFilters} type="button">
        Clear filters
      </button>
      <fieldset className={styles.fieldset}>
        <legend className={styles.visuallyHiddenLegend}>Date Range</legend>
        <h2 aria-hidden={true} className={styles.fieldsetHeading}>
          Date
        </h2>
        <ul className={styles.dateFields}>
          <li className={styles.dateField}>
            <label className={styles.dateLabel} htmlFor="startDate">
              start
            </label>
            <input
              className={styles.dateInput}
              id="startDate"
              max={endDate}
              name="startDate"
              onChange={updateStartDate}
              ref={startDateInputRef}
              type="date"
              value={startDate ? startDate : ""}
            />
          </li>
          <li className={styles.dateField}>
            <label className={styles.dateLabel} htmlFor="endDate">
              end
            </label>
            <input
              className={styles.dateInput}
              id="endDate"
              min={startDate}
              name="endDate"
              onChange={updateEndDate}
              ref={endDateInputRef}
              type="date"
              value={endDate ? endDate : ""}
            />
          </li>
        </ul>
      </fieldset>
      <fieldset className={styles.fieldset}>
        <legend className={styles.visuallyHiddenLegend}>Entry Types</legend>
        <h2 aria-hidden={true} className={styles.fieldsetHeading}>
          Type
        </h2>
        <ul className={`${styles.checkboxItems} ${styles.typesCheckboxItems}`}>
          <li>
            <label className={styles.checkboxItem} htmlFor="text">
              <input
                checked={selectedTypes.includes("text")}
                className={styles.hiddenCheckbox}
                id="text"
                name="type"
                onChange={updateSelectedTypes}
                type="checkbox"
                value="text"
              />
              <Checkbox checked={selectedTypes.includes("text")} />
              text
            </label>
          </li>
          <li>
            <label className={styles.checkboxItem} htmlFor="image">
              <input
                checked={selectedTypes.includes("image")}
                className={styles.hiddenCheckbox}
                id="image"
                name="type"
                onChange={updateSelectedTypes}
                type="checkbox"
                value="image"
              />
              <Checkbox checked={selectedTypes.includes("image")} />
              image
            </label>
          </li>
          <li>
            <label className={styles.checkboxItem} htmlFor="video">
              <input
                checked={selectedTypes.includes("video")}
                className={styles.hiddenCheckbox}
                id="video"
                name="type"
                onChange={updateSelectedTypes}
                type="checkbox"
                value="video"
              />
              <Checkbox checked={selectedTypes.includes("video")} />
              video
            </label>
          </li>
        </ul>
      </fieldset>
      <fieldset className={styles.fieldset}>
        <legend className={styles.visuallyHiddenLegend}>Tags</legend>
        <h2 aria-hidden={true} className={styles.fieldsetHeading}>
          Tags
        </h2>
        <div className={styles.tagsField}>
          <div className={styles.tagsSection}>
            <button
              aria-label="Collapse/expand selected tags"
              aria-haspopup="menu"
              className={styles.tagsSectionToggle}
              onClick={toggleSelectedTagsSection}
              type="button"
            >
              <div
                className={`${styles.tagsSectionToggleIcon} ${
                  selectedTagsSection ? styles.expanded : ""
                }`}
              >
                <ThemedImage
                  alt="expand/collapse icon"
                  imageName="collapse-icon"
                />
              </div>
              <h3
                className={styles.tagsSectionHeading}
              >{`selected (${selectedTagIds.length})`}</h3>
            </button>
            <div
              className={`${styles.tagsSectionItems} ${
                !selectedTagsSection ? styles.collapsedTagsSection : ""
              }`}
              role="menu"
            >
              {selectedTagIds.length !== 0 ? (
                <ul>
                  {userTags.map((userTag) => {
                    if (selectedTagIds.includes(userTag.id)) {
                      return (
                        <li
                          aria-checked={true}
                          key={userTag.id}
                          role="menuitemcheckbox"
                        >
                          <label
                            className={`${styles.checkboxItem} ${styles.tagsCheckboxItem}`}
                            htmlFor={userTag.id}
                          >
                            <input
                              checked
                              className={styles.hiddenCheckbox}
                              id={userTag.id}
                              name="tags"
                              onChange={updateSelectedTagIds}
                              type="checkbox"
                              value={userTag.id}
                            />
                            <Checkbox checked={true} />
                            {userTag.name}
                          </label>
                        </li>
                      );
                    }
                  })}
                </ul>
              ) : (
                <p className={styles.noneIndicator} role="status">
                  none
                </p>
              )}
            </div>
          </div>
          <div className={styles.tagsSection}>
            <button
              aria-label="Collapse/expand more tags available for selection"
              aria-haspopup="menu"
              className={styles.tagsSectionToggle}
              disabled={filteredMatchedTags === null}
              onClick={toggleMoreTagsSection}
              type="button"
            >
              <div
                className={`${styles.tagsSectionToggleIcon} ${
                  moreTagsSection ? styles.expanded : ""
                }`}
              >
                <ThemedImage
                  alt="expand/collapse icon"
                  imageName="collapse-icon"
                />
              </div>
              <h3 className={styles.tagsSectionHeading}>{`more (${
                filteredMatchedTags === null
                  ? "loading..."
                  : filteredMatchedTags.length
              })`}</h3>
            </button>
            <div
              className={`${styles.tagsSectionItems} ${
                !moreTagsSection ? styles.collapsedTagsSection : ""
              }`}
              role="menu"
            >
              <div role="menuitem">
                <label
                  className={styles.visuallyHiddenLabel}
                  htmlFor="tagSearch"
                >
                  Search tags
                </label>
                <input
                  className={styles.searchInput}
                  id="tagSearch"
                  onChange={updateMatchedTags}
                  placeholder="Search tags..."
                  ref={tagSearchInputRef}
                  type="search"
                />
              </div>
              {filteredMatchedTags !== null &&
              filteredMatchedTags.length !== 0 ? (
                <ul aria-live="polite">
                  {filteredMatchedTags.map((matchedTag) => {
                    if (!selectedTagIds.includes(matchedTag.id)) {
                      return (
                        <li
                          aria-checked={false}
                          key={matchedTag.id}
                          role="menuitemcheckbox"
                        >
                          <label
                            className={`${styles.checkboxItem} ${styles.tagsCheckboxItem}`}
                            htmlFor={matchedTag.id}
                          >
                            <input
                              className={styles.hiddenCheckbox}
                              id={matchedTag.id}
                              name="tags"
                              onChange={updateSelectedTagIds}
                              type="checkbox"
                              value={matchedTag.id}
                            />
                            <Checkbox checked={false} />
                            {matchedTag.name}
                          </label>
                        </li>
                      );
                    }
                  })}
                </ul>
              ) : (
                <p className={styles.noneIndicator} role="status">
                  none
                </p>
              )}
            </div>
          </div>
        </div>
      </fieldset>
      <div className={styles.applyBtnWrapper}>
        <button className={styles.applyBtn}>Apply filters</button>
      </div>
    </form>
  );
}
