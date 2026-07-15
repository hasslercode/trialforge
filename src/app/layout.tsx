import type { Metadata } from "next";
import { Kalam, Nunito } from "next/font/google";
import "./globals.css";

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
    <html lang="en" className={`${studyHand.variable} ${studyBody.variable}`}>
      <body>{children}</body>
    </html>
  );
}
