"use client";

import authCredentials from "../_actions/auth-credentials";
import { experimental_useFormState as useFormState } from "react-dom";

export default function SignInForm() {
  // TO DO: client side form validation //
  const [formState, formAction] = useFormState(authCredentials, "initial");
  return (
    <form action={formAction}>
      <ul>
        <li>
          <label htmlFor="username">username</label>
          <input id="username" name="username" type="text"></input>
        </li>
        <li>
          <label htmlFor="password">password</label>
          <input id="password" name="password" type="password"></input>
        </li>
      </ul>
      <button>Log in</button>
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
