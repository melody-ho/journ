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
  const [entryModal, setEntryModal] = useState(null);
  const [entryToUpdate, setEntryToUpdate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
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
            const nextEntries = await getEntries(
              userId,
              selectedStartDate,
              selectedEndDate,
              selectedTypes,
              selectedTags,
              page,
            );
            if (nextEntries.length === 0) {
              setReachEnd(true);
            } else {
              const entriesToAdd = nextEntries.map((nextEntry) => {
                const entryToAdd = { ...nextEntry };
                entryToAdd.layoutSize = getType();
                return entryToAdd;
              });
              setEntries((entries) => [...entries, ...entriesToAdd]);
              setPage((prevPage) => prevPage + 1);
            }
            setLoading(false);
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
      observerTargetRef,
      page,
      selectedEndDate,
      selectedStartDate,
      selectedTags,
      selectedTypes,
      userId,
    ],
  );

  // render entry modal when entry is clicked //
  function renderEntryModal(id) {
    setEntryModal(id);
  }

  // remove entry modal when modal is closed //
  function removeEntryModal() {
    setEntryModal(null);
  }

  // update entry in feed and tags in filters menu when edited //
  function updateFeed(entryId) {
    router.refresh();
    setEntryToUpdate(entryId);
  }
  useEffect(
    function updateEntries() {
      async function updateEntry() {
        const updatedEntry = await getEntryWithoutTags(entryToUpdate);
        const newEntries = entries.map((entry) => {
          if (entry.id === entryToUpdate) {
            return updatedEntry;
          } else {
            return entry;
          }
        });
        setEntries(newEntries);
        setEntryToUpdate(null);
      }
      if (entryToUpdate) updateEntry();
    },
    [entries, entryToUpdate, router],
  );

  // remove entry in feed and update tags in filters menu when deleted //
  function removeFromFeed(entryId) {
    router.refresh();
    const newEntries = entries.filter((entry) => entry.id !== entryId);
    setEntries(newEntries);
  }

  return (
    <>
      <section className={styles.component}>
        {entries.map((entry) => {
          return (
            <button
              aria-haspopup="dialog"
              className={`${styles.entryBtn} ${
                entry.layoutSize === "small" ? styles.small : styles.large
              }`}
              key={entry.id}
              onClick={() => renderEntryModal(entry.id)}
              type="button"
            >
              <div className={styles.entry}>
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
                        priority={true}
                        sizes="(min-width: 1600px) 30vw, (min-width: 800px) 50vw, 100vw"
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
