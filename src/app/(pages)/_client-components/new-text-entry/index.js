"use client";

/// imports ///
import addTextEntry from "@/server-actions/add-text-entry";
import NewEntryStatusModal from "../new-entry-status-modal";
import styles from "./index.module.css";
import TagDropdown from "../tag-dropdown";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

/// main component ///
/**
 * @param {Object} props
 * @param {string} props.userId
 * @param {Array.<{id: string, name: string}>} props.userTags
 */
export default function NewTextEntry({ userId, userTags }) {
  // initialize router //
  const router = useRouter();

  // document states //
  /**
   * @typedef {boolean} resetTagDropdownType Indicates whether tag dropdown is currently being reset.
   */
  /**
   * @typedef {React.Dispatch<boolean>} setResetTagDropdownType Updates whether tag dropdown is currently being reset.
   */
  /**
   * @typedef {null | "adding" | "empty" | "error" | "success"} submitStatusType Submission status of new text entry, null when no submission attempted or previous status acknowledged.
   */
  /**
   * @typedef {React.Dispatch<null | "adding" | "empty" | "error" | "success">} setSubmitStatusType Reports submission status of new text entry, null when no submission attempted or previous status acknowledged.
   */
  /**
   * @typedef {string} textInputValueType
   */
  /**
   * @typedef {React.Dispatch<string>} setTextInputValueType
   */

  // initialize states //
  /**
   * @type {[resetTagDropdownType, setResetTagDropdownType]}
   */
  const [resetTagDropdown, setResetTagDropdown] = useState(false);
  /**
   * @type {[submitStatusType, setSubmitStatusType]}
   */
  const [submitStatus, setSubmitStatus] = useState(null);
  /**
   * @type {[textInputValueType, setTextInputValueType]}
   */
  const [textInputValue, setTextInputValue] = useState("");

  // initialize refs //
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
  let tagNames = [];
  function getEntryTagNames(entryTagNames) {
    tagNames = [...entryTagNames];
  }

  // add new text entry when form is submitted//
  async function submitEntry(e) {
    setSubmitStatus("adding");
    e.preventDefault();
    const formData = new FormData(textFormRef.current);
    formData.append("userId", userId);
    formData.append("tagNames", JSON.stringify(tagNames));
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

  // render //
  return (
    <>
      <form ref={textFormRef}>
        <h2 className={styles.visuallyHidden}>New Text Entry</h2>
        <div className={styles.textField}>
          <label className={styles.textFieldLabel} htmlFor="content">
            Write something:
          </label>
          <textarea
            className={styles.textFieldInput}
            id="content"
            name="content"
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
            passEntryTagNames={getEntryTagNames}
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
