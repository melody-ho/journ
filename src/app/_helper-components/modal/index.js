"use client";

import styles from "./index.module.css";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export default function Modal({ children }) {
  const modal = useRef(null);
  const router = useRouter();

  useEffect(
    function show() {
      modal.current.showModal();
    },
    [modal],
  );

  function handleClose(e) {
    e.preventDefault();
    router.back();
  }

  return (
    <dialog className={styles.modal} onCancel={handleClose} ref={modal}>
      {children}
    </dialog>
  );
}
