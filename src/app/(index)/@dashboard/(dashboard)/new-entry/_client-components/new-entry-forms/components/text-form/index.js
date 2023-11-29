"use client";

import addTextEntry from "./server-actions/add-text-entry";
import getUserTags from "@/(dashboard)/_helper-functions/get-user-tags";
import StatusModal from "../helper-components/status-modal";
import styles from "./index.module.css";
import TagDropdown from "../helper-components/tag-dropdown";
import { useEffect, useRef, useState } from "react";

export default function TextForm({ user }) {
  // initialize states and refs //
  const [resetTagDropdown, setResetTagDropdown] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [textInputValue, setTextInputValue] = useState("");
  const [userTags, setUserTags] = useState(null);
  const textForm = useRef(null);
  const textInput = useRef(null);

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

  // update tag dropdown reset state after reset is complete //
  function confirmTagDropdownReset() {
    setResetTagDropdown(false);
  }

  // update text input value when changed //
  function updateTextInputValue(e) {
    setTextInputValue(e.target.value);
  }

  // update selected tags when changed in tag dropdown //
  let tags = [];
  function getEntryTags(entryTags) {
    tags = [...entryTags];
  }

  // add new text entry when form is submitted//
  async function submitEntry(e) {
    setSubmitStatus("loading");
    e.preventDefault();
    const formData = new FormData(textForm.current);
    formData.append("user", user);
    formData.append("tags", JSON.stringify(tags));
    const status = await addTextEntry(formData);
    setSubmitStatus(status);
  }

  // reset submit status if user chooses to try again on error //
  function retry() {
    setSubmitStatus(null);
  }

  // reset form if user chooses to add another //
  function resetForm() {
    setResetTagDropdown(true);
    textInput.current.value = "";
    setTextInputValue("");
    setSubmitStatus(null);
  }

  useEffect(
    function refetchUserTags() {
      if (resetTagDropdown) {
        setUserTags(null);
      }
    },
    [resetTagDropdown],
  );

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
            onChange={updateTextInputValue}
            ref={textInput}
          ></textarea>
        </div>
        <div className={styles.tagsField}>
          <p className={styles.tagsFieldLabel}>Tags:</p>
          <TagDropdown
            confirmReset={confirmTagDropdownReset}
            instruction="Add tags"
            passEntryTags={getEntryTags}
            reset={resetTagDropdown}
            userTags={userTags}
          />
        </div>
        <div className={styles.submitBtnWrapper}>
          <button
            className={styles.submitBtn}
            disabled={textInputValue === ""}
            onClick={submitEntry}
          >
            Add entry
          </button>
        </div>
      </form>
      {submitStatus ? (
        <StatusModal
          resetForm={resetForm}
          retry={retry}
          status={submitStatus}
        />
      ) : null}
    </>
  );
}
