"use client";

import getEntries from "./server-actions/get-entries";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function FilteredEntries({
  selectedEndDate,
  selectedStartDate,
  selectedTags,
  selectedTypes,
  userId,
}) {
  // initialize states and refs //
  const [entries, setEntries] = useState([]);
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

  return (
    <section>
      {entries.map((entry) => {
        if (entry.type === "text") {
          return (
            <Link href={`/entry/${entry.id}`} key={entry.id}>
              <p>{entry.content}</p>
            </Link>
          );
        } else if (entry.type === "image") {
          return (
            <Link href={`/entry/${entry.id}`} key={entry.id}>
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
            </Link>
          );
        } else {
          return (
            <Link href={`/entry/${entry.id}`} key={entry.id}>
              <video autoPlay loop muted src={entry.srcUrl}></video>
              <p>{entry.content}</p>
            </Link>
          );
        }
      })}
      {reachEnd ? null : (
        <div
          aria-hidden="true"
          ref={observerTarget}
          style={{ height: 50 }}
        ></div>
      )}
    </section>
  );
}
