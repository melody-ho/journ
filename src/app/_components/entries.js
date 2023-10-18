"use client";

import getEntries from "../_actions/get-entries";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function Entries({ userId, totalEntries }) {
  // initialize states and refs //
  const [entries, setEntries] = useState([]);
  const [page, setPage] = useState(1);
  const [reachEnd, setReachEnd] = useState(false);
  const observerTarget = useRef(null);

  // configure intersection observer to retrieve next entries when they're in view //
  useEffect(
    function configureObserver() {
      // get target
      const target = observerTarget.current;
      // create observer
      const observer = new IntersectionObserver(
        async (targets) => {
          if (targets[0].isIntersecting) {
            const nextEntries = await getEntries(userId, page);
            const newEntries = [...entries, ...nextEntries];
            if (newEntries.length === totalEntries) setReachEnd(true);
            setEntries(newEntries);
            setPage((prevPage) => prevPage + 1);
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
    [entries, observerTarget, page, totalEntries, userId],
  );

  return (
    <section>
      {entries.map((entry) => {
        if (entry.type === "text") {
          return (
            <div key={entry.id}>
              <p>{entry.content}</p>
            </div>
          );
        } else if (entry.type === "image") {
          return (
            <div key={entry.id}>
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
            </div>
          );
        } else {
          return (
            <div key={entry.id}>
              <video autoPlay loop muted src={entry.srcUrl}></video>
              <p>{entry.content}</p>
            </div>
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
