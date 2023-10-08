"use client";

import handleUpload from "./_actions/handle-upload";
import Image from "next/image";
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
      const newPreviews = videos.map((video) => {
        return (
          <li key={video.index}>
            <video autoPlay loop muted src={video.source}></video>
            <textarea
              ref={(ref) => {
                captionRefs.current.set(video.index, ref);
              }}
            ></textarea>
          </li>
        );
      });
      setVideoPreviews(newPreviews);
    },
    [videos],
  );

  // update lists of images and videos when files are added //
  function handleFileInput(e) {
    const files = e.target.files;
    for (let i = 0; i < files.length; i += 1) {
      const file = files[i];
      const url = URL.createObjectURL(file);
      file.index = crypto.randomUUID();
      file.source = url;
      if (file.type.startsWith("image/")) {
        setImages((images) => [...images, file]);
      } else {
        setVideos((videos) => [...videos, file]);
      }
    }
    e.target.value = "";
  }

  // prepare then hand data to server action when submit button is clicked //
  async function submitData(e) {
    e.preventDefault();
    const formData = new FormData();
    formData.append("user", user);
    const indexes = [];
    captionRefs.current.forEach((ref, index) => {
      indexes.push(index);
      formData.append(`captions[${index}]`, ref.value);
    });
    formData.append("indexes", indexes);
    const files = [...images, ...videos];
    files.forEach((file) => {
      formData.append(`files[${file.index}]`, file);
    });
    await handleUpload(formData);
  }

  return (
    <>
      <h2>Images and Videos</h2>
      <form>
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
      </form>
    </>
  );
}
