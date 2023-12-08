import Link from "next/link";
import styles from "./index.module.css";
import ThemedImage from "@/helper-components/themed-image";

export default function AccountMenu({ animateOut, close }) {
  return (
    <div
      className={`${styles.growDown} ${animateOut ? styles.shrinkUp : null}`}
    >
      <div
        className={`${styles.component} ${styles.slideIn} ${
          animateOut ? styles.slideOut : null
        }`}
      >
        <button
          aria-label="Close Account Menu"
          className={`${styles.closeBtn} ${styles.mobileOnly}`}
          onClick={close}
          type="button"
        >
          <ThemedImage alt="Close Icon" imageName="close-icon" />
        </button>
        <ul className={styles.items}>
          <li className={styles.item}>
            <Link className={styles.link} href="./manage-account">
              Manage Account
            </Link>
          </li>
          <li className={`${styles.item} ${styles.lastItem}`}>
            <form action="./sign-out" method="post">
              <button className={styles.menuButton}>Log out</button>
            </form>
          </li>
        </ul>
      </div>
    </div>
  );
}
