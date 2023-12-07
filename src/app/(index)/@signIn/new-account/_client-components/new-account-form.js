"use client";

/// imports ///
import checkUsername from "./server-actions/check-username";
import createUser from "./server-actions/create-user";
import debounce from "lodash.debounce";
import Link from "next/link";
import styles from "./new-account-form.module.css";
import ThemedImage from "@/app/_helper-components/themed-image";
import z from "zod";
import {
  experimental_useFormState as useFormState,
  experimental_useFormStatus as useFormStatus,
} from "react-dom";
import { useEffect, useRef, useState } from "react";

/// children components ///
function FormFields({ status }) {
  // client-side form validation //
  // first name
  const [firstName, setfirstName] = useState("");
  const [firstNameStatus, setFirstNameStatus] = useState("valid");
  const [firstNameMessage, setFirstNameMessage] = useState(null);
  const firstNameSchema = z
    .string()
    .min(1, { message: "First name is required." });
  function handleChangeFirstName(e) {
    setfirstName(e.target.value);
    try {
      firstNameSchema.parse(e.target.value);
      setFirstNameStatus("valid");
      setFirstNameMessage(null);
    } catch (error) {
      setFirstNameStatus("invalid");
      setFirstNameMessage(error.issues[0].message);
    }
  }
  // username
  const [username, setUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState("valid");
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
      setUsernameStatus("valid");
      setUsernameMessage(null);
    } catch (error) {
      setUsernameStatus("invalid");
      setUsernameMessage(error.issues[0].message);
    }
    checkUsernameAvailability(e.target.value);
  }
  const debouncedHandleUsernameChange = debounce(handleUsernameChange, 250);
  // password
  const passwordField = useRef(null);
  const [password, setPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState("valid");
  const [passwordMessage, setPasswordMessage] = useState(null);
  const confirmPasswordField = useRef(null);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordStatus, setConfirmPasswordStatus] = useState("valid");
  const [confirmPasswordMessage, setConfirmPasswordMessage] = useState(null);
  function matchPasswords() {
    if (passwordField.current.value === confirmPasswordField.current.value) {
      setConfirmPasswordStatus("valid");
      setConfirmPasswordMessage(null);
    } else {
      setConfirmPasswordStatus("invalid");
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
      setPasswordStatus("valid");
      setPasswordMessage(null);
    } catch (error) {
      setPasswordStatus("invalid");
      setPasswordMessage(error.issues[0].message);
    }
    if (e.target.value === "" && confirmPasswordField.current.value === "") {
      setConfirmPasswordStatus("valid");
      setConfirmPasswordMessage(null);
    }
    if (confirmPasswordField.current.value !== "") {
      matchPasswords();
    }
  }
  function handleConfirmPasswordChange(e) {
    setConfirmPassword(e.target.value);
    matchPasswords();
  }

  // pending status initialization //
  const { pending } = useFormStatus();

  // show account creation status //
  const statusModal = useRef(null);
  useEffect(function openModal() {
    if (statusModal.current) {
      statusModal.current.close();
      statusModal.current.showModal();
    }
  });

  function handleCancel(e) {
    e.preventDefault();
  }

  function closeModal() {
    statusModal.current.close();
  }

  return (
    <>
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
              className={`${firstNameStatus} ${styles.inputField}`}
              id="first-name"
              name="firstName"
              onBlur={handleChangeFirstName}
              onChange={handleChangeFirstName}
              readOnly={pending}
              type="text"
            ></input>
            <p className={styles.requiredIndicator}>required</p>
            <p
              aria-hidden={`${firstNameMessage ? "false" : "true"}`}
              className={styles.hint}
            >
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
              readOnly={pending}
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
            <label className={styles.inputLabel} htmlFor="username">
              username
            </label>
            <input
              className={`${usernameUnavailable ? "invalid" : usernameStatus} ${
                styles.inputField
              }`}
              id="username"
              name="username"
              onBlur={debouncedHandleUsernameChange}
              onChange={debouncedHandleUsernameChange}
              readOnly={pending}
              type="text"
            ></input>
            <p className={styles.requiredIndicator}>required</p>
            <p
              aria-hidden={`${
                usernameMessage || usernameUnavailable ? "false" : "true"
              }`}
              className={styles.hint}
            >
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
              className={`${passwordStatus} ${styles.inputField}`}
              id="password"
              name="password"
              onBlur={handlePasswordChange}
              onChange={handlePasswordChange}
              readOnly={pending}
              ref={passwordField}
              type="password"
            ></input>
            <p className={styles.requiredIndicator}>required</p>
            <p
              aria-hidden={`${passwordMessage ? "false" : "true"}`}
              className={styles.hint}
            >
              {passwordMessage ? passwordMessage : ""}
            </p>
          </li>
          <li className={`${styles.formField} ${styles.pwdConfirmField}`}>
            <label className={styles.inputLabel} htmlFor="confirm-password">
              confirm password
            </label>
            <input
              className={`${confirmPasswordStatus} ${styles.inputField}`}
              id="confirm-password"
              name="confirmPassword"
              onBlur={handleConfirmPasswordChange}
              onChange={handleConfirmPasswordChange}
              readOnly={pending}
              ref={confirmPasswordField}
              type="password"
            ></input>
            <p className={styles.requiredIndicator}>required</p>
            <p
              aria-hidden={`${confirmPasswordMessage ? "false" : "true"}`}
              className={styles.hint}
            >
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
          pending ||
          status
        }
      >
        Create account
      </button>
      {pending || status ? (
        <dialog
          className={styles.statusModal}
          onCancel={handleCancel}
          ref={statusModal}
        >
          {pending ? (
            <>
              <div className={styles.modalContent}>
                <div className={styles.loadingIndicator}>
                  <div className={styles.spinner}></div>
                </div>
                <p className={styles.status}>Creating account...</p>
              </div>
            </>
          ) : status === "success" ? (
            <>
              <div className={styles.modalContent}>
                <div className={styles.statusIcon}>
                  <ThemedImage alt="success icon" imageName="success-icon" />
                </div>
                <p className={styles.status}>Success! Welcome to Journ.</p>
                <Link className={styles.signInLink} href="/">
                  Sign-in page ➜
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className={styles.modalContent}>
                <div className={styles.statusIcon}>
                  <ThemedImage alt="sad face icon" imageName="sad-icon" />
                </div>
                <p className={styles.status}>Oh no! An error occurred.</p>
                <button
                  className={styles.backButton}
                  onClick={closeModal}
                  type="button"
                >
                  Try again ➜
                </button>
              </div>
            </>
          )}
        </dialog>
      ) : null}
    </>
  );
}

/// main component ///
export default function NewAccountForm() {
  // initialize submission status //
  const [formState, formAction] = useFormState(createUser, null);

  return (
    <form action={formAction} className={styles.form}>
      <FormFields status={formState} />
    </form>
  );
}
