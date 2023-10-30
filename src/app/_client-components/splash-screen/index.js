"use client";

import "@lottiefiles/lottie-player";
import styles from "./index.module.css";
import { useEffect, useRef, useState } from "react";

const FADEOUT_DURATION = 500;
const SPLASH_DURATION = 3000;

export default function SplashScreen({ children }) {
  // initialize refs and states //
  const modal = useRef(null);
  const [splash, setSplash] = useState(true);

  // display splash screen for fixed duration //
  useEffect(
    function openModal() {
      if (modal) {
        modal.current.showModal();
        setTimeout(function fadeoutModal() {
          modal.current.classList.add(`${styles.fadeout}`);
          setTimeout(function removeModal() {
            modal.current.close();
            setSplash(false);
          }, FADEOUT_DURATION);
        }, SPLASH_DURATION);
      }
    },
    [modal],
  );

  // prevent closing splash screen //
  function preventCancel(e) {
    e.preventDefault(e);
  }

  return splash ? (
    <dialog
      className={styles.modal}
      inert="true"
      onCancel={preventCancel}
      ref={modal}
    >
      <lottie-player
        autoplay
        src={
          window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "/splash-screen-animation/dark.json"
            : "/splash-screen-animation/light.json"
        }
      ></lottie-player>
    </dialog>
  ) : (
    children
  );
}
