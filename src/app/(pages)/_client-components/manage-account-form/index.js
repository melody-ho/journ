"use client";

import checkEditedUsername from "@/server-actions/check-edited-username";
import debounce from "lodash.debounce";
import updateUser from "@/server-actions/update-user";
import { experimental_useFormState as useFormState } from "react-dom";
import z from "zod";
import { useEffect, useRef, useState } from "react";

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
  const debouncedHandleUsernameChange = debounce(handleUsernameChange, 200);
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
      newPwdInputRef.current.value = newPassword;
    },
    [newPassword],
  );
  useEffect(
    function updateConfirmNewPwd() {
      confirmNewPwdInputRef.current.value = confirmNewPwd;
    },
    [confirmNewPwd],
  );
  // current password
  const [currentPassword, setCurrentPassword] = useState("");
  const [currenPwdMessage, setCurrentPwdMessage] = useState(null);
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
      currentPwdInputRef.current.value = currentPassword;
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
  function handleSaveChanges(e) {
    e.preventDefault();
    const formData = new FormData(manageAccountFormRef.current);
    formData.append("userId", userData.id);
    updateUser(formData);
  }

  return (
    <>
      <button hidden={edit} onClick={enableEdit} type="button">
        Edit
      </button>
      <form ref={manageAccountFormRef}>
        <section>
          <ul>
            <li>
              <label htmlFor="first-name">First Name</label>
              <input
                disabled={!edit}
                id="first-name"
                name="firstName"
                onChange={handleChangeFirstName}
                ref={firstNameInputRef}
                type="text"
              ></input>
              <p aria-hidden={!edit}>{edit ? "required" : ""}</p>
              <p aria-hidden={!firstNameMessage}>
                {firstNameMessage ? firstNameMessage : ""}
              </p>
            </li>
            <li>
              <label htmlFor="last-name">Last Name</label>
              <input
                disabled={!edit}
                id="last-name"
                name="lastName"
                onChange={handleChangeLastName}
                ref={lastNameInputRef}
                type="text"
              ></input>
            </li>
            <li>
              <label htmlFor="username">Username</label>
              <input
                disabled={!edit}
                id="username"
                name="username"
                onBlur={debouncedHandleUsernameChange}
                onChange={debouncedHandleUsernameChange}
                type="text"
                ref={usernameInputRef}
              ></input>
              <p aria-hidden={!edit}>{edit ? "required" : ""}</p>
              <p aria-hidden={!usernameMessage && !usernameUnavailable}>
                {usernameMessage
                  ? usernameMessage
                  : usernameUnavailable
                  ? usernameUnavailable
                  : ""}
              </p>
            </li>
          </ul>
        </section>
        <section hidden={!edit}>
          <button
            onClick={editPassword ? cancelPasswordChange : enablePasswordChange}
            type="button"
          >
            {editPassword ? "Cancel Password Change" : "Change Password"}
          </button>
          <ul hidden={!editPassword}>
            <li>
              <label htmlFor="new-password">New Password</label>
              <input
                id="new-password"
                name="newPassword"
                onBlur={handleNewPwdChange}
                onChange={handleNewPwdChange}
                ref={newPwdInputRef}
                type="password"
              ></input>
              <p>required</p>
              <p aria-hidden={!newPwdMessage}>
                {newPwdMessage ? newPwdMessage : ""}
              </p>
            </li>
            <li>
              <label htmlFor="confirm-new-password">Confirm New Password</label>
              <input
                id="confirm-new-password"
                name="confirmNewPassword"
                onBlur={handleConfirmNewPwdChange}
                onChange={handleConfirmNewPwdChange}
                ref={confirmNewPwdInputRef}
                type="password"
              ></input>
              <p>required</p>
              <p aria-hidden={!confirmNewPwdMessage}>
                {confirmNewPwdMessage ? confirmNewPwdMessage : ""}
              </p>
            </li>
          </ul>
        </section>
        <section hidden={!edit}>
          <label htmlFor="current-password">Current Password</label>
          <input
            id="current-password"
            name="currentPassword"
            onChange={handleCurrentPwdChange}
            ref={currentPwdInputRef}
            type="password"
          ></input>
          <p>required</p>
          <p aria-hidden={!currenPwdMessage}>
            {currenPwdMessage ? currenPwdMessage : ""}
          </p>
        </section>
        <button hidden={!edit} onClick={handleCancelEdit} type="button">
          Cancel
        </button>
        <button
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
            currenPwdMessage
          }
          onClick={handleSaveChanges}
        >
          Save
        </button>
      </form>
    </>
  );
}
