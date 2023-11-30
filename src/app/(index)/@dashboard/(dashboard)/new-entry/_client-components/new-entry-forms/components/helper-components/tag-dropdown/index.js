"use client";

import styles from "./index.module.css";
import { v4 as uuidv4 } from "uuid";
import { useEffect, useReducer, useRef, useState } from "react";

export default function TagDropdown({
  confirmReset = null,
  instruction,
  passEntryTags,
  preSelectedTags = null,
  readOnly = false,
  reset = false,
  userTags,
}) {
  // initialize states and refs //
  const [dropdown, setDropdown] = useState(false);
  const [entryTags, setEntryTags] = useState([]);
  const [matchedTags, setMatchedTags] = useState([]);
  const [newTags, setNewTags] = useState([]);
  const [preSelected, dispatchPreSelected] = useReducer(
    preSelectedReducer,
    preSelectedTags !== null ? { prev: [], curr: [...preSelectedTags] } : null,
  );
  const [selectedTags, setSelectedTags] = useState([]);
  const dropdownId = useRef(uuidv4());
  const dropdownRef = useRef(null);
  const tagSearchRef = useRef(null);

  // define reducers //
  function preSelectedReducer(preSelected, action) {
    const prev = [...preSelected.curr];
    const curr = [...action.newPreSelected];
    return { prev, curr };
  }

  // reset dropdown if passed reset: true //
  useEffect(
    function resetDropdown() {
      if (reset) {
        setDropdown(false);
        setEntryTags([]);
        setMatchedTags([]);
        setNewTags([]);
        setSelectedTags([]);
        confirmReset();
      }
    },
    [confirmReset, reset],
  );

  // initialize matched tags //
  useEffect(
    function updateUserTags() {
      if (userTags !== null) {
        setMatchedTags([...userTags]);
      }
    },
    [userTags],
  );

  // pass entry tags when changed //
  useEffect(
    function passUpdatedTags() {
      passEntryTags([...entryTags]);
    },
    [entryTags, passEntryTags],
  );

  // update new and selected tags when entry tags or user tags change //
  useEffect(
    function updateNewAndSelected() {
      const userTagsNames = userTags.map((userTag) => userTag.name);
      const updatedNew = [];
      const updatedSelected = [];
      for (const entryTag of entryTags) {
        if (userTagsNames.includes(entryTag)) {
          updatedSelected.push(entryTag);
        } else {
          updatedNew.push(entryTag);
        }
      }
      setNewTags(updatedNew);
      setSelectedTags(updatedSelected);
    },
    [entryTags, userTags],
  );

  // update entry tags when preselected tags change //
  useEffect(
    function updatePreSelectedTags() {
      if (preSelectedTags !== null) {
        const newPreSelected = [...preSelectedTags];
        dispatchPreSelected({ newPreSelected });
      }
    },
    [dispatchPreSelected, preSelectedTags],
  );

  useEffect(
    function applyNewPreSelected() {
      if (preSelected !== null) {
        const added = preSelected.curr.filter(
          (tag) => !preSelected.prev.includes(tag),
        );
        const removed = preSelected.prev.filter(
          (tag) => !preSelected.curr.includes(tag),
        );
        if (added.length > 0) {
          added.forEach((tag) => {
            setEntryTags((entryTags) => [...entryTags, tag].sort());
          });
        } else if (removed.length > 0) {
          setEntryTags((entryTags) =>
            entryTags.filter((entryTag) => !removed.includes(entryTag)),
          );
        }
      }
    },
    [preSelected],
  );

  // define event handlers //
  function toggleDropdown() {
    if (!dropdown) {
      window.addEventListener("click", handleClickOut);
    }
    setDropdown(!dropdown);
    setMatchedTags(userTags ? [...userTags] : []);
  }

  function handleClickOut(e) {
    if (e.target.getAttribute("dropdown") !== dropdownId.current) {
      setDropdown(false);
      window.removeEventListener("click", handleClickOut);
    }
  }

  function updateMatchedTags(e) {
    const regex = new RegExp(e.target.value, "i");
    const newMatchedTags = userTags.filter((userTag) =>
      userTag.name.match(regex),
    );
    setMatchedTags(newMatchedTags);
  }

  function addSelectedTag(e) {
    const updatedEntryTags = [...entryTags, e.target.value];
    updatedEntryTags.sort();
    setEntryTags(updatedEntryTags);
  }

  function addNewTag(tagName) {
    const updatedEntryTags = [...entryTags, tagName];
    updatedEntryTags.sort();
    setEntryTags(updatedEntryTags);
    tagSearchRef.current.value = "";
    setMatchedTags(userTags ? [...userTags] : []);
  }

  function removeTag(e) {
    const updatedEntryTags = entryTags.filter(
      (entryTag) => entryTag !== e.target.value,
    );
    setEntryTags(updatedEntryTags);
  }

  return (
    <>
      <fieldset className={styles.fieldset}>
        <legend className={styles.visuallyHidden}>Tags</legend>
        <div className={styles.tagsField}>
          <div
            className={styles.dropdownContainer}
            dropdown={dropdownId.current}
            ref={dropdownRef}
          >
            <button
              className={styles.dropdownToggle}
              disabled={readOnly}
              dropdown={dropdownId.current}
              onClick={toggleDropdown}
              type="button"
            >
              <span className={styles.visuallyHidden}>{instruction}</span>
              <span
                className={styles.countIndicator}
                dropdown={dropdownId.current}
              >{`${entryTags.length} tag(s) selected `}</span>
              {dropdown ? "▲" : "▼"}
            </button>
            {dropdown ? (
              <div className={styles.dropdown} dropdown={dropdownId.current}>
                {userTags !== null ? (
                  <>
                    <div
                      className={styles.searchBar}
                      dropdown={dropdownId.current}
                    >
                      <label
                        className={styles.visuallyHidden}
                        dropdown={dropdownId.current}
                        htmlFor="searchTags"
                      >
                        Search tags:
                      </label>
                      <input
                        className={styles.searchInput}
                        dropdown={dropdownId.current}
                        id="searchTags"
                        onChange={updateMatchedTags}
                        placeholder="Search tags..."
                        ref={tagSearchRef}
                        type="text"
                      ></input>
                    </div>
                    <div
                      className={styles.dropdownSection}
                      dropdown={dropdownId.current}
                    >
                      <p
                        className={styles.dropdownSectionLabel}
                        dropdown={dropdownId.current}
                      >
                        new
                      </p>
                      {newTags.length !== 0 ? (
                        newTags.map((newTag) => (
                          <div dropdown={dropdownId.current} key={newTag}>
                            <input
                              checked
                              dropdown={dropdownId.current}
                              id={newTag}
                              onChange={removeTag}
                              type="checkbox"
                              value={newTag}
                            />
                            <label
                              dropdown={dropdownId.current}
                              htmlFor={newTag}
                            >
                              {newTag}
                            </label>
                          </div>
                        ))
                      ) : (
                        <p
                          className={styles.noneIndicator}
                          dropdown={dropdownId.current}
                        >
                          none
                        </p>
                      )}
                    </div>
                    <div
                      className={styles.dropdownSection}
                      dropdown={dropdownId.current}
                    >
                      <p
                        className={styles.dropdownSectionLabel}
                        dropdown={dropdownId.current}
                      >
                        selected
                      </p>
                      {selectedTags.length !== 0 ? (
                        selectedTags.map((selectedTag) => {
                          return (
                            <div
                              dropdown={dropdownId.current}
                              key={selectedTag}
                            >
                              <input
                                checked
                                dropdown={dropdownId.current}
                                id={selectedTag}
                                onChange={removeTag}
                                type="checkbox"
                                value={selectedTag}
                              />
                              <label
                                dropdown={dropdownId.current}
                                htmlFor={selectedTag}
                              >
                                {selectedTag}
                              </label>
                            </div>
                          );
                        })
                      ) : (
                        <p
                          className={styles.noneIndicator}
                          dropdown={dropdownId.current}
                        >
                          none
                        </p>
                      )}
                    </div>
                    <div
                      className={`${styles.dropdownSection} ${styles.lastSection}`}
                      dropdown={dropdownId.current}
                    >
                      <p
                        className={styles.dropdownSectionLabel}
                        dropdown={dropdownId.current}
                      >
                        more
                      </p>
                      {matchedTags.length !== 0 ? (
                        matchedTags.map((matchedTag) => {
                          if (!selectedTags.includes(matchedTag.name)) {
                            return (
                              <div
                                dropdown={dropdownId.current}
                                key={matchedTag.name}
                              >
                                <input
                                  dropdown={dropdownId.current}
                                  id={matchedTag.name}
                                  onChange={addSelectedTag}
                                  type="checkbox"
                                  value={matchedTag.name}
                                />
                                <label
                                  dropdown={dropdownId.current}
                                  htmlFor={matchedTag.name}
                                >
                                  {matchedTag.name}
                                </label>
                              </div>
                            );
                          }
                        })
                      ) : tagSearchRef.current &&
                        tagSearchRef.current.value &&
                        !newTags.includes(tagSearchRef.current.value) ? (
                        <button
                          className={styles.addNewBtn}
                          dropdown={dropdownId.current}
                          onClick={() => addNewTag(tagSearchRef.current.value)}
                          type="button"
                        >
                          <span
                            className={styles.addNewSubLabel}
                            dropdown={dropdownId.current}
                          >
                            Create tag:{" "}
                          </span>
                          {tagSearchRef.current.value}
                        </button>
                      ) : (
                        <p
                          className={styles.noneIndicator}
                          dropdown={dropdownId.current}
                        >
                          none
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <p
                    className={styles.loadingIndicator}
                    dropdown={dropdownId.current}
                  >
                    loading...
                  </p>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </fieldset>
    </>
  );
}
