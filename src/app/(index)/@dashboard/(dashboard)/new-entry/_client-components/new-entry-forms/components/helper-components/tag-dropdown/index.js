"use client";

import styles from "./index.module.css";
import { useEffect, useReducer, useRef, useState } from "react";

export default function TagDropdown({
  confirmReset = null,
  instruction,
  passEntryTags,
  preSelectedTags = null,
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

  // update and pass entry tags when changed //
  useEffect(
    function updateEntryTags() {
      setEntryTags([...newTags, ...selectedTags]);
    },
    [newTags, selectedTags],
  );

  useEffect(
    function passUpdatedTags() {
      passEntryTags([...entryTags]);
    },
    [entryTags, passEntryTags],
  );

  // update new and selected tags when preselected tags change //
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
        const userTagsNames = userTags
          ? userTags.map((userTag) => userTag.name)
          : [];
        const added = preSelected.curr.filter(
          (tag) => !preSelected.prev.includes(tag),
        );
        const removed = preSelected.prev.filter(
          (tag) => !preSelected.curr.includes(tag),
        );
        if (added.length > 0) {
          added.forEach((tag) => {
            if (userTagsNames.includes(tag)) {
              setSelectedTags((selectedTags) =>
                selectedTags.includes(tag)
                  ? [...selectedTags]
                  : [...selectedTags, tag],
              );
            } else if (!userTagsNames.includes(tag)) {
              setNewTags((newTags) =>
                newTags.includes(tag) ? [...newTags] : [...newTags, tag].sort(),
              );
            }
          });
        } else if (removed.length > 0) {
          setSelectedTags((selectedTags) =>
            selectedTags.filter(
              (selectedTag) => !removed.includes(selectedTag),
            ),
          );
          setNewTags((newTags) =>
            newTags.filter((newTag) => !removed.includes(newTag)),
          );
        }
      }
    },
    [preSelected, userTags],
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
    if (!dropdownRef.current.contains(e.target)) {
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

  function updateSelectedTags(e) {
    if (e.target.checked) {
      setSelectedTags([...selectedTags, e.target.value]);
    } else {
      const newSelectedTags = selectedTags.filter(
        (selectedTag) => selectedTag !== e.target.value,
      );
      setSelectedTags(newSelectedTags);
    }
  }

  function addNewTag(tagName) {
    const updatedNewTags = [...newTags, tagName];
    updatedNewTags.sort();
    setNewTags(updatedNewTags);
    tagSearchRef.current.value = "";
    setMatchedTags(userTags ? [...userTags] : []);
  }

  function removeFromNewTags(e) {
    const updatedNewTags = newTags.filter(
      (newTag) => newTag !== e.target.value,
    );
    setNewTags(updatedNewTags);
  }

  return (
    <>
      <fieldset className={styles.fieldset}>
        <legend className={styles.visuallyHidden}>Tags</legend>
        <div className={styles.tagsField}>
          <div className={styles.dropdownContainer} ref={dropdownRef}>
            <button
              className={styles.dropdownToggle}
              onClick={toggleDropdown}
              type="button"
            >
              <span className={styles.visuallyHidden}>{instruction}</span>
              <span
                className={styles.countIndicator}
              >{`${entryTags.length} tag(s) selected `}</span>
              {dropdown ? "▲" : "▼"}
            </button>
            {dropdown ? (
              <div className={styles.dropdown}>
                {userTags !== null ? (
                  <>
                    <div className={styles.searchBar}>
                      <label
                        className={styles.visuallyHidden}
                        htmlFor="searchTags"
                      >
                        Search tags:
                      </label>
                      <input
                        className={styles.searchInput}
                        id="searchTags"
                        onChange={updateMatchedTags}
                        placeholder="Search tags..."
                        ref={tagSearchRef}
                        type="text"
                      ></input>
                    </div>
                    <div className={styles.dropdownSection}>
                      <p className={styles.dropdownSectionLabel}>new</p>
                      {newTags.length !== 0 ? (
                        newTags.map((newTag) => (
                          <div key={newTag}>
                            <input
                              checked
                              id={newTag}
                              onChange={removeFromNewTags}
                              type="checkbox"
                              value={newTag}
                            />
                            <label htmlFor={newTag}>{newTag}</label>
                          </div>
                        ))
                      ) : (
                        <p className={styles.noneIndicator}>none</p>
                      )}
                    </div>
                    <div className={styles.dropdownSection}>
                      <p className={styles.dropdownSectionLabel}>selected</p>
                      {selectedTags.length !== 0 ? (
                        userTags.map((userTag) => {
                          if (selectedTags.includes(userTag.name)) {
                            return (
                              <div key={userTag.name}>
                                <input
                                  checked
                                  id={userTag.name}
                                  onChange={updateSelectedTags}
                                  type="checkbox"
                                  value={userTag.name}
                                />
                                <label htmlFor={userTag.name}>
                                  {userTag.name}
                                </label>
                              </div>
                            );
                          }
                        })
                      ) : (
                        <p className={styles.noneIndicator}>none</p>
                      )}
                    </div>
                    <div
                      className={`${styles.dropdownSection} ${styles.lastSection}`}
                    >
                      <p className={styles.dropdownSectionLabel}>more</p>
                      {matchedTags.length !== 0 ? (
                        matchedTags.map((matchedTag) => {
                          if (!selectedTags.includes(matchedTag.name)) {
                            return (
                              <div key={matchedTag.name}>
                                <input
                                  id={matchedTag.name}
                                  onChange={updateSelectedTags}
                                  type="checkbox"
                                  value={matchedTag.name}
                                />
                                <label htmlFor={matchedTag.name}>
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
                          onClick={() => addNewTag(tagSearchRef.current.value)}
                          type="button"
                        >
                          <span className={styles.addNewSubLabel}>
                            Create tag:{" "}
                          </span>
                          {tagSearchRef.current.value}
                        </button>
                      ) : (
                        <p className={styles.noneIndicator}>none</p>
                      )}
                    </div>
                  </>
                ) : (
                  <p className={styles.loadingIndicator}>loading...</p>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </fieldset>
    </>
  );
}
