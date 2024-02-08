"use client";

/// imports ///
import "@lottiefiles/lottie-player";
import styles from "./index.module.css";
import { useEffect, useRef, useState } from "react";

/// constants ///
/**
 * Duration of fade-out transition, in ms.
 */
const FADEOUT_DURATION = 500;
/**
 * Duration of splash screen animation, in ms.
 */
const SPLASH_DURATION = 3000;

/// main component ///
/**
 * Wrapper that goes around component(s) before which to show splash screen.
 * @param {Object} props
 * @param {JSX.Element} props.children
 * @example <SplashScreen> component(s) before which to show splash screen </SplashScreen>
 */
export default function SplashScreen({ children }) {
  // document states //
  /**
   * @typedef {boolean} showType Indicates whether splash screen is displayed.
   */
  /**
   * @typedef {React.Dispatch<boolean>} setShowType Toggles splash screen.
   */

  // initialize states //
  /**
   * @type {[showType, setShowType]}
   */
  const [show, setShow] = useState(true);

  // initialize refs //
  const splashAnimationRef = useRef(null);

  // fade out and remove splash screen after fixed duration //
  useEffect(
    function endSplash() {
      if (splashAnimationRef) {
        setTimeout(function fadeoutAnimation() {
          splashAnimationRef.current.classList.add(styles.splashFadeout);
          setTimeout(function removeAnimation() {
            setShow(false);
          }, FADEOUT_DURATION);
        }, SPLASH_DURATION);
      }
    },
    [splashAnimationRef],
  );

  // render //
  return show ? (
    <div className={styles.splashAnimationContainer}>
      <div className={styles.splashAnimation} ref={splashAnimationRef}>
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
