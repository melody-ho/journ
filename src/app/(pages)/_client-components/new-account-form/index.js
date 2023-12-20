"use client";

/// imports ///
import checkUsername from "@/server-actions/check-username";
import createUser from "@/server-actions/create-user";
import debounce from "lodash.debounce";
import Link from "next/link";
import styles from "./index.module.css";
import ThemedImage from "@/helper-components/themed-image";
import { experimental_useFormState as useFormState } from "react-dom";
import z from "zod";
import { useEffect, useRef, useState } from "react";

/// constants ///
// debounce duration for checking username availability //
const DEBOUNCE_DURATION = 200;

/// main component ///
export default function NewAccountForm() {
  // client-side form validation //
  // first name
  const [firstName, setfirstName] = useState("");
  const [firstNameMessage, setFirstNameMessage] = useState(null);
  const firstNameSchema = z
    .string()
    .min(1, { message: "First name is required." });
  function handleChangeFirstName(e) {
    setfirstName(e.target.value);
    try {
      firstNameSchema.parse(e.target.value);
      setFirstNameMessage(null);
    } catch (error) {
      setFirstNameMessage(error.issues[0].message);
    }
  }
  // username
  const [username, setUsername] = useState("");
  const [usernameMessage, setUsernameMessage] = useState(null);
  const [usernameUnavailable, checkUsernameAvailability] = useFormState(
    checkUsername,
    null,
  );
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
    checkUsernameAvailability(e.target.value);
  }
  const debouncedHandleUsernameChange = debounce(
    handleUsernameChange,
    DEBOUNCE_DURATION,
  );
  // password
  const passwordInputRef = useRef(null);
  const [password, setPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState(null);
  const confirmPwdInputRef = useRef(null);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordMessage, setConfirmPasswordMessage] = useState(null);
  function matchPasswords() {
    if (passwordInputRef.current.value === confirmPwdInputRef.current.value) {
      setConfirmPasswordMessage(null);
    } else {
      setConfirmPasswordMessage("Passwords do not match.");
    }
  }
  const passwordSchema = z
    .string()
    .min(6, { message: "Password must be at least 6 characters." })
    .max(255, { message: "Password cannot be longer than 255 characters." });
  function handlePasswordChange(e) {
    setPassword(e.target.value);
    try {
      passwordSchema.parse(e.target.value);
      setPasswordMessage(null);
    } catch (error) {
      setPasswordMessage(error.issues[0].message);
    }
    if (e.target.value === "" && confirmPwdInputRef.current.value === "") {
      setConfirmPasswordMessage(null);
    }
    if (confirmPwdInputRef.current.value !== "") {
      matchPasswords();
    }
  }
  function handleConfirmPasswordChange(e) {
    setConfirmPassword(e.target.value);
    matchPasswords();
  }

  // show/hide username info popup //
  const [usernameInfo, setUsernameInfo] = useState(false);
  function showUsernameInfo() {
    setUsernameInfo(true);
  }
  function hideUsernameInfo() {
    setUsernameInfo(false);
  }
  function toggleUsernameInfo() {
    setUsernameInfo(!usernameInfo);
  }

  // form submission //
  // initialize states and refs
  const newAccountFormRef = useRef(null);
  const [submissionState, setSubmissionState] = useState(null);
  // declare submission handler
  async function handleCreateAccount(e) {
    e.preventDefault();
    setSubmissionState("pending");
    const formData = new FormData(newAccountFormRef.current);
    const newState = await createUser(formData);
    setSubmissionState(newState);
  }

  // account creation status modal //
  // show status modal when rendered
  const statusModalRef = useRef(null);
  useEffect(function openModal() {
    if (statusModalRef.current) {
      statusModalRef.current.close();
      statusModalRef.current.showModal();
    }
  });
  // declare status modal handlers
  function handleCancel(e) {
    e.preventDefault();
  }
  function handleEsc(e) {
    if (e.key === "Escape") e.preventDefault();
  }
  function handleRetry() {
    setSubmissionState(null);
    statusModalRef.current.close();
  }

  return (
    <form className={styles.form} ref={newAccountFormRef}>
      <section className={styles.nameSection}>
        <h2 className={styles.sectionHeading}>What should we call you?</h2>
        <h3 className={styles.sectionSubheading}>
          This can be changed later in account settings.
        </h3>
        <ul className={styles.nameFields}>
          <li className={styles.formField}>
            <label className={styles.inputLabel} htmlFor="first-name">
              first name
            </label>
            <input
              className={styles.inputField}
              id="first-name"
              name="firstName"
              onBlur={handleChangeFirstName}
              onChange={handleChangeFirstName}
              readOnly={submissionState}
              required
              type="text"
            ></input>
            <p className={styles.requiredIndicator}>required</p>
            <p className={styles.hint} role="status">
              {firstNameMessage ? firstNameMessage : ""}
            </p>
          </li>
          <li className={styles.formField}>
            <label className={styles.inputLabel} htmlFor="last-name">
              last name
            </label>
            <input
              className={styles.inputField}
              id="last-name"
              name="lastName"
              readOnly={submissionState}
              type="text"
            ></input>
          </li>
        </ul>
      </section>
      <section className={styles.usernamePwdSection}>
        <h2 className={styles.sectionHeading}>
          Your username and password are used to access your account.
        </h2>
        <h3 className={styles.sectionSubheading}>
          These can be changed later in account settings.
        </h3>
        <ul className={styles.usernamePwdFields}>
          <li className={`${styles.formField} ${styles.usernameField}`}>
            <div className={styles.usernameLabelAndInfo}>
              <div
                className={styles.usernameLabelWrapper}
                onBlur={hideUsernameInfo}
                onClick={toggleUsernameInfo}
                onFocus={showUsernameInfo}
                onMouseEnter={showUsernameInfo}
                onMouseLeave={hideUsernameInfo}
                tabIndex={0}
              >
                <label className={styles.inputLabel} htmlFor="username">
                  username
                </label>
                <div className={styles.infoIcon}>
                  <ThemedImage alt="info icon" imageName="info-icon" />
                </div>
              </div>
              <div
                aria-description="username format guide"
                className={`${styles.infoPopup} ${
                  usernameInfo ? styles.show : styles.hide
                }`}
              >
                <p className={styles.infoContent}>
                  Can only consist of lowercase alphanumerical characters,
                  periods, and underscores. Must start and end with a lowercase
                  alphanumerical character.
                </p>
              </div>
            </div>
            <input
              className={styles.inputField}
              id="username"
              maxLength={255}
              minLength={6}
              name="username"
              onBlur={debouncedHandleUsernameChange}
              onChange={debouncedHandleUsernameChange}
              readOnly={submissionState}
              required
              type="text"
            ></input>
            <p className={styles.requiredIndicator}>required</p>
            <p className={styles.hint} role="status">
              {usernameMessage
                ? usernameMessage
                : usernameUnavailable
                ? usernameUnavailable
                : ""}
            </p>
          </li>
          <li className={`${styles.formField} ${styles.pwdField}`}>
            <label className={styles.inputLabel} htmlFor="password">
              password
            </label>
            <input
              className={styles.inputField}
              id="password"
              maxLength={255}
              minLength={6}
              name="password"
              onBlur={handlePasswordChange}
              onChange={handlePasswordChange}
              readOnly={submissionState}
              ref={passwordInputRef}
              required
              type="password"
            ></input>
            <p className={styles.requiredIndicator}>required</p>
            <p className={styles.hint} role="status">
              {passwordMessage ? passwordMessage : ""}
            </p>
          </li>
          <li className={`${styles.formField} ${styles.pwdConfirmField}`}>
            <label className={styles.inputLabel} htmlFor="confirm-password">
              confirm password
            </label>
            <input
              className={styles.inputField}
              id="confirm-password"
              maxLength={255}
              minLength={6}
              name="confirmPassword"
              onBlur={handleConfirmPasswordChange}
              onChange={handleConfirmPasswordChange}
              readOnly={submissionState}
              ref={confirmPwdInputRef}
              required
              type="password"
            ></input>
            <p className={styles.requiredIndicator}>required</p>
            <p className={styles.hint} role="status">
              {confirmPasswordMessage ? confirmPasswordMessage : ""}
            </p>
          </li>
        </ul>
      </section>
      <button
        className={styles.submitButton}
        disabled={
          !firstName ||
          !username ||
          !password ||
          !confirmPassword ||
          firstNameMessage ||
          usernameMessage ||
          usernameUnavailable ||
          passwordMessage ||
          confirmPasswordMessage ||
          submissionState
        }
        onClick={handleCreateAccount}
      >
        Create account
      </button>
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
              <p className={styles.status}>Creating account...</p>
            </div>
          ) : submissionState === "success" ? (
            <div className={styles.modalContent}>
              <div className={styles.statusIcon}>
                <ThemedImage alt="success icon" imageName="success-icon" />
              </div>
              <p className={styles.status}>Success! Welcome to Journ.</p>
              <Link className={styles.signInLink} href="/">
                Sign-in page ➜
              </Link>
            </div>
          ) : (
            <div className={styles.modalContent}>
              <div className={styles.statusIcon}>
                <ThemedImage alt="sad face icon" imageName="sad-icon" />
              </div>
              <p className={styles.status}>Oh no! An error occurred.</p>
              <button
                className={styles.backButton}
                onClick={handleRetry}
                type="button"
              >
                Try again ➜
              </button>
            </div>
          )}
        </dialog>
      ) : null}
    </form>
  );
}
