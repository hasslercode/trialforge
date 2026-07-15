import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TrialForge · Simulador de pruebas técnicas",
  description:
    "Simula pruebas técnicas reales por fases: MCQ, código, timer y banco anti-repetición. Multi-cliente.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
