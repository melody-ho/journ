"use client";

import styles from "./index.module.css";
import { useEffect, useRef, useState } from "react";

export default function TagDropdown({ passEntryTags, userTags }) {
  // initialize states and refs //
  const [dropdown, setDropdown] = useState(false);
  const [entryTags, setEntryTags] = useState([]);
  const [matchedTags, setMatchedTags] = useState([]);
  const [newTags, setNewTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const tagSearchRef = useRef(null);

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

  // define event handlers //
  function toggleDropDown() {
    setDropdown(!dropdown);
    setMatchedTags(userTags ? [...userTags] : []);
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
    <div>
      <fieldset className={styles.fieldset}>
        <legend className={styles.visuallyHidden}>Tags</legend>
        <div className={styles.tagsField}>
          <p aria-hidden={true}>Tags:</p>
          <div className={styles.dropdownContainer}>
            <button
              className={styles.dropdownToggle}
              onClick={toggleDropDown}
              type="button"
            >
              <span className={styles.visuallyHidden}>Add tags</span>
              <span
                className={styles.countIndicator}
              >{`${entryTags.length} tag(s) selected `}</span>
              {dropdown ? "▲" : "▼"}
            </button>
            {dropdown ? (
              <div className={`${styles.dropdown}`}>
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
    </div>
  );
}
