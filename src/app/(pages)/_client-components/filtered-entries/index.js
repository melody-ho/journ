"use client";

/// imports ///
import EntryModal from "../entry-modal";
import getEntries from "@/server-actions/get-entries";
import getEntry from "@/server-actions/get-entry";
import Image from "next/image";
import Link from "next/link";
import styles from "./index.module.css";
import ThemedImage from "@/helper-components/themed-image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/// helper functions ///
/**
 * Generates individual entry layout size.
 * @returns {"small" | "large"}
 */
const getLayoutSize = (function getLayoutSizeFactory() {
  let _remainingSmall = false;
  function getLayoutSize() {
    if (_remainingSmall) {
      _remainingSmall = false;
      return "small";
    } else {
      const randomNum = Math.floor(Math.random() * 2);
      if (randomNum === 0) {
        _remainingSmall = true;
        return "small";
      }
      return "large";
    }
  }
  return getLayoutSize;
})();

/// main component ///
/**
 * Confirms feed has been reset.
 * @callback confirmFeedResetType
 * @returns {void}
 */
/**
 * Triggers feed reset.
 * @callback triggerFeedResetType
 * @returns {void}
 */
/**
 * @param {Object} props
 * @param {confirmFeedResetType} props.confirmFeedReset
 * @param {boolean} props.feedReset Indicates whether feed should be reset.
 * @param {?Date} props.filterEndDate
 * @param {Array.<"text" | "image" | "video">}  props.filterEntryTypes
 * @param {?Date} props.filterStartDate
 * @param {Array.<string>} props.filterTagIds
 * @param {triggerFeedResetType} props.triggerFeedReset
 * @param {string} props.userId
 * @param {Array.<{id: string, name: string}>} props.userTags
 */
