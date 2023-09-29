import "./globals.css";

export const metadata = {
  title: "Journ",
  description: "Your journal. Your journey.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
