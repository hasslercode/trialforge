import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bancolombia · Simulador de prueba técnica Frontend",
  description: "Simula la prueba técnica Frontend de Bancolombia: 5 sesiones, 3 horas, 70% para aprobar.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