export default function FilteredEntries({
  confirmFeedReset,
  feedReset,
  filterEndDate,
  filterEntryTypes,
  filterStartDate,
  filterTagIds,
  triggerFeedReset,
  userId,
  userTags,
}) {
  // initialize router //
  const router = useRouter();

  // document states //
  /**
   * @typedef {Object} entryType An entry in feed.
   * @property {string} id
   * @property {"text" | "image" | "video"} type
   * @property {string} content
   * @property {Date} createdAt
   * @property {Date} updatedAt
   * @property {string | undefined} srcUrl Only required for type: "image" and type: "video".
   * @property {"small" | "large"} layoutSize
   * @property {number} page
   * @property {boolean} loaded
   * @property {boolean} error Optional. Evaluated as no error if omitted.
   */
  /**
   * @typedef {Array.<entryType>} entriesType List of entries in feed.
   */
  /**
   * @typedef {React.Dispatch<Array.<entryType>>} setEntriesType Updates list of entries in feed.
   */
  /**
   * @typedef {Array.<entryType>} entriesLoadingType List of entries currently being loaded.
   */
  /**
   * @typedef {React.Dispatch<Array.<entryType>} setEntriesLoadingType Updates list of entries currently being loaded.
   */
  /**
   * @typedef {?string} entryModalIdType Id of entry being displayed in modal. No modal displayed if null.
   */
  /**
   * @typedef {React.Dispatch<?string>} setEntryModalIdType Toggles modal displaying specific entry.
   */
  /**
   * @typedef {?string} entryToUpdateIdType Id of entry to update in feed. No entry being updated if null.
   */
  /**
   * @typedef {React.Dispatch<?string>} setEntryToUpdateIdType Triggers update of an entry when changed from null to an entry id.
   */
  /**
   * @typedef {boolean} feedEndType Indicates whether there are no more entries in feed.
   */
  /**
   * @typedef {React.Dispatch<boolean>} setFeedEndType Toggles end-of-feed UI.
   */
  /**
   * @typedef {boolean} loadErrorType Indicates whether there is an error fetching next batch of entries.
   */
  /**
   * @typedef {React.Dispatch<boolean>} setLoadErrorType Toggles error UI at end of feed.
   */
  /**
   * @typedef {boolean} loadingType Indicates whether next batch of entries are still being fetched and rendered.
   */
  /**
   * @typedef {React.Dispatch<boolean>} setLoadingType Toggles loading indicator at end of feed.
   */
  /**
   * @typedef {number} nextPageType Next page number for feed.
   */
  /**
   * @typedef {React.Dispatch<number>} setNextPageType Updates next page number for feed.
   */
  /**
   * @typedef {boolean} noEntriesType Indicates whether there are no entries to display in feed.
   */
  /**
   * @typedef {React.Dispatch<boolean>} setNoEntriesType Toggles message indicating there are no entries in feed.
   */
  /**
   * @typedef {?number} renderPageType Number of page currently being rendered.
   */
  /**
   * @typedef {React.Dispatch<?number>} setRenderPageType Updates number of page currently being rendered.
   */

  // initialize states //
  /**
   * @type {[entriesType, setEntriesType]}
   */
  const [entries, setEntries] = useState([]);
  /**
   * @type {[entriesLoadingType, setEntriesLoadingType]}
   */
  const [entriesLoading, setEntriesLoading] = useState([]);
  /**
   * @type {[entryModalIdType, setEntryModalIdType]}
   */
  const [entryModalId, setEntryModalId] = useState(null);
  /**
   * @type {[entryToUpdateIdType, setEntryToUpdateIdType]}
   */
  const [entryToUpdateId, setEntryToUpdateId] = useState(null);
  /**
   * @type {[feedEndType, setFeedEndType]}
   */
  const [feedEnd, setFeedEnd] = useState(false);
  /**
   * @type {[loadErrorType, setLoadErrorType]}
   */
  const [loadError, setLoadError] = useState(false);
  /**
   * @type {[loadingType, setLoadingType]}
   */
  const [loading, setLoading] = useState(false);
  /**
   * @type {[nextPageType, setNextPageType]}
   */
  const [nextPage, setNextPage] = useState(1);
  /**
   * @type {[noEntriesType, setNoEntriesType]}
   */
  const [noEntries, setNoEntries] = useState(false);
  /**
   * @type {[renderPageType, setRenderPageType]}
   */
  const [renderPage, setRenderPage] = useState(1);

  // initialize refs //
  const observerTargetRef = useRef(null);

  // reset entries feed when triggered //
  useEffect(
    function resetFeedWhenTriggered() {
      if (feedReset) {
        setEntries([]);
        setEntriesLoading([]);
        setEntryToUpdateId(null);
        setNextPage(1);
        setRenderPage(1);
        setLoading(false);
        setLoadError(false);
        setFeedEnd(false);
        setNoEntries(false);
        confirmFeedReset();
      }
    },
    [confirmFeedReset, feedReset],
  );

  // configure intersection observer to retrieve next entries when they're in view //
  useEffect(
    function configureObserver() {
      function checkLoaded(entries) {
        let allLoaded = true;
        for (let i = 0; i < entries.length; i += 1) {
          if (!entries[i].loaded) {
            allLoaded = false;
            break;
          }
        }
        return allLoaded;
      }
      // get target
      const target = observerTargetRef.current;
      // create observer
      const observer = new IntersectionObserver(
        async (targets) => {
          if (targets[0].isIntersecting) {
            setLoading(true);
            setRenderPage(nextPage);
            const nextEntries = await getEntries(
              userId,
              filterStartDate,
              filterEndDate,
              filterEntryTypes,
              filterTagIds,
              nextPage,
            );
            if (nextEntries === "error") {
              setLoadError(true);
              setLoading(false);
            } else if (nextEntries.length === 0) {
              if (nextPage === 1) {
                setNoEntries(true);
              } else {
                setFeedEnd(true);
              }
              setLoading(false);
            } else {
              const entriesToAdd = nextEntries.map((nextEntry) => {
                const entryToAdd = { ...nextEntry };
                entryToAdd.layoutSize = getLayoutSize();
                entryToAdd.page = nextPage;
                entryToAdd.loaded = entryToAdd.type === "text";
                return entryToAdd;
              });
              setEntries((entries) => [...entries, ...entriesToAdd]);
              if (!checkLoaded(entriesToAdd)) {
                setEntriesLoading([...entriesToAdd]);
              } else {
                setLoading(false);
                setRenderPage(null);
              }
              setNextPage((prevPage) => prevPage + 1);
            }
          }
        },
        { threshold: 0 },
      );
      // attach observer to target
      if (target) observer.observe(target);
      // remove previous observer before attaching new one
      return () => {
        if (target) observer.unobserve(target);
      };
    },
    [
      entries,
      filterEndDate,
      filterEntryTypes,
      filterStartDate,
      filterTagIds,
      loadError,
      loading,
      nextPage,
      userId,
    ],
  );

  // remove next batch loading state and show rendered entries when all images/videos are loaded //
  function updateLoaded(id) {
    // mark newly loaded entry
    const newEntriesLoading = entriesLoading.map((entry) => {
      if (entry.id === id) {
        entry.loaded = true;
      }
      return entry;
    });
    // check if there are still unloaded entries
    let allLoaded = true;
    for (let i = 0; i < newEntriesLoading.length; i += 1) {
      if (!newEntriesLoading[i].loaded) {
        allLoaded = false;
        break;
      }
    }
    // respond to current load state
    if (allLoaded) {
      setLoading(false);
      setRenderPage(null);
      setEntriesLoading([]);
    } else {
      setEntriesLoading(newEntriesLoading);
    }
  }

  // retry retrieving next entries //
  function retryGetEntries() {
    setLoadError(false);
  }

  // render entry modal when entry is clicked //
  function renderEntryModal(id) {
    setEntryModalId(id);
  }

  // remove entry modal when modal is closed //
  function removeEntryModal() {
    setEntryModalId(null);
  }

  // update entry in feed and tags in filters menu when an entry is edited //
  // handle main update
  function updateFeedEntry(entryId) {
    router.refresh();
    setEntryToUpdateId(entryId);
  }
  // handle retry on error
  function retryUpdate(entryId) {
    setEntryToUpdateId(entryId);
  }
  // remove loading state for image/video entry being updated when loading complete or loading error
  function markUpdated() {
    setEntryToUpdateId(null);
  }
  useEffect(
    function updateEntries() {
      async function updateEntry() {
        // retrieve entry to update
        const updatedEntry = await getEntry(entryToUpdateId);
        // update in list of entries
        // check if current tag filters still valid
        let filteredOut = false;
        for (const filterTagId of filterTagIds) {
          if (!updatedEntry.tagIds.includes(filterTagId)) {
            filteredOut = true;
            break;
          }
        }
        if (filteredOut) {
          let noEntries = false;
          // remove if tag filters no longer valid
          setEntries((entries) => {
            const newEntries = entries.filter(
              (entry) => entry.id !== entryToUpdateId,
            );
            if (newEntries.length === 0) {
              noEntries = true;
            }
            return newEntries;
          });
          if (noEntries) {
            triggerFeedReset();
          }
          setEntryToUpdateId(null);
        } else {
          // update if tag filters still valid
          setEntries((entries) =>
            entries.map((entry) => {
              if (entry.id === entryToUpdateId) {
                if (updatedEntry === "error") {
                  return {
                    id: entryToUpdateId,
                    layoutSize: entry.layoutSize,
                    error: true,
                  };
                }
                return { ...updatedEntry, layoutSize: entry.layoutSize };
              } else {
                return entry;
              }
            }),
          );
          // remove loading state for text entries or entries that failed to retrieve
          if (
            updatedEntry.type === "text" ||
            updatedEntry === "error" ||
            updatedEntry.srcUrl === "error"
          ) {
            setEntryToUpdateId(null);
          }
        }
      }
      if (entryToUpdateId) updateEntry();
    },
    [entryToUpdateId, filterTagIds, triggerFeedReset],
  );

  // remove entry in feed and update tags in filters menu when an entry is deleted //
  function removeFromFeed(entryId) {
    router.refresh();
    const newEntries = entries.filter((entry) => entry.id !== entryId);
    if (newEntries.length === 0) {
      setNoEntries(true);
    }
    setEntries(newEntries);
  }

  // handle image/video loading complete and loading error //
  function handleLoaded(entryId) {
    if (entryId === entryToUpdateId) {
      markUpdated();
    } else {
      updateLoaded(entryId);
    }
  }

  // render //
  return (
    <>
      <section className={styles.filteredEntries}>
        {entries.map((entry) => {
          return entry.error || entry.srcUrl === "error" ? (
            <div
              className={` ${styles.errorContainer}
                ${entry.layoutSize === "small" ? styles.small : styles.large}
                ${
                  entry.page === renderPage
                    ? styles.hiddenPage
                    : styles.shownPage
                }`}
              key={entry.id}
            >
              <div className={styles.error}>
                <p>Failed to load.</p>
                <button
                  className={styles.retryButton}
                  onClick={() => {
                    retryUpdate(entry.id);
                  }}
                  type="button"
                >
                  Retry
                  <div className={styles.retryIcon}>
                    <ThemedImage
                      alt="retry icon"
                      imageName="retry-icon"
                      onError={() => updateLoaded(entry.id)}
                      onLoad={() => updateLoaded(entry.id)}
                    />
                  </div>
                </button>
              </div>
            </div>
          ) : (
            <button
              aria-haspopup="dialog"
              className={`${styles.entryBtn}
              ${entry.layoutSize === "small" ? styles.small : styles.large}
              ${
                entry.page === renderPage ? styles.hiddenPage : styles.shownPage
              }`}
              key={entry.id}
              onClick={() => renderEntryModal(entry.id)}
              type="button"
            >
              {entry.id === entryToUpdateId ? (
                <div className={styles.placeholder}>
                  <div className={styles.shimmer}></div>
                </div>
              ) : null}
              <div
                className={`${styles.entry} ${
                  entry.id === entryToUpdateId
                    ? styles.hiddenEntry
                    : styles.shownEntry
                }`}
              >
                {entry.type === "text" ? (
                  <div className={styles.textEntryBox}>
                    <div className={styles.textEntryIcon}>
                      <ThemedImage
                        alt="text entry icon"
                        imageName="quote-icon"
                      />
                    </div>
                    <div className={styles.textEntryContent}>
                      <p className={styles.textEntryText}>{entry.content}</p>
                    </div>
                  </div>
                ) : entry.type === "image" ? (
                  <>
                    <div className={styles.imgEntryImageContainer}>
                      <Image
                        alt={
                          entry.content
                            ? entry.content
                            : "The user did not provide a caption for this image."
                        }
                        className={styles.imgEntryImage}
                        fill={true}
                        onError={() => handleLoaded(entry.id)}
                        onLoad={() => handleLoaded(entry.id)}
                        priority={true}
                        src={entry.srcUrl}
                        unoptimized
                      />
                    </div>
                    {entry.content ? (
                      <div className={styles.imgEntryCaptionBox}>
                        <span className={styles.imgEntryCaption}>
                          {entry.content}
                        </span>
                      </div>
                    ) : null}
                  </>
                ) : (
                  <>
                    <div className={styles.videoEntryBox}>
                      <video
                        autoPlay
                        className={styles.videoEntryVideo}
                        loop
                        muted
                        onCanPlay={() => handleLoaded(entry.id)}
                        onError={() => handleLoaded(entry.id)}
                        playsInline
                        src={entry.srcUrl}
                      ></video>
                    </div>
                    {entry.content ? (
                      <div className={styles.videoEntryCaptionBox}>
                        <span className={styles.videoEntryCaption}>
                          {entry.content}
                        </span>
                      </div>
                    ) : null}
                  </>
                )}
              </div>
            </button>
          );
        })}
      </section>
      {loading ? (
        <div className={styles.loading} role="status">
          <div className={styles.loader}></div>
        </div>
      ) : loadError ? (
        <div className={styles.loadError} role="status">
          <div className={styles.loadErrorMessage}>
            <div className={styles.loadErrorIcon}>
              <ThemedImage alt="error icon" imageName="sad-icon" />
            </div>
            <p className={styles.loadErrorText}>Could not load entries.</p>
          </div>
          <button
            className={styles.loadErrorBtn}
            onClick={retryGetEntries}
            type="button"
          >
            retry
            <div className={styles.loadErrorBtnIcon}>
              <ThemedImage alt="retry icon" imageName="retry-icon" />
            </div>
          </button>
        </div>
      ) : noEntries ? (
        !filterStartDate &&
        !filterEndDate &&
        filterEntryTypes.length === 0 &&
        filterTagIds.length === 0 ? (
          <div className={styles.noEntries}>
            <p className={styles.noEntriesText}>
              You don&#39;t have any Journ entries yet.
            </p>
            <Link className={styles.noEntriesBtn} href="/new-entry">
              Add entry
            </Link>
          </div>
        ) : (
          <p className={styles.noFilteredEntries}>
            No entries matching current filters.
          </p>
        )
      ) : feedEnd ? (
        <div className={styles.endOfFeed} role="status">
          <p className={styles.endOfFeedText}>end</p>
        </div>
      ) : (
        <div
          aria-hidden="true"
          className={styles.intersectionObserver}
          ref={observerTargetRef}
        ></div>
      )}
      {entryModalId ? (
        <EntryModal
          id={entryModalId}
          removeFromFeed={removeFromFeed}
          removeModal={removeEntryModal}
          updateFeedEntry={updateFeedEntry}
          userTags={userTags}
        />
      ) : null}
    </>
  );
}
