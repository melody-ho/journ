import Image from "next/image";
import styles from "./index.module.css";

export default function ThemedImage({
  alt,
  imageName,
  onError = null,
  onLoad = null,
}) {
  return (
    <picture>
      <source
        media="(prefers-color-scheme: dark)"
        srcSet={`/${imageName}/dark.svg`}
      />
      <Image
        alt={alt}
        className={styles.imageComponent}
        fill="true"
        onError={onError}
        onLoad={onLoad}
        priority={true}
        src={`/${imageName}/light.svg`}
      />
    </picture>
  );
}
