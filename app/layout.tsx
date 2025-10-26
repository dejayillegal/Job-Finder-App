import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JobFinder Pro - AI Resume-Driven Job Matching",
  description: "Revolutionary AI-powered platform that automatically scrapes and matches jobs based on your resume from Naukri, Indeed, LinkedIn, and Hirist.",
  keywords: "job matching, AI resume parsing, automatic job scraping, naukri jobs, linkedin jobs",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}