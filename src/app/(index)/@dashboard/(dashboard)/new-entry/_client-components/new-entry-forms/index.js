"use client";

import ImageVideoForm from "./components/image-video-form";
import styles from "./index.module.css";
import TextForm from "./components/text-form";
import { useState } from "react";

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
      <nav className={styles.tabs}>
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
      </nav>
      <section className={styles.form} hidden={formShown !== "text"}>
        <TextForm user={user} userTags={userTags} />
      </section>
      <section className={styles.form} hidden={formShown !== "imageVideo"}>
        <ImageVideoForm user={user} userTags={userTags} />
      </section>
    </div>
  );
}
