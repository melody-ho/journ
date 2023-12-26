"use client";

/// imports ///
import EntryModal from "../entry-modal";
import getEntries from "@/server-actions/get-entries";
import { getEntryWithoutTags } from "@/server-actions/get-entry";
import Image from "next/image";
import styles from "./index.module.css";
import ThemedImage from "@/helper-components/themed-image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/// Private ///
// maximum image dimension allowed for uploads //
const MAX_IMAGE_SIZE = "1920px";

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
  selectedEndDate,
  selectedStartDate,
  selectedTags,
  selectedTypes,
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
  const [page, setPage] = useState(1);
  const [pageLoading, setPageLoading] = useState(1);
  const [reachEnd, setReachEnd] = useState(false);
  // refs
  const observerTargetRef = useRef(null);

  // reset component when filters change //
  useEffect(
    function resetComponent() {
      setEntries([]);
      setPage(1);
      setReachEnd(false);
    },
    [selectedTags],
  );

  // configure intersection observer to retrieve next entries when they're in view //
  useEffect(
    function configureObserver() {
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
              setReachEnd(true);
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
              setEntriesLoading([...entriesToAdd]);
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
        const updatedEntry = await getEntryWithoutTags(entryToUpdate);
        // update in list of entries
        const newEntries = entries.map((entry) => {
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
        });
        setEntries(newEntries);
        // remove loading state for text entries or entries that failed to retrieve
        if (
          updatedEntry.type === "text" ||
          updatedEntry === "error" ||
          updatedEntry.srcUrl === "error"
        ) {
          setEntryToUpdate(null);
        }
      }
      if (entryToUpdate) updateEntry();
    },
    [entries, entryToUpdate],
  );

  // remove entry in feed and update tags in filters menu when deleted //
  function removeFromFeed(entryId) {
    router.refresh();
    const newEntries = entries.filter((entry) => entry.id !== entryId);
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
                <div className={styles.loading}>
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
                    <div className={styles.imgEntryImage}>
                      <Image
                        alt={
                          entry.content
                            ? entry.content
                            : "The user did not provide a caption for this image."
                        }
                        fill={true}
                        onError={() => handleLoaded(entry.id)}
                        onLoad={() => handleLoaded(entry.id)}
                        priority={true}
                        sizes={MAX_IMAGE_SIZE}
                        src={entry.srcUrl}
                        style={{ objectFit: "cover" }}
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
        <div role="status">
          <p>loading...</p>
        </div>
      ) : loadingError ? (
        <div role="status">
          <p>failed to load</p>
          <button onClick={retryGetEntries} type="button">
            retry
          </button>
        </div>
      ) : reachEnd ? (
        <div role="status">
          <p>end</p>
        </div>
      ) : (
        <div
          aria-hidden="true"
          ref={observerTargetRef}
          style={{ height: 50 }}
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
