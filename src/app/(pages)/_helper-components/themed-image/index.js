/// imports ///
import Image from "next/image";
import styles from "./index.module.css";

/// main component ///
/**
 * @param {Object} props
 * @param {string} props.alt alternative text for image
 * @param {string} props.imageName name of image in public directory
 * @param {?Function} props.onError optional, function to call if there is an error loading image
 * @param {?Function} props.onLoad optional, function to call when image is loaded
 */
export default function ThemedImage({
  alt,
  imageName,
  onError = null,
  onLoad = null,
}) {
  // render //
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
        unoptimized
      />
    </picture>
  );
}
