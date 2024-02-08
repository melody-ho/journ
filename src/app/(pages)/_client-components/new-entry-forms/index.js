"use client";

/// imports ///
import NewImageVideoEntry from "../new-image-video-entry";
import NewTextEntry from "../new-text-entry";
import styles from "./index.module.css";
import { useState } from "react";

/// main component ///
/**
 * @param {Object} props
 * @param {string} props.userId
 * @param {Array.<{id: string, name: string}>} props.userTags
 */
export default function NewEntryForms({ userId, userTags }) {
  // document states //
  /**
   * @typedef {"text" | "imageVideo"} formShownType Indicates which new-entry form is shown.
   */
  /**
   * @typedef {React.Dispatch<"text" | "imageVideo">} setFormShownType Updates which new-entry form is shown.
   */

  // initialize states //
  /**
   * @type {[formShownType, setFormShownType]}
   */
  const [formShown, setFormShown] = useState("text");

  // handle showing new text entry form //
  function showTextForm() {
    setFormShown("text");
  }

  // handle showing new image/video entry form //
  function showImageVideoForm() {
    setFormShown("imageVideo");
  }

  // render //
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
        <NewTextEntry userId={userId} userTags={userTags} />
      </section>
      <section className={styles.form} hidden={formShown !== "imageVideo"}>
        <NewImageVideoEntry userId={userId} userTags={userTags} />
      </section>
    </div>
  );
}
