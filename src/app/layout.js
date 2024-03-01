/// imports ///
import "./globals.css";
import dynamic from "next/dynamic";
import fonts from "./_fonts";

/// metadata ///
export const metadata = {
  title: "Journ",
  description:
    "A dynamic digital scrapbook serving as your personal journal, capturing your unique journey. Add custom tags to entries and effortlessly filter for different views. Crafted with ♡ by Melody Ho.",
};

/// fonts ///
const fontVariables = [];
for (const font of Object.values(fonts)) {
  fontVariables.push(font.variable);
}
const fontVariablesString = fontVariables.join(" ");

/// splash screen ///
const SplashScreenWrapper = dynamic(() => import("./_splash-screen"), {
  ssr: false,
});

/// main component ///
export default function RootLayout({ children }) {
  return (
    <html className={fontVariablesString} lang="en">
      <body>
        <SplashScreenWrapper>{children}</SplashScreenWrapper>
      </body>
    </html>
  );
}
