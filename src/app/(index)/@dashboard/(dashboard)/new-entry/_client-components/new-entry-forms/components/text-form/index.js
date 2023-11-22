"use client";

import addTextEntry from "./server-actions/add-text-entry";
import getUserTags from "@/(dashboard)/_helper-functions/get-user-tags";
import styles from "./index.module.css";
import TagDropdown from "../helper-components/tag-dropdown";
import { useEffect, useRef, useState } from "react";

export default function TextForm({ user }) {
  // initialize states and refs //
  const [userTags, setUserTags] = useState(null);
  const textForm = useRef(null);

  // get user tags from database//
  useEffect(
    function getUserTagData() {
      async function getData() {
        const userTags = await getUserTags(user);
        setUserTags(userTags ? userTags : []);
      }
      if (userTags === null) {
        try {
          getData();
        } catch (error) {
          // TO DO: error handling //
        }
      }
    },
    [user, userTags],
  );

  // update selected tags when changed in tag dropdown //
  let tags = [];
  function getEntryTags(entryTags) {
    tags = [...entryTags];
  }

  // add new text entry when form is submitted//
  async function submitEntry(e) {
    e.preventDefault();
    const formData = new FormData(textForm.current);
    formData.append("user", user);
    formData.append("tags", JSON.stringify(tags));
    await addTextEntry(formData);
  }

  return (
    <>
      <form ref={textForm}>
        <h2 className={styles.visuallyHidden}>New Text Entry</h2>
        <div className={styles.textField}>
          <label className={styles.textFieldLabel} htmlFor="text">
            Write something:
          </label>
          <textarea
            className={styles.textFieldInput}
            id="text"
            name="text"
          ></textarea>
        </div>
        <TagDropdown passEntryTags={getEntryTags} userTags={userTags} />
        <div className={styles.submitBtnWrapper}>
          <button className={styles.submitBtn} onClick={submitEntry}>
            Add entry
          </button>
        </div>
      </form>
    </>
  );
}
