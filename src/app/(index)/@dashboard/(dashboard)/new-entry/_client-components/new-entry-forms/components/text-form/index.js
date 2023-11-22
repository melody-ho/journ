"use client";

import addTextEntry from "./server-actions/add-text-entry";
import getUserTags from "@/(dashboard)/_helper-functions/get-user-tags";
import TagDropdown from "../helper-components/tag-dropdown";
import { useEffect, useRef, useState } from "react";

export default function TextForm({ user }) {
  // initialize states and refs //
  const [userTags, setUserTags] = useState(null);
  const textForm = useRef(null);

  // get user tags from database//
  useEffect(
    function getUserTagData() {
      async function getData() {
        const userTags = await getUserTags(user);
        setUserTags(userTags ? userTags : []);
      }
      if (userTags === null) {
        try {
          getData();
        } catch (error) {
          // TO DO: error handling //
        }
      }
    },
    [user, userTags],
  );

  // update selected tags when changed in tag dropdown //
  let tags = [];
  function getEntryTags(entryTags) {
    tags = [...entryTags];
  }

  // add new text entry when form is submitted//
  async function submitEntry(e) {
    e.preventDefault();
    const formData = new FormData(textForm.current);
    formData.append("user", user);
    formData.append("tags", JSON.stringify(tags));
    await addTextEntry(formData);
  }

  return (
    <>
      <h2>Text</h2>
      <form ref={textForm}>
        <label htmlFor="text">Text</label>
        <textarea id="text" name="text"></textarea>
        <TagDropdown passEntryTags={getEntryTags} userTags={userTags} />
        <button onClick={submitEntry}>Add entry</button>
      </form>
    </>
  );
}
