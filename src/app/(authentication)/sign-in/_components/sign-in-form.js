"use client";

/// imports ///
import authCredentials from "../_actions/auth-credentials";
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
        <li>
          <label htmlFor="username">username</label>
          <input
            id="username"
            name="username"
            onBlur={handleUsernameChange}
            onChange={handleUsernameChange}
            type="text"
          ></input>
          <p aria-hidden={usernameState !== ""}>
            {usernameState === "" ? "Please enter your username." : ""}
          </p>
        </li>
        <li>
          <label htmlFor="password">password</label>
          <input
            id="password"
            name="password"
            onBlur={handlePasswordChange}
            onChange={handlePasswordChange}
            type="password"
          ></input>
          <p aria-hidden={passwordState !== ""}>
            {passwordState === "" ? "Please enter your password." : ""}
          </p>
        </li>
      </ul>
      <button disabled={!usernameState || !passwordState || pending}>
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
        form.current.action = "./sign-in/success";
        form.current.method = "post";
        form.current.submit();
      }
    },
    [formState],
  );

  return (
    <form action={formAction} ref={form}>
      <FormFields />
      <h2>
        {formState === "invalid"
          ? "Invalid credentials."
          : formState === "error"
          ? "An error occured."
          : formState === "success"
          ? "Successful authentication."
          : ""}
      </h2>
    </form>
  );
}
