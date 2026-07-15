import type { Metadata } from "next";
import { Figtree, Kalam, Nunito } from "next/font/google";
import "./globals.css";

const examSans = Figtree({
  subsets: ["latin"],
  variable: "--font-exam-sans",
  weight: ["400", "500", "600", "700"],
});

const studyHand = Kalam({
  subsets: ["latin"],
  variable: "--font-study-hand",
  weight: ["300", "400", "700"],
});

const studyBody = Nunito({
  subsets: ["latin"],
  variable: "--font-study-body",
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "TrialForge · Technical assessment simulator",
  description:
    "Simulate real technical assessments by phase: MCQ, code, timer, and an anti-repeat question bank. Includes a study module.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${examSans.variable} ${studyHand.variable} ${studyBody.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
