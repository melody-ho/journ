"use client";

/// imports ///
import addTextEntry from "@/server-actions/add-text-entry";
import NewEntryStatusModal from "../new-entry-status-modal";
import styles from "./index.module.css";
import TagDropdown from "../tag-dropdown";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

/// main component ///
export default function NewTextEntry({ user, userTags }) {
  // initialize router //
  const router = useRouter();

  // initialize states and refs //
  // states
  const [resetTagDropdown, setResetTagDropdown] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [textInputValue, setTextInputValue] = useState("");
  // refs
  const textFormRef = useRef(null);
  const textInputRef = useRef(null);

  // update text input value when changed //
  function updateTextInputValue(e) {
    setTextInputValue(e.target.value);
  }

  // update tag dropdown reset state after reset is complete //
  function confirmTagDropdownReset() {
    setResetTagDropdown(false);
  }

  // update selected tags when changed in tag dropdown //
  let tags = [];
  function getEntryTags(entryTags) {
    tags = [...entryTags];
  }

  // add new text entry when form is submitted//
  async function submitEntry(e) {
    setSubmitStatus("adding");
    e.preventDefault();
    const formData = new FormData(textFormRef.current);
    formData.append("user", user);
    formData.append("tags", JSON.stringify(tags));
    const status = await addTextEntry(formData);
    router.refresh();
    setSubmitStatus(status);
  }

  // reset submit status if user chooses to try again on error //
  function retry() {
    setSubmitStatus(null);
  }

  // reset form if user chooses to add another //
  function resetForm() {
    setResetTagDropdown(true);
    textInputRef.current.value = "";
    setTextInputValue("");
    setSubmitStatus(null);
  }

  return (
    <>
      <form ref={textFormRef}>
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
            ref={textInputRef}
            required
          ></textarea>
          <p className={styles.requiredIndicator}>required</p>
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
        <NewEntryStatusModal
          resetForm={resetForm}
          retry={retry}
          status={submitStatus}
        />
      ) : null}
    </>
  );
}
