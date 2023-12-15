"use client";

import EntryModal from "../entry-modal";
import getEntries from "@/server-actions/get-entries";
import { getEntryWithoutTags } from "@/server-actions/get-entry";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

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
  const [entries, setEntries] = useState([]);
  const [entryModal, setEntryModal] = useState(null);
  const [entryToUpdate, setEntryToUpdate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [reachEnd, setReachEnd] = useState(false);
  const observerTarget = useRef(null);

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
      const target = observerTarget.current;
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
              setEntries((entries) => [...entries, ...nextEntries]);
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
      observerTarget,
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
      <section>
        {entries.map((entry) => {
          if (entry.type === "text") {
            return (
              <button
                key={entry.id}
                onClick={() => renderEntryModal(entry.id)}
                type="button"
              >
                <p>{entry.content}</p>
              </button>
            );
          } else if (entry.type === "image") {
            return (
              <button key={entry.id} onClick={() => renderEntryModal(entry.id)}>
                <Image
                  alt={
                    entry.content
                      ? entry.content
                      : "The user did not provide a caption for this image."
                  }
                  height="100"
                  src={entry.srcUrl}
                  width="100"
                />
                <p>{entry.content}</p>
              </button>
            );
          } else {
            return (
              <button key={entry.id} onClick={() => renderEntryModal(entry.id)}>
                <video autoPlay loop muted src={entry.srcUrl}></video>
                <p>{entry.content}</p>
              </button>
            );
          }
        })}
        {loading ? (
          <div>
            <p>loading...</p>
          </div>
        ) : reachEnd ? (
          <div>
            <p>end</p>
          </div>
        ) : (
          <div
            aria-hidden="true"
            ref={observerTarget}
            style={{ height: 50 }}
          ></div>
        )}
      </section>
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
