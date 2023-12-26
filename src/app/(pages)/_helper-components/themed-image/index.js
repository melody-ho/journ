import Image from "next/image";

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
        fill="true"
        onError={onError}
        onLoad={onLoad}
        priority={true}
        src={`/${imageName}/light.svg`}
        style={{ objectFit: "contain", objectPosition: "center" }}
      />
    </picture>
  );
}
