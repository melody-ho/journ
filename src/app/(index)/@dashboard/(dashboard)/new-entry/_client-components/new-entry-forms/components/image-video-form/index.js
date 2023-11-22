"use client";

import handleUpload from "./server-actions/handle-upload";
import Image from "next/image";
import { v4 as uuidv4 } from "uuid";
import { useEffect, useRef, useState } from "react";

export default function ImageVideoForm({ user }) {
  // initialize states and refs //
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [videoPreviews, setVideoPreviews] = useState([]);
  const captionRefs = useRef(new Map());

  // update DOM when list of images changes //
  useEffect(
    function updateImagePreviews() {
      function deleteImage(index) {
        const newImages = images.filter((image) => image.index !== index);
        setImages(newImages);
      }
      const newPreviews = images.map((image) => {
        return (
          <li key={image.index}>
            <Image
              alt={`preview of ${image.name}`}
              height="100"
              src={image.source}
              width="100"
            />
            <textarea
              ref={(ref) => {
                captionRefs.current.set(image.index, ref);
              }}
            ></textarea>
            <button onClick={() => deleteImage(image.index)} type="button">
              Delete
            </button>
          </li>
        );
      });
      setImagePreviews(newPreviews);
    },
    [images],
  );

  // update DOM when list of videos changes //
  useEffect(
    function updateVideoPreviews() {
      function deleteVideo(index) {
        const newVideos = videos.filter((video) => video.index !== index);
        setVideos(newVideos);
      }
      const newPreviews = videos.map((video) => {
        return (
          <li key={video.index}>
            <video autoPlay loop muted src={video.source}></video>
            <textarea
              ref={(ref) => {
                captionRefs.current.set(video.index, ref);
              }}
            ></textarea>
            <button onClick={() => deleteVideo(video.index)} type="button">
              Delete
            </button>
          </li>
        );
      });
      setVideoPreviews(newPreviews);
    },
    [videos],
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
    entriesData.captions = {};
    entriesData.files = {};
    captionRefs.current.forEach((ref, index) => {
      entriesData.indexes.push(index);
      entriesData.captions[index] = ref.value;
    });
    const files = [...images, ...videos];
    files.forEach((file) => {
      entriesData.files[file.index] = file;
    });
    for (let i = 0; i < entriesData.indexes.length; i += 1) {
      const index = entriesData.indexes[i];
      const entryData = new FormData();
      entryData.append("user", user);
      entryData.append("file", entriesData.files[index]);
      entryData.append("caption", entriesData.captions[index]);
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
