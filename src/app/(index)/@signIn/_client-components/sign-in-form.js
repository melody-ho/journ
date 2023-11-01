"use client";

/// imports ///
import authCredentials from "./server-actions/auth-credentials";
import styles from "./sign-in-form.module.css";
import {
  experimental_useFormState as useFormState,
  experimental_useFormStatus as useFormStatus,
} from "react-dom";
import { useEffect, useRef, useState } from "react";

/// children components ///
function FormFields() {
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
      <button
        className={styles.submitButton}
        disabled={!usernameState || !passwordState || pending}
      >
        Log in
      </button>
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
      <FormFields />
      <p className={styles.submitStatus}>
        {formState === "invalid"
          ? "Invalid credentials."
          : formState === "error"
          ? "An error occured."
          : formState === "success"
          ? "Successful authentication."
          : ""}
      </p>
    </form>
  );
}
