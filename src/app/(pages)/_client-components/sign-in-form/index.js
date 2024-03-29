"use client";

/// imports ///
import authCredentials from "@/server-actions/auth-credentials";
import styles from "./index.module.css";
import ThemedImage from "@/helper-components/themed-image";
import { useEffect, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";

/// constants ///
/**
 * Delay for posting form data to ensure success message is shown, in ms.
 */
const POST_DELAY = 200;

/// child components ///
/**
 * @param {Object} props
 * @param {"invalid" | "error" | "success"} props.status Result of attempted authorization.
 */
function FormFields({ status }) {
  // initialize states used for client-side validation //
  // username
  const [usernameValue, setUsernameValue] = useState(null);
  function handleUsernameChange(e) {
    setUsernameValue(e.target.value);
  }
  // password
  const [passwordValue, setPasswordValue] = useState(null);
  function handlePasswordChange(e) {
    setPasswordValue(e.target.value);
  }

  // initialize form status //
  const { pending } = useFormStatus();

  // render //
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
            {usernameValue === "" ? "Please enter your username." : ""}
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
            {passwordValue === "" ? "Please enter your password." : ""}
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
          disabled={!usernameValue || !passwordValue}
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

  // render //
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
