"use client";

/// imports ///
import checkEditedUsername from "@/server-actions/check-edited-username";
import debounce from "lodash.debounce";
import Link from "next/link";
import styles from "./index.module.css";
import ThemedImage from "@/helper-components/themed-image";
import updateUser from "@/server-actions/update-user";
import { experimental_useFormState as useFormState } from "react-dom";
import z from "zod";
import { useEffect, useRef, useState } from "react";

/// constants ///
// debounce duration for checking username availability //
const DEBOUNCE_DURATION = 200;

/// main component ///
export default function ManageAccountForm({ userData }) {
  // manage form input values and client side validation //
  // first name
  const [firstName, setFirstName] = useState(userData.firstName);
  const [firstNameMessage, setFirstNameMessage] = useState(null);
  const firstNameInputRef = useRef(null);
  const firstNameSchema = z
    .string()
    .min(1, { message: "First name is required." });
  function handleChangeFirstName(e) {
    setFirstName(e.target.value);
    try {
      firstNameSchema.parse(e.target.value);
      setFirstNameMessage(null);
    } catch (error) {
      setFirstNameMessage(error.issues[0].message);
    }
  }
  useEffect(
    function updateFirstName() {
      firstNameInputRef.current.value = firstName;
    },
    [firstName],
  );
  // last name
  const [lastName, setLastName] = useState(userData.lastName);
  const lastNameInputRef = useRef(null);
  function handleChangeLastName(e) {
    setLastName(e.target.value);
  }
  useEffect(
    function updateLastName() {
      lastNameInputRef.current.value = lastName;
    },
    [lastName],
  );
  // username
  const [username, setUsername] = useState(userData.username);
  const [usernameMessage, setUsernameMessage] = useState(null);
  const [usernameUnavailable, checkUsernameAvailability] = useFormState(
    checkEditedUsername,
    null,
  );
  const usernameInputRef = useRef(null);
  const userNameSchema = z
    .string()
    .min(6, { message: "Username must be at least 6 characters." })
    .max(255, { message: "Username cannot be longer than 255 characters." })
    .regex(new RegExp("^[a-z0-9][a-z0-9_.]+[a-z0-9]$"), {
      message: "Username format is invalid.",
    });
  function handleUsernameChange(e) {
    setUsername(e.target.value);
    try {
      userNameSchema.parse(e.target.value);
      setUsernameMessage(null);
    } catch (error) {
      setUsernameMessage(error.issues[0].message);
    }
    checkUsernameAvailability({
      newUsername: e.target.value,
      oldUsername: userData.username,
    });
  }
  const debouncedHandleUsernameChange = debounce(
    handleUsernameChange,
    DEBOUNCE_DURATION,
  );
  useEffect(
    function updateUsername() {
      usernameInputRef.current.value = username;
    },
    [username],
  );
  // new password
  const [newPassword, setNewPassword] = useState("");
  const [newPwdMessage, setNewPwdMessage] = useState(null);
  const newPwdInputRef = useRef(null);
  const [confirmNewPwd, setConfirmNewPwd] = useState("");
  const [confirmNewPwdMessage, setConfirmNewPwdMessage] = useState(null);
  const confirmNewPwdInputRef = useRef(null);
  function matchPasswords() {
    if (newPwdInputRef.current.value === confirmNewPwdInputRef.current.value) {
      setConfirmNewPwdMessage(null);
    } else {
      setConfirmNewPwdMessage("Passwords do not match.");
    }
  }
  const newPwdSchema = z
    .string()
    .min(6, { message: "Password must be at least 6 characters." })
    .max(255, { message: "Password cannot be longer than 255 characters." });
  function handleNewPwdChange(e) {
    setNewPassword(e.target.value);
    try {
      newPwdSchema.parse(e.target.value);
      setNewPwdMessage(null);
    } catch (error) {
      setNewPwdMessage(error.issues[0].message);
    }
    if (e.target.value === "" && confirmNewPwdInputRef.current.value === "") {
      setConfirmNewPwdMessage(null);
    }
    if (confirmNewPwdInputRef.current.value !== "") {
      matchPasswords();
    }
  }
  function handleConfirmNewPwdChange(e) {
    setConfirmNewPwd(e.target.value);
    matchPasswords();
  }
  useEffect(
    function updateNewPwd() {
      if (newPwdInputRef.current) {
        newPwdInputRef.current.value = newPassword;
      }
    },
    [newPassword],
  );
  useEffect(
    function updateConfirmNewPwd() {
      if (confirmNewPwdInputRef.current) {
        confirmNewPwdInputRef.current.value = confirmNewPwd;
      }
    },
    [confirmNewPwd],
  );
  // current password
  const [currentPassword, setCurrentPassword] = useState("");
  const [currentPwdMessage, setCurrentPwdMessage] = useState(null);
  const currentPwdInputRef = useRef(null);
  const currentPwdSchema = z
    .string()
    .min(1, { message: "Your current password is required." });
  function handleCurrentPwdChange(e) {
    setCurrentPassword(e.target.value);
    try {
      currentPwdSchema.parse(e.target.value);
      setCurrentPwdMessage(null);
    } catch (error) {
      setCurrentPwdMessage(error.issues[0].message);
    }
  }
  useEffect(
    function updateCurrentPwd() {
      if (currentPwdInputRef.current) {
        currentPwdInputRef.current.value = currentPassword;
      }
    },
    [currentPassword],
  );

  // handle enabling/disabling editing //
  // states
  const [edit, setEdit] = useState(false);
  const [editPassword, setEditPassword] = useState(false);
  // event handlers
  function enableEdit() {
    setEdit(true);
  }
  function handleCancelEdit() {
    setFirstName(userData.firstName);
    setFirstNameMessage(null);
    setLastName(userData.lastName);
    setUsername(userData.username);
    setUsernameMessage(null);
    checkUsernameAvailability({
      newUsername: userData.username,
      oldUsername: userData.username,
    });
    setNewPassword("");
    setNewPwdMessage(null);
    setConfirmNewPwd("");
    setConfirmNewPwdMessage(null);
    setCurrentPassword("");
    setCurrentPwdMessage(null);
    setEditPassword(false);
    setEdit(false);
  }
  function enablePasswordChange() {
    setEditPassword(true);
  }
  function cancelPasswordChange() {
    setNewPassword("");
    setNewPwdMessage(null);
    setConfirmNewPwd("");
    setConfirmNewPwdMessage(null);
    setEditPassword(false);
  }

  // handle submit //
  const manageAccountFormRef = useRef(null);
  const [submissionState, setSubmissionState] = useState(null);
  async function handleSaveChanges(e) {
    e.preventDefault();
    setSubmissionState("pending");
    const formData = new FormData(manageAccountFormRef.current);
    formData.append("userId", userData.id);
    const newState = await updateUser(formData);
    setSubmissionState(newState);
  }

  // handle status modal //
  const statusModalRef = useRef(null);
  // show when rendered
  useEffect(function openModal() {
    if (statusModalRef.current) {
      statusModalRef.current.close();
      statusModalRef.current.showModal();
    }
  });
  // define handlers
  function handleCancel(e) {
    e.preventDefault();
  }
  function handleEsc(e) {
    if (e.key === "Escape") e.preventDefault();
  }
  function handleBackToManageAccount() {
    setSubmissionState(null);
    handleCancelEdit();
    statusModalRef.current.close();
  }
  function handleRetry() {
    setSubmissionState(null);
    setNewPassword("");
    setNewPwdMessage(null);
    setConfirmNewPwd("");
    setConfirmNewPwdMessage(null);
    setCurrentPassword("");
    setCurrentPwdMessage(null);
    statusModalRef.current.close();
  }

  return (
    <>
      <form ref={manageAccountFormRef}>
        {!edit ? (
          <button
            className={`${styles.secondaryBtn} ${styles.editBtn}`}
            onClick={enableEdit}
            type="button"
          >
            Edit
          </button>
        ) : null}
        <section className={styles.nameSection}>
          <h2 className={styles.sectionHeading}>Your display name.</h2>
          <h3 className={styles.sectionSubheading}>
            This is what we call you.
          </h3>
          <ul className={styles.formFields}>
            <li
              className={`${styles.formField} ${!edit ? styles.readOnly : ""}`}
            >
              <label className={styles.inputLabel} htmlFor="first-name">
                first name
              </label>
              <input
                className={styles.inputField}
                disabled={!edit}
                id="first-name"
                name="firstName"
                onChange={handleChangeFirstName}
                ref={firstNameInputRef}
                required
                type="text"
              ></input>
              {edit ? (
                <>
                  <p className={styles.requiredIndicator}>required</p>
                  <p className={styles.hint} role="status">
                    {firstNameMessage ? firstNameMessage : ""}
                  </p>
                </>
              ) : null}
            </li>
            <li
              className={`${styles.formField} ${!edit ? styles.readOnly : ""}`}
            >
              <label className={styles.inputLabel} htmlFor="last-name">
                last name
              </label>
              <input
                className={styles.inputField}
                disabled={!edit}
                id="last-name"
                name="lastName"
                onChange={handleChangeLastName}
                ref={lastNameInputRef}
                type="text"
              ></input>
            </li>
          </ul>
        </section>
        <section className={styles.usernamePwdSection}>
          <h2 className={styles.sectionHeading}>Your credentials.</h2>
          <h3 className={styles.sectionSubheading}>
            This is what you use to sign in.
          </h3>
          <ul className={styles.formFields}>
            <li
              className={`${styles.formField} ${!edit ? styles.readOnly : ""}`}
            >
              <label className={styles.inputLabel} htmlFor="username">
                username
              </label>
              <input
                className={styles.inputField}
                disabled={!edit}
                id="username"
                maxLength={255}
                minLength={6}
                name="username"
                onBlur={debouncedHandleUsernameChange}
                onChange={debouncedHandleUsernameChange}
                ref={usernameInputRef}
                required
                type="text"
              ></input>
              {edit ? (
                <>
                  <p className={styles.requiredIndicator}>required</p>
                  <p className={styles.hint} role="status">
                    {usernameMessage
                      ? usernameMessage
                      : usernameUnavailable
                      ? usernameUnavailable
                      : ""}
                  </p>
                </>
              ) : null}
            </li>
            {edit ? (
              <li
                className={
                  editPassword
                    ? styles.disablePwdEditWrapper
                    : styles.enablePwdEditWrapper
                }
              >
                <button
                  className={`${styles.tertiaryBtn} ${
                    editPassword
                      ? styles.disablePwdEditBtn
                      : styles.enablePwdEditBtn
                  }`}
                  onClick={
                    editPassword ? cancelPasswordChange : enablePasswordChange
                  }
                  type="button"
                >
                  {editPassword ? "Cancel password change" : "Change password"}
                </button>
              </li>
            ) : null}
            {editPassword ? (
              <>
                <li className={styles.formField}>
                  <label className={styles.inputLabel} htmlFor="new-password">
                    new password
                  </label>
                  <input
                    className={styles.inputField}
                    id="new-password"
                    maxLength={255}
                    minLength={6}
                    name="newPassword"
                    onBlur={handleNewPwdChange}
                    onChange={handleNewPwdChange}
                    ref={newPwdInputRef}
                    required
                    type="password"
                  ></input>
                  <p className={styles.requiredIndicator}>required</p>
                  <p className={styles.hint} role="status">
                    {newPwdMessage ? newPwdMessage : ""}
                  </p>
                </li>
                <li className={styles.formField}>
                  <label
                    className={styles.inputLabel}
                    htmlFor="confirm-new-password"
                  >
                    confirm new password
                  </label>
                  <input
                    className={styles.inputField}
                    id="confirm-new-password"
                    maxLength={255}
                    minLength={6}
                    name="confirmNewPassword"
                    onBlur={handleConfirmNewPwdChange}
                    onChange={handleConfirmNewPwdChange}
                    ref={confirmNewPwdInputRef}
                    required
                    type="password"
                  ></input>
                  <p className={styles.requiredIndicator}>required</p>
                  <p className={styles.hint} role="status">
                    {confirmNewPwdMessage ? confirmNewPwdMessage : ""}
                  </p>
                </li>
              </>
            ) : null}
          </ul>
        </section>
        {edit ? (
          <section className={styles.currentPwdSection}>
            <h2 className={styles.sectionHeading}>Authorize account change.</h2>
            <h3 className={styles.sectionSubheading}>
              Enter your current password to authorize changes.
            </h3>
            <div className={styles.formFields}>
              <div className={styles.formField}>
                <label className={styles.inputLabel} htmlFor="current-password">
                  current password
                </label>
                <input
                  className={styles.inputField}
                  id="current-password"
                  name="currentPassword"
                  onBlur={handleCurrentPwdChange}
                  onChange={handleCurrentPwdChange}
                  ref={currentPwdInputRef}
                  required
                  type="password"
                ></input>
                <p className={styles.requiredIndicator}>required</p>
                <p className={styles.hint} role="status">
                  {currentPwdMessage ? currentPwdMessage : ""}
                </p>
              </div>
            </div>
          </section>
        ) : null}
        {edit ? (
          <div className={styles.formBtns}>
            <button
              className={`${styles.secondaryBtn} ${styles.cancelBtn}`}
              onClick={handleCancelEdit}
              type="button"
            >
              Cancel
            </button>
            <button
              className={styles.primaryBtn}
              disabled={
                !firstName ||
                !username ||
                (editPassword && !newPassword) ||
                (editPassword && !confirmNewPwd) ||
                !currentPassword ||
                firstNameMessage ||
                usernameMessage ||
                usernameUnavailable ||
                newPwdMessage ||
                confirmNewPwdMessage ||
                currentPwdMessage
              }
              onClick={handleSaveChanges}
            >
              Save
            </button>
          </div>
        ) : null}
      </form>
      {submissionState ? (
        <dialog
          className={styles.statusModal}
          onCancel={handleCancel}
          onKeyDown={handleEsc}
          ref={statusModalRef}
        >
          {submissionState === "pending" ? (
            <div className={styles.modalContent}>
              <div className={styles.loadingIndicator}>
                <div className={styles.spinner}></div>
              </div>
              <p className={styles.status}>Updating account...</p>
            </div>
          ) : submissionState === "success" ? (
            <div className={styles.modalContent}>
              <div className={styles.statusIcon}>
                <ThemedImage alt="success icon" imageName="success-icon" />
              </div>
              <p className={styles.status}>Account updated!</p>
              <div className={styles.ctaWrapper}>
                <Link className={styles.primaryCta} href="/">
                  Go to dashboard
                </Link>
                <button
                  className={styles.secondaryCta}
                  onClick={handleBackToManageAccount}
                  type="button"
                >
                  Stay in manage account
                </button>
              </div>
            </div>
          ) : submissionState === "invalid" ? (
            <div className={styles.modalContent}>
              <div className={styles.statusIcon}>
                <ThemedImage alt="alert icon" imageName="alert-icon" />
              </div>
              <p className={styles.status}>
                Your current password was incorrect.
              </p>
              <button
                className={styles.singleCta}
                onClick={handleRetry}
                type="button"
              >
                Try again
              </button>
            </div>
          ) : (
            <div className={styles.modalContent}>
              <div className={styles.statusIcon}>
                <ThemedImage alt="sad face icon" imageName="sad-icon" />
              </div>
              <p className={styles.status}>Oh no! An error occurred.</p>
              <button
                className={styles.singleCta}
                onClick={handleRetry}
                type="button"
              >
                Try again
              </button>
            </div>
          )}
        </dialog>
      ) : null}
    </>
  );
}
