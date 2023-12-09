"use client";

import styles from "./index.module.css";
import { v4 as uuidv4 } from "uuid";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";

const DROPDOWN_CLOSE_DURATION = 200;

function Icon({ alt, dropdownId, imageName }) {
  return (
    <picture>
      <source
        media="(prefers-color-scheme: dark)"
        srcSet={`/${imageName}/dark.svg`}
      />
      <img alt={alt} dropdown={dropdownId} src={`/${imageName}/light.svg`} />
    </picture>
  );
}

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
  const [filteredMatchedTags, setFilteredMatchedTags] = useState([]);
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

  // update filtered matched tags when matched tags or selected tags change //
  useEffect(
    function filterMatchedTags() {
      const filtered = matchedTags.filter(
        (matchedTag) => !selectedTags.includes(matchedTag.name),
      );
      setFilteredMatchedTags([...filtered]);
    },
    [matchedTags, selectedTags],
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
            setEntryTags((entryTags) => {
              if (!entryTags.includes(tag)) {
                return [...entryTags, tag].sort();
              } else {
                return [...entryTags];
              }
            });
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

  // add/remove event listener for clicking out when dropdown is shown/hidden //
  const handleClickOut = useCallback((e) => {
    if (e.target.getAttribute("dropdown") !== dropdownId.current) {
      closeDropdown();
    }
  }, []);

  useEffect(
    function toggleClickOutListener() {
      if (dropdown === true) {
        window.addEventListener("click", handleClickOut);
      } else {
        window.removeEventListener("click", handleClickOut);
      }
    },
    [dropdown, handleClickOut],
  );

  // define event handlers //
  function toggleDropdown() {
    if (dropdown === false) {
      setDropdown(true);
      setMatchedTags(userTags ? [...userTags] : []);
    } else if (dropdown === true) {
      closeDropdown();
    }
  }

  function closeDropdown() {
    setDropdown("animate out");
    setTimeout(function removeDropdown() {
      setDropdown(false);
    }, DROPDOWN_CLOSE_DURATION);
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
              <div
                className={`${styles.dropdownIconWrapper} ${
                  dropdown ? styles.reverse : null
                }`}
                dropdown={dropdownId.current}
              >
                <Icon
                  alt="dropdown icon"
                  dropdownId={dropdownId.current}
                  imageName="dropdown-icon"
                />
              </div>
            </button>
            {dropdown ? (
              <div
                className={`${styles.dropdown} ${styles.growDown} ${
                  dropdown === "animate out" ? styles.shrinkUp : null
                }`}
                dropdown={dropdownId.current}
              >
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
                    {matchedTags.length === 0 &&
                    tagSearchRef.current &&
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
                    ) : null}
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
                            <label
                              className={styles.checkboxItem}
                              dropdown={dropdownId.current}
                              htmlFor={newTag}
                            >
                              <input
                                checked
                                className={styles.hiddenCheckbox}
                                dropdown={dropdownId.current}
                                id={newTag}
                                onChange={removeTag}
                                type="checkbox"
                                value={newTag}
                              />
                              <div className={styles.checkboxIcon}>
                                <Icon
                                  alt="checked box icon"
                                  dropdownId={dropdownId.current}
                                  imageName="checked-icon"
                                />
                              </div>
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
                              <label
                                className={styles.checkboxItem}
                                dropdown={dropdownId.current}
                                htmlFor={selectedTag}
                              >
                                <input
                                  checked
                                  className={styles.hiddenCheckbox}
                                  dropdown={dropdownId.current}
                                  id={selectedTag}
                                  onChange={removeTag}
                                  type="checkbox"
                                  value={selectedTag}
                                />
                                <div className={styles.checkboxIcon}>
                                  <Icon
                                    alt="checked box icon"
                                    dropdownId={dropdownId.current}
                                    imageName="checked-icon"
                                  />
                                </div>
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
                      {filteredMatchedTags.length !== 0 ? (
                        filteredMatchedTags.map((matchedTag) => {
                          return (
                            <div
                              dropdown={dropdownId.current}
                              key={matchedTag.name}
                            >
                              <label
                                className={styles.checkboxItem}
                                dropdown={dropdownId.current}
                                htmlFor={matchedTag.name}
                              >
                                <input
                                  className={styles.hiddenCheckbox}
                                  dropdown={dropdownId.current}
                                  id={matchedTag.name}
                                  onChange={addSelectedTag}
                                  type="checkbox"
                                  value={matchedTag.name}
                                />
                                <div className={styles.checkboxIcon}>
                                  <Icon
                                    alt="unchecked box icon"
                                    dropdownId={dropdownId.current}
                                    imageName="unchecked-icon"
                                  />
                                </div>
                                {matchedTag.name}
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
