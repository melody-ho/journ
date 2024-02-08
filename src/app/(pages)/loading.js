/// imports ///
import styles from "./loading.module.css";
import ThemedImage from "@/helper-components/themed-image";

/// main component ///
export default function Loading() {
  return (
    <div aria-description="loading" className={styles.component}>
      <div className={styles.logoContainer}>
        <ThemedImage alt="Journ logo" imageName="logo" />
      </div>
    </div>
  );
}
