"use client";

/// imports ///
import authCredentials from "@/server-actions/auth-credentials";
import styles from "./index.module.css";
import ThemedImage from "@/helper-components/themed-image";
import { useEffect, useRef, useState } from "react";
import {
  experimental_useFormState as useFormState,
  experimental_useFormStatus as useFormStatus,
} from "react-dom";

/// constants ///
// duration of delay for posting form data to ensure success message is shown //
const POST_DELAY = 200;

/// children components ///
function FormFields({ status }) {
  // initialize states used for client-side validation //
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

  // initialize form status //
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
            required
            type="text"
          ></input>
          <label className={styles.inputLabel} htmlFor="username">
            username
          </label>
          <p className={styles.errorMessage} role="status">
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
            required
            type="password"
          ></input>
          <label className={styles.inputLabel} htmlFor="password">
            password
          </label>
          <p className={styles.errorMessage} role="status">
            {passwordState === "" ? "Please enter your password." : ""}
          </p>
        </li>
      </ul>
      {pending || status === "success" ? (
        <div className={styles.loadingIndicator} role="status">
          <div
            aria-description="Attempting sign-in with credentials provided. Please wait."
            className={styles.spinner}
          ></div>
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
  // handle server-side response //
  const [formState, formAction] = useFormState(authCredentials, "initial");
  const formRef = useRef(null);
  useEffect(
    function postOnSuccess() {
      if (formState === "success") {
        formRef.current.action = "./sign-in";
        formRef.current.method = "post";
        setTimeout(function submit() {
          formRef.current.submit();
        }, POST_DELAY);
      }
    },
    [formState],
  );

  return (
    <form action={formAction} className={styles.form} ref={formRef}>
      <FormFields status={formState} />
      <div className={styles.submitStatus} role="status">
        {formState === "invalid" ? (
          <>
            <div className={styles.statusIcon}>
              <ThemedImage alt="alert icon" imageName="alert-icon" />
            </div>
            <p className={styles.statusMessage}>Invalid credentials.</p>
          </>
        ) : formState === "error" ? (
          <>
            <div className={styles.statusIcon}>
              <ThemedImage alt="sad face icon" imageName="sad-icon" />
            </div>
            <p className={styles.statusMessage}>An error occurred.</p>
          </>
        ) : formState === "success" ? (
          <>
            <div className={styles.statusIcon}>
              <ThemedImage alt="success icon" imageName="success-icon" />
            </div>
            <p className={styles.statusMessage}>Success!</p>
          </>
        ) : null}
      </div>
    </form>
  );
}
