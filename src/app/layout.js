import "./globals.css";
import rds from "@/database/rds";

async function resetDatabase() {
  await rds.sync({ force: true });
}

export const metadata = {
  title: "Journ",
  description: "Your journal. Your journey.",
};

export default function RootLayout({ children }) {
  resetDatabase();
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
