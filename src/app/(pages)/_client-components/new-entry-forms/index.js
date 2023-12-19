"use client";

/// imports ///
import NewImageVideoEntry from "../new-image-video-entry";
import NewTextEntry from "../new-text-entry";
import styles from "./index.module.css";
import { useState } from "react";

/// main component ///
export default function NewEntryForms({ user, userTags }) {
  const [formShown, setFormShown] = useState("text");

  function showTextForm() {
    setFormShown("text");
  }

  function showImageVideoForm() {
    setFormShown("imageVideo");
  }

  return (
    <div className={styles.component}>
      <menu className={styles.tabs}>
        <button
          className={`${styles.tab} ${
            formShown === "text" ? styles.activeTab : styles.inactiveTab
          }`}
          onClick={showTextForm}
          type="button"
        >
          Text
        </button>
        <button
          className={`${styles.tab} ${
            formShown === "imageVideo" ? styles.activeTab : styles.inactiveTab
          }`}
          onClick={showImageVideoForm}
          type="button"
        >
          Images/Videos
        </button>
      </menu>
      <section className={styles.form} hidden={formShown !== "text"}>
        <NewTextEntry user={user} userTags={userTags} />
      </section>
      <section className={styles.form} hidden={formShown !== "imageVideo"}>
        <NewImageVideoEntry user={user} userTags={userTags} />
      </section>
    </div>
  );
}
