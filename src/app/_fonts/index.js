import localFont from "next/font/local";

const belyDisplay = localFont({
  src: "./bely-display/regular.woff2",
  variable: "--font-bely-display",
});

const monarcha = localFont({
  src: [
    {
      path: "./monarcha/book.woff2",
      weight: "200",
      style: "normal",
    },
    {
      path: "./monarcha/book-italic.woff2",
      weight: "200",
      style: "italic",
    },
    {
      path: "./monarcha/regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./monarcha/regular-italic.woff2",
      weight: "400",
      style: "italic",
    },
    {
      path: "./monarcha/semibold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "./monarcha/semibold-italic.woff2",
      weight: "600",
      style: "italic",
    },
    {
      path: "./monarcha/bold.woff2",
      weight: "800",
      style: "normal",
    },
    {
      path: "./monarcha/bold-italic.woff2",
      weight: "800",
      style: "italic",
    },
  ],
  variable: "--font-monarcha",
});

const muli = localFont({
  src: [
    {
      path: "./muli/extralight.woff2",
      weight: "200",
      style: "normal",
    },
    {
      path: "./muli/extralight-italic.woff2",
      weight: "200",
      style: "italic",
    },
    {
      path: "./muli/light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "./muli/light-italic.woff2",
      weight: "300",
      style: "italic",
    },
    {
      path: "./muli/regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./muli/regular-italic.woff2",
      weight: "400",
      style: "italic",
    },
    {
      path: "./muli/semibold.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./muli/semibold-italic.woff2",
      weight: "500",
      style: "italic",
    },
    {
      path: "./muli/bold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "./muli/bold-italic.woff2",
      weight: "600",
      style: "italic",
    },
    {
      path: "./muli/extrabold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "./muli/extrabold-italic.woff2",
      weight: "700",
      style: "italic",
    },
    {
      path: "./muli/black.woff2",
      weight: "800",
      style: "normal",
    },
    {
      path: "./muli/black-italic.woff2",
      weight: "800",
      style: "italic",
    },
  ],
  variable: "--font-muli",
});

const fonts = { belyDisplay, monarcha, muli };

export default fonts;
