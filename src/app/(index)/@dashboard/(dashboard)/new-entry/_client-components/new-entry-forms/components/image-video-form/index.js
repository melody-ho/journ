"use client";

import getUserTags from "@/(dashboard)/_helper-functions/get-user-tags";
import handleUpload from "./server-actions/handle-upload";
import Image from "next/image";
import TagDropdown from "../helper-components/tag-dropdown";
import { v4 as uuidv4 } from "uuid";
import { useCallback, useEffect, useRef, useState } from "react";

export default function ImageVideoForm({ user }) {
  // initialize states and refs //
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [videoPreviews, setVideoPreviews] = useState([]);
  const [userTags, setUserTags] = useState(null);
  const [tagsData, setTagsData] = useState(new Map());
  const captionRefs = useRef(new Map());
  const tagRefs = useRef(new Map());

  // get user tags from database //
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

  // define factory function for managing tags data //
  const manageTagData = useCallback(() => {
    let entryTags = [];
    function updateEntryTags(updatedTags) {
      entryTags = [...updatedTags];
    }
    function getEntryTags() {
      return entryTags;
    }
    return { updateEntryTags, getEntryTags };
  }, []);

  // create image/video previews //
  const createPreviews = useCallback(
    (type, entries, setEntries) => {
      function deleteEntry(index) {
        const newEntries = entries.filter((entry) => entry.index !== index);
        setTagsData((tagsData) => {
          tagsData.delete(index);
          return tagsData;
        });
        setEntries(newEntries);
      }
      const newPreviews = entries.map((entry) => {
        const tagData = manageTagData();
        setTagsData((tagsData) => tagsData.set(entry.index, tagData));
        return (
          <li key={entry.index}>
            {type === "image" ? (
              <Image
                alt={`preview of ${entry.name}`}
                height="100"
                src={entry.source}
                width="100"
              />
            ) : (
              <video autoPlay loop muted src={entry.source}></video>
            )}
            <textarea
              ref={(ref) => {
                captionRefs.current.set(entry.index, ref);
              }}
            ></textarea>
            <div
              ref={(ref) => {
                tagRefs.current.set(entry.index, ref);
              }}
            >
              <TagDropdown
                passEntryTags={tagData.updateEntryTags}
                userTags={userTags}
              />
            </div>
            <button onClick={() => deleteEntry(entry.index)} type="button">
              Delete
            </button>
          </li>
        );
      });
      return newPreviews;
    },
    [manageTagData, userTags],
  );

  // update DOM when list of images changes //
  useEffect(
    function updateImagePreviews() {
      const newPreviews = createPreviews("image", images, setImages);
      setImagePreviews(newPreviews);
    },
    [createPreviews, images],
  );

  // update DOM when list of videos changes //
  useEffect(
    function updateVideoPreviews() {
      const newPreviews = createPreviews("video", videos, setVideos);
      setVideoPreviews(newPreviews);
    },
    [createPreviews, videos],
  );

  // remove caption input ref if an image/video is removed //
  useEffect(
    function updateCaptionRefs() {
      captionRefs.current.forEach((value, key) => {
        if (value === null) captionRefs.current.delete(key);
      });
    },
    [imagePreviews, videoPreviews],
  );

  // remove tag dropdown ref if an image/video is removed //
  useEffect(
    function updateTagRefs() {
      tagRefs.current.forEach((value, key) => {
        if (value === null) tagRefs.current.delete(key);
      });
    },
    [imagePreviews, videoPreviews],
  );

  // update lists of images and videos when files are added //
  function addNewFiles(files) {
    for (let i = 0; i < files.length; i += 1) {
      const file = files[i];
      if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
        const url = URL.createObjectURL(file);
        file.index = uuidv4();
        file.source = url;
        if (file.type.startsWith("image/")) {
          setImages((images) => [...images, file]);
        } else {
          setVideos((videos) => [...videos, file]);
        }
      }
    }
  }

  // handle files added through file input //
  function handleFileInput(e) {
    const files = e.target.files;
    addNewFiles(files);
    e.target.value = "";
  }

  // handle files added through drag and drop //
  function handleFileDrop(e) {
    e.preventDefault();
    const files = e.dataTransfer.files;
    addNewFiles(files);
  }

  // handle files being hovered over drop zone //
  function handleDragOver(e) {
    e.preventDefault();
  }

  // prepare then hand data to server action when submit button is clicked //
  async function submitData(e) {
    e.preventDefault();
    const entriesData = {};
    entriesData.indexes = [];
    entriesData.files = {};
    entriesData.captions = {};
    entriesData.tags = {};
    const files = [...images, ...videos];
    files.forEach((file) => {
      entriesData.indexes.push(file.index);
      entriesData.files[file.index] = file;
    });
    captionRefs.current.forEach((ref, index) => {
      entriesData.captions[index] = ref.value;
    });
    tagsData.forEach((tagData, index) => {
      entriesData.tags[index] = tagData.getEntryTags();
    });
    for (let i = 0; i < entriesData.indexes.length; i += 1) {
      const index = entriesData.indexes[i];
      const entryData = new FormData();
      entryData.append("user", user);
      entryData.append("file", entriesData.files[index]);
      entryData.append("caption", entriesData.captions[index]);
      entryData.append("tags", JSON.stringify(entriesData.tags[index]));
      await handleUpload(entryData);
      console.log(`Uploaded: ${index}`);
    }
  }

  return (
    <>
      <h2>Images and Videos</h2>
      <form>
        <div onDragOver={handleDragOver} onDrop={handleFileDrop}>
          <section>
            <label htmlFor="files">Add images/videos</label>
            <input
              accept="image/*, video/*"
              id="files"
              multiple
              name="files"
              onChange={handleFileInput}
              type="file"
            ></input>
          </section>
          <section
            hidden={imagePreviews.length === 0 && videoPreviews.length === 0}
          >
            {<ul>{imagePreviews}</ul>}
            {<ul>{videoPreviews}</ul>}
          </section>
          <button onClick={submitData}>Upload</button>
        </div>
      </form>
    </>
  );
}
