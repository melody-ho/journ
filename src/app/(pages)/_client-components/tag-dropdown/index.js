"use client";

/// imports ///
import styles from "./index.module.css";
import { v4 as uuidv4 } from "uuid";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";

/// constants ///
/**
 * Transition duration for closing dropdown, in ms.
 */
const DROPDOWN_CLOSE_DURATION = 200;
/**
 * Maximum character length for tags.
 */
const MAX_TAG_LENGTH = 50;

/// helper components ///
/**
 * @param {Object} props
 * @param {string} props.alt alternative text for the icon
 * @param {string} props.dropdownId id for the dropdown menu it belongs to
 * @param {string} props.imageName name of the icon in public directory
 */
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

/// main component ///
/**
 * Confirms reset of tag dropdown.
 * @callback confirmResetType
 * @returns {void}
 */
/**
 * Reports tag names.
 * @callback passEntryTagNamesType
 * @param {Array.<string>} tagNames
 * @returns {void}
 */
/**
 * @param {Object} props
 * @param {?confirmResetType} props.confirmReset only required if using reset prop
 * @param {string} props.instructions instructions to label dropdown with
 * @param {passEntryTagNamesType} props.passEntryTagNames
 * @param {?Array.<string>} props.preSelectedTagNames optional, null if omitted
 * @param {boolean} props.readOnly optional, false if ommitted
 * @param {boolean} props.reset optional, false if omitted
 * @param {Array.<{id: string, name: string}>} props.userTags
 */
