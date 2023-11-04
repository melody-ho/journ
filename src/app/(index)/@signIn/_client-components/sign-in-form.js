"use client";

/// imports ///
import authCredentials from "./server-actions/auth-credentials";
import styles from "./sign-in-form.module.css";
import ThemedImage from "@/app/_helper-components/themed-image";
import {
  experimental_useFormState as useFormState,
  experimental_useFormStatus as useFormStatus,
} from "react-dom";
import { useEffect, useRef, useState } from "react";

/// children components ///
function FormFields({ status }) {
  // client-side validation //
  // username
  const [usernameState, setUsernameState] = useState(null);
  function handleUsernameChange(e) {
    setUsernameState(e.target.value);
  }
  // password
  const [passwordState, setPasswordState] = useState(null);
  function handlePasswordChange(e) {
    setPasswordState(e.target.value);
  }
  // form status initialization //
  const { pending } = useFormStatus();

  return (
    <>
      <ul>
        <li className={styles.formField}>
          <input
            className={styles.textInput}
            id="username"
            name="username"
            onBlur={handleUsernameChange}
            onChange={handleUsernameChange}
            readOnly={pending || status === "success"}
            type="text"
          ></input>
          <label className={styles.inputLabel} htmlFor="username">
            username
          </label>
          <p aria-hidden={usernameState !== ""} className={styles.errorMessage}>
            {usernameState === "" ? "Please enter your username." : ""}
          </p>
        </li>
        <li className={styles.formField}>
          <input
            className={styles.textInput}
            id="password"
            name="password"
            onBlur={handlePasswordChange}
            onChange={handlePasswordChange}
            readOnly={pending || status === "success"}
            type="password"
          ></input>
          <label className={styles.inputLabel} htmlFor="password">
            password
          </label>
          <p aria-hidden={passwordState !== ""} className={styles.errorMessage}>
            {passwordState === "" ? "Please enter your password." : ""}
          </p>
        </li>
      </ul>
      {pending || status === "success" ? (
        <div className={styles.loadingIndicator}>
          <div className={styles.spinner}></div>
        </div>
      ) : (
        <button
          className={styles.submitButton}
          disabled={!usernameState || !passwordState}
        >
          Log in
        </button>
      )}
    </>
  );
}

/// main component ///
export default function SignInForm() {
  // server-side response handling //
  const [formState, formAction] = useFormState(authCredentials, "initial");
  const form = useRef(null);
  useEffect(
    function postOnSuccess() {
      if (formState === "success") {
        form.current.action = "./sign-in";
        form.current.method = "post";
        form.current.submit();
      }
    },
    [formState],
  );

  return (
    <form action={formAction} className={styles.form} ref={form}>
      <FormFields status={formState} />
      <div
        aria-hidden={formState === "initial"}
        className={styles.submitStatus}
      >
        {formState === "invalid" ? (
          <>
            <div className={styles.statusIcon}>
              <ThemedImage
                alt="alert icon"
                imageName="alert-icon"
                position="center"
              />
            </div>
            <p className={styles.statusMessage}>Invalid credentials.</p>
          </>
        ) : formState === "error" ? (
          <>
            <div className={styles.statusIcon}>
              <ThemedImage
                alt="sad face icon"
                imageName="sad-icon"
                position="center"
              />
            </div>
            <p className={styles.statusMessage}>An error occurred.</p>
          </>
        ) : formState === "success" ? (
          <>
            <div className={styles.statusIcon}>
              <ThemedImage
                alt="success icon"
                imageName="success-icon"
                position="center"
              />
            </div>
            <p className={styles.statusMessage}>Success!</p>
          </>
        ) : null}
      </div>
    </form>
  );
}
