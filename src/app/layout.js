import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "Skillizee Competitions",
  description: "Discover and participate in premium school-based competitions globally.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="bg-gradient"></div>
        <Navbar />
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
