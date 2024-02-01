"use client";

/// imports ///
import handleImageVideoUpload from "@/server-actions/handle-image-video-upload";
import Image from "next/image";
import NewEntryStatusModal from "../new-entry-status-modal";
import styles from "./index.module.css";
import TagDropdown from "../tag-dropdown";
import ThemedImage from "@/helper-components/themed-image";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { useCallback, useEffect, useRef, useState } from "react";

/// private ///
// max image dimension allowed //
const MAX_IMAGE_SIZE = 1920;
// max video file size allowed //
const MAX_VIDEO_SIZE = 5368709120;

// resize images with at least one dimension larger than max allowed //
function resizeImage(fileURL, fileIndex) {
  return new Promise((resolve) => {
    const image = document.createElement("img");
    image.addEventListener("load", () => {
      const canvas = document.createElement("canvas");
      let width = image.width;
      let height = image.height;
      if (width > height) {
        if (width > MAX_IMAGE_SIZE) {
          height *= MAX_IMAGE_SIZE / width;
          width = MAX_IMAGE_SIZE;
        }
      } else {
        if (height > MAX_IMAGE_SIZE) {
          width *= MAX_IMAGE_SIZE / height;
          height = MAX_IMAGE_SIZE;
        }
      }
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d").drawImage(image, 0, 0, width, height);
      canvas.toBlob((b) => {
        resolve(new File([b], `${fileIndex}.webp`, { type: "image/webp" }));
      }, "image/webp");
    });
    image.src = fileURL;
  });
}

