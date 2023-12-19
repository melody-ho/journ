"use client";

/// imports ///
import Link from "next/link";
import styles from "./index.module.css";
import ThemedImage from "@/helper-components/themed-image";
import { useEffect, useRef } from "react";

/// main component ///
export default function NewEntryStatusModal({ resetForm, retry, status }) {
  const modalRef = useRef(null);

  useEffect(
    function openModal() {
      if (modalRef.current) {
        modalRef.current.close();
        modalRef.current.showModal();
      }
    },
    [modalRef],
  );

  function handleCancel(e) {
    e.preventDefault();
  }

  function handleEsc(e) {
    if (e.key === "Escape") e.preventDefault();
  }

  return (
    <dialog
      className={`${styles.modal} ${
        status !== "uploading"
          ? styles.opaqueBackdrop
          : styles.transparentBackdrop
      }`}
      onCancel={handleCancel}
      onKeyDown={handleEsc}
      ref={modalRef}
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
      ) : status === "empty" ? (
        <div className={styles.modalContent}>
          <div className={styles.alertIconContainer}>
            <ThemedImage alt="alert icon" imageName="alert-icon" />
          </div>
          <p className={styles.statusMessage}>Entry content cannot be empty.</p>
          <button
            className={`${styles.button} ${styles.callToAction} ${styles.errorAction}`}
            onClick={retry}
            type="button"
          >
            Go back
          </button>
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
