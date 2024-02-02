"use client";

/// imports ///
import EntryModal from "../entry-modal";
import getEntries from "@/server-actions/get-entries";
import { getEntryWithTagIds } from "@/server-actions/get-entry";
import Image from "next/image";
import Link from "next/link";
import styles from "./index.module.css";
import ThemedImage from "@/helper-components/themed-image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/// private ///
// generate individual entry layout sizes //
const getType = (function getTypeFactory() {
  let _remainingSmall = false;
  function getType() {
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
  return getType;
})();

/// main component ///
export default function FilteredEntries({
  feedReset,
  selectedEndDate,
  selectedStartDate,
  selectedTags,
  selectedTypes,
  setFeedReset,
  userId,
  userTags,
}) {
  // initialize router //
  const router = useRouter();

  // initialize states and refs //
  // states
  const [entries, setEntries] = useState([]);
  const [entriesLoading, setEntriesLoading] = useState([]);
  const [entryModal, setEntryModal] = useState(null);
  const [entryToUpdate, setEntryToUpdate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingError, setLoadingError] = useState(false);
  const [noEntries, setNoEntries] = useState(false);
  const [page, setPage] = useState(1);
  const [pageLoading, setPageLoading] = useState(1);
  const [reachEnd, setReachEnd] = useState(false);
  // refs
  const observerTargetRef = useRef(null);

  // reset entries feed when triggered //
  useEffect(
    function resetFeedWhenTriggered() {
      if (feedReset) {
        setEntries([]);
        setEntriesLoading([]);
        setEntryToUpdate(null);
        setLoading(false);
        setLoadingError(false);
        setNoEntries(false);
        setPage(1);
        setPageLoading(1);
        setReachEnd(false);
        setFeedReset(false);
      }
    },
    [feedReset, setFeedReset],
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
            setPageLoading(page);
            const nextEntries = await getEntries(
              userId,
              selectedStartDate,
              selectedEndDate,
              selectedTypes,
              selectedTags,
              page,
            );
            if (nextEntries === "error") {
              setLoadingError(true);
              setLoading(false);
            } else if (nextEntries.length === 0) {
              if (page === 1) {
                setNoEntries(true);
              } else {
                setReachEnd(true);
              }
              setLoading(false);
            } else {
              const entriesToAdd = nextEntries.map((nextEntry) => {
                const entryToAdd = { ...nextEntry };
                entryToAdd.layoutSize = getType();
                entryToAdd.page = page;
                entryToAdd.loaded = entryToAdd.type === "text";
                return entryToAdd;
              });
              setEntries((entries) => [...entries, ...entriesToAdd]);
              if (!checkLoaded(entriesToAdd)) {
                setEntriesLoading([...entriesToAdd]);
              } else {
                setLoading(false);
                setPageLoading(null);
              }
              setPage((prevPage) => prevPage + 1);
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
      loading,
      loadingError,
      observerTargetRef,
      page,
      selectedEndDate,
      selectedStartDate,
      selectedTags,
      selectedTypes,
      userId,
    ],
  );

  // remove next batch loading state if all images/videos are loaded //
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
      setPageLoading(null);
      setEntriesLoading([]);
    } else {
      setEntriesLoading(newEntriesLoading);
    }
  }

  // retry retrieving next entries //
  function retryGetEntries() {
    setLoadingError(false);
  }

  // render entry modal when entry is clicked //
  function renderEntryModal(id) {
    setEntryModal(id);
  }

  // remove entry modal when modal is closed //
  function removeEntryModal() {
    setEntryModal(null);
  }

  // update entry in feed and tags in filters menu when edited //
  // handle main update
  function updateFeed(entryId) {
    router.refresh();
    setEntryToUpdate(entryId);
  }
  // handle retry on error
  function retryUpdate(entryId) {
    setEntryToUpdate(entryId);
  }
  // remove loading state for image/video entry being updated when loading complete or loading error
  function markUpdated() {
    setEntryToUpdate(null);
  }
  useEffect(
    function updateEntries() {
      async function updateEntry() {
        // retrieve entry to update
        const updatedEntry = await getEntryWithTagIds(entryToUpdate);
        // update in list of entries
        // check if current tag filters still valid
        let filteredOut = false;
        for (const selectedTag of selectedTags) {
          if (!updatedEntry.tags.includes(selectedTag)) {
            filteredOut = true;
            break;
          }
        }
        if (filteredOut) {
          // remove if tag filters no longer valid
          setEntries((entries) => {
            const newEntries = entries.filter(
              (entry) => entry.id !== entryToUpdate,
            );
            if (newEntries.length === 0) {
              setFeedReset(true);
            }
            return newEntries;
          });
          setEntryToUpdate(null);
        } else {
          // update if tag filters still valid
          setEntries((entries) =>
            entries.map((entry) => {
              if (entry.id === entryToUpdate) {
                if (updatedEntry === "error") {
                  return {
                    id: entryToUpdate,
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
            setEntryToUpdate(null);
          }
        }
      }
      if (entryToUpdate) updateEntry();
    },
    [entryToUpdate, selectedTags, setFeedReset],
  );

  // remove entry in feed and update tags in filters menu when deleted //
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
    if (entryToUpdate === null) {
      updateLoaded(entryId);
    } else if (entryId === entryToUpdate) {
      markUpdated();
    }
  }

  return (
    <>
      <section className={styles.filteredEntries}>
        {entries.map((entry) => {
          return entry.error || entry.srcUrl === "error" ? (
            <div
              className={` ${styles.errorContainer}
                ${entry.layoutSize === "small" ? styles.small : styles.large}
                ${
                  entry.page === pageLoading
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
                entry.page === pageLoading
                  ? styles.hiddenPage
                  : styles.shownPage
              }`}
              key={entry.id}
              onClick={() => renderEntryModal(entry.id)}
              type="button"
            >
              {entry.id === entryToUpdate ? (
                <div className={styles.placeholder}>
                  <div className={styles.shimmer}></div>
                </div>
              ) : null}
              <div
                className={`${styles.entry} ${
                  entry.id === entryToUpdate
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
      ) : loadingError ? (
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
        !selectedStartDate &&
        !selectedEndDate &&
        selectedTypes.length === 0 &&
        selectedTags.length === 0 ? (
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
      ) : reachEnd ? (
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
      {entryModal ? (
        <EntryModal
          id={entryModal}
          removeFromFeed={removeFromFeed}
          removeModal={removeEntryModal}
          updateFeed={updateFeed}
          userTags={userTags}
        />
      ) : null}
    </>
  );
}
