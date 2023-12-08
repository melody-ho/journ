import Link from "next/link";
import styles from "./index.module.css";
import ThemedImage from "@/helper-components/themed-image";
import { useEffect, useRef } from "react";

export default function NewEntryStatusModal({ resetForm, retry, status }) {
  const modal = useRef(null);

  useEffect(
    function openModal() {
      if (modal.current) {
        modal.current.close();
        modal.current.showModal();
      }
    },
    [modal],
  );

  function handleCancel(e) {
    e.preventDefault();
  }

  return (
    <dialog
      className={`${styles.modal} ${
        status !== "uploading"
          ? styles.opaqueBackdrop
          : styles.transparentBackdrop
      }`}
      onCancel={handleCancel}
      ref={modal}
    >
      {status === "uploading" ? (
        <p className={styles.visuallyHidden}>
          Adding image/video entry/entries
        </p>
      ) : status === "adding" ? (
        <div className={styles.modalContent}>
          <div className={styles.loader}></div>
          <p className={styles.statusMessage}>Adding new entry</p>
        </div>
      ) : status === "error" ? (
        <div className={styles.modalContent}>
          <div className={styles.errorIconContainer}>
            <ThemedImage alt="error icon" imageName="sad-icon" />
          </div>
          <p className={styles.statusMessage}>An error occured.</p>
          <button
            className={`${styles.button} ${styles.callToAction} ${styles.errorAction}`}
            onClick={retry}
            type="button"
          >
            Try again
          </button>
        </div>
      ) : (
        <div className={styles.modalContent}>
          <div className={styles.successIconContainer}>
            <ThemedImage alt="success icon" imageName="success-icon" />
          </div>
          <p className={styles.statusMessage}>
            {status === "success" ? "Entry added!" : "Entries added!"}
          </p>
          <div className={styles.successActions}>
            <button
              className={`${styles.button} ${styles.callToAction}`}
              onClick={resetForm}
              type="button"
            >
              Add more
            </button>
            <Link className={`${styles.link} ${styles.callToAction}`} href="/">
              or back to dashboard
            </Link>
          </div>
        </div>
      )}
    </dialog>
  );
}