/// main component ///
export default function NewImageVideoEntry({ user, userTags }) {
  // initialize router //
  const router = useRouter();

  // initialize states and refs //
  // states
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [overallStatus, setOverallStatus] = useState(null);
  const [tagsData, setTagsData] = useState(new Map());
  const [tagsForAll, setTagsForAll] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadStatuses, setUploadStatuses] = useState(new Map());
  const [videos, setVideos] = useState([]);
  const [videoPreviews, setVideoPreviews] = useState([]);
  // refs
  const captionRefs = useRef(new Map());
  const tagRefs = useRef(new Map());

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

  // update tags for all when changed //
  const updateTagsForAll = useCallback((tags) => {
    setTagsForAll([...tags]);
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
          <li className={styles.entry} key={entry.index}>
            <div className={styles.entryContent}>
              {type === "image" ? (
                <div className={styles.imagePreviewContainer}>
                  <Image
                    alt={`preview of ${entry.name}`}
                    className={styles.imagePreview}
                    fill={true}
                    src={entry.source}
                    unoptimized
                  />
                </div>
              ) : (
                <video
                  autoPlay
                  className={styles.videoPreview}
                  loop
                  muted
                  playsInline
                  src={entry.source}
                ></video>
              )}
              <div className={styles.entryCaptionTags}>
                <textarea
                  aria-label="caption"
                  className={styles.captionInput}
                  placeholder="caption..."
                  readOnly={
                    uploading ||
                    (uploadStatuses.has(entry.index) &&
                      uploadStatuses.get(entry.index) === "success")
                  }
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
                    instruction="Add tags"
                    passEntryTags={tagData.updateEntryTags}
                    preSelectedTags={tagsForAll}
                    readOnly={
                      uploading ||
                      (uploadStatuses.has(entry.index) &&
                        uploadStatuses.get(entry.index) === "success")
                    }
                    userTags={userTags}
                  />
                </div>
              </div>
            </div>
            {uploadStatuses.has(entry.index) ? (
              uploadStatuses.get(entry.index) === "adding" ? (
                // currently uploading
                <div className={styles.uploadProgress} role="status">
                  <p className={styles.visuallyHidden}>uploading</p>
                  <div className={styles.uploadingSpinner}></div>
                </div>
              ) : uploadStatuses.get(entry.index) === "success" ? (
                // uploaded
                <div className={styles.uploadStatus} role="status">
                  <p className={styles.visuallyHidden}>uploaded</p>
                  <div className={styles.statusIcon}>
                    <ThemedImage alt="success icon" imageName="success-icon" />
                  </div>
                </div>
              ) : uploading ? (
                // error
                <div className={styles.uploadStatus} role="status">
                  <p className={styles.visuallyHidden}>error</p>
                  <div className={styles.statusIcon}>
                    <ThemedImage alt="error icon" imageName="alert-icon" />
                  </div>
                </div>
              ) : (
                // retry
                <>
                  <button
                    aria-label="delete entry"
                    className={styles.deleteBtn}
                    onClick={() => deleteEntry(entry.index)}
                    type="button"
                  >
                    <div className={styles.deleteImgWrapper}>
                      <ThemedImage alt="delete icon" imageName="delete-icon" />
                    </div>
                  </button>
                  <div className={styles.retryStatus} role="status">
                    <div className={styles.retryIcon}>
                      <ThemedImage alt="alert icon" imageName="alert-icon" />
                    </div>
                    <p className={styles.retryMessage}>
                      Failed to add, click upload to retry.
                    </p>
                  </div>
                </>
              )
            ) : uploading ? (
              // queued
              <div className={styles.uploadProgress} role="status">
                <p className={styles.visuallyHidden}>queued</p>
                <div className={styles.queueIndicator}></div>
              </div>
            ) : (
              // default
              <button
                aria-label="delete entry"
                className={styles.deleteBtn}
                onClick={() => deleteEntry(entry.index)}
                type="button"
              >
                <div className={styles.deleteImgWrapper}>
                  <ThemedImage alt="delete icon" imageName="delete-icon" />
                </div>
              </button>
            )}
          </li>
        );
      });
      return newPreviews;
    },
    [manageTagData, tagsForAll, uploading, uploadStatuses, userTags],
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
  async function addNewFiles(files) {
    for (let i = 0; i < files.length; i += 1) {
      const file = files[i];
      if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
        const url = URL.createObjectURL(file);
        file.index = uuidv4();
        file.source = url;
        if (file.type.startsWith("image/")) {
          file.resizedFile = await resizeImage(file.source, file.index);
          setImages((images) => [...images, file]);
        } else {
          if (file.size <= MAX_VIDEO_SIZE) {
            file.resizedFile = file;
            setVideos((videos) => [...videos, file]);
          } else {
            alert(
              `Video "${file.name}" exceeds 5GB limit and could not be added.`,
            );
          }
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
    if (!uploading) {
      const files = e.dataTransfer.files;
      addNewFiles(files);
    }
  }

  // handle files being hovered over drop zone //
  function handleDragOver(e) {
    e.preventDefault();
  }

  // prepare then hand data to server action when submit button is clicked //
  async function submitData(e) {
    // make page inert
    setOverallStatus("uploading");
    // remove error statuses if retry attempt
    uploadStatuses.forEach((value, key) => {
      if (value === "error") {
        uploadStatuses.delete(key);
      }
    });
    const newUploadStatus = new Map(uploadStatuses);
    setUploadStatuses(newUploadStatus);
    // set up upload
    setUploading(true);
    e.preventDefault();
    const entriesData = {};
    entriesData.indexes = [];
    entriesData.files = {};
    entriesData.captions = {};
    entriesData.tags = {};
    const files = [...images, ...videos];
    files.forEach((file) => {
      entriesData.indexes.push(file.index);
      entriesData.files[file.index] = file.resizedFile;
    });
    captionRefs.current.forEach((ref, index) => {
      entriesData.captions[index] = ref.value;
    });
    tagsData.forEach((tagData, index) => {
      entriesData.tags[index] = tagData.getEntryTags();
    });
    let error = false;
    // upload files one by one
    for (let i = 0; i < entriesData.indexes.length; i += 1) {
      const index = entriesData.indexes[i];
      if (uploadStatuses.get(index) !== "success") {
        const uploadingState = new Map(uploadStatuses.set(index, "adding"));
        setUploadStatuses(uploadingState);
        const entryData = new FormData();
        entryData.append("user", user);
        entryData.append("file", entriesData.files[index]);
        entryData.append("caption", entriesData.captions[index]);
        entryData.append("tags", JSON.stringify(entriesData.tags[index]));
        const status = await handleImageVideoUpload(entryData);
        const uploadedState = new Map(uploadStatuses.set(index, status));
        setUploadStatuses(uploadedState);
        if (status === "error") {
          error = true;
        }
      }
    }
    // revalidate user tags data
    router.refresh();
    // update overall status
    if (!error) {
      if (entriesData.indexes.length === 1) setOverallStatus("success");
      if (entriesData.indexes.length > 1) setOverallStatus("success multiple");
    } else {
      setOverallStatus("error");
    }
  }

  // set up form if user chooses to retry upon error //
  function retry() {
    setUploading(false);
    setOverallStatus(null);
  }

  // reset form if user chooses to add more //
  function resetForm() {
    setImages([]);
    setVideos([]);
    setImagePreviews([]);
    setVideoPreviews([]);
    setTagsForAll([]);
    setTagsData(new Map());
    setUploading(false);
    setUploadStatuses(new Map());
    setOverallStatus(null);
  }

  return (
    <>
      <form>
        <h2 className={styles.visuallyHidden}>New Image/Video Entries</h2>
        <div className={`${styles.addFilesField} ${styles.bottomMargin}`}>
          <label
            aria-label="Browse and add image/video files"
            className={`${styles.addBtn} ${styles.labelFont}`}
            htmlFor="files"
          >
            Add...
          </label>
          <input
            accept="image/*, video/*"
            className={styles.hidden}
            disabled={uploading}
            id="files"
            multiple
            name="files"
            onChange={handleFileInput}
            required
            type="file"
          ></input>
        </div>
        <div
          className={`${styles.dragDropArea} ${styles.bottomMargin}`}
          onDragOver={handleDragOver}
          onDrop={handleFileDrop}
        >
          {imagePreviews.length === 0 && videoPreviews.length === 0 ? (
            <div
              aria-label="Add image/video files by dragging and dropping"
              className={styles.emptyDragDrop}
            >
              <p className={styles.labelFont}>or drag and drop...</p>
            </div>
          ) : (
            <section>
              <div className={styles.tagAllField}>
                <p
                  className={`${styles.tagAllFieldLabel} ${styles.mobileOnly}`}
                >
                  tag all
                </p>
                <p
                  className={`${styles.tagAllFieldLabel} ${styles.desktopOnly}`}
                >
                  Tag all:{" "}
                </p>
                <TagDropdown
                  instruction="Add tags to all"
                  passEntryTags={updateTagsForAll}
                  readOnly={uploading || uploadStatuses.size > 0}
                  userTags={userTags}
                />
              </div>
              <ul>{imagePreviews}</ul>
              <ul>{videoPreviews}</ul>
            </section>
          )}
        </div>
        <div className={styles.alignRight}>
          <button
            className={`${styles.uploadBtn} ${styles.labelFont}`}
            disabled={images.length === 0 && videos.length === 0}
            onClick={submitData}
          >
            Upload
          </button>
        </div>
      </form>
      {overallStatus ? (
        overallStatus === "uploading" ? (
          <NewEntryStatusModal status="uploading" />
        ) : overallStatus === "error" ? (
          <NewEntryStatusModal retry={retry} status="error" />
        ) : (
          <NewEntryStatusModal resetForm={resetForm} status={overallStatus} />
        )
      ) : null}
    </>
  );
}