export default function TagDropdown({
  confirmReset = null,
  instructions,
  passEntryTagNames,
  preSelectedTagNames = null,
  readOnly = false,
  reset = false,
  userTags,
}) {
  // document states //
  /**
   * @typedef {boolean | "animate out"} dropdownType Indicates whether dropdown is collapsed, expanded, or animating out.
   */
  /**
   * @typedef {React.Dispatch<boolean | "animate out"} setDropdownType Updates dropdown display state.
   */
  /**
   * @typedef {Array.<string>} entryTagNamesType Names of tags to attach.
   */
  /**
   * @typedef {React.Dispatch<Array.<string>>} setEntryTagNamesType Updates names of tags to attach.
   */
  /**
   * @typedef {Array.<string>} matchedTagNamesType Names of tags matching search.
   */
  /**
   * @typedef {React.Dispatch<Array.<string>>} setMatchedTagNamesType Updates names of tags matching search.
   */
  /**
   * @typedef {Array.<string>} newTagNamesType Names of tags to create and attach.
   */
  /**
   * @typedef {React.Dispatch<Array.<string>>} setNewTagNamesType Updates names of tags to create and attach.
   */
  /**
   * @typedef {?{prev: Array.<string>, curr: Array.<string>}} preSelectedTagNamesTrackerType Contains previous and current pre-selected tag names. null if pre-selected tags are not applicable.
   */
  /**
   * @typedef {React.DispatchWithAction<{newPreSelectedTagNames: Array.<string>}>} dispatchPreSelectedTagNamesTrackerType Updates pre-selected tag names in tracker.
   */
  /**
   * @typedef {Array.<string>} selectedTagNamesType Names of existing user tags to attach.
   */
  /**
   * @typedef {React.Dispatch<Array.<string>>} setSelectedTagNamesType Updates names of existing user tags to attach.
   */
  /**
   * @typedef {Array.<string>} unselectedMatchedTagNamesType Names of tags matching search that are not yet selected.
   */
  /**
   * @typedef {React.Dispatch<Array.<string>>} setUnselectedMatchedTagNamesType Updates names of tags matching search that are not yet selected.
   */

  // initialize states //
  /**
   * @type {[dropdownType, setDropdownType]}
   */
  const [dropdown, setDropdown] = useState(false);
  /**
   * @type {[entryTagNamesType, setEntryTagNamesType]}
   */
  const [entryTagNames, setEntryTagNames] = useState([]);
  /**
   * @type {[matchedTagNamesType, setMatchedTagNamesType]}
   */
  const [matchedTagNames, setMatchedTagNames] = useState([]);
  /**
   * @type {[newTagNamesType, setNewTagNamesType]}
   */
  const [newTagNames, setNewTagNames] = useState([]);
  /**
   * @type {[selectedTagNamesType, setSelectedTagNamesType]}
   */
  const [selectedTagNames, setSelectedTagNames] = useState([]);
  /**
   * @type {[unselectedMatchedTagNamesType, setUnselectedMatchedTagNamesType]}
   */
  const [unselectedMatchedTagNames, setUnselectedMatchedTagNames] = useState(
    [],
  );

  // initialize refs //
  const dropdownId = useRef(uuidv4());
  const dropdownRef = useRef(null);
  const tagSearchRef = useRef(null);

  // initialize reducers //
  /**
   * @type {[preSelectedTagNamesTrackerType, dispatchPreSelectedTagNamesTrackerType]}
   */
  const [preSelectedTagNamesTracker, dispatchPreSelectedTagNamesTracker] =
    useReducer(
      preSelectedTagNamesReducer,
      preSelectedTagNames !== null
        ? { prev: [], curr: [...preSelectedTagNames] }
        : null,
    );
  function preSelectedTagNamesReducer(preSelectedTagNamesTracker, action) {
    const prev = [...preSelectedTagNamesTracker.curr];
    const curr = [...action.newPreSelectedTagNames];
    return { prev, curr };
  }

  // reset dropdown if passed reset: true //
  useEffect(
    function resetDropdown() {
      if (reset) {
        setDropdown(false);
        setEntryTagNames([]);
        setMatchedTagNames([]);
        setNewTagNames([]);
        setSelectedTagNames([]);
        confirmReset();
      }
    },
    [confirmReset, reset],
  );

  // initialize matched tags //
  useEffect(
    function initializeMatchedTagNames() {
      if (userTags !== null) {
        const userTagNames = userTags.map((userTag) => userTag.name);
        setMatchedTagNames(userTagNames);
      }
    },
    [userTags],
  );

  // update unselected matched tags when matched tags or selected tags change //
  useEffect(
    function filterMatchedTagNames() {
      const filtered = matchedTagNames.filter(
        (matchedTagName) => !selectedTagNames.includes(matchedTagName),
      );
      setUnselectedMatchedTagNames(filtered);
    },
    [matchedTagNames, selectedTagNames],
  );

  // pass entry tags when changed //
  useEffect(
    function passUpdatedEntryTagNames() {
      passEntryTagNames([...entryTagNames]);
    },
    [entryTagNames, passEntryTagNames],
  );

  // update new and selected tags when entry tags or user tags change //
  useEffect(
    function updateNewAndSelectedTagNames() {
      const userTagsNames = userTags.map((userTag) => userTag.name);
      const updatedNew = [];
      const updatedSelected = [];
      for (const entryTagName of entryTagNames) {
        if (userTagsNames.includes(entryTagName)) {
          updatedSelected.push(entryTagName);
        } else {
          updatedNew.push(entryTagName);
        }
      }
      setNewTagNames(updatedNew);
      setSelectedTagNames(updatedSelected);
    },
    [entryTagNames, userTags],
  );

  // update entry tags when pre-selected tags change //
  useEffect(
    function updatePreSelectedTagNames() {
      if (preSelectedTagNames !== null) {
        const newPreSelectedTagNames = [...preSelectedTagNames];
        dispatchPreSelectedTagNamesTracker({ newPreSelectedTagNames });
      }
    },
    [dispatchPreSelectedTagNamesTracker, preSelectedTagNames],
  );

  useEffect(
    function applyNewPreSelectedTagNames() {
      if (preSelectedTagNamesTracker !== null) {
        const added = preSelectedTagNamesTracker.curr.filter(
          (tagName) => !preSelectedTagNamesTracker.prev.includes(tagName),
        );
        const removed = preSelectedTagNamesTracker.prev.filter(
          (tagName) => !preSelectedTagNamesTracker.curr.includes(tagName),
        );
        if (added.length > 0) {
          added.forEach((tagName) => {
            setEntryTagNames((entryTagNames) => {
              if (!entryTagNames.includes(tagName)) {
                return [...entryTagNames, tagName].sort();
              } else {
                return [...entryTagNames];
              }
            });
          });
        } else if (removed.length > 0) {
          setEntryTagNames((entryTagNames) =>
            entryTagNames.filter(
              (entryTagName) => !removed.includes(entryTagName),
            ),
          );
        }
      }
    },
    [preSelectedTagNamesTracker],
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

  // handle toggling dropdown //
  function toggleDropdown() {
    if (dropdown === false) {
      setDropdown(true);
      const userTagNames = userTags
        ? userTags.map((userTag) => userTag.name)
        : [];
      setMatchedTagNames(userTagNames);
    } else if (dropdown === true) {
      closeDropdown();
    }
  }

  // handle closing dropdown //
  function closeDropdown() {
    setDropdown("animate out");
    setTimeout(function removeDropdown() {
      setDropdown(false);
    }, DROPDOWN_CLOSE_DURATION);
  }

  // handle change in search input //
  function updateMatchedTagNames(e) {
    const searchValue = e.target.value
      .split(" ")
      .join("")
      .slice(0, MAX_TAG_LENGTH);
    tagSearchRef.current.value = searchValue;
    const regex = new RegExp(searchValue, "i");
    const newMatchedTagNames = userTags.reduce(function filterAndGetName(
      result,
      userTag,
    ) {
      if (userTag.name.match(regex)) {
        result.push(userTag.name);
      }
      return result;
    }, []);
    setMatchedTagNames(newMatchedTagNames);
  }

  // handle selecting a tag //
  function addSelectedTagName(e) {
    const updatedEntryTagNames = [...entryTagNames, e.target.value];
    updatedEntryTagNames.sort();
    setEntryTagNames(updatedEntryTagNames);
  }

  // handle adding a new tag //
  function addNewTagName(tagName) {
    const updatedEntryTagNames = [...entryTagNames, tagName];
    updatedEntryTagNames.sort();
    setEntryTagNames(updatedEntryTagNames);
    tagSearchRef.current.value = "";
    const userTagNames = userTags
      ? userTags.map((userTag) => userTag.name)
      : [];
    setMatchedTagNames(userTagNames);
  }

  // handle unselecting a tag //
  function removeTagName(e) {
    const updatedEntryTagNames = entryTagNames.filter(
      (entryTagName) => entryTagName !== e.target.value,
    );
    setEntryTagNames(updatedEntryTagNames);
  }

  // render //
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
              aria-haspopup="menu"
              aria-label="Toggle tags selection dropdown"
              className={styles.dropdownToggle}
              disabled={readOnly}
              dropdown={dropdownId.current}
              onClick={toggleDropdown}
              type="button"
            >
              <span className={styles.visuallyHidden}>{instructions}</span>
              <span
                className={styles.countIndicator}
                dropdown={dropdownId.current}
              >{`${entryTagNames.length} tag(s) selected `}</span>
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
                role="menu"
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
                        onChange={updateMatchedTagNames}
                        placeholder="Search tags..."
                        ref={tagSearchRef}
                        type="text"
                      ></input>
                    </div>
                    {tagSearchRef.current &&
                    tagSearchRef.current.value &&
                    !matchedTagNames.includes(tagSearchRef.current.value) &&
                    !newTagNames.includes(tagSearchRef.current.value) ? (
                      <button
                        aria-live="polite"
                        className={styles.addNewBtn}
                        dropdown={dropdownId.current}
                        onClick={() =>
                          addNewTagName(tagSearchRef.current.value)
                        }
                        type="button"
                      >
                        <span
                          className={styles.addNewSubLabel}
                          dropdown={dropdownId.current}
                        >
                          Create tag:{" "}
                        </span>
                        <span
                          className={styles.addNewTagLabel}
                          dropdown={dropdownId.current}
                        >
                          {tagSearchRef.current.value}
                        </span>
                      </button>
                    ) : null}
                    <div
                      aria-live="polite"
                      className={styles.dropdownSection}
                      dropdown={dropdownId.current}
                    >
                      <p
                        className={styles.dropdownSectionLabel}
                        dropdown={dropdownId.current}
                      >
                        new
                      </p>
                      {newTagNames.length !== 0 ? (
                        <ul dropdown={dropdownId.current}>
                          {newTagNames.map((newTagName) => (
                            <li dropdown={dropdownId.current} key={newTagName}>
                              <label
                                className={styles.checkboxItem}
                                dropdown={dropdownId.current}
                                htmlFor={newTagName}
                              >
                                <input
                                  checked
                                  className={styles.hiddenCheckbox}
                                  dropdown={dropdownId.current}
                                  id={newTagName}
                                  onChange={removeTagName}
                                  type="checkbox"
                                  value={newTagName}
                                />
                                <div className={styles.checkboxIcon}>
                                  <Icon
                                    alt="checked box icon"
                                    dropdownId={dropdownId.current}
                                    imageName="checked-icon"
                                  />
                                </div>
                                {newTagName}
                              </label>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p
                          aria-description="no new tags"
                          className={styles.noneIndicator}
                          dropdown={dropdownId.current}
                        >
                          none
                        </p>
                      )}
                    </div>
                    <div
                      aria-live="polite"
                      className={styles.dropdownSection}
                      dropdown={dropdownId.current}
                    >
                      <p
                        className={styles.dropdownSectionLabel}
                        dropdown={dropdownId.current}
                      >
                        selected
                      </p>
                      {selectedTagNames.length !== 0 ? (
                        <ul dropdown={dropdownId.current}>
                          {selectedTagNames.map((selectedTagName) => {
                            return (
                              <li
                                dropdown={dropdownId.current}
                                key={selectedTagName}
                              >
                                <label
                                  className={styles.checkboxItem}
                                  dropdown={dropdownId.current}
                                  htmlFor={selectedTagName}
                                >
                                  <input
                                    checked
                                    className={styles.hiddenCheckbox}
                                    dropdown={dropdownId.current}
                                    id={selectedTagName}
                                    onChange={removeTagName}
                                    type="checkbox"
                                    value={selectedTagName}
                                  />
                                  <div className={styles.checkboxIcon}>
                                    <Icon
                                      alt="checked box icon"
                                      dropdownId={dropdownId.current}
                                      imageName="checked-icon"
                                    />
                                  </div>
                                  {selectedTagName}
                                </label>
                              </li>
                            );
                          })}
                        </ul>
                      ) : (
                        <p
                          aria-description="no selected tags"
                          className={styles.noneIndicator}
                          dropdown={dropdownId.current}
                        >
                          none
                        </p>
                      )}
                    </div>
                    <div
                      aria-live="polite"
                      className={`${styles.dropdownSection} ${styles.lastSection}`}
                      dropdown={dropdownId.current}
                    >
                      <p
                        className={styles.dropdownSectionLabel}
                        dropdown={dropdownId.current}
                      >
                        more
                      </p>
                      {unselectedMatchedTagNames.length !== 0 ? (
                        <ul dropdown={dropdownId.current}>
                          {unselectedMatchedTagNames.map((matchedTagName) => {
                            return (
                              <li
                                dropdown={dropdownId.current}
                                key={matchedTagName}
                              >
                                <label
                                  className={styles.checkboxItem}
                                  dropdown={dropdownId.current}
                                  htmlFor={matchedTagName}
                                >
                                  <input
                                    className={styles.hiddenCheckbox}
                                    dropdown={dropdownId.current}
                                    id={matchedTagName}
                                    onChange={addSelectedTagName}
                                    type="checkbox"
                                    value={matchedTagName}
                                  />
                                  <div className={styles.checkboxIcon}>
                                    <Icon
                                      alt="unchecked box icon"
                                      dropdownId={dropdownId.current}
                                      imageName="unchecked-icon"
                                    />
                                  </div>
                                  {matchedTagName}
                                </label>
                              </li>
                            );
                          })}
                        </ul>
                      ) : (
                        <p
                          aria-description="no existing tags that match current search criteria"
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
