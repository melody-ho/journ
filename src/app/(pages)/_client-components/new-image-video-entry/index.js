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

/// constants ///
/**
 * Max image dimension allowed, in px.
 */
const MAX_IMAGE_SIZE = 1920;
/**
 * Max video file size allowed, in bytes.
 */
const MAX_VIDEO_SIZE = 5368709120;

/// helper functions ///
/**
 * Resizes and converts image.
 * @param {string} fileURL Object URL of image to resize/convert.
 * @param {string} fileIndex UUID attached to image being resized/converted.
 * @returns {Promise<File>} File object of resized image in WebP.
 */
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
/**
 * @param {Object} props
 * @param {string} props.userId
 * @param {Array.<{id: string, name: string}>} props.userTags
 */
export default function NewImageVideoEntry({ userId, userTags }) {
  // initialize router //
  const router = useRouter();

  // document states //
  /**
   * @typedef {Object} imageType
   * @property {string} index UUID attached to file
   * @property {string} name name of file
   * @property {string} source object URL for file
   * @property {File} resizedFile File object of resized image in WebP
   */
  /**
   * @typedef {Array.<imageType>} imagesType List of image data.
   */
  /**
   * @typedef {React.Dispatch<Array.<imageType>>} setImagesType Updates image data list.
   */
  /**
   * @typedef {Array.<JSX.Element>} imagePreviewsType
   */
  /**
   * @typedef {React.Dispatch<Array.<JSX.Element>>} setImagePreviewsType
   */
  /**
   * @typedef {null | "uploading" | "error" | "success" | "success multiple"} overallStatusType Overall upload status, null when no upload attempted or previous result acknowledged.
   */
  /**
   * @typedef {React.Dispatch<null | "uploading" | "error" | "success" | "success multiple">} setOverallStatusType Reports overall update status, null when no upload attempted or previous result acknowledged.
   */
  /**
   * @typedef {Object} tagDataType
   * @property {Function} updateEntryTagNames Updates tag names attached to an entry when passed new array of tag names.
   * @property {Function} getEntryTagNames Get tag names attached to an entry when called.
   */
  /**
   * @typedef {Map<string, tagDataType>} tagsDataType Map containing tag names attached to each file being uploaded (key: index/UUID attached to file).
   */
  /**
   * @typedef {React.Dispatch<Map<string, tagDataType>>} setTagsDataType Updates map containing tag names attached to each file being uploaded (key: index/UUID attached to file).
   */
  /**
   * @typedef {Array.<string>} tagNamesForAllType Names of tags to apply to all entries in current upload.
   */
  /**
   * @typedef {React.Dispatch<Array.<string>>} setTagNamesForAllType Updates names of tags to apply to all entries in current upload.
   */
  /**
   * @typedef {Map<string, "adding" | "error" | "success">} uploadStatusesType Upload status for each file. (key: index/UUID attached to file, value: status of upload)
   */
  /**
   * @typedef {React.Dispatch<Map<string, "adding" | "error" | "success">>} setUploadStatusesType Updates upload status for each file. (key: index/UUID attached to file, value: status of upload)
   */
  /**
   * @typedef {Object} videoType
   * @property {string} index UUID attached to file
   * @property {string} name name of file
   * @property {string} source object URL for file
   * @property {File} resizedFile File object of file
   */
  /**
   * @typedef {Array.<videoType>} videosType List of video data.
   */
  /**
   * @typedef {React.Dispatch<Array.<videoType>>} setVideosType Updates video data list.
   */
  /**
   * @typedef {Array.<JSX.Element>} videoPreviewsType
   */
  /**
   * @typedef {React.Dispatch<Array.<JSX.Element>>} setVideoPreviewsType
   */

  // initialize states //
  /**
   * @type {[imagesType, setImagesType]}
   */
  const [images, setImages] = useState([]);
  /**
   * @type {[imagePreviewsType, setImagePreviewsType]}
   */
  const [imagePreviews, setImagePreviews] = useState([]);
  /**
   * @type {[overallStatusType, setOverallStatusType]}
   */
  const [overallStatus, setOverallStatus] = useState(null);
  /**
   * @type {[tagsDataType, setTagsDataType]}
   */
  const [tagsData, setTagsData] = useState(new Map());
  /**
   * @type {[tagNamesForAllType, setTagNamesForAllType]}
   */
  const [tagNamesForAll, setTagNamesForAll] = useState([]);
  /**
   * @type {[uploadStatusesType, setUploadStatusesType]}
   */
  const [uploadStatuses, setUploadStatuses] = useState(new Map());
  /**
   * @type {[videosType, setVideosType]}
   */
  const [videos, setVideos] = useState([]);
  /**
   * @type {[videoPreviewsType, setVideoPreviewsType]}
   */
  const [videoPreviews, setVideoPreviews] = useState([]);

  // initialize refs //
  const captionRefs = useRef(new Map());
  const tagRefs = useRef(new Map());

  // declare factory function for managing tags data //
  const manageTagData = useCallback(() => {
    let entrytagNames = [];
    function updateEntryTagNames(updatedTagNames) {
      entrytagNames = [...updatedTagNames];
    }
    function getEntryTagNames() {
      return entrytagNames;
    }
    return { updateEntryTagNames, getEntryTagNames };
  }, []);

  // update tags for all when changed //
  const updateTagNamesForAll = useCallback((tagNames) => {
    setTagNamesForAll([...tagNames]);
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
                    overallStatus === "uploading" ||
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
                    passEntryTagNames={tagData.updateEntryTagNames}
                    preSelectedTagNames={tagNamesForAll}
                    readOnly={
                      overallStatus === "uploading" ||
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
              ) : overallStatus === "uploading" ? (
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
            ) : overallStatus === "uploading" ? (
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
    [manageTagData, overallStatus, tagNamesForAll, uploadStatuses, userTags],
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
  async function handleFileInput(e) {
    const files = e.target.files;
    await addNewFiles(files);
    e.target.value = "";
  }

  // handle files added through drag and drop //
  function handleFileDrop(e) {
    e.preventDefault();
    if (overallStatus !== "uploading") {
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
    e.preventDefault();
    const entriesData = {};
    entriesData.indexes = [];
    entriesData.files = {};
    entriesData.captions = {};
    entriesData.tagNames = {};
    const files = [...images, ...videos];
    files.forEach((file) => {
      entriesData.indexes.push(file.index);
      entriesData.files[file.index] = file.resizedFile;
    });
    captionRefs.current.forEach((ref, index) => {
      entriesData.captions[index] = ref.value;
    });
    tagsData.forEach((tagData, index) => {
      entriesData.tagNames[index] = tagData.getEntryTagNames();
    });
    let error = false;
    // upload files one by one
    for (let i = 0; i < entriesData.indexes.length; i += 1) {
      const index = entriesData.indexes[i];
      if (uploadStatuses.get(index) !== "success") {
        const uploadingState = new Map(uploadStatuses.set(index, "adding"));
        setUploadStatuses(uploadingState);
        const entryData = new FormData();
        entryData.append("userId", userId);
        entryData.append("file", entriesData.files[index]);
        entryData.append("caption", entriesData.captions[index]);
        entryData.append(
          "tagNames",
          JSON.stringify(entriesData.tagNames[index]),
        );
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
    setOverallStatus(null);
  }

  // reset form if user chooses to add more //
  function resetForm() {
    setImages([]);
    setVideos([]);
    setImagePreviews([]);
    setVideoPreviews([]);
    setTagNamesForAll([]);
    setTagsData(new Map());
    setUploadStatuses(new Map());
    setOverallStatus(null);
  }

  // render //
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
            disabled={overallStatus === "uploading"}
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
                  passEntryTagNames={updateTagNamesForAll}
                  readOnly={
                    overallStatus === "uploading" || uploadStatuses.size > 0
                  }
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
