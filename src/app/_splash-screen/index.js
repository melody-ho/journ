"use client";

import "@lottiefiles/lottie-player";
import styles from "./index.module.css";
import { useEffect, useRef, useState } from "react";

const FADEOUT_DURATION = 500;
const SPLASH_DURATION = 3000;

export default function SplashScreen({ children }) {
  // initialize refs and states //
  const splashAnimation = useRef(null);
  const [splash, setSplash] = useState(true);

  // fade out and remove splash screen after fixed duration //
  useEffect(
    function endSplash() {
      if (splashAnimation) {
        setTimeout(function fadeoutAnimation() {
          splashAnimation.current.classList.add(styles.splashFadeout);
          setTimeout(function removeAnimation() {
            setSplash(false);
          }, FADEOUT_DURATION);
        }, SPLASH_DURATION);
      }
    },
    [splashAnimation],
  );

  return splash ? (
    <div className={styles.splashAnimationContainer}>
      <div className={styles.splashAnimation} ref={splashAnimation}>
        <lottie-player
          autoplay
          src={
            window.matchMedia("(prefers-color-scheme: dark)").matches
              ? "/splash-screen-animation/dark.json"
              : "/splash-screen-animation/light.json"
          }
        ></lottie-player>
      </div>
    </div>
  ) : (
    children
  );
}
