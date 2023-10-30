import "./globals.css";
import dynamic from "next/dynamic";
import fonts from "./_fonts";
import rds from "@/database/rds";

async function resetDatabase() {
  await rds.sync({ force: true });
}

export const metadata = {
  title: "Journ",
  description: "Your journal. Your journey.",
};

const fontVariables = [];
for (const font of Object.values(fonts)) {
  fontVariables.push(font.variable);
}
const fontVariablesString = fontVariables.join(" ");

const SplashScreenWrapper = dynamic(
  () => import("./_client-components/splash-screen"),
  { ssr: false },
);

export default function RootLayout({ children }) {
  resetDatabase();
  return (
    <html className={fontVariablesString} lang="en">
      <body>
        <SplashScreenWrapper>{children}</SplashScreenWrapper>
      </body>
    </html>
  );
}
