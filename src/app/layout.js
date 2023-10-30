import "./globals.css";
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

export default function RootLayout({ children }) {
  resetDatabase();
  return (
    <html className={fontVariablesString} lang="en">
      <body>{children}</body>
    </html>
  );
}
