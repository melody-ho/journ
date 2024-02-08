"use client";

/// imports ///
import styles from "./index.module.css";
import ThemedImage from "@/helper-components/themed-image";
import { useEffect, useRef, useState } from "react";

/// helper components ///
/**
 * @param {Object} props
 * @param {boolean} props.checked
 */
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
/**
 * Applies filters.
 * @callback applyFiltersType
 * @param {FormData} filtersFormData includes "startDate", "endDate", "type", and "tags"
 * @returns {void}
 */
/**
 * @param {Object} props
 * @param {applyFiltersType} props.applyFilters
 * @param {?Date} props.previousEndDate
 * @param {Array.<"text" | "image" | "video">} props.previousEntryTypes
 * @param {?Date} props.previousStartDate
 * @param {Array.<string>} props.previousTagIds
 * @param {Array.<{id: string, name: string}>} props.userTags
 */
export default function FiltersMenu({
  applyFilters,
  previousEndDate,
  previousEntryTypes,
  previousStartDate,
  previousTagIds,
  userTags,
}) {
  // document states //
  /**
   * @typedef {?Date} endDateType End date selected.
   */
  /**
   * @typedef {React.Dispatch<?Date>} setEndDateType Updates end date selected.
   */
  /**
   * @typedef {Array.<"text" | "image" | "video">} entryTypesType Entry types selected.
   */
  /**
   * @typedef {React.Dispatch<Array.<"text" | "image" | "video">>} setEntryTypesType Updates entry types selected.
   */
  /**
   * @typedef {Array.<{id: string, name: string}>} matchedTagsType Tags matching search.
   */
  /**
   * @typedef {React.Dispatch<Array.<{id: string, name: string}>>} setMatchedTagsType Updates tags matching search.
   */
  /**
   * @typedef {boolean} moreTagsExpandType Indicates whether more tags section is expanded.
   */
  /**
   * @typedef {React.Dispatch<boolean>} setMoreTagsExpandType Toggles more tags section expand/collapse state.
   */
  /**
   * @typedef {Array.<string>} selectedTagIdsType Ids of tags selected.
   */
  /**
   * @typedef {React.Dispatch<Array.<string>>} setSelectedTagIdsType Updates ids of tags selected.
   */
  /**
   * @typedef {boolean} selectedTagsExpandType Indicates whether selected tags section is expanded.
   */
  /**
   * @typedef {React.Dispatch<boolean>} setSelectedTagsExpandType Toggles selected tags section expand/collapse state.
   */
  /**
   * @typedef {?Date} startDateType Start date selected.
   */
  /**
   * @typedef {React.Dispatch<?Date>} setStartDateType Updates start date selected.
   */
  /**
   * @typedef {?Array.<{id: string, name: string}>} unselectedMatchedTagsType Tags matching search that are not currently selected. Null when user tags are loading.
   */
  /**
   * @typedef {React.Dispatch<Array.<{id: string, name: string}>} setUnselectedMatchedTagsType Updates list of tags matching search that are not currently selected.
   */

  // initialize states //
  /**
   * @type {[endDateType, setEndDateType]}
   */
  const [endDate, setEndDate] = useState(previousEndDate);
  /**
   * @type {[entryTypesType, setEntryTypesType]}
   */
  const [entryTypes, setEntryTypes] = useState([...previousEntryTypes]);
  /**
   * @type {[matchedTagsType, setMatchedTagsType]}
   */
  const [matchedTags, setMatchedTags] = useState([...userTags]);
  /**
   * @type {[moreTagsExpandType, setMoreTagsExpandType]}
   */
  const [moreTagsExpand, setMoreTagsExpand] = useState(false);
  /**
   * @type {[selectedTagIdsType, setSelectedTagIdsType]}
   */
  const [selectedTagIds, setSelectedTagIds] = useState([...previousTagIds]);
  /**
   * @type {[selectedTagsExpandType, setSelectedTagsExpandType]}
   */
  const [selectedTagsExpand, setSelectedTagsExpand] = useState(false);
  /**
   * @type {[startDateType, setStartDateType]}
   */
  const [startDate, setStartDate] = useState(previousStartDate);
  /**
   * @type {[unselectedMatchedTagsType, setUnselectedMatchedTagsType]}
   */
  const [unselectedMatchedTags, setUnselectedMatchedTags] = useState(null);

  // initialize refs //
  const endDateInputRef = useRef(null);
  const formRef = useRef(null);
  const startDateInputRef = useRef(null);
  const tagSearchInputRef = useRef(null);

  // update unselected matched tags when matched tags or selected tags change //
  useEffect(
    function filterMatchedTags() {
      const filtered = matchedTags.filter(
        (matchedTag) => !selectedTagIds.includes(matchedTag.id),
      );
      setUnselectedMatchedTags([...filtered]);
    },
    [matchedTags, selectedTagIds],
  );

  // handle clearing filters //
  function clearFilters() {
    setStartDate(null);
    setEndDate(null);
    setEntryTypes([]);
    setSelectedTagIds([]);
    setMatchedTags([...userTags]);
    tagSearchInputRef.current.value = "";
  }

  // handle updating start date //
  function updateStartDate() {
    setStartDate(startDateInputRef.current.value);
  }

  // handle updating end date //
  function updateEndDate() {
    setEndDate(endDateInputRef.current.value);
  }

  // handle updating selected types //
  function updateEntryTypes(e) {
    if (e.target.checked) {
      setEntryTypes((entryTypes) => [...entryTypes, e.target.value]);
    } else {
      const newEntryTypes = entryTypes.filter(
        (entryTypes) => entryTypes !== e.target.value,
      );
      setEntryTypes(newEntryTypes);
    }
  }

  // handle updating selected tags //
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

  // handle updating matched tags //
  function updateMatchedTags(e) {
    const regex = new RegExp(e.target.value, "i");
    const newMatchedTags = userTags.filter((userTag) =>
      userTag.name.match(regex),
    );
    setMatchedTags(newMatchedTags);
  }

  // handle toggling selected tags section //
  function toggleSelectedTagsSection() {
    setSelectedTagsExpand(!selectedTagsExpand);
  }

  // handle toggling more tags section //
  function toggleMoreTagsSection() {
    setMoreTagsExpand(!moreTagsExpand);
  }

  // handle applying filters //
  function handleApply(e) {
    e.preventDefault();
    const formData = new FormData(formRef.current);
    applyFilters(formData);
  }

  // render //
  return (
    <form className={styles.component} onSubmit={handleApply} ref={formRef}>
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
                checked={entryTypes.includes("text")}
                className={styles.hiddenCheckbox}
                id="text"
                name="type"
                onChange={updateEntryTypes}
                type="checkbox"
                value="text"
              />
              <Checkbox checked={entryTypes.includes("text")} />
              text
            </label>
          </li>
          <li>
            <label className={styles.checkboxItem} htmlFor="image">
              <input
                checked={entryTypes.includes("image")}
                className={styles.hiddenCheckbox}
                id="image"
                name="type"
                onChange={updateEntryTypes}
                type="checkbox"
                value="image"
              />
              <Checkbox checked={entryTypes.includes("image")} />
              image
            </label>
          </li>
          <li>
            <label className={styles.checkboxItem} htmlFor="video">
              <input
                checked={entryTypes.includes("video")}
                className={styles.hiddenCheckbox}
                id="video"
                name="type"
                onChange={updateEntryTypes}
                type="checkbox"
                value="video"
              />
              <Checkbox checked={entryTypes.includes("video")} />
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
                  selectedTagsExpand ? styles.expanded : ""
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
                !selectedTagsExpand ? styles.collapsedTagsSection : ""
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
              disabled={unselectedMatchedTags === null}
              onClick={toggleMoreTagsSection}
              type="button"
            >
              <div
                className={`${styles.tagsSectionToggleIcon} ${
                  moreTagsExpand ? styles.expanded : ""
                }`}
              >
                <ThemedImage
                  alt="expand/collapse icon"
                  imageName="collapse-icon"
                />
              </div>
              <h3 className={styles.tagsSectionHeading}>{`more (${
                unselectedMatchedTags === null
                  ? "loading..."
                  : unselectedMatchedTags.length
              })`}</h3>
            </button>
            <div
              className={`${styles.tagsSectionItems} ${
                !moreTagsExpand ? styles.collapsedTagsSection : ""
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
              {unselectedMatchedTags !== null &&
              unselectedMatchedTags.length !== 0 ? (
                <ul aria-live="polite">
                  {unselectedMatchedTags.map((matchedTag) => {
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
