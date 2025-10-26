import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JobFinder Pro - Resume-Driven Job Matching",
  description: "Upload resume, get matching QA jobs automatically",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}