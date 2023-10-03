"use client";

import createUser from "../actions/create-user";
import { experimental_useFormState as useFormState } from "react-dom";

export default function NewAccountForm() {
  // TO DO: client-side validation of form data //
  // TO DO: display loading state after submission //
  const [formState, formAction] = useFormState(createUser, null);
  return (
    <form action={formAction}>
      <section>
        <h2>What should we call you?</h2>
        <h3>This can be changed later in account settings.</h3>
        <ul>
          <li>
            <label htmlFor="first-name">first name</label>
            <input id="first-name" name="firstName" type="text"></input>
          </li>
          <li>
            <label htmlFor="last-name">last name</label>
            <input id="last-name" name="lastName" type="text"></input>
          </li>
        </ul>
      </section>
      <section>
        <h2>Your username and password are used to access your account.</h2>
        <h3>These can be changed later in account settings.</h3>
        <ul>
          <li>
            <label htmlFor="username">username</label>
            <input id="username" name="username" type="text"></input>
          </li>
          <li>
            <label htmlFor="password">password</label>
            <input id="password" name="password" type="password"></input>
          </li>
          <li>
            <label htmlFor="confirm-password">confirm password</label>
            <input
              id="confirm-password"
              name="confirmPassword"
              type="password"
            ></input>
          </li>
        </ul>
      </section>
      <button>Create account</button>
      <h2>{formState ? formState : ""}</h2>
    </form>
  );
}
