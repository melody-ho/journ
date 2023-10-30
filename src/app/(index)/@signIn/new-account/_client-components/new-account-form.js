"use client";

/// imports ///
import checkUsername from "./server-actions/check-username";
import createUser from "./server-actions/create-user";
import debounce from "lodash.debounce";
import z from "zod";
import {
  experimental_useFormState as useFormState,
  experimental_useFormStatus as useFormStatus,
} from "react-dom";
import { useRef, useState } from "react";

/// children components ///
function FormFields() {
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

  // form status initialization //
  const { pending } = useFormStatus();

  return (
    <>
      <section>
        <h2>What should we call you?</h2>
        <h3>This can be changed later in account settings.</h3>
        <ul>
          <li>
            <label htmlFor="first-name">first name</label>
            <input
              className={firstNameStatus}
              id="first-name"
              name="firstName"
              onBlur={handleChangeFirstName}
              onChange={handleChangeFirstName}
              readOnly={pending}
              type="text"
            ></input>
            <p aria-hidden={`${firstNameMessage ? "false" : "true"}`}>
              {firstNameMessage ? firstNameMessage : ""}
            </p>
          </li>
          <li>
            <label htmlFor="last-name">last name</label>
            <input
              id="last-name"
              name="lastName"
              readOnly={pending}
              type="text"
            ></input>
          </li>
        </ul>
      </section>
      <section>
        <h2>Your username and password are used to access your account.</h2>
        <h3>These can be changed later in account settings.</h3>
        <ul>
          <li>
            <label htmlFor="username">username</label>
            <input
              className={usernameUnavailable ? "invalid" : usernameStatus}
              id="username"
              name="username"
              onBlur={debouncedHandleUsernameChange}
              onChange={debouncedHandleUsernameChange}
              readOnly={pending}
              type="text"
            ></input>
            <p
              aria-hidden={`${
                usernameMessage || usernameUnavailable ? "false" : "true"
              }`}
            >
              {usernameMessage
                ? usernameMessage
                : usernameUnavailable
                ? usernameUnavailable
                : ""}
            </p>
          </li>
          <li>
            <label htmlFor="password">password</label>
            <input
              className={passwordStatus}
              id="password"
              name="password"
              onBlur={handlePasswordChange}
              onChange={handlePasswordChange}
              readOnly={pending}
              ref={passwordField}
              type="password"
            ></input>
            <p aria-hidden={`${passwordMessage ? "false" : "true"}`}>
              {passwordMessage ? passwordMessage : ""}
            </p>
          </li>
          <li>
            <label htmlFor="confirm-password">confirm password</label>
            <input
              className={confirmPasswordStatus}
              id="confirm-password"
              name="confirmPassword"
              onBlur={handleConfirmPasswordChange}
              onChange={handleConfirmPasswordChange}
              readOnly={pending}
              ref={confirmPasswordField}
              type="password"
            ></input>
            <p aria-hidden={`${confirmPasswordMessage ? "false" : "true"}`}>
              {confirmPasswordMessage ? confirmPasswordMessage : ""}
            </p>
          </li>
        </ul>
      </section>
      <button
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
          pending
        }
      >
        Create account
      </button>
    </>
  );
}

/// main component ///
export default function NewAccountForm() {
  // server-side error handling //
  const [formState, formAction] = useFormState(createUser, null);

  return (
    <form action={formAction}>
      <FormFields />
      <h2>{formState ? formState : ""}</h2>
    </form>
  );
}
