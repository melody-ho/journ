"use client";

import { useEffect, useRef, useState } from "react";

export default function TagForm({ userTags }) {
  // initialize states and refs //
  const [dropdown, setDropdown] = useState(false);
  const [matchedTags, setMatchedTags] = useState([]);
  const [newTags, setNewTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const tagSearchRef = useRef(null);

  // initialize matched tags //
  useEffect(
    function updateUserTags() {
      if (userTags !== null) {
        setMatchedTags([...userTags]);
      }
    },
    [userTags],
  );

  // define event handlers //
  function toggleDropDown() {
    setDropdown(!dropdown);
  }

  function updateMatchedTags(e) {
    const regex = new RegExp(e.target.value, "i");
    const newMatchedTags = userTags.filter((userTag) =>
      userTag.name.match(regex),
    );
    setMatchedTags(newMatchedTags);
  }

  function updateSelectedTags(e) {
    if (e.target.checked) {
      setSelectedTags([...selectedTags, e.target.value]);
    } else {
      const newSelectedTags = selectedTags.filter(
        (selectedTag) => selectedTag !== e.target.value,
      );
      setSelectedTags(newSelectedTags);
    }
  }

  function addNewTag(tagName) {
    const updatedNewTags = [...newTags, tagName];
    updatedNewTags.sort();
    setNewTags(updatedNewTags);
    tagSearchRef.current.value = "";
    setMatchedTags(userTags ? [...userTags] : []);
  }

  function removeFromNewTags(e) {
    const updatedNewTags = newTags.filter(
      (newTag) => newTag !== e.target.value,
    );
    setNewTags(updatedNewTags);
  }

  return (
    <div>
      <fieldset>
        <legend>Tags</legend>
        <div>
          <button onClick={toggleDropDown} type="button">
            Add tags...
          </button>
          {dropdown ? (
            <div>
              {userTags !== null ? (
                <>
                  <div>
                    <p>New tags</p>
                    {newTags.length !== 0 ? (
                      newTags.map((newTag) => (
                        <div key={newTag}>
                          <input
                            checked
                            id={newTag}
                            name="tags"
                            onChange={removeFromNewTags}
                            type="checkbox"
                            value={newTag}
                          />
                          <label htmlFor={newTag}>{newTag}</label>
                        </div>
                      ))
                    ) : (
                      <p>none</p>
                    )}
                  </div>
                  <div>
                    <p>Selected</p>
                    {selectedTags.length !== 0 ? (
                      userTags.map((userTag) => {
                        if (selectedTags.includes(userTag.name)) {
                          return (
                            <div key={userTag.name}>
                              <input
                                checked
                                id={userTag.name}
                                name="tags"
                                onChange={updateSelectedTags}
                                type="checkbox"
                                value={userTag.name}
                              />
                              <label htmlFor={userTag.name}>
                                {userTag.name}
                              </label>
                            </div>
                          );
                        }
                      })
                    ) : (
                      <p>none</p>
                    )}
                  </div>
                  <div>
                    <div>
                      <label htmlFor="searchTags">Add more:</label>
                      <input
                        id="searchTags"
                        onChange={updateMatchedTags}
                        ref={tagSearchRef}
                        type="search"
                      ></input>
                    </div>
                    {matchedTags.length !== 0 ? (
                      matchedTags.map((matchedTag) => {
                        if (!selectedTags.includes(matchedTag.name)) {
                          return (
                            <div key={matchedTag.name}>
                              <input
                                id={matchedTag.name}
                                name="tags"
                                onChange={updateSelectedTags}
                                type="checkbox"
                                value={matchedTag.name}
                              />
                              <label htmlFor={matchedTag.name}>
                                {matchedTag.name}
                              </label>
                            </div>
                          );
                        }
                      })
                    ) : tagSearchRef.current &&
                      tagSearchRef.current.value &&
                      !newTags.includes(tagSearchRef.current.value) ? (
                      <button
                        onClick={() => addNewTag(tagSearchRef.current.value)}
                        type="button"
                      >
                        Add {tagSearchRef.current.value}
                      </button>
                    ) : (
                      <p>none</p>
                    )}
                  </div>
                </>
              ) : (
                <p>loading...</p>
              )}
            </div>
          ) : null}
        </div>
      </fieldset>
    </div>
  );
}
