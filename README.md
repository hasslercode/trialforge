# TrialForge

Plataforma local-first para **simular pruebas técnicas** reales. Hoy corre el track Frontend de Bancolombia; la arquitectura está lista para sumar otros clientes y perfiles.

## Por qué TrialForge

- Flujos por **fases** (MCQ + prácticas) con timer global y umbral de aprobación  
- **Banco grande** con anti-repetición entre corridas  
- Historial de intentos (10 slots · banco completo)  
- Escalable: contenido por cliente (`src/content/<cliente>`)

## Stack

Next.js · React · TypeScript · Tailwind · IndexedDB

## Inicio

```bash
npm install
npm run dev
```

## Cliente actual

**Bancolombia Frontend** — 5 sesiones, 3 horas, ≥ 70%, incluye SQL en teoría/práctica.
