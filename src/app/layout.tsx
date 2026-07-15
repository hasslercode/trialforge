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
  title: "TrialForge · Simulador de pruebas técnicas",
  description:
    "Simula pruebas técnicas reales por fases: MCQ, código, timer y banco anti-repetición. Incluye módulo de estudio.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${studyHand.variable} ${studyBody.variable}`}>
      <body>{children}</body>
    </html>
  );
}
